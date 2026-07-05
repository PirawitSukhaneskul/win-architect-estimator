import { Facebook, Globe, Linkedin, Mail } from "lucide-react";
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

export function CreditFooter() {
  return (
    <footer className="credit-footer">
      <div className="credit-brand">{BRAND}</div>
      <div className="credit-fb">{FB_CREDIT}</div>

      <nav className="credit-links" aria-label="ช่องทางติดต่อ WIN ARCHITECT">
        <a className="credit-link" href={PORTFOLIO_URL} target="_blank" rel="noreferrer">
          <Globe size={16} /> Portfolio
        </a>
        <a className="credit-link" href={LINKEDIN_URL} target="_blank" rel="noreferrer">
          <Linkedin size={16} /> LinkedIn
        </a>
        <a className="credit-link" href={FB_PAGE_URL} target="_blank" rel="noreferrer">
          <Facebook size={16} /> Facebook
        </a>
        <a className="credit-link" href={`mailto:${CONTACT_EMAIL}`}>
          <Mail size={16} /> Email
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
