import React, { useState } from "react";
import {
  User as UserIcon,
  Mail,
  Lock,
  Globe,
  Clock,
  Languages,
  Check,
  ShieldCheck,
  Sparkles,
  Phone,
  Gift,
  KeyRound,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronRight,
  Camera,
} from "lucide-react";
import {
  registerWithSupabase,
  loginWithSupabase,
  sendPasswordReset,
} from "../../lib/auth";
import { User, UserRegistrationInput } from "../../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  initialMode?: "login" | "register";
}

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "United Arab Emirates",
  "Saudi Arabia",
  "Singapore",
  "Brazil",
  "India",
  "Netherlands",
  "Sweden",
  "Switzerland",
  "International / Other",
];

const TIMEZONES = [
  "UTC-08:00 (PST - Pacific)",
  "UTC-05:00 (EST - Eastern)",
  "UTC+00:00 (GMT / London)",
  "UTC+01:00 (CET - Paris / Berlin)",
  "UTC+03:00 (GST - Dubai / Riyadh)",
  "UTC+04:00 (GST - Gulf Standard)",
  "UTC+08:00 (SGT - Singapore)",
  "UTC+09:00 (JST - Tokyo)",
  "UTC+10:00 (AEST - Sydney)",
];

const LANGUAGES = [
  "English (US)",
  "English (UK)",
  "Arabic (العربية)",
  "Spanish (Español)",
  "French (Français)",
  "German (Deutsch)",
  "Japanese (日本語)",
  "Chinese (中文)",
];

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80",
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = "register",
}) => {
  const [mode, setMode] = useState<"login" | "register" | "forgot">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState("");

  // Registration Form State
  const [regData, setRegData] = useState<UserRegistrationInput>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "United States",
    timezone: "UTC-05:00 (EST)",
    preferredLanguage: "English (US)",
    ageConfirmed: false,
    termsAccepted: false,
    privacyAccepted: false,

    // Optional
    displayName: "",
    profilePhoto: PRESET_AVATARS[0],
    phoneNumber: "",
    referralCode: "",
    invitationCode: "",
    productUpdateConsent: true,
    marketingConsent: false,
    analyticsConsent: true,
  });

  if (!isOpen) return null;

  const handleRegChange = (field: keyof UserRegistrationInput, value: any) => {
    setRegData((prev) => ({ ...prev, [field]: value }));
    setErrorMsg(null);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const result = await registerWithSupabase(regData);

    if (!result.success) {
      setErrorMsg(
        result.error ||
        "Registration failed."
      );
      return;
    }

    if (result.needsEmailConfirmation) {
      setSuccessMsg(
        "Account created. Please check your email and confirm your account before signing in."
      );

      setMode("login");
      setLoginEmail(regData.email);
      return;
    }

    setSuccessMsg(
      "Secure account created successfully."
    );

    setTimeout(() => {
      if (result.user) {
        onSuccess(result.user);
      }

      onClose();
    }, 800);
  };


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginEmail || !loginPassword) {
      setErrorMsg(
        "Please enter both email address and password."
      );
      return;
    }

    const result =
      await loginWithSupabase(
        loginEmail,
        loginPassword
      );

    if (!result.success) {
      setErrorMsg(
        result.error ||
        "Authentication failed."
      );
      return;
    }

    setSuccessMsg(
      "Authentication successful. Loading your personal command center..."
    );

    setTimeout(() => {
      if (result.user) {
        onSuccess(result.user);
      }

      onClose();
    }, 600);
  };


  const handleDemoLogin = () => {
    setSuccessMsg(null);
    setErrorMsg(
      "Quick Demo Login is disabled in secure authentication mode."
    );
  };


  const handleForgotPassword = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setErrorMsg(null);
    setSuccessMsg(null);

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !forgotEmail ||
      !emailRegex.test(forgotEmail.trim())
    ) {
      setErrorMsg(
        "Please enter a valid email address."
      );
      return;
    }

    const result =
      await sendPasswordReset(forgotEmail);

    if (!result.success) {
      setErrorMsg(
        result.error ||
        "Could not send password reset email."
      );
      return;
    }

    setSuccessMsg(
      `Password reset instructions were sent to ${forgotEmail.trim()}.`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 md:p-8 shadow-[0_0_40px_rgba(2,6,23,0.9)] relative animate-in fade-in zoom-in-95 duration-200 text-slate-100 max-h-[90vh] overflow-y-auto my-auto">
        
        {/* Header Branding */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-2xl flex items-center justify-center border border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.4)]">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-[0.2em] uppercase text-cyan-400 flex items-center gap-2">
                NIX LIFE OS AUTHENTICATION
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {mode === "register" ? "Create your personal command profile" : "Sign in to access your synchronized OS"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-cyan-400 text-sm font-semibold p-2 rounded-xl hover:bg-slate-900 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl mb-6">
          <button
            onClick={() => {
              setMode("register");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              mode === "register"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(34,211,238,0.2)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserCheck className="w-4 h-4" /> Create Account (Register)
          </button>
          <button
            onClick={() => {
              setMode("login");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              mode === "login"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(34,211,238,0.2)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Lock className="w-4 h-4" /> Sign In (Login)
          </button>
        </div>

        {/* Alerts & Feedback */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2.5 shadow-[0_0_12px_rgba(244,63,94,0.2)] animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2.5 shadow-[0_0_12px_rgba(16,185,129,0.2)] animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ================= REGISTER FORM ================= */}
        {mode === "register" && (
          <form onSubmit={handleRegister} className="space-y-6">
            
            {/* Required Section 1: Basic Identity */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 border-b border-slate-800 pb-2">
                <UserIcon className="w-4 h-4 text-cyan-400" />
                <span>1. Primary Account Details <span className="text-rose-400">* Required</span></span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    First Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regData.firstName}
                    onChange={(e) => handleRegChange("firstName", e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    Last Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regData.lastName}
                    onChange={(e) => handleRegChange("lastName", e.target.value)}
                    placeholder="e.g. Vance"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={regData.email}
                    onChange={(e) => handleRegChange("email", e.target.value)}
                    placeholder="e.g. alex.vance@example.com"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={regData.password}
                      onChange={(e) => handleRegChange("password", e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-9 pr-9 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    Confirm Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={regData.confirmPassword}
                      onChange={(e) => handleRegChange("confirmPassword", e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Required Section 2: Localization & Region */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 border-b border-slate-800 pb-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>2. Location & Localization <span className="text-rose-400">* Required</span></span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    Country/Region <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={regData.country}
                    onChange={(e) => handleRegChange("country", e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    Time Zone <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={regData.timezone}
                    onChange={(e) => handleRegChange("timezone", e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    Preferred Language <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={regData.preferredLanguage}
                    onChange={(e) => handleRegChange("preferredLanguage", e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Optional Section 3: Profile & Customization */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-2">
                <Camera className="w-4 h-4 text-slate-400" />
                <span>3. Profile Customization <span className="text-slate-500 font-normal">(Optional)</span></span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={regData.displayName || ""}
                    onChange={(e) => handleRegChange("displayName", e.target.value)}
                    placeholder="e.g. Commander Alex"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={regData.phoneNumber || ""}
                      onChange={(e) => handleRegChange("phoneNumber", e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Avatar Preset Selector */}
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-2">Select Avatar Preset or Custom Photo URL</label>
                <div className="flex items-center gap-3 mb-2">
                  {PRESET_AVATARS.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleRegChange("profilePhoto", imgUrl)}
                      className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all ${
                        regData.profilePhoto === imgUrl
                          ? "border-cyan-400 scale-110 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                          : "border-slate-800 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={imgUrl} alt="Preset avatar" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  value={regData.profilePhoto || ""}
                  onChange={(e) => handleRegChange("profilePhoto", e.target.value)}
                  placeholder="Or paste image URL (https://...)"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">Referral Code</label>
                  <div className="relative">
                    <Gift className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={regData.referralCode || ""}
                      onChange={(e) => handleRegChange("referralCode", e.target.value)}
                      placeholder="e.g. NIX-FRIEND-2026"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">Invitation Code</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={regData.invitationCode || ""}
                      onChange={(e) => handleRegChange("invitationCode", e.target.value)}
                      placeholder="e.g. INV-HQ-9901"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Required Section 4: Mandatory Legal Agreements & Consents */}
            <div className="space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 mb-1 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" /> Mandatory Policies & Consents
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  required
                  checked={regData.ageConfirmed}
                  onChange={(e) => handleRegChange("ageConfirmed", e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
                <span>
                  <strong>Age Confirmation:</strong> I confirm that I am at least 16 years of age or meet the local age requirements for digital account creation. <span className="text-rose-400">*</span>
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  required
                  checked={regData.termsAccepted}
                  onChange={(e) => handleRegChange("termsAccepted", e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
                <span>
                  <strong>Terms of Service:</strong> I accept the Nix Life OS Terms of Service and End User License Agreement. <span className="text-rose-400">*</span>
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  required
                  checked={regData.privacyAccepted}
                  onChange={(e) => handleRegChange("privacyAccepted", e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
                <span>
                  <strong>Privacy Policy:</strong> I accept the Privacy Policy and local storage data encryption standards. <span className="text-rose-400">*</span>
                </span>
              </label>

              {/* Optional Consents */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2 mt-2">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Optional Communication Consents:</div>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-400">
                  <input
                    type="checkbox"
                    checked={regData.productUpdateConsent}
                    onChange={(e) => handleRegChange("productUpdateConsent", e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                  />
                  <span>Product Update Consent (Receive new feature & version release notices)</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-400">
                  <input
                    type="checkbox"
                    checked={regData.marketingConsent}
                    onChange={(e) => handleRegChange("marketingConsent", e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                  />
                  <span>Marketing Consent (Receive operational productivity tips and offers)</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-400">
                  <input
                    type="checkbox"
                    checked={regData.analyticsConsent}
                    onChange={(e) => handleRegChange("analyticsConsent", e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                  />
                  <span>Analytics Consent (Help improve Nix Life OS performance with anonymous telemetry)</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-2xl text-xs font-mono font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> Complete Registration & Boot Nix OS
            </button>
          </form>
        )}

        {/* ================= LOGIN FORM ================= */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[11px] font-mono text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="alex.vance@nixos.io"
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer font-mono text-[11px]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
                Remember user session
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(loginEmail);
                  setMode("forgot");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-cyan-400 hover:underline font-mono text-[11px]"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-2xl text-xs font-mono font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all flex items-center justify-center gap-2"
            >
              <ChevronRight className="w-4 h-4" /> Sign In to Nix Life OS
            </button>

            {/* Quick Demo Credentials */}
            <div className="pt-4 border-t border-slate-800 text-center space-y-2">
              <p className="text-[11px] font-mono text-slate-500">Need instant access? Use the pre-configured Demo Account:</p>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-mono font-bold rounded-xl transition-all shadow-sm"
              >
                ⚡ Quick Demo Login (Commander Alex)
              </button>
            </div>
          </form>
        )}

        {/* ================= FORGOT PASSWORD FORM ================= */}
        {mode === "forgot" && (
          <form onSubmit={handleForgotPassword} className="space-y-5">
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 font-mono space-y-1">
              <p className="text-cyan-400 font-bold uppercase tracking-wider">Account Access Recovery</p>
              <p>Enter your registered account email address. We will dispatch a password reset link and verification key.</p>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-300 mb-1">
                Account Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="alex.vance@nixos.io"
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-2xl text-xs font-mono font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" /> Dispatch Password Reset Link
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-slate-400 hover:text-cyan-300 text-xs font-mono underline"
              >
                ← Return to Sign In
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
