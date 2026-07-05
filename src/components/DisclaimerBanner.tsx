import { AlertTriangle, Info } from "lucide-react";
import { DISCLAIMER_PRIMARY, DISCLAIMER_SCOPE } from "../data/disclaimers";

export function DisclaimerBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`disclaimer-banner ${compact ? "is-compact" : ""}`} role="note">
      <div className="disclaimer-row">
        <AlertTriangle size={compact ? 18 : 22} className="disclaimer-icon warn" />
        <p className="disclaimer-primary">{DISCLAIMER_PRIMARY}</p>
      </div>
      {!compact && (
        <div className="disclaimer-row">
          <Info size={18} className="disclaimer-icon info" />
          <p className="disclaimer-scope">{DISCLAIMER_SCOPE}</p>
        </div>
      )}
    </div>
  );
}
