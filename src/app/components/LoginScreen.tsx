import { useState, useRef, useEffect } from "react";
import { CreBroLogo } from "./CreBroLogo";
import { ArrowLeft, Eye, EyeOff, CheckCircle, Mail, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LoginScreenProps {
  onLogin: () => void;
}

const PERSONAL_PROVIDERS = [
  "gmail.com","yahoo.com","yahoo.co.uk","yahoo.in","hotmail.com","outlook.com",
  "outlook.in","live.com","icloud.com","me.com","mac.com","protonmail.com",
  "proton.me","aol.com","zoho.com","yandex.com","yandex.ru","gmx.com",
  "gmx.net","mail.com","rediffmail.com","inbox.com","fastmail.com",
];

function isPersonalEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  return PERSONAL_PROVIDERS.includes(domain);
}

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length >= 12) score++;
  if (score <= 1) return { score, label: "Weak", color: "#EF4444" };
  if (score <= 3) return { score, label: "Fair", color: "#F59E0B" };
  return { score, label: "Strong", color: "#10B981" };
}

type ForgotStep = "login" | "email" | "otp" | "newpass" | "success";

/* ─── Slide wrapper ──────────────────────────────────────────────────── */
function Slide({ children, dir = 1 }: { children: React.ReactNode; dir?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: dir * 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -dir * 40 }}
      transition={{ type: "spring", damping: 28, stiffness: 320 }}
    >
      {children}
    </motion.div>
  );
}

/* ─── OTP digit boxes ────────────────────────────────────────────────── */
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, "").slice(0, 6).split("");

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
      const next = digits.slice();
      next[i - 1] = "";
      onChange(next.join(""));
    }
  };

  const handleChange = (i: number, char: string) => {
    const c = char.replace(/\D/g, "").slice(-1);
    const next = digits.slice();
    next[i] = c;
    onChange(next.join(""));
    if (c && i < 5) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) { onChange(pasted.padEnd(6, "").slice(0, 6)); refs.current[Math.min(pasted.length, 5)]?.focus(); }
    e.preventDefault();
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length: 6 }, (_, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ""}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-xl font-semibold rounded-2xl border-2 focus:outline-none transition-colors bg-white"
          style={{
            fontFamily: "Inter, sans-serif",
            color: "#15113C",
            borderColor: digits[i] ? "#8B5CF6" : "#DDD6FE",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Resend countdown ───────────────────────────────────────────────── */
function ResendTimer({ onResend }: { onResend: () => void }) {
  const [secs, setSecs] = useState(60);
  useEffect(() => {
    if (secs <= 0) return;
    const t = setTimeout(() => setSecs(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);

  return secs > 0 ? (
    <p className="text-sm text-center" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>
      Resend code in <span style={{ color: "#8B5CF6", fontWeight: 600 }}>{secs}s</span>
    </p>
  ) : (
    <button
      onClick={() => { onResend(); setSecs(60); }}
      className="flex items-center gap-1.5 mx-auto text-sm"
      style={{ fontFamily: "Inter, sans-serif", color: "#8B5CF6", fontWeight: 600 }}
    >
      <RefreshCw style={{ width: 14, height: 14 }} /> Resend code
    </button>
  );
}

/* ─── Main component ─────────────────────────────────────────────────── */
export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [ageError, setAgeError] = useState("");
  const [emailError, setEmailError] = useState("");

  // Forgot password state
  const [step, setStep] = useState<ForgotStep>("login");
  const [fpEmail, setFpEmail] = useState("");
  const [fpEmailError, setFpEmailError] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passError, setPassError] = useState("");

  const strength = getPasswordStrength(newPass);

  const calculateAge = (d: string, m: string, y: string) => {
    if (!d || !m || !y) return 0;
    const birth = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const md = today.getMonth() - birth.getMonth();
    if (md < 0 || (md === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && !isPersonalEmail(email)) {
      setEmailError("Please use a personal email address (Gmail, Outlook, Yahoo, iCloud, etc.)");
      return;
    }
    setEmailError("");
    if (isSignUp) {
      if (!day || !month || !year) { setAgeError("Please enter your complete date of birth"); return; }
      if (calculateAge(day, month, year) < 18) { setAgeError("You must be 18 or older to use CereBro"); return; }
    }
    setAgeError("");
    onLogin();
  };

  const handleSendReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fpEmail) { setFpEmailError("Please enter your email address"); return; }
    if (!isPersonalEmail(fpEmail)) { setFpEmailError("Please use the personal email you registered with"); return; }
    setFpEmailError("");
    setStep("otp");
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const filled = otp.replace(/\s/g, "");
    if (filled.length < 6) { setOtpError("Please enter the complete 6-digit code"); return; }
    // Mock: accept any 6-digit code
    setOtpError("");
    setStep("newpass");
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 8) { setPassError("Password must be at least 8 characters"); return; }
    if (newPass !== confirmPass) { setPassError("Passwords don't match"); return; }
    setPassError("");
    setStep("success");
  };

  const resetForgotFlow = () => {
    setStep("login");
    setFpEmail("");
    setFpEmailError("");
    setOtp("");
    setOtpError("");
    setNewPass("");
    setConfirmPass("");
    setPassError("");
    setShowNew(false);
    setShowConfirm(false);
  };

  const PAGE_BG = { background: "transparent", padding: "16px" };
  const INPUT_BASE = "w-full px-6 py-4 rounded-full text-base border-2 focus:outline-none transition-colors bg-white";

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={PAGE_BG}>
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">

          {/* ── LOGIN ─────────────────────────────────────────────── */}
          {step === "login" && (
            <Slide key="login">
              <div className="flex flex-col items-center mb-10">
                <CreBroLogo size={80} variant="full" />
                <h1 className="mt-6 text-3xl text-center" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>
                  {isSignUp ? "Welcome to CereBro" : "Welcome Back"}
                </h1>
                <p className="mt-2 text-sm text-gray-600 text-center" style={{ fontFamily: "Inter, sans-serif" }}>
                  {isSignUp ? "Your journey to mental wellness begins here" : "Continue your wellness journey"}
                </p>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <input
                    type="email" placeholder="Personal email (Gmail, Outlook, Yahoo…)"
                    value={email} onChange={e => { setEmail(e.target.value); setEmailError(""); }}
                    className={INPUT_BASE}
                    style={{ fontFamily: "Inter, sans-serif", color: "#15113C", borderColor: emailError ? "#EF4444" : "#DDD6FE" }}
                    required
                  />
                  {emailError && <p className="mt-2 px-4 text-xs" style={{ color: "#EF4444", fontFamily: "Inter, sans-serif" }}>{emailError}</p>}
                </div>

                <div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"} placeholder="Password"
                      value={password} onChange={e => setPassword(e.target.value)}
                      className={INPUT_BASE + " pr-14"}
                      style={{ fontFamily: "Inter, sans-serif", color: "#15113C", borderColor: "#DDD6FE" }}
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-5 top-1/2 -translate-y-1/2"
                      style={{ color: "#9CA3AF" }}>
                      {showPassword
                        ? <EyeOff style={{ width: 18, height: 18 }} />
                        : <Eye style={{ width: 18, height: 18 }} />}
                    </button>
                  </div>
                  {!isSignUp && (
                    <div className="text-right mt-2 pr-2">
                      <button type="button" onClick={() => { setFpEmail(email); setStep("email"); }}
                        className="text-xs"
                        style={{ fontFamily: "Inter, sans-serif", color: "#8B5CF6", fontWeight: 600 }}>
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>

                {isSignUp && (
                  <div>
                    <p className="text-sm text-gray-700 mb-3 px-2" style={{ fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
                      Date of Birth
                    </p>
                    <div className="flex gap-3">
                      <input type="number" placeholder="DD" value={day}
                        onChange={e => { const v = e.target.value; if (v === "" || (parseInt(v) >= 1 && parseInt(v) <= 31)) { setDay(v); setAgeError(""); } }}
                        min="1" max="31" className="flex-1 px-4 py-4 rounded-full text-center text-base border-2 border-purple-200 focus:border-purple-400 focus:outline-none bg-white"
                        style={{ fontFamily: "Inter, sans-serif", color: "#15113C" }} required />
                      <input type="number" placeholder="MM" value={month}
                        onChange={e => { const v = e.target.value; if (v === "" || (parseInt(v) >= 1 && parseInt(v) <= 12)) { setMonth(v); setAgeError(""); } }}
                        min="1" max="12" className="flex-1 px-4 py-4 rounded-full text-center text-base border-2 border-purple-200 focus:border-purple-400 focus:outline-none bg-white"
                        style={{ fontFamily: "Inter, sans-serif", color: "#15113C" }} required />
                      <input type="number" placeholder="YYYY" value={year}
                        onChange={e => { const v = e.target.value; if (v === "" || (v.length <= 4 && parseInt(v) >= 1900)) { setYear(v); setAgeError(""); } }}
                        min="1900" max="2026" className="flex-[1.5] px-4 py-4 rounded-full text-center text-base border-2 border-purple-200 focus:border-purple-400 focus:outline-none bg-white"
                        style={{ fontFamily: "Inter, sans-serif", color: "#15113C" }} required />
                    </div>
                    <p className="text-xs text-gray-600 mt-2 text-center" style={{ fontFamily: "Inter, sans-serif" }}>You must be 18+ to use CereBro</p>
                    {ageError && <p className="text-sm text-red-600 mt-2 text-center" style={{ fontFamily: "Inter, sans-serif", fontWeight: 500 }}>{ageError}</p>}
                  </div>
                )}

                <button type="submit" className="w-full py-4 rounded-full transition-colors mt-6"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "16px", background: "linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)", color: "white" }}>
                  {isSignUp ? "Create Account" : "Sign In"}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-transparent text-gray-500" style={{ fontFamily: "Inter, sans-serif" }}>or</span>
                </div>
              </div>

              <div className="space-y-3">
                <button type="button" onClick={() => onLogin()}
                  className="w-full h-14 rounded-full border-2 border-purple-200 hover:border-purple-300 bg-white transition-colors flex items-center justify-center"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, color: "#15113C" }}>
                  <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
                <button type="button" onClick={() => onLogin()}
                  className="w-full h-14 rounded-full border-2 border-purple-200 hover:border-purple-300 bg-white transition-colors flex items-center justify-center"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, color: "#15113C" }}>
                  <svg className="mr-3 h-5 w-5" viewBox="0 0 23 23" fill="none">
                    <path d="M0 0h11v11H0z" fill="#f25022"/><path d="M12 0h11v11H12z" fill="#00a4ef"/>
                    <path d="M0 12h11v11H0z" fill="#7fba00"/><path d="M12 12h11v11H12z" fill="#ffb900"/>
                  </svg>
                  Continue with Microsoft
                </button>
              </div>

              <div className="mt-8 text-center">
                <button type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setAgeError(""); setDay(""); setMonth(""); setYear(""); }}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  style={{ fontFamily: "Inter, sans-serif" }}>
                  {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                </button>
              </div>
            </Slide>
          )}

          {/* ── STEP 1 — EMAIL ENTRY ───────────────────────────────── */}
          {step === "email" && (
            <Slide key="email">
              <button onClick={resetForgotFlow} className="mb-8 flex items-center gap-2"
                style={{ fontFamily: "Inter, sans-serif", color: "#8B5CF6", fontWeight: 600, fontSize: 14 }}>
                <ArrowLeft style={{ width: 18, height: 18 }} /> Back to Sign In
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)" }}>
                  <Mail style={{ width: 34, height: 34, color: "#8B5CF6", strokeWidth: 1.5 }} />
                </div>
              </div>

              <h2 className="text-2xl text-center mb-2" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>
                Forgot Password?
              </h2>
              <p className="text-sm text-center mb-8" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280", lineHeight: 1.6 }}>
                No worries — enter your email and we'll send you a 6-digit reset code.
              </p>

              <form onSubmit={handleSendReset} className="space-y-4">
                <div>
                  <input
                    type="email" placeholder="Your registered email"
                    value={fpEmail} onChange={e => { setFpEmail(e.target.value); setFpEmailError(""); }}
                    className={INPUT_BASE}
                    style={{ fontFamily: "Inter, sans-serif", color: "#15113C", borderColor: fpEmailError ? "#EF4444" : "#DDD6FE" }}
                    autoFocus
                  />
                  {fpEmailError && <p className="mt-2 px-4 text-xs" style={{ color: "#EF4444", fontFamily: "Inter, sans-serif" }}>{fpEmailError}</p>}
                </div>

                <button type="submit" className="w-full py-4 rounded-full mt-2"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 16, background: "linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)", color: "white" }}>
                  Send Reset Code
                </button>
              </form>
            </Slide>
          )}

          {/* ── STEP 2 — OTP VERIFICATION ─────────────────────────── */}
          {step === "otp" && (
            <Slide key="otp">
              <button onClick={() => setStep("email")} className="mb-8 flex items-center gap-2"
                style={{ fontFamily: "Inter, sans-serif", color: "#8B5CF6", fontWeight: 600, fontSize: 14 }}>
                <ArrowLeft style={{ width: 18, height: 18 }} /> Back
              </button>

              <h2 className="text-2xl text-center mb-2" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>
                Check Your Email
              </h2>
              <p className="text-sm text-center mb-2" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280" }}>
                We sent a 6-digit code to
              </p>
              <p className="text-sm text-center mb-8 font-semibold" style={{ fontFamily: "Inter, sans-serif", color: "#8B5CF6" }}>
                {fpEmail}
              </p>

              <form onSubmit={handleVerifyOtp}>
                <OtpInput value={otp} onChange={setOtp} />
                {otpError && <p className="mt-3 text-xs text-center" style={{ color: "#EF4444", fontFamily: "Inter, sans-serif" }}>{otpError}</p>}

                <button type="submit" className="w-full py-4 rounded-full mt-8"
                  style={{
                    fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 16, color: "white",
                    background: otp.replace(/\s/g, "").length === 6
                      ? "linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)"
                      : "#E5E7EB",
                    transition: "background 0.2s"
                  }}
                  disabled={otp.replace(/\s/g, "").length < 6}>
                  Verify Code
                </button>
              </form>

              <div className="mt-6">
                <ResendTimer onResend={() => console.log("Resend OTP")} />
              </div>

              <div className="mt-4 text-center">
                <button onClick={resetForgotFlow} className="text-xs"
                  style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>
                  Back to Sign In
                </button>
              </div>
            </Slide>
          )}

          {/* ── STEP 3 — NEW PASSWORD ──────────────────────────────── */}
          {step === "newpass" && (
            <Slide key="newpass">
              <button onClick={() => setStep("otp")} className="mb-8 flex items-center gap-2"
                style={{ fontFamily: "Inter, sans-serif", color: "#8B5CF6", fontWeight: 600, fontSize: 14 }}>
                <ArrowLeft style={{ width: 18, height: 18 }} /> Back
              </button>

              <h2 className="text-2xl text-center mb-2" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>
                Create New Password
              </h2>
              <p className="text-sm text-center mb-8" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280", lineHeight: 1.6 }}>
                Your new password must be different from previously used passwords.
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* New password */}
                <div>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"} placeholder="New password"
                      value={newPass} onChange={e => { setNewPass(e.target.value); setPassError(""); }}
                      className={INPUT_BASE + " pr-14"}
                      style={{ fontFamily: "Inter, sans-serif", color: "#15113C", borderColor: passError ? "#EF4444" : "#DDD6FE" }}
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowNew(v => !v)}
                      className="absolute right-5 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }}>
                      {showNew ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {newPass && (
                    <div className="mt-3 px-2">
                      <div className="flex gap-1.5 mb-1.5">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className="flex-1 h-1.5 rounded-full transition-all"
                            style={{ background: i <= strength.score ? strength.color : "#E5E7EB" }} />
                        ))}
                      </div>
                      <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: strength.color, fontWeight: 600 }}>
                        {strength.label}
                        {strength.score < 3 && " — add uppercase, numbers or symbols"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"} placeholder="Confirm new password"
                    value={confirmPass} onChange={e => { setConfirmPass(e.target.value); setPassError(""); }}
                    className={INPUT_BASE + " pr-14"}
                    style={{
                      fontFamily: "Inter, sans-serif", color: "#15113C",
                      borderColor: passError ? "#EF4444" : confirmPass && confirmPass === newPass ? "#10B981" : "#DDD6FE"
                    }}
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-5 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }}>
                    {showConfirm ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                  </button>
                </div>

                {passError && <p className="text-xs px-2" style={{ color: "#EF4444", fontFamily: "Inter, sans-serif" }}>{passError}</p>}

                {/* Requirements */}
                <div className="px-2 space-y-1.5">
                  {[
                    { ok: newPass.length >= 8, text: "At least 8 characters" },
                    { ok: /[A-Z]/.test(newPass), text: "One uppercase letter" },
                    { ok: /[0-9]/.test(newPass), text: "One number" },
                  ].map(({ ok, text }) => (
                    <div key={text} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: ok ? "#DCFCE7" : "#F3F4F6" }}>
                        {ok && <CheckCircle style={{ width: 12, height: 12, color: "#10B981" }} />}
                      </div>
                      <span className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: ok ? "#10B981" : "#9CA3AF" }}>{text}</span>
                    </div>
                  ))}
                </div>

                <button type="submit" className="w-full py-4 rounded-full mt-2"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 16, background: "linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)", color: "white" }}>
                  Reset Password
                </button>
              </form>
            </Slide>
          )}

          {/* ── STEP 4 — SUCCESS ──────────────────────────────────── */}
          {step === "success" && (
            <Slide key="success">
              <div className="flex flex-col items-center text-center py-8">
                {/* Animated checkmark */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 14, stiffness: 200, delay: 0.1 }}
                  className="w-24 h-24 rounded-full flex items-center justify-center mb-8"
                  style={{ background: "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)" }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 12, stiffness: 260, delay: 0.25 }}
                  >
                    <CheckCircle style={{ width: 44, height: 44, color: "#10B981", strokeWidth: 1.75 }} />
                  </motion.div>
                </motion.div>

                <h2 className="text-3xl mb-3" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>
                  Password Reset!
                </h2>
                <p className="text-sm mb-10 max-w-xs" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280", lineHeight: 1.7 }}>
                  Your password has been successfully updated. You can now sign in with your new password.
                </p>

                {/* Confetti dots */}
                <div className="relative w-full h-2 mb-8 overflow-visible pointer-events-none">
                  {[...Array(8)].map((_, i) => (
                    <motion.div key={i}
                      className="absolute w-2 h-2 rounded-full"
                      style={{ left: `${10 + i * 12}%`, background: ["#A78BFA","#8B5CF6","#C4B5FD","#10B981","#34D399","#6EE7B7","#A78BFA","#8B5CF6"][i] }}
                      initial={{ y: 0, opacity: 1 }}
                      animate={{ y: [-30, 0], opacity: [1, 0] }}
                      transition={{ duration: 1.2, delay: i * 0.08, ease: "easeOut" }}
                    />
                  ))}
                </div>

                <button onClick={resetForgotFlow}
                  className="w-full py-4 rounded-full"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 16, background: "linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)", color: "white" }}>
                  Sign In Now
                </button>
              </div>
            </Slide>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
