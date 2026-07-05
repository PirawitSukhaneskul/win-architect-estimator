import { useMemo, useState } from "react";
import {
  Building2,
  DoorOpen,
  Droplets,
  Grid2X2,
  Landmark,
  Layers,
  Paintbrush,
  PanelTop,
  Sparkles,
  Warehouse,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { GlassCard, SegmentedControl } from "./primitives";
import { rateItems } from "../data/rateItems";
import { buildingPresets } from "../data/buildingPresets";
import {
  formulaCards,
  qualityCategories,
  qualitySummaries,
  scopeExcluded,
  scopeIncluded,
} from "../data/reference";
import {
  BUILDING_FEE_CATEGORY,
  FEE_BAND_LABELS,
  FEE_SOURCE_NAME,
  FEE_SOURCE_URL,
  disciplineSplit,
  feeCategories,
  feeCategoriesById,
} from "../data/architectFeeRates";
import { formatNumber } from "../lib/format";

type Tab = "quality" | "database" | "fee" | "scope" | "method";

export function ReferencePage() {
  const [tab, setTab] = useState<Tab>("quality");

  return (
    <div className="reference-page">
      <div className="page-header">
        <h1 className="page-title">Reference — ที่มาราคาและนิยามคุณภาพ</h1>
      </div>

      <SegmentedControl<Tab>
        ariaLabel="หมวด Reference"
        value={tab}
        onChange={setTab}
        options={[
          { value: "quality", label: "นิยามคุณภาพ" },
          { value: "database", label: "ฐานข้อมูลราคา" },
          { value: "fee", label: "ค่าออกแบบ" },
          { value: "scope", label: "รวม / ไม่รวม" },
          { value: "method", label: "วิธีคำนวณ" },
        ]}
      />

      <div className="reference-body">
        {tab === "quality" && <QualityTab />}
        {tab === "database" && <DatabaseTab />}
        {tab === "fee" && <FeeTab />}
        {tab === "scope" && <ScopeTab />}
        {tab === "method" && <MethodTab />}
      </div>
    </div>
  );
}

function QualityTab() {
  return (
    <div className="ref-stack">
      <div className="quality-cards">
        {qualitySummaries.map((q) => (
          <GlassCard key={q.level} className="quality-card">
            <h3>
              <Sparkles size={17} /> {q.level}
            </h3>
            <ul>
              {q.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <p className="quality-fit">{q.fit}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="ref-table-card">
        <div className="ref-table-wrap">
          <table className="ref-table">
            <thead>
              <tr>
                <th>หมวดงาน</th>
                <th>ราคาต่ำ</th>
                <th>ราคาปานกลาง</th>
                <th>ราคาสูง</th>
                <th>พรีเมียม</th>
                <th>custom / luxury</th>
              </tr>
            </thead>
            <tbody>
              {qualityCategories.map((row) => {
                const Icon = qualityIconFor(row.category);
                return (
                  <tr key={row.category}>
                    <th scope="row">
                      <span className="quality-category">
                        <Icon size={16} /> {row.category}
                      </span>
                    </th>
                    <td>{row.low}</td>
                    <td>{row.mid}</td>
                    <td>{row.high}</td>
                    <td>{premiumMaterialFor(row.category)}</td>
                    <td>{customMaterialFor(row.category)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <p className="ref-note">
        ระดับคุณภาพเป็นคำอธิบายเพื่อช่วยเลือกช่วงราคาเบื้องต้น ไม่ใช่ BOQ หรือ specification
        งานก่อสร้างฉบับสมบูรณ์
      </p>
    </div>
  );
}

function qualityIconFor(category: string): LucideIcon {
  if (category.includes("ฐานราก")) return Landmark;
  if (category.includes("โครงสร้าง")) return Building2;
  if (category.includes("หลังคา")) return Warehouse;
  if (category.includes("ฝ้า")) return Layers;
  if (category.includes("พื้น")) return Grid2X2;
  if (category.includes("ผนัง")) return PanelTop;
  if (category.includes("ประตู") || category.includes("หน้าต่าง")) return DoorOpen;
  if (category.includes("สุขภัณฑ์") || category.includes("ประปา")) return Droplets;
  if (category.includes("ไฟฟ้า")) return Zap;
  if (category.includes("สี")) return Paintbrush;
  return Sparkles;
}

function premiumMaterialFor(category: string): string {
  if (category.includes("พื้น")) return "พอร์ซเลนเกรดสูง / engineered wood / หินบางส่วน";
  if (category.includes("ผนัง")) return "ผิวพิเศษ / feature wall / cladding บางส่วน";
  if (category.includes("ประตู") || category.includes("หน้าต่าง")) return "profile หนาขึ้น กระจก/ฮาร์ดแวร์คุณภาพสูง";
  if (category.includes("สุขภัณฑ์")) return "สุขภัณฑ์เกรดดี ระบบฝังผนังบางส่วน";
  if (category.includes("ไฟฟ้า")) return "lighting scene / สวิตช์-ปลั๊กเกรดสูง";
  if (category.includes("หลังคา")) return "ฉนวนดีขึ้น รายละเอียดรอยต่อและ flashing ดีขึ้น";
  return "วัสดุและรายละเอียดสูงกว่าฐานอ้างอิง";
}

function customMaterialFor(category: string): string {
  if (category.includes("พื้น") || category.includes("ผนัง")) return "natural stone / custom surface / งานสั่งทำ";
  if (category.includes("ประตู") || category.includes("หน้าต่าง")) return "กระจกพิเศษ facade เฉพาะทาง หรือระบบ custom";
  if (category.includes("ไฟฟ้า")) return "smart control / special lighting / ระบบเฉพาะทาง";
  if (category.includes("สุขภัณฑ์")) return "สุขภัณฑ์ luxury / fitting เฉพาะรุ่น";
  return "วัสดุเฉพาะทาง งาน custom มาก ต้องยืนยัน BOQ/spec";
}

function DatabaseTab() {
  const [query, setQuery] = useState("");
  const [building, setBuilding] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rateItems.filter((item) => {
      const matchesQuery =
        !q ||
        item.sourceCategoryName.toLowerCase().includes(q) ||
        item.sourceCode.toLowerCase().includes(q);
      const matchesBuilding =
        building === "all" || item.suitableFor.includes(building);
      return matchesQuery && matchesBuilding;
    });
  }, [query, building]);

  return (
    <div className="ref-stack">
      <div className="db-filters">
        <input
          type="search"
          className="db-search"
          placeholder="ค้นหาชื่อประเภทอาคารหรือรหัส"
          value={query}
          aria-label="ค้นหาฐานข้อมูลราคา"
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          value={building}
          aria-label="กรองตามประเภทอาคาร"
          onChange={(e) => setBuilding(e.target.value)}
        >
          <option value="all">ทุกประเภทอาคาร</option>
          {buildingPresets.map((p) => (
            <option key={p.id} value={p.labelTh}>
              {p.labelTh}
            </option>
          ))}
        </select>
      </div>

      <GlassCard className="ref-table-card">
        {filtered.length === 0 ? (
          <div className="empty-state">ไม่พบรายการที่ตรงกับคำค้น</div>
        ) : (
          <div className="ref-table-wrap">
            <table className="ref-table db-table">
              <thead>
                <tr>
                  <th>รหัส</th>
                  <th>ประเภทอาคาร</th>
                  <th>หน่วย</th>
                  <th className="num">ราคาต่ำ</th>
                  <th className="num">ปานกลาง</th>
                  <th className="num">ราคาสูง</th>
                  <th>ปีราคา</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>{item.sourceCode}</td>
                    <td>{item.sourceCategoryName}</td>
                    <td>{unitLabel(item.unit)}</td>
                    <td className="num">{item.rateLow ? formatNumber(item.rateLow) : "-"}</td>
                    <td className="num">{item.rateMid ? formatNumber(item.rateMid) : "-"}</td>
                    <td className="num">{item.rateHigh ? formatNumber(item.rateHigh) : "-"}</td>
                    <td>{item.sourceYear}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
      <p className="ref-note">
        ราคาข้างต้นเป็นค่าตั้งต้นที่อ่านจากคอลัมน์ปี 2569 ของบัญชีราคามาตรฐานฯ
        ผู้ดูแลระบบควรตรวจสอบและเพิ่มเติมให้ครบตามเอกสารต้นฉบับ
      </p>
    </div>
  );
}

function unitLabel(unit: string): string {
  if (unit === "sqm") return "ตร.ม.";
  if (unit === "m") return "เมตร";
  if (unit === "set") return "ชุด";
  return "หน่วย";
}

function ScopeTab() {
  return (
    <div className="scope-grid">
      <GlassCard className="scope-card included">
        <h3>รวมในราคานี้</h3>
        <ul>
          {scopeIncluded.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </GlassCard>
      <GlassCard className="scope-card excluded">
        <h3>ไม่รวมในราคานี้</h3>
        <ul>
          {scopeExcluded.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}

function FeeTab() {
  return (
    <div className="ref-stack">
      <p className="ref-note">
        อัตราค่าบริการออกแบบอ้างอิงจาก {FEE_SOURCE_NAME} คิดแบบ “ขั้นบันได” ตามช่วงมูลค่าก่อสร้าง
        (แต่ละช่วงคิดในอัตราของช่วงนั้น) แอปคำนวณให้อัตโนมัติตามประเภทอาคาร และปรับเปอร์เซ็นต์เองได้ในหน้าประเมิน
      </p>

      <GlassCard className="ref-table-card">
        <div className="ref-table-wrap">
          <table className="ref-table">
            <thead>
              <tr>
                <th>ประเภทโครงการ</th>
                {FEE_BAND_LABELS.map((b) => (
                  <th key={b} className="num">
                    {b}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {feeCategories.map((cat) => (
                <tr key={cat.id}>
                  <th scope="row">{cat.labelTh}</th>
                  {cat.bands.map((band, i) => (
                    <td key={i} className="num">
                      {band.rate.toFixed(2)}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <GlassCard className="formula-card">
        <h3>วิธีคำนวณค่าออกแบบ (ขั้นบันได)</h3>
        <code>
          ตัวอย่าง บ้าน มูลค่าก่อสร้าง 15 ล้าน{"\n"}
          10 ล้านแรก × 7.50% = 750,000 บาท{"\n"}
          5 ล้านถัดมา × 6.00% = 300,000 บาท{"\n"}
          รวมค่าออกแบบ = 1,050,000 บาท (เฉลี่ย 7.00%)
        </code>
      </GlassCard>

      <GlassCard className="ref-table-card">
        <div className="ref-table-wrap">
          <table className="ref-table">
            <thead>
              <tr>
                <th>ประเภทอาคารในแอป</th>
                <th>หมวดค่าออกแบบที่ใช้</th>
              </tr>
            </thead>
            <tbody>
              {buildingPresets.map((p) => (
                <tr key={p.id}>
                  <th scope="row">{p.labelTh}</th>
                  <td>{feeCategoriesById[BUILDING_FEE_CATEGORY[p.id] ?? "commercial"].labelTh}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <h3 className="subsection-title">สัดส่วนงานออกแบบระหว่างสถาปนิกและวิศวกร</h3>
      <GlassCard className="ref-table-card">
        <div className="ref-table-wrap">
          <table className="ref-table">
            <thead>
              <tr>
                <th>สาขา</th>
                {disciplineSplit.typeLabels.map((_t, i) => (
                  <th key={i} className="num">
                    ประเภท {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {disciplineSplit.rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {row.values.map((v, i) => (
                    <td key={i} className="num">
                      {v == null ? "-" : `${v}%`}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
      <p className="ref-note">
        ประเภท 1 = บ้าน · ประเภท 2 = อาคารชุด/สำนักงาน/ห้าง/หอพัก/โรงเรียน · ประเภท 3 = โรงแรม/โรงพยาบาล/โรงงาน/สนามกีฬาในร่ม ·
        ประเภท 4 = โรงงาน/โกดัง/อาคารจอดรถ/ห้องแถว/ตลาด
      </p>

      <p className="ref-note">
        ที่มา:{" "}
        <a href={FEE_SOURCE_URL} target="_blank" rel="noreferrer">
          {FEE_SOURCE_NAME}
        </a>{" "}
        · อัตรานี้เป็นแนวทางมาตรฐาน ค่าบริการจริงอาจต่างตามขอบเขตงานและการตกลง
      </p>
    </div>
  );
}

function MethodTab() {
  return (
    <div className="formula-grid">
      {formulaCards.map((card) => (
        <GlassCard key={card.title} className="formula-card">
          <h3>{card.title}</h3>
          <code>{card.formula}</code>
        </GlassCard>
      ))}
    </div>
  );
}
