import { BRAND, FB_CREDIT, SOURCE_NAME, SOURCE_URL } from "../data/disclaimers";

export function CreditFooter() {
  return (
    <footer className="credit-footer">
      <div className="credit-brand">{BRAND}</div>
      <div className="credit-fb">{FB_CREDIT}</div>
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
