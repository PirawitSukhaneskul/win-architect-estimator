import { useMemo } from "react";
import type { View } from "../nav";
import { useStore } from "../state/store";
import { buildReportModel } from "../lib/report";
import { GlassCard } from "./primitives";
import { DisclaimerBanner } from "./DisclaimerBanner";
import { SpatialBlockPreview } from "./SpatialBlockPreview";
import { ArchitectSummary } from "./ArchitectSummary";
import { ExportActions } from "./ExportActions";
import {
  formatArea,
  formatBaht,
  formatNumber,
  formatRatePerSqm,
  formatThaiDate,
} from "../lib/format";
import {
  BRAND,
  FB_CREDIT,
  DISCLAIMER_SOURCE,
  SOURCE_NAME,
  SOURCE_URL,
} from "../data/disclaimers";

export function ResultReport({ onNavigate }: { onNavigate: (v: View) => void }) {
  const { state } = useStore();
  const model = useMemo(() => buildReportModel(state), [state]);
  const c = model.computation;

  return (
    <div className="result-page">
      <ExportActions model={model} onNavigate={onNavigate} />

      <div className="result-report">
        <header className="report-header">
          <div>
            <p className="report-kicker">จัดทำโดย {BRAND}</p>
            <h1 className="report-title">รายงานประเมินราคาก่อสร้างเบื้องต้น</h1>
            <p className="report-fb">{FB_CREDIT}</p>
          </div>
          <div className="report-date">วันที่จัดทำ: {formatThaiDate(model.generatedISO)}</div>
        </header>

        <GlassCard className="result-hero" strong>
          <div className="result-hero-main">
            <span className="result-hero-label">ราคาประเมินรวม</span>
            <span className="result-hero-value">{formatBaht(c.grandTotal)}</span>
            <span className="result-hero-range">
              ช่วงประเมิน {formatBaht(c.grandTotalLow)} – {formatBaht(c.grandTotalHigh)}
            </span>
          </div>
          <div className="result-hero-stats">
            <Stat label="พื้นที่รวม (GFA)" value={formatArea(c.gfa)} />
            <Stat label="ราคาเฉลี่ย/ตร.ม." value={c.gfa > 0 ? formatRatePerSqm(c.costPerSqm) : "-"} />
            <Stat label="จำนวนห้องรวม" value={`${formatNumber(c.roomCount)} ห้อง`} />
          </div>
        </GlassCard>

        <section className="report-block planning-grid">
          <GlassCard className="planning-card">
            <span className="planning-label">ค่าออกแบบสถาปนิก (สมาคมสถาปนิกสยามฯ)</span>
            <strong>{formatBaht(model.architectFee.fee)}</strong>
            <p>
              {model.architectFee.effectivePercent.toFixed(2)}% ของงบก่อสร้าง
              {model.architectFee.isOverridden
                ? " (กำหนดเอง)"
                : ` · อัตราสมาคมฯ ${model.architectFee.categoryLabel}`}
            </p>
          </GlassCard>
          <GlassCard className="planning-card">
            <span className="planning-label">ระยะเวลาก่อสร้างคร่าว ๆ</span>
            <strong>
              {formatNumber(model.duration.lowDays)}–{formatNumber(model.duration.highDays)} วัน
            </strong>
            <p>เป็นช่วงวางแผนเบื้องต้น ขึ้นกับแบบ วัสดุ ผู้รับเหมา และสภาพหน้างาน</p>
          </GlassCard>
        </section>

        {model.renovationWarning && (
          <section className="report-block warning-card">
            {model.renovationWarning}
          </section>
        )}

        <section className="report-block">
          <h2 className="section-heading">ข้อมูลโครงการ</h2>
          <div className="info-grid">
            <Info label="ชื่อโครงการ" value={model.info.projectName || "-"} />
            {model.info.clientName && <Info label="ลูกค้า" value={model.info.clientName} />}
            {model.info.location && <Info label="ทำเล" value={model.info.location} />}
            <Info label="ประเภทอาคาร" value={model.buildingLabel} />
            <Info label="รูปแบบงาน" value={model.modeLabel} />
            <Info label="จำนวนชั้น" value={`${model.info.floors} ชั้น`} />
            <Info label="คุณภาพงานหลัก" value={model.qualityLabel} />
          </div>
        </section>

        <section className="report-block">
          <h2 className="section-heading">รายการคำนวณ</h2>
          <div className="result-table-wrap">
            <table className="result-table">
              <thead>
                <tr>
                  <th>ลำดับ</th>
                  <th>รายการ / ห้อง</th>
                  <th className="num">จำนวน</th>
                  <th className="num">พื้นที่/ห้อง</th>
                  <th className="num">พื้นที่รวม</th>
                  <th>คุณภาพ</th>
                  <th className="num">ราคา/ตร.ม.</th>
                  <th className="num">รวม</th>
                  <th>อ้างอิงราคา</th>
                </tr>
              </thead>
              <tbody>
                {model.rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.index}</td>
                    <td>
                      {r.name}
                      <span className="row-floor">ชั้น {r.floor}</span>
                    </td>
                    <td className="num">{formatNumber(r.quantity)}</td>
                    <td className="num">{formatNumber(r.areaPerRoom)}</td>
                    <td className="num">{formatArea(r.totalArea)}</td>
                    <td>
                      {r.qualityLabel}
                      {r.manualRate && <span className="tag-manual">ปรับเอง</span>}
                    </td>
                    <td className="num">{formatNumber(Math.round(r.rate))}</td>
                    <td className="num">{formatBaht(r.cost)}</td>
                    <td className="ref-cell">{r.rateRef}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4}>รวมทั้งหมด</td>
                  <td className="num">{formatArea(c.gfa)}</td>
                  <td colSpan={2}></td>
                  <td className="num">{formatBaht(c.selectedSubtotal)}</td>
                  <td></td>
                </tr>
                {c.renovationExtra > 0 && (
                  <tr>
                    <td colSpan={7}>ค่ารีโนเวต ({model.complexityPercent}%)</td>
                    <td className="num">{formatBaht(c.renovationExtra)}</td>
                    <td></td>
                  </tr>
                )}
                {c.demolitionExtra > 0 && (
                  <tr>
                    <td colSpan={7}>ค่ารื้อถอน ({model.demolitionPercent}%)</td>
                    <td className="num">{formatBaht(c.demolitionExtra)}</td>
                    <td></td>
                  </tr>
                )}
                <tr className="grand">
                  <td colSpan={7}>ราคาประเมินสุทธิ</td>
                  <td className="num">{formatBaht(c.grandTotal)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <section className="report-block report-spatial-block">
          <h2 className="section-heading">ภาพรวมพื้นที่ตามห้อง (แยกตามชั้น)</h2>
          <p className="subsection-hint">
            ผังเชิงพื้นที่คร่าว ๆ เพื่อพูดคุยกับสถาปนิก ไม่ใช่แบบก่อสร้างที่พร้อมขออนุญาต
          </p>
          <SpatialBlockPreview rooms={state.rooms} captureId="report-spatial" />
        </section>

        <div className="report-block">
          <ArchitectSummary model={model} />
        </div>

        <section className="report-block source-block">
          <h2 className="section-heading">แหล่งอ้างอิงราคา</h2>
          <p>{SOURCE_NAME}</p>
          <a href={SOURCE_URL} target="_blank" rel="noreferrer">
            {SOURCE_URL}
          </a>
          <p className="source-note">{DISCLAIMER_SOURCE}</p>
        </section>

        <DisclaimerBanner />

        <footer className="report-footer">
          <strong>{BRAND}</strong>
          <span>{FB_CREDIT}</span>
        </footer>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="result-stat">
      <span className="result-stat-label">{label}</span>
      <span className="result-stat-value">{value}</span>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-item">
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
    </div>
  );
}
