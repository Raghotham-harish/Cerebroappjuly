import { useState } from "react";
import { CreBroLogo } from "./CreBroLogo";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Mail } from "lucide-react";

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

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [ageError, setAgeError] = useState("");
  const [emailError, setEmailError] = useState("");

  const calculateAge = (day: string, month: string, year: string) => {
    if (!day || !month || !year) return 0;
    
    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate personal email
    if (email && !isPersonalEmail(email)) {
      setEmailError("Please use a personal email address (Gmail, Outlook, Yahoo, iCloud, etc.)");
      return;
    }
    setEmailError("");

    // Validate age for sign up
    if (isSignUp) {
      if (!day || !month || !year) {
        setAgeError("Please enter your complete date of birth");
        return;
      }

      const age = calculateAge(day, month, year);
      if (age < 18) {
        setAgeError("You must be 18 or older to use CereBro");
        return;
      }
    }

    setAgeError("");
    onLogin();
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
    onLogin();
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden flex items-center justify-center" 
      style={{ 
        background: 'transparent',
        padding: '16px'
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo and title */}
        <div className="flex flex-col items-center mb-10">
          <CreBroLogo size={80} variant="full" />
          <h1 className="mt-6 text-3xl text-center" style={{ fontFamily: 'Lora, serif', fontWeight: 500, color: '#15113C' }}>
            {isSignUp ? 'Welcome to CereBro' : 'Welcome Back'}
          </h1>
          <p className="mt-2 text-sm text-gray-600 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
            {isSignUp ? 'Your journey to mental wellness begins here' : 'Continue your wellness journey'}
          </p>
        </div>

        {/* Email login form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Personal email (Gmail, Outlook, Yahoo…)"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
              className="w-full px-6 py-4 rounded-full text-base border-2 focus:outline-none transition-colors bg-white"
              style={{ fontFamily: 'Inter, sans-serif', color: '#15113C', borderColor: emailError ? "#EF4444" : undefined }}
              required
            />
            {emailError && (
              <p className="mt-2 px-4 text-xs" style={{ color: "#EF4444", fontFamily: "Inter, sans-serif" }}>{emailError}</p>
            )}
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 rounded-full text-base border-2 border-purple-200 focus:border-purple-400 focus:outline-none transition-colors bg-white"
              style={{ fontFamily: 'Inter, sans-serif', color: '#15113C' }}
              required
            />
          </div>
          
          {isSignUp && (
            <div>
              <p className="text-sm text-gray-700 mb-3 px-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                Date of Birth
              </p>
              <div className="flex gap-3">
                {/* Day */}
                <input
                  type="number"
                  placeholder="DD"
                  value={day}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 31)) {
                      setDay(val);
                      setAgeError("");
                    }
                  }}
                  min="1"
                  max="31"
                  className="flex-1 px-4 py-4 rounded-full text-center text-base border-2 border-purple-200 focus:border-purple-400 focus:outline-none transition-colors bg-white"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#15113C' }}
                  required
                />
                {/* Month */}
                <input
                  type="number"
                  placeholder="MM"
                  value={month}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 12)) {
                      setMonth(val);
                      setAgeError("");
                    }
                  }}
                  min="1"
                  max="12"
                  className="flex-1 px-4 py-4 rounded-full text-center text-base border-2 border-purple-200 focus:border-purple-400 focus:outline-none transition-colors bg-white"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#15113C' }}
                  required
                />
                {/* Year */}
                <input
                  type="number"
                  placeholder="YYYY"
                  value={year}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || (val.length <= 4 && parseInt(val) >= 1900)) {
                      setYear(val);
                      setAgeError("");
                    }
                  }}
                  min="1900"
                  max="2026"
                  className="flex-[1.5] px-4 py-4 rounded-full text-center text-base border-2 border-purple-200 focus:border-purple-400 focus:outline-none transition-colors bg-white"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#15113C' }}
                  required
                />
              </div>
              <p className="text-xs text-gray-600 mt-2 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                You must be 18+ to use CereBro
              </p>
              {ageError && (
                <p className="text-sm text-red-600 mt-2 text-center" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                  {ageError}
                </p>
              )}
            </div>
          )}
          
          <button
            type="submit"
            className="w-full py-4 rounded-full transition-colors mt-6"
            style={{ 
              fontFamily: 'Inter, sans-serif', 
              fontWeight: 600,
              fontSize: '16px',
              background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
              color: 'white'
            }}
          >
            {isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-transparent text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>or</span>
          </div>
        </div>

        {/* Social login buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleSocialLogin("Google")}
            className="w-full h-14 rounded-full border-2 border-purple-200 hover:border-purple-300 bg-white transition-colors flex items-center justify-center"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#15113C' }}
          >
            <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          
          <button
            type="button"
            onClick={() => handleSocialLogin("Microsoft")}
            className="w-full h-14 rounded-full border-2 border-purple-200 hover:border-purple-300 bg-white transition-colors flex items-center justify-center"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#15113C' }}
          >
            <svg className="mr-3 h-5 w-5" viewBox="0 0 23 23" fill="none">
              <path d="M0 0h11v11H0z" fill="#f25022"/>
              <path d="M12 0h11v11H12z" fill="#00a4ef"/>
              <path d="M0 12h11v11H0z" fill="#7fba00"/>
              <path d="M12 12h11v11H12z" fill="#ffb900"/>
            </svg>
            Continue with Microsoft
          </button>
        </div>

        {/* Toggle sign up/in */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setAgeError("");
              setDay("");
              setMonth("");
              setYear("");
            }}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}