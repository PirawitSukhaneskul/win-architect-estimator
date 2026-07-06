import {
  BRAND,
  CONTACT_EMAIL,
  FB_CREDIT,
  FB_PAGE_URL,
  LINKEDIN_URL,
  PORTFOLIO_URL,
  SOURCE_NAME,
  SOURCE_URL,
} from "../data/disclaimers";

// Inline brand/contact icons (lucide-react in this project has no brand icons).
const icons = {
  portfolio: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M6.94 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM3.2 8.5h3.5V21H3.2V8.5zM9.5 8.5h3.35v1.7h.05c.47-.9 1.6-1.85 3.3-1.85 3.5 0 4.15 2.3 4.15 5.3V21h-3.5v-5.5c0-1.3 0-3-1.85-3s-2.1 1.44-2.1 2.9V21H9.5V8.5z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.47 1.47-3.84 3.72-3.84 1.08 0 2.2.2 2.2.2v2.42h-1.24c-1.22 0-1.6.76-1.6 1.54V12h2.72l-.44 2.9h-2.28v7A10 10 0 0 0 22 12z" />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  ),
};

export function CreditFooter() {
  return (
    <footer className="credit-footer">
      <div className="credit-brand">{BRAND}</div>
      <div className="credit-fb">{FB_CREDIT}</div>

      <nav className="credit-links" aria-label="ช่องทางติดต่อ WIN ARCHITECT">
        <a className="credit-link" href={PORTFOLIO_URL} target="_blank" rel="noreferrer">
          {icons.portfolio} Portfolio
        </a>
        <a className="credit-link" href={LINKEDIN_URL} target="_blank" rel="noreferrer">
          {icons.linkedin} LinkedIn
        </a>
        <a className="credit-link" href={FB_PAGE_URL} target="_blank" rel="noreferrer">
          {icons.facebook} Facebook
        </a>
        <a className="credit-link" href={`mailto:${CONTACT_EMAIL}`}>
          {icons.email} Email
        </a>
      </nav>

      <div className="credit-source">
        อ้างอิง: {SOURCE_NAME}
        <br />
        <a href={SOURCE_URL} target="_blank" rel="noreferrer">
          {SOURCE_URL}
        </a>
      </div>
    </footer>
  );
}
