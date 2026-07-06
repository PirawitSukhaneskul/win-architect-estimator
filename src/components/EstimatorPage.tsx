import { BookOpen, RotateCcw } from "lucide-react";
import { useStore } from "../state/store";
import type { View } from "../nav";
import { GlassCard } from "./primitives";
import { DisclaimerBanner } from "./DisclaimerBanner";
import { ProjectSetupPanel } from "./ProjectSetupPanel";
import { RoomEstimateTable } from "./RoomEstimateTable";
import { LiveSummaryPanel } from "./LiveSummaryPanel";
import { SpatialBlockPreview } from "./SpatialBlockPreview";
import { FeedbackButton } from "./FeedbackButton";
import { MobileSummaryBar } from "./MobileSummaryBar";
import { BRAND } from "../data/disclaimers";

export function EstimatorPage({
  onNavigate,
  onCalculate,
}: {
  onNavigate: (v: View) => void;
  onCalculate: () => void;
}) {
  const { state, reset } = useStore();

  return (
    <div className="estimator-page">
      <div className="page-header">
        <div>
          <p className="page-kicker">จัดทำโดย {BRAND}</p>
          <h1 className="page-title">ประเมินราคาก่อสร้างเบื้องต้น</h1>
        </div>
        <div className="page-header-actions">
          <button type="button" className="btn-outline" onClick={() => onNavigate("reference")}>
            <BookOpen size={16} /> ดูนิยามคุณภาพและฐานราคา
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              if (window.confirm("เริ่มใหม่ทั้งหมด? ข้อมูลปัจจุบันจะถูกล้าง")) reset();
            }}
          >
            <RotateCcw size={16} /> เริ่มใหม่
          </button>
        </div>
      </div>

      <DisclaimerBanner />

      <div className="estimator-layout">
        <div className="estimator-main">
          <ProjectSetupPanel />
          <RoomEstimateTable />
        </div>

        <aside className="estimator-side">
          <div className="sticky-side">
            <LiveSummaryPanel onCalculate={onCalculate} />
            <FeedbackButton compact />
            <GlassCard className="spatial-panel">
              <h2 className="panel-title">ภาพรวมพื้นที่ตามห้อง</h2>
              <p className="subsection-hint">
                ผังเชิงพื้นที่คร่าว ๆ เพื่อพูดคุยกับสถาปนิก ไม่ใช่แบบก่อสร้างจริง
              </p>
              <SpatialBlockPreview rooms={state.rooms} allowFloorTabs />
            </GlassCard>
          </div>
        </aside>
      </div>

      <MobileSummaryBar onCalculate={onCalculate} />
    </div>
  );
}
