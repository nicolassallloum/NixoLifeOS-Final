import {
  supabaseDbService,
} from "./supabase";

import {
  STORAGE_KEYS,
  ACTIVE_WORKSPACE_USER_KEY,
  getUserScopedStorageKey,
} from "./storage";

export type CloudSyncState =
  | "idle"
  | "hydrating"
  | "syncing"
  | "synced"
  | "offline"
  | "error";

const SYNC_INTERVAL_MS = 2000;

const DIRTY_PREFIX =
  "nix_cloud_dirty::";

const LAST_SYNC_PREFIX =
  "nix_cloud_last_sync::";

let activeUserId:
  | string
  | null = null;

let hydrated = false;

let monitorTimer:
  | ReturnType<typeof setInterval>
  | null = null;

let syncPromise:
  | Promise<boolean>
  | null = null;

let hydrationPromise:
  | Promise<boolean>
  | null = null;

let lastSyncedSignature = "";

let globalListenersInstalled = false;


/* ---------------------------------------------------------
 * Domain collections only.
 *
 * Browser authentication identity is owned by Supabase Auth
 * and must never participate in cloud snapshot comparison.
 * --------------------------------------------------------- */

const CLOUD_COLLECTION_KEYS =
  Object.values(STORAGE_KEYS).filter(
    (key) =>
      key !== STORAGE_KEYS.USERS &&
      key !== STORAGE_KEYS.CURRENT_USER
  );


function dirtyKey(
  userId: string
): string {
  return `${DIRTY_PREFIX}${userId}`;
}


function lastSyncKey(
  userId: string
): string {
  return `${LAST_SYNC_PREFIX}${userId}`;
}


function currentWorkspaceUser():
  string | null {
  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  return localStorage.getItem(
    ACTIVE_WORKSPACE_USER_KEY
  );
}


function workspaceSignature(
  userId: string
): string {
  if (
    typeof window === "undefined"
  ) {
    return "";
  }

  return CLOUD_COLLECTION_KEYS
    .map((key) => {
      const scopedKey =
        getUserScopedStorageKey(
          key,
          userId
        );

      const value =
        localStorage.getItem(
          scopedKey
        ) ?? "";

      return `${key}:${value}`;
    })
    .join("\u001e");
}


function emitStatus(
  state: CloudSyncState,
  message: string
): void {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      "nix:cloud-sync-status",
      {
        detail: {
          state,
          message,
          userId:
            activeUserId,
          timestamp:
            new Date().toISOString(),
        },
      }
    )
  );
}


function markDirty(
  userId: string
): void {
  localStorage.setItem(
    dirtyKey(userId),
    "1"
  );
}


function clearDirty(
  userId: string
): void {
  localStorage.removeItem(
    dirtyKey(userId)
  );
}


function isDirty(
  userId: string
): boolean {
  return (
    localStorage.getItem(
      dirtyKey(userId)
    ) === "1"
  );
}


function recordSuccessfulSync(
  userId: string
): void {
  localStorage.setItem(
    lastSyncKey(userId),
    new Date().toISOString()
  );
}


function stopMonitor(): void {
  if (monitorTimer) {
    clearInterval(
      monitorTimer
    );

    monitorTimer = null;
  }
}


function startMonitor(): void {
  stopMonitor();

  monitorTimer =
    setInterval(() => {
      if (
        !activeUserId ||
        !hydrated
      ) {
        return;
      }

      const currentUser =
        currentWorkspaceUser();

      if (
        currentUser !==
        activeUserId
      ) {
        return;
      }

      const currentSignature =
        workspaceSignature(
          activeUserId
        );

      if (
        currentSignature ===
        lastSyncedSignature
      ) {
        return;
      }

      markDirty(
        activeUserId
      );

      void syncCloudNow();
    }, SYNC_INTERVAL_MS);
}


/* ---------------------------------------------------------
 * Push current authenticated user's workspace.
 * --------------------------------------------------------- */

export async function syncCloudNow():
Promise<boolean> {
  const userId =
    activeUserId ||
    currentWorkspaceUser();

  if (!userId) {
    return false;
  }

  if (!hydrated) {
    return false;
  }

  if (
    typeof navigator !==
      "undefined" &&
    !navigator.onLine
  ) {
    markDirty(userId);

    emitStatus(
      "offline",
      "Offline — changes remain safely stored locally."
    );

    return false;
  }

  if (syncPromise) {
    return syncPromise;
  }

  const signatureAtStart =
    workspaceSignature(
      userId
    );

  markDirty(userId);

  emitStatus(
    "syncing",
    "Saving changes to cloud..."
  );

  syncPromise =
    (async () => {
      try {
        const result =
          await supabaseDbService
            .pushAllToCloud();

        if (!result.success) {
          emitStatus(
            "error",
            result.message ||
              "Cloud synchronization failed."
          );

          return false;
        }

        /*
         * Important:
         *
         * Record the signature that actually existed when
         * this upload started.
         *
         * If data changed while the network request was
         * running, the monitor will see another difference
         * and perform one more synchronization.
         */
        lastSyncedSignature =
          signatureAtStart;

        clearDirty(
          userId
        );

        recordSuccessfulSync(
          userId
        );

        emitStatus(
          "synced",
          "All changes saved online."
        );

        return true;
      } catch (error) {
        emitStatus(
          "error",
          error instanceof Error
            ? error.message
            : "Cloud synchronization failed."
        );

        return false;
      } finally {
        syncPromise = null;
      }
    })();

  const result =
    await syncPromise;

  /*
   * Something may have changed while the previous upload
   * was running.
   */

  if (
    result &&
    workspaceSignature(userId) !==
      lastSyncedSignature
  ) {
    markDirty(userId);

    setTimeout(
      () => {
        void syncCloudNow();
      },
      500
    );
  }

  return result;
}


/* ---------------------------------------------------------
 * Initial cloud hydration.
 *
 * Cloud is restored BEFORE automatic upload is enabled.
 * This protects a new/empty browser from overwriting good
 * cloud data.
 * --------------------------------------------------------- */

export async function initializeCloudWorkspace(
  userId: string
): Promise<boolean> {
  if (
    activeUserId === userId &&
    hydrated
  ) {
    return true;
  }

  if (
    hydrationPromise
  ) {
    return hydrationPromise;
  }

  stopMonitor();

  activeUserId =
    userId;

  hydrated =
    false;

  ensureGlobalListeners();

  hydrationPromise =
    (async () => {
      emitStatus(
        "hydrating",
        "Loading your online workspace..."
      );

      /*
       * If the browser was previously hydrated and closed
       * before a pending change reached the cloud, the
       * dirty marker means local data is newer.
       *
       * Push that local workspace first instead of
       * overwriting it with an older cloud snapshot.
       */

      if (
        isDirty(userId)
      ) {
        if (
          typeof navigator !==
            "undefined" &&
          !navigator.onLine
        ) {
          emitStatus(
            "offline",
            "Offline — waiting to synchronize pending changes."
          );

          return false;
        }

        hydrated = true;

        const restoredPending =
          await syncCloudNow();

        if (
          restoredPending
        ) {
          lastSyncedSignature =
            workspaceSignature(
              userId
            );

          startMonitor();

          window.dispatchEvent(
            new CustomEvent(
              "nix:cloud-hydrated",
              {
                detail: {
                  userId,
                },
              }
            )
          );

          return true;
        }

        hydrated = false;

        return false;
      }

      if (
        typeof navigator !==
          "undefined" &&
        !navigator.onLine
      ) {
        emitStatus(
          "offline",
          "Offline — online workspace will load when connection returns."
        );

        return false;
      }

      try {
        const result =
          await supabaseDbService
            .pullAllFromCloud();

        if (!result.success) {
          emitStatus(
            "error",
            result.message ||
              "Could not load online workspace."
          );

          return false;
        }

        hydrated =
          true;

        clearDirty(
          userId
        );

        lastSyncedSignature =
          workspaceSignature(
            userId
          );

        recordSuccessfulSync(
          userId
        );

        startMonitor();

        emitStatus(
          "synced",
          "Online workspace loaded."
        );

        window.dispatchEvent(
          new CustomEvent(
            "nix:cloud-hydrated",
            {
              detail: {
                userId,
              },
            }
          )
        );

        return true;
      } catch (error) {
        emitStatus(
          "error",
          error instanceof Error
            ? error.message
            : "Could not load online workspace."
        );

        return false;
      }
    })();

  try {
    return await hydrationPromise;
  } finally {
    hydrationPromise =
      null;
  }
}


/* ---------------------------------------------------------
 * Reset synchronization after logout/user switch.
 * --------------------------------------------------------- */

export function stopCloudSync():
void {
  stopMonitor();

  activeUserId =
    null;

  hydrated =
    false;

  lastSyncedSignature =
    "";

  syncPromise =
    null;

  hydrationPromise =
    null;

  emitStatus(
    "idle",
    "Cloud synchronization stopped."
  );
}


/* ---------------------------------------------------------
 * Browser lifecycle handlers.
 * --------------------------------------------------------- */

function ensureGlobalListeners():
void {
  if (
    globalListenersInstalled ||
    typeof window ===
      "undefined"
  ) {
    return;
  }

  globalListenersInstalled =
    true;

  window.addEventListener(
    "online",
    () => {
      const userId =
        activeUserId ||
        currentWorkspaceUser();

      if (!userId) {
        return;
      }

      if (
        hydrated
      ) {
        void syncCloudNow();
      } else {
        void initializeCloudWorkspace(
          userId
        );
      }
    }
  );

  window.addEventListener(
    "offline",
    () => {
      emitStatus(
        "offline",
        "Offline — changes remain stored locally."
      );
    }
  );

  /*
   * pagehide is synchronous.
   *
   * We cannot reliably wait for an HTTP request here, but
   * we CAN persist a dirty marker so the next session knows
   * not to overwrite newer local data.
   */
  window.addEventListener(
    "pagehide",
    () => {
      if (
        !activeUserId ||
        !hydrated
      ) {
        return;
      }

      if (
        workspaceSignature(
          activeUserId
        ) !==
        lastSyncedSignature
      ) {
        markDirty(
          activeUserId
        );
      }
    }
  );
}


/* ---------------------------------------------------------
 * Status helpers for future UI.
 * --------------------------------------------------------- */

export function getLastCloudSync(
  userId: string
): string | null {
  if (
    typeof window ===
      "undefined"
  ) {
    return null;
  }

  return localStorage.getItem(
    lastSyncKey(userId)
  );
}


export function isCloudWorkspaceHydrated():
boolean {
  return hydrated;
}
