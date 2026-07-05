import { BookOpen, Calculator, FileText, History } from "lucide-react";
import type { View } from "../nav";
import { BRAND, SOURCE_BADGE } from "../data/disclaimers";

const NAV_ITEMS: { view: View; label: string; icon: typeof Calculator }[] = [
  { view: "estimator", label: "ประเมินราคา", icon: Calculator },
  { view: "result", label: "ผลประเมิน", icon: FileText },
  { view: "reference", label: "Reference", icon: BookOpen },
  { view: "history", label: "ประวัติ", icon: History },
];

export function GlassNav({
  view,
  onNavigate,
  onCalculate,
  resultEnabled,
}: {
  view: View;
  onNavigate: (v: View) => void;
  onCalculate: () => void;
  resultEnabled: boolean;
}) {
  return (
    <>
      <header className="glass-nav glass-strong">
        <div className="nav-left">
          <span className="brand">{BRAND}</span>
          <span className="source-badge">{SOURCE_BADGE}</span>
        </div>
        <nav className="nav-links" aria-label="เมนูหลัก">
          {NAV_ITEMS.map((item) => {
            const disabled = item.view === "result" && !resultEnabled;
            const Icon = item.icon;
            return (
              <button
                key={item.view}
                type="button"
                className={`nav-link ${view === item.view ? "is-active" : ""}`}
                aria-current={view === item.view ? "page" : undefined}
                disabled={disabled}
                onClick={() => onNavigate(item.view)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <button type="button" className="btn-primary nav-cta" onClick={onCalculate}>
          คำนวณราคา
        </button>
      </header>

      <nav className="tab-bar glass-strong" aria-label="เมนูล่าง (มือถือ)">
        {NAV_ITEMS.map((item) => {
          const disabled = item.view === "result" && !resultEnabled;
          const Icon = item.icon;
          return (
            <button
              key={item.view}
              type="button"
              className={`tab-item ${view === item.view ? "is-active" : ""}`}
              aria-current={view === item.view ? "page" : undefined}
              disabled={disabled}
              onClick={() => onNavigate(item.view)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
