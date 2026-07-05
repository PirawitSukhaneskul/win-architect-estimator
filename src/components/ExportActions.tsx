import { useState } from "react";
import { FileText, FileType2, BookOpen } from "lucide-react";
import type { ReportModel } from "../lib/report";
import type { View } from "../nav";
import { exportToPdf } from "../lib/export/pdf";
import { exportToDocx } from "../lib/export/docx";
import { todayISODate } from "../lib/format";
import { FeedbackButton } from "./FeedbackButton";

function filenameBase(model: ReportModel): string {
  const raw = model.info.projectName.trim() || "project";
  const slug = raw.replace(/\s+/g, "-").replace(/[\\/:*?"<>|]/g, "");
  return `WIN_ARCHITECT_Estimate_${slug}_${todayISODate()}`;
}

export function ExportActions({
  model,
  onNavigate,
}: {
  model: ReportModel;
  onNavigate: (v: View) => void;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <div className="result-actions no-print">
      <button
        type="button"
        className="btn-primary"
        onClick={() => exportToPdf(filenameBase(model))}
      >
        <FileText size={16} /> ดาวน์โหลด PDF
      </button>
      <button
        type="button"
        className="btn-outline"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await exportToDocx(model, filenameBase(model));
          } finally {
            setBusy(false);
          }
        }}
      >
        <FileType2 size={16} /> {busy ? "กำลังสร้าง..." : "ดาวน์โหลด Word"}
      </button>
      <button type="button" className="btn-ghost" onClick={() => onNavigate("reference")}>
        <BookOpen size={16} /> ดูที่มาราคาและนิยามคุณภาพ
      </button>
      <FeedbackButton />
    </div>
  );
}
