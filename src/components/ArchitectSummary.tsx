import type { ReportModel } from "../lib/report";
import { formatArea, formatBaht, formatRatePerSqm } from "../lib/format";
import { scopeExcluded } from "../data/reference";

export function ArchitectSummary({ model }: { model: ReportModel }) {
  const c = model.computation;
  return (
    <section className="architect-summary">
      <h2 className="section-heading">สรุปสำหรับสถาปนิก</h2>

      <div className="arch-meta-grid">
        <Meta label="ประเภทอาคาร" value={model.buildingLabel} />
        <Meta label="รูปแบบงาน" value={model.modeLabel} />
        <Meta label="จำนวนชั้น" value={`${model.info.floors} ชั้น`} />
        <Meta label="พื้นที่รวม (GFA)" value={formatArea(c.gfa)} />
        <Meta label="คุณภาพงานหลัก" value={model.qualityLabel} />
        <Meta label="ราคาเฉลี่ย/ตร.ม." value={c.gfa > 0 ? formatRatePerSqm(c.costPerSqm) : "-"} />
        <Meta
          label="ค่าจ้างสถาปนิกแนะนำ"
          value={`${formatBaht(model.architectFee.low)} – ${formatBaht(model.architectFee.high)}`}
        />
        <Meta
          label="เวลาก่อสร้างคร่าว ๆ"
          value={`${model.duration.lowDays}–${model.duration.highDays} วัน`}
        />
      </div>

      <div className="arch-budget">
        งบประมาณเบื้องต้น: <strong>{formatBaht(c.grandTotal)}</strong>{" "}
        <span className="arch-range">
          (ช่วง {formatBaht(c.grandTotalLow)} – {formatBaht(c.grandTotalHigh)})
        </span>
      </div>

      <h3 className="arch-subheading">โปรแกรมพื้นที่แยกตามชั้น</h3>
      {model.floorPrograms.map((fp) => (
        <div key={fp.floor} className="arch-floor">
          <div className="arch-floor-head">
            ชั้น {fp.floor} · {formatArea(fp.gfa)}
          </div>
          <ul className="arch-room-list">
            {fp.rows.map((r) => (
              <li key={r.id}>
                <span>{r.name}</span>
                <span className="arch-room-meta">
                  {r.quantity}× {r.areaPerRoom} ตร.ม. = {formatArea(r.totalArea)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {(model.demolitionPercent > 0 || model.complexityPercent > 0) && (
        <p className="arch-note">
          ปรับสำหรับงานรีโนเวต: scope เทียบสร้างใหม่ {Math.round(model.renovationScopePercent)}% ·
          ค่ารื้อถอน {model.demolitionPercent}% · ความเสี่ยงหน้างาน {model.complexityPercent}%
        </p>
      )}

      <h3 className="arch-subheading">ค่าจ้างสถาปนิก / ระยะเวลาก่อสร้าง</h3>
      <p className="arch-exclusions">
        {model.architectFee.note} · {model.duration.note}
      </p>

      {model.info.mode === "renovation" && c.grandTotal > c.comparableNewBuildSubtotal && (
        <p className="arch-note is-warning">
          รีโนเวตสูงกว่าเทียบสร้างใหม่ เพราะ scope หนัก/ค่ารื้อถอน/ความเสี่ยงหน้างาน หรือวัสดุที่เลือกสูงกว่าฐานราคา
        </p>
      )}

      {model.info.mode === "renovation" && (
        <p className="arch-note">
          งานรีโนเวตอาจต้องสำรวจหน้างาน เปิดฝ้า/ผนังบางส่วน และตรวจระบบเดิมก่อนสรุป BOQ
        </p>
      )}

      {model.feedbackComments.length > 0 && (
        <>
          <h3 className="arch-subheading">ความคิดเห็นแนบจากลูกค้า</h3>
          <ul className="arch-feedback-list">
            {model.feedbackComments.map((comment) => (
              <li key={comment.id}>
                <span>{feedbackTagLabel(comment.tag)}</span>
                <p>{comment.text}</p>
              </li>
            ))}
          </ul>
        </>
      )}

      <h3 className="arch-subheading">ข้อควรทราบ / ไม่รวมในราคานี้</h3>
      <p className="arch-exclusions">{scopeExcluded.join(" · ")}</p>
    </section>
  );
}

function feedbackTagLabel(tag: string): string {
  if (tag === "price_question") return "ข้อสงสัยเรื่องราคา";
  if (tag === "material_quality") return "วัสดุ/คุณภาพ";
  if (tag === "area_revision") return "แก้ไขพื้นที่";
  if (tag === "architect_handoff") return "ส่งต่อสถาปนิก";
  return "ความต้องการเพิ่มเติม";
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="arch-meta">
      <span className="arch-meta-label">{label}</span>
      <span className="arch-meta-value">{value}</span>
    </div>
  );
}
