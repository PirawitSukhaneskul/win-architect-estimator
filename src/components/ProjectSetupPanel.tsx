import { Minus, Plus } from "lucide-react";
import { useStore } from "../state/store";
import { GlassCard, Field, SegmentedControl, IconButton } from "./primitives";
import { BuildingPresetPicker } from "./BuildingPresetPicker";
import { RENOVATION_HELPER } from "../data/disclaimers";
import { computeEstimate } from "../lib/calc";
import { estimateArchitectFee } from "../lib/planning";
import type { ProjectMode, QualityLevel, RenovationComplexity } from "../types";

export function ProjectSetupPanel() {
  const { state, patchInfo, applyGlobalQuality, setBuildingType } = useStore();
  const { info } = state;
  const fee = estimateArchitectFee(state, computeEstimate(state));

  return (
    <GlassCard className="setup-panel" strong>
      <h2 className="panel-title">ตั้งค่าโครงการ</h2>

      <div className="field-grid">
        <Field label="ชื่อโครงการ" htmlFor="projectName">
          <input
            id="projectName"
            type="text"
            value={info.projectName}
            placeholder="เช่น บ้านคุณสมชาย"
            onChange={(e) => patchInfo({ projectName: e.target.value })}
          />
        </Field>
        <Field label="ชื่อลูกค้า (ไม่บังคับ)" htmlFor="clientName">
          <input
            id="clientName"
            type="text"
            value={info.clientName}
            onChange={(e) => patchInfo({ clientName: e.target.value })}
          />
        </Field>
        <Field label="ทำเล / จังหวัด (ไม่บังคับ)" htmlFor="location">
          <input
            id="location"
            type="text"
            value={info.location}
            onChange={(e) => patchInfo({ location: e.target.value })}
          />
        </Field>
      </div>

      <div className="setup-controls">
        <Field label="รูปแบบงาน">
          <SegmentedControl<ProjectMode>
            ariaLabel="รูปแบบงาน"
            value={info.mode}
            onChange={(v) => patchInfo({ mode: v })}
            options={[
              { value: "new_build", label: "สร้างใหม่" },
              { value: "renovation", label: "รีโนเวต" },
            ]}
          />
        </Field>

        <Field label="จำนวนชั้น">
          <div className="stepper">
            <IconButton
              title="ลดจำนวนชั้น"
              onClick={() => patchInfo({ floors: Math.max(1, info.floors - 1) })}
            >
              <Minus size={16} />
            </IconButton>
            <span className="stepper-value">{info.floors}</span>
            <IconButton
              title="เพิ่มจำนวนชั้น"
              onClick={() => patchInfo({ floors: Math.min(60, info.floors + 1) })}
            >
              <Plus size={16} />
            </IconButton>
          </div>
        </Field>

        <Field label="คุณภาพงานเริ่มต้น" hint="ปรับราคาเริ่มต้นของทุกห้องที่ยังไม่ปรับเอง">
          <SegmentedControl<QualityLevel>
            ariaLabel="คุณภาพงานเริ่มต้น"
            value={info.defaultQuality}
            onChange={(v) => applyGlobalQuality(v)}
            options={[
              { value: "low", label: "ราคาต่ำ" },
              { value: "mid", label: "ปานกลาง" },
              { value: "high", label: "ราคาสูง" },
            ]}
          />
        </Field>

        <Field
          label="ค่าออกแบบสถาปนิก (%)"
          hint={`เว้นว่าง = ใช้อัตราสมาคมฯ อัตโนมัติ ${fee.asaEffectivePercent.toFixed(2)}% · ${fee.categoryLabel}`}
        >
          <input
            type="number"
            min={0}
            max={30}
            step={0.25}
            inputMode="decimal"
            placeholder={`อัตโนมัติ ${fee.asaEffectivePercent.toFixed(2)}%`}
            value={info.architectFeePercentOverride ?? ""}
            aria-label="เปอร์เซ็นต์ค่าออกแบบสถาปนิก (แก้ไขได้)"
            onChange={(e) => {
              const raw = e.target.value.trim();
              const n = Number(raw);
              patchInfo({
                architectFeePercentOverride:
                  raw === "" || Number.isNaN(n) ? null : Math.max(0, n),
              });
            }}
          />
        </Field>
      </div>

      {info.mode === "renovation" && (
        <div className="renovation-box">
          <div className="renovation-head">
            <label className="switch">
              <input
                type="checkbox"
                checked={info.hasDemolition}
                onChange={(e) => patchInfo({ hasDemolition: e.target.checked })}
              />
              <span>มีงานรื้อถอน</span>
            </label>
          </div>

          {info.hasDemolition && (
            <Field label={`ค่าเผื่อรื้อถอน: ${info.demolitionPercent}%`}>
              <input
                type="range"
                min={0}
                max={20}
                step={1}
                value={info.demolitionPercent}
                aria-label="ค่าเผื่อรื้อถอน (%)"
                onChange={(e) => patchInfo({ demolitionPercent: Number(e.target.value) })}
              />
            </Field>
          )}

          <Field label="ความซับซ้อนงานรีโนเวต">
            <SegmentedControl<RenovationComplexity>
              ariaLabel="ความซับซ้อนงานรีโนเวต"
              value={info.renovationComplexity}
              onChange={(v) => patchInfo({ renovationComplexity: v })}
              options={[
                { value: "light", label: "เบา 35%" },
                { value: "medium", label: "กลาง 65%" },
                { value: "heavy", label: "หนัก 95%+" },
              ]}
            />
          </Field>

          <p className="helper-copy">{RENOVATION_HELPER}</p>
          <p className="helper-copy">
            ถ้ารีโนเวตหนัก บวกค่ารื้อถอน และเลือกวัสดุสูง ราคาสามารถเท่ากับหรือสูงกว่าสร้างใหม่ได้
          </p>
        </div>
      )}

      <div className="preset-section">
        <h3 className="subsection-title">ประเภทอาคาร</h3>
        <p className="subsection-hint">
          เลือกประเภทอาคารเพื่อสร้างรายการห้องแนะนำอัตโนมัติ (แก้ไขได้ทั้งหมด)
        </p>
        <BuildingPresetPicker selectedId={info.buildingTypeId} onSelect={setBuildingType} />
      </div>
    </GlassCard>
  );
}
