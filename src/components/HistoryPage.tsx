import { FileText, Trash2 } from "lucide-react";
import { useStore } from "../state/store";
import type { View } from "../nav";
import { GlassCard, IconButton } from "./primitives";
import { buildingPresetsById } from "../data/buildingPresets";
import { computeEstimate } from "../lib/calc";
import { formatArea, formatBaht, formatThaiDate } from "../lib/format";

export function HistoryPage({ onNavigate }: { onNavigate: (v: View) => void }) {
  const { history, loadReport, deleteReport } = useStore();

  return (
    <div className="history-page">
      <div className="page-header">
        <h1 className="page-title">ประวัติการประเมิน</h1>
      </div>

      {history.length === 0 ? (
        <GlassCard className="empty-history">
          <div className="empty-state">
            ยังไม่มีประวัติ กด “คำนวณราคา” และยืนยันเพื่อบันทึกรายการประเมิน
          </div>
        </GlassCard>
      ) : (
        <div className="history-list">
          {history.map((report) => {
            const c = computeEstimate({
              info: report.info,
              rooms: report.rooms,
              feedbackComments: report.feedbackComments ?? [],
            });
            const building = buildingPresetsById[report.info.buildingTypeId];
            return (
              <GlassCard key={report.id} className="history-card">
                <div className="history-main">
                  <h3>{report.info.projectName || "ไม่มีชื่อโครงการ"}</h3>
                  <p className="history-meta">
                    {building?.labelTh ?? report.info.buildingTypeId} ·{" "}
                    {report.info.mode === "renovation" ? "รีโนเวต" : "สร้างใหม่"} ·{" "}
                    {formatArea(c.gfa)}
                  </p>
                  <p className="history-date">{formatThaiDate(report.createdAt)}</p>
                </div>
                <div className="history-total">{formatBaht(c.grandTotal)}</div>
                <div className="history-actions">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => {
                      loadReport(report.id);
                      onNavigate("result");
                    }}
                  >
                    <FileText size={15} /> เปิดดู
                  </button>
                  <IconButton
                    title="ลบประวัติ"
                    variant="danger"
                    onClick={() => deleteReport(report.id)}
                  >
                    <Trash2 size={15} />
                  </IconButton>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
