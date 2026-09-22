import { useState, useEffect } from "react";
import { Search, Building2, Plus, Check, X } from "lucide-react";
import { AnimatedLogo } from "./AnimatedLogo";

interface Company {
  id: string;
  name: string;
  industry?: string;
  domain: string;
}

interface CompanySelectionProps {
  userName: string;
  onComplete: (companyName: string, companyEmail: string, companyId?: string) => void;
}

const GENERIC_PROVIDERS = [
  "gmail.com","yahoo.com","yahoo.co.uk","yahoo.in","hotmail.com","outlook.com",
  "outlook.in","live.com","icloud.com","me.com","mac.com","protonmail.com",
  "proton.me","aol.com","zoho.com","yandex.com","yandex.ru","gmx.com",
  "gmx.net","mail.com","rediffmail.com","inbox.com","fastmail.com",
];

function isOrgEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  return !!domain && !GENERIC_PROVIDERS.includes(domain);
}

const onboardedCompanies: Company[] = [
  { id: "1",  name: "Google",             industry: "Technology",    domain: "google.com" },
  { id: "2",  name: "Microsoft",          industry: "Technology",    domain: "microsoft.com" },
  { id: "3",  name: "Apple Inc.",         industry: "Technology",    domain: "apple.com" },
  { id: "4",  name: "Amazon",             industry: "E-commerce",    domain: "amazon.com" },
  { id: "5",  name: "Meta Platforms",     industry: "Technology",    domain: "meta.com" },
  { id: "6",  name: "Tesla",              industry: "Automotive",    domain: "tesla.com" },
  { id: "7",  name: "Netflix",            industry: "Entertainment", domain: "netflix.com" },
  { id: "8",  name: "Goldman Sachs",      industry: "Finance",       domain: "gs.com" },
  { id: "9",  name: "McKinsey & Company", industry: "Consulting",    domain: "mckinsey.com" },
  { id: "10", name: "Deloitte",           industry: "Consulting",    domain: "deloitte.com" },
];

export function CompanySelection({ userName, onComplete }: CompanySelectionProps) {
  const [searchQuery, setSearchQuery]               = useState("");
  const [selectedCompany, setSelectedCompany]       = useState<Company | null>(null);
  const [isManualEntry, setIsManualEntry]           = useState(false);
  const [manualCompanyName, setManualCompanyName]   = useState("");
  // For known companies: just the local part (before @)
  const [emailLocal, setEmailLocal]                 = useState("");
  // For manual companies: full email
  const [manualEmail, setManualEmail]               = useState("");
  const [emailError, setEmailError]                 = useState("");

  const filteredCompanies = searchQuery
    ? onboardedCompanies.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // When search has text but no matches → auto-enter manual mode with query pre-filled
  useEffect(() => {
    if (searchQuery && filteredCompanies.length === 0 && !selectedCompany) {
      setIsManualEntry(true);
      setManualCompanyName(searchQuery);
    } else if (filteredCompanies.length > 0) {
      // Results came back — exit auto-manual mode if nothing confirmed yet
      if (isManualEntry && !manualCompanyName) {
        setIsManualEntry(false);
      }
    }
  }, [searchQuery, filteredCompanies.length]);

  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company);
    setIsManualEntry(false);
    setManualCompanyName("");
    setEmailLocal("");
    setEmailError("");
    setSearchQuery("");
  };

  const handleClearSelection = () => {
    setSelectedCompany(null);
    setEmailLocal("");
    setEmailError("");
  };

  const handleManualEntry = () => {
    setIsManualEntry(true);
    setSelectedCompany(null);
    setEmailError("");
  };

  const handleContinue = () => {
    if (selectedCompany) {
      if (!emailLocal.trim()) return;
      const fullEmail = `${emailLocal.trim()}@${selectedCompany.domain}`;
      onComplete(selectedCompany.name, fullEmail, selectedCompany.id);
    } else if (isManualEntry && manualCompanyName.trim()) {
      if (!manualEmail.trim() || !manualEmail.includes("@")) {
        setEmailError("Please enter a valid work email address");
        return;
      }
      if (!isOrgEmail(manualEmail.trim())) {
        setEmailError("Please use your organisation email (not Gmail, Outlook, Yahoo, etc.)");
        return;
      }
      onComplete(manualCompanyName.trim(), manualEmail.trim());
    }
  };

  const canContinue = selectedCompany
    ? emailLocal.trim().length > 0
    : isManualEntry && manualCompanyName.trim().length > 0 && manualEmail.trim().includes("@") && !emailError;

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(135deg, #FAF5FF 0%, #EDE9FE 50%, #EBF8FF 100%)" }}
    >
      {/* Logo */}
      <div className="pt-8 pb-4 flex justify-center px-4">
        <AnimatedLogo size={48} animate={false} />
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto px-4">
          <div className="max-w-2xl mx-auto py-6">

            {/* Header */}
            <div className="mb-8 text-center">
              <h2 className="text-2xl mb-2" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>
                Welcome, {userName}
              </h2>
              <p className="text-base" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280" }}>
                Which organisation are you associated with?
              </p>
            </div>

            {/* Selected company pill */}
            {selectedCompany && (
              <div
                className="flex items-center gap-3 p-4 rounded-2xl mb-6"
                style={{ background: "#F3E8FF", border: "2px solid #A78BFA" }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#EDE9FE" }}>
                  <Building2 className="w-5 h-5" style={{ color: "#8B5CF6" }} />
                </div>
                <div className="flex-1">
                  <p className="text-base" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#15113C" }}>
                    {selectedCompany.name}
                  </p>
                  <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#8B5CF6" }}>
                    {selectedCompany.industry}
                  </p>
                </div>
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: "#8B5CF6" }} />
                <button onClick={handleClearSelection} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(139,92,246,0.15)" }}>
                  <X className="w-3 h-3" style={{ color: "#8B5CF6" }} />
                </button>
              </div>
            )}

            {/* Search (hidden once company selected) */}
            {!selectedCompany && (
              <>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "#9CA3AF" }} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (!e.target.value) { setIsManualEntry(false); setManualCompanyName(""); }
                      }}
                      placeholder="Search for your organisation..."
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 outline-none transition-all"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "16px",
                        borderColor: searchQuery ? "#8B5CF6" : "#E5E7EB",
                        background: "white",
                      }}
                    />
                  </div>
                </div>

                {/* Results dropdown */}
                {searchQuery && filteredCompanies.length > 0 && (
                  <div className="mb-4 rounded-2xl overflow-hidden" style={{ background: "white", border: "2px solid #E5E7EB" }}>
                    {filteredCompanies.map((company) => (
                      <button
                        key={company.id}
                        onClick={() => handleSelectCompany(company)}
                        className="w-full p-4 text-left border-b transition-all hover:bg-purple-50"
                        style={{ borderColor: "#F3F4F6" }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#EDE9FE" }}>
                            <Building2 className="w-5 h-5" style={{ color: "#8B5CF6" }} />
                          </div>
                          <div>
                            <p className="text-base" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#15113C" }}>
                              {company.name}
                            </p>
                            <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>
                              {company.industry} · {company.domain}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Auto manual entry — no results found */}
                {isManualEntry && (
                  <div className="mb-4 p-5 rounded-2xl" style={{ background: "white", border: "2px solid #8B5CF6" }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Plus className="w-4 h-4" style={{ color: "#8B5CF6" }} />
                      <p className="text-sm" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#8B5CF6" }}>
                        Not found — add your organisation
                      </p>
                    </div>
                    <label className="block text-xs mb-1.5" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280", fontWeight: 600 }}>
                      Organisation Name
                    </label>
                    <input
                      type="text"
                      value={manualCompanyName}
                      onChange={(e) => setManualCompanyName(e.target.value)}
                      placeholder="Enter organisation name..."
                      className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", borderColor: "#E5E7EB", background: "#F9FAFB" }}
                      autoFocus
                    />
                  </div>
                )}

                {/* Manual add button — shown when no search query */}
                {!searchQuery && !isManualEntry && (
                  <>
                    <div className="flex items-center justify-center mb-4">
                      <div className="flex-1 h-px" style={{ background: "#E5E7EB" }} />
                      <span className="px-4 text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>OR</span>
                      <div className="flex-1 h-px" style={{ background: "#E5E7EB" }} />
                    </div>
                    <button
                      onClick={handleManualEntry}
                      className="w-full p-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 transition-all"
                      style={{ borderColor: "#C4B5FD", background: "rgba(237,233,254,0.3)" }}
                    >
                      <Plus className="w-5 h-5" style={{ color: "#8B5CF6" }} />
                      <span className="text-base" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#8B5CF6" }}>
                        Add Organisation Manually
                      </span>
                    </button>
                  </>
                )}
              </>
            )}

            {/* ── Email section ── */}

            {/* Known company: split input — local part only, domain locked */}
            {selectedCompany && (
              <div className="p-5 rounded-2xl mb-6" style={{ background: "white", border: "2px solid #E5E7EB" }}>
                <label className="block text-sm mb-2" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280", fontWeight: 600 }}>
                  Work Email Address
                </label>
                <div
                  className="flex items-center rounded-xl overflow-hidden border-2 transition-all"
                  style={{ borderColor: emailLocal ? "#8B5CF6" : "#E5E7EB" }}
                >
                  <input
                    type="text"
                    value={emailLocal}
                    onChange={(e) => setEmailLocal(e.target.value.replace(/@.*/, ""))}
                    placeholder="yourname"
                    className="flex-1 px-4 py-3 outline-none"
                    style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", background: "#F9FAFB", color: "#15113C" }}
                  />
                  <div
                    className="px-4 py-3 flex-shrink-0"
                    style={{ background: "#EDE9FE", borderLeft: "2px solid #C4B5FD" }}
                  >
                    <span className="text-sm" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#8B5CF6" }}>
                      @{selectedCompany.domain}
                    </span>
                  </div>
                </div>
                <p className="text-xs mt-2" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>
                  Enter the part before @ — domain is pre-filled for {selectedCompany.name}
                </p>
              </div>
            )}

            {/* Manual company: full email */}
            {isManualEntry && manualCompanyName.trim() && (
              <div className="p-5 rounded-2xl mb-6" style={{ background: "white", border: `2px solid ${emailError ? "#EF4444" : "#E5E7EB"}` }}>
                <label className="block text-sm mb-1" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280", fontWeight: 600 }}>
                  Organisation Email Address
                </label>
                <p className="text-xs mb-2" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>
                  Use your company domain — not Gmail, Outlook, Yahoo, etc.
                </p>
                <input
                  type="email"
                  value={manualEmail}
                  onChange={(e) => { setManualEmail(e.target.value); setEmailError(""); }}
                  placeholder="you@yourcompany.com"
                  className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "15px",
                    borderColor: emailError ? "#EF4444" : manualEmail.includes("@") ? "#10B981" : "#E5E7EB",
                    background: "#F9FAFB",
                  }}
                />
                {emailError && (
                  <p className="text-xs mt-2" style={{ fontFamily: "Inter, sans-serif", color: "#EF4444", fontWeight: 600 }}>
                    {emailError}
                  </p>
                )}
              </div>
            )}

            <div className="pb-8" />
          </div>
        </div>

        {/* Sticky Continue */}
        <div
          className="flex-shrink-0 px-4 py-4"
          style={{
            background: "linear-gradient(180deg, rgba(250,245,255,0.8) 0%, rgba(250,245,255,1) 100%)",
            borderTop: "1px solid rgba(229,231,235,0.3)",
          }}
        >
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleContinue}
              disabled={!canContinue}
              className="w-full py-4 rounded-full transition-all disabled:opacity-40"
              style={{
                background: canContinue ? "linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)" : "#E5E7EB",
                color: "white",
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: "16px",
                border: canContinue ? "none" : "2px solid #D1D5DB",
              }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
