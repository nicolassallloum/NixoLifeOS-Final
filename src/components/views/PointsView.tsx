import React, { useState } from "react";
import { Trophy, Award, Gift, Zap, CheckCircle2, AlertCircle } from "lucide-react";
import { nixStorage } from "../../lib/storage";
import { NixCard, NixProgressBar } from "../ui/NixUi";

export const PointsRewardsView: React.FC = () => {
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const profile = nixStorage.getPointsProfile();
  const history = nixStorage.getPointHistory();

  const [rewardTitle, setRewardTitle] = useState("");
  const [rewardCost, setRewardCost] = useState<number>(100);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRedeemReward = (title: string, cost: number) => {
    const pts = profile.currentPoints ?? profile.totalPoints;
    if (pts < cost) {
      setErrorMsg(`Insufficient points! You need ${cost - pts} more points.`);
      return;
    }

    nixStorage.addPoints(-cost, `Redeemed Reward: ${title}`);
    setErrorMsg("");
    refresh();
  };

  const handleCustomRedeem = () => {
    if (!rewardTitle.trim()) return;
    handleRedeemReward(rewardTitle.trim(), rewardCost);
    setRewardTitle("");
  };

  const nextLevelThreshold = profile.currentLevel * 500;
  const currentLevelProgress = Math.min(100, Math.round(((profile.currentPoints % 500) / 500) * 100));

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-mono">
      {/* Level Hero Header */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-800 p-6 rounded-3xl border border-amber-500/30 text-slate-950 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-950/20 text-slate-950 px-2.5 py-1 rounded-full">
              Level {profile.currentLevel} • {profile.levelName}
            </span>
            <h1 className="text-2xl font-extrabold text-slate-950 mt-1 flex items-center gap-2">
              <Trophy className="w-6 h-6 fill-slate-950" /> {profile.currentPoints} AVAILABLE PRODUCTIVITY POINTS
            </h1>
            <p className="text-xs text-amber-950/80 font-bold mt-0.5">Earn points by completing tasks, habits, focus sprints, and vital logs.</p>
          </div>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-slate-950/20">
          <div className="flex justify-between text-xs font-bold text-slate-950">
            <span>Progress to Level {profile.currentLevel + 1}</span>
            <span>{currentLevelProgress}%</span>
          </div>
          <NixProgressBar progress={currentLevelProgress} colorClass="bg-slate-950" />
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {errorMsg}
        </div>
      )}

      {/* Badges Row */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" /> Unlocked Badges & Achievements
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {profile.badges.map((b) => (
            <NixCard key={b.id} className="text-center p-4 space-y-2">
              <div className="text-3xl">{b.icon}</div>
              <div className="text-xs font-bold text-slate-100">{b.name}</div>
              <div className="text-[10px] text-slate-400">{b.description}</div>
              <div className="text-[9px] text-amber-400 font-bold pt-1">Unlocked {b.unlockedAt}</div>
            </NixCard>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reward Store Column */}
        <NixCard className="space-y-4">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Gift className="w-4 h-4" /> Reward Redemption Store
          </h3>

          <div className="space-y-3">
            {[
              { title: "1-Hour Gaming / Sci-Fi Block", cost: 100 },
              { title: "Favorite Cheat Meal / Special Coffee", cost: 250 },
              { title: "Movie / Cinema Evening Out", cost: 500 },
              { title: "Tech Gadget / Personal Upgrade Purchase", cost: 1000 },
            ].map((r, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-100">{r.title}</h4>
                  <span className="text-[10px] text-amber-400 font-bold">{r.cost} Points</span>
                </div>

                <button
                  onClick={() => handleRedeemReward(r.title, r.cost)}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all"
                >
                  Redeem
                </button>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-300">Custom Reward Redemption</h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Reward title..."
                value={rewardTitle}
                onChange={(e) => setRewardTitle(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100"
              />
              <input
                type="number"
                placeholder="Cost"
                value={rewardCost}
                onChange={(e) => setRewardCost(Number(e.target.value))}
                className="w-20 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100"
              />
              <button onClick={handleCustomRedeem} className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs">
                Redeem
              </button>
            </div>
          </div>
        </NixCard>

        {/* History Log Column */}
        <NixCard className="space-y-4">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4" /> Point Transaction History Log
          </h3>

          <div className="space-y-2 overflow-y-auto max-h-[350px]">
            {history.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">No points transactions recorded yet.</p>
            ) : (
              history.map((h) => {
                const ptsChange = h.pointsChange ?? h.totalPoints;
                const timeStr = (h.timestamp || h.createdAt || "").substring(0, 16).replace("T", " ");
                return (
                  <div key={h.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-200 font-bold">{h.reason || h.action}</span>
                      <div className="text-[10px] text-slate-500">{timeStr}</div>
                    </div>
                    <span className={`font-extrabold ${ptsChange > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {ptsChange > 0 ? "+" : ""}
                      {ptsChange} pts
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </NixCard>
      </div>
    </div>
  );
};
