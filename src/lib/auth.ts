import type { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { nixStorage } from "./storage";
import type { User, UserRegistrationInput } from "../types";

export function mapSupabaseUser(authUser: SupabaseUser): User {
  const meta = authUser.user_metadata || {};
  const now = new Date().toISOString();
  const email = authUser.email || "";

  const firstName =
    meta.firstName ||
    meta.first_name ||
    email.split("@")[0] ||
    "User";

  const lastName =
    meta.lastName ||
    meta.last_name ||
    "";

  return {
    id: authUser.id,
    firstName,
    lastName,
    displayName:
      meta.displayName ||
      meta.display_name ||
      `${firstName} ${lastName}`.trim(),

    email,

    country:
      meta.country ||
      "International / Other",

    timezone:
      meta.timezone ||
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      "UTC",

    preferredLanguage:
      meta.preferredLanguage ||
      "English (US)",

    ageConfirmed: Boolean(meta.ageConfirmed),
    termsAccepted: Boolean(meta.termsAccepted),
    privacyAccepted: Boolean(meta.privacyAccepted),

    profilePhoto:
      meta.profilePhoto ||
      undefined,

    phoneNumber:
      meta.phoneNumber ||
      undefined,

    referralCode:
      meta.referralCode ||
      undefined,

    invitationCode:
      meta.invitationCode ||
      undefined,

    productUpdateConsent:
      Boolean(meta.productUpdateConsent),

    marketingConsent:
      Boolean(meta.marketingConsent),

    analyticsConsent:
      Boolean(meta.analyticsConsent),

    createdAt:
      authUser.created_at ||
      now,

    lastLoginAt:
      authUser.last_sign_in_at ||
      now,

    updatedAt:
      authUser.updated_at ||
      now,
  };
}

function validateRegistration(
  input: UserRegistrationInput
): string | null {
  if (!input.firstName?.trim()) {
    return "First Name is required.";
  }

  if (!input.lastName?.trim()) {
    return "Last Name is required.";
  }

  if (!input.email?.trim()) {
    return "Email Address is required.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(input.email.trim())) {
    return "Please enter a valid email address.";
  }

  if (!input.password) {
    return "Password is required.";
  }

  if (input.password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (input.password !== input.confirmPassword) {
    return "Passwords do not match.";
  }

  if (!input.ageConfirmed) {
    return "Age confirmation required.";
  }

  if (!input.termsAccepted) {
    return "Terms acceptance required.";
  }

  if (!input.privacyAccepted) {
    return "Privacy Policy acceptance required.";
  }

  return null;
}

export async function registerWithSupabase(
  input: UserRegistrationInput
): Promise<{
  success: boolean;
  user?: User;
  needsEmailConfirmation?: boolean;
  error?: string;
}> {
  const validationError = validateRegistration(input);

  if (validationError) {
    return {
      success: false,
      error: validationError,
    };
  }

  const { data, error } =
    await supabase.auth.signUp({
      email: input.email.trim().toLowerCase(),
      password: input.password,

      options: {
        emailRedirectTo: window.location.origin,

        data: {
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),

          displayName:
            input.displayName?.trim() ||
            `${input.firstName.trim()} ${input.lastName.trim()}`,

          country: input.country,
          timezone: input.timezone,
          preferredLanguage: input.preferredLanguage,

          ageConfirmed: input.ageConfirmed,
          termsAccepted: input.termsAccepted,
          privacyAccepted: input.privacyAccepted,

          profilePhoto: input.profilePhoto,
          phoneNumber: input.phoneNumber,

          referralCode: input.referralCode,
          invitationCode: input.invitationCode,

          productUpdateConsent:
            input.productUpdateConsent,

          marketingConsent:
            input.marketingConsent,

          analyticsConsent:
            input.analyticsConsent,
        },
      },
    });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  if (!data.user) {
    return {
      success: false,
      error: "Supabase did not return a user account.",
    };
  }

  // When email confirmation is enabled,
  // Supabase creates the user but does not create
  // an authenticated session until confirmation.
  if (!data.session) {
    return {
      success: true,
      needsEmailConfirmation: true,
    };
  }

  const user = mapSupabaseUser(data.user);

  nixStorage.saveAuthenticatedUser(user);

  return {
    success: true,
    user,
  };
}

export async function loginWithSupabase(
  email: string,
  password: string
): Promise<{
  success: boolean;
  user?: User;
  error?: string;
}> {
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  if (!data.user || !data.session) {
    return {
      success: false,
      error: "Authentication session was not created.",
    };
  }

  const user = mapSupabaseUser(data.user);

  nixStorage.saveAuthenticatedUser(user);

  return {
    success: true,
    user,
  };
}

export async function restoreAuthenticatedUser():
Promise<User | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    nixStorage.logoutUser();
    return null;
  }

  const mapped = mapSupabaseUser(user);

  nixStorage.saveAuthenticatedUser(mapped);

  return mapped;
}

export async function logoutFromSupabase():
Promise<void> {
  await supabase.auth.signOut();
  nixStorage.logoutUser();
}

export async function sendPasswordReset(
  email: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  const { error } =
    await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: window.location.origin,
      }
    );

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
  };
}
