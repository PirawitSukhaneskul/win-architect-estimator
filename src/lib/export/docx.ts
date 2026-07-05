import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";
import type { ReportModel } from "../report";
import { formatArea, formatBaht, formatNumber, formatRatePerSqm, formatThaiDate } from "../format";
import {
  BRAND,
  DISCLAIMER_PRIMARY,
  DISCLAIMER_SCOPE,
  DISCLAIMER_SOURCE,
  FB_CREDIT,
  SOURCE_NAME,
  SOURCE_URL,
} from "../../data/disclaimers";
import { scopeExcluded } from "../../data/reference";

const FONT = "Leelawadee UI"; // Windows Thai-capable font; Word substitutes if absent.

function text(value: string, opts: { bold?: boolean; size?: number; color?: string } = {}) {
  return new TextRun({
    text: value,
    bold: opts.bold,
    size: opts.size ?? 22,
    color: opts.color,
    font: FONT,
  });
}

function para(value: string, opts: { bold?: boolean; size?: number; spacingAfter?: number } = {}) {
  return new Paragraph({
    spacing: { after: opts.spacingAfter ?? 120 },
    children: [text(value, { bold: opts.bold, size: opts.size })],
  });
}

function cell(value: string, opts: { bold?: boolean; align?: (typeof AlignmentType)[keyof typeof AlignmentType] } = {}) {
  return new TableCell({
    margins: { top: 40, bottom: 40, left: 60, right: 60 },
    children: [
      new Paragraph({
        alignment: opts.align,
        children: [text(value, { bold: opts.bold, size: 18 })],
      }),
    ],
  });
}

function fullWidthTable(rows: TableRow[]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: "C6CEDD" },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: "C6CEDD" },
      left: { style: BorderStyle.SINGLE, size: 2, color: "C6CEDD" },
      right: { style: BorderStyle.SINGLE, size: 2, color: "C6CEDD" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "E0E5EF" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "E0E5EF" },
    },
    rows,
  });
}

function feedbackTagLabel(tag: string): string {
  if (tag === "price_question") return "ข้อสงสัยเรื่องราคา";
  if (tag === "material_quality") return "วัสดุ/คุณภาพ";
  if (tag === "area_revision") return "แก้ไขพื้นที่";
  if (tag === "architect_handoff") return "ส่งต่อสถาปนิก";
  return "ความต้องการเพิ่มเติม";
}

export async function exportToDocx(model: ReportModel, filenameBase: string): Promise<void> {
  const c = model.computation;

  const roomHeader = new TableRow({
    tableHeader: true,
    children: [
      cell("ลำดับ", { bold: true }),
      cell("รายการ / ห้อง", { bold: true }),
      cell("จำนวน", { bold: true, align: AlignmentType.CENTER }),
      cell("พื้นที่/ห้อง", { bold: true, align: AlignmentType.RIGHT }),
      cell("พื้นที่รวม", { bold: true, align: AlignmentType.RIGHT }),
      cell("คุณภาพ", { bold: true }),
      cell("ราคา/ตร.ม.", { bold: true, align: AlignmentType.RIGHT }),
      cell("รวม", { bold: true, align: AlignmentType.RIGHT }),
      cell("อ้างอิงราคา", { bold: true }),
    ],
  });

  const roomRows = model.rows.map(
    (r) =>
      new TableRow({
        children: [
          cell(String(r.index), { align: AlignmentType.CENTER }),
          cell(r.name),
          cell(formatNumber(r.quantity), { align: AlignmentType.CENTER }),
          cell(`${formatNumber(r.areaPerRoom)}`, { align: AlignmentType.RIGHT }),
          cell(formatArea(r.totalArea), { align: AlignmentType.RIGHT }),
          cell(`${r.qualityLabel}${r.manualRate ? " (ปรับเอง)" : ""}`),
          cell(formatRatePerSqm(r.rate), { align: AlignmentType.RIGHT }),
          cell(formatBaht(r.cost), { align: AlignmentType.RIGHT }),
          cell(r.rateRef),
        ],
      }),
  );

  const floorTables = model.floorPrograms.flatMap((fp) => [
    para(`ชั้น ${fp.floor} · ${formatArea(fp.gfa)}`, { bold: true, size: 22, spacingAfter: 60 }),
    fullWidthTable([
      new TableRow({
        tableHeader: true,
        children: [
          cell("ห้อง", { bold: true }),
          cell("จำนวน", { bold: true, align: AlignmentType.CENTER }),
          cell("พื้นที่/ห้อง", { bold: true, align: AlignmentType.RIGHT }),
          cell("พื้นที่รวม", { bold: true, align: AlignmentType.RIGHT }),
        ],
      }),
      ...fp.rows.map(
        (r) =>
          new TableRow({
            children: [
              cell(r.name),
              cell(formatNumber(r.quantity), { align: AlignmentType.CENTER }),
              cell(formatNumber(r.areaPerRoom), { align: AlignmentType.RIGHT }),
              cell(formatArea(r.totalArea), { align: AlignmentType.RIGHT }),
            ],
          }),
      ),
    ]),
    new Paragraph({ spacing: { after: 120 }, children: [] }),
  ]);

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: FONT, size: 22 } },
      },
    },
    sections: [
      {
        properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 60 },
            children: [text(`จัดทำโดย ${BRAND}`, { bold: true, size: 30 })],
          }),
          para("รายงานประเมินราคาก่อสร้างเบื้องต้น", { size: 24, bold: true }),
          para(FB_CREDIT, { size: 18 }),
          para(`วันที่จัดทำ: ${formatThaiDate(model.generatedISO)}`, { size: 18 }),

          para("ข้อมูลโครงการ", { bold: true, size: 24 }),
          para(`ชื่อโครงการ: ${model.info.projectName || "-"}`),
          ...(model.info.clientName ? [para(`ลูกค้า: ${model.info.clientName}`)] : []),
          ...(model.info.location ? [para(`ทำเล: ${model.info.location}`)] : []),
          para(`ประเภทอาคาร: ${model.buildingLabel}`),
          para(`รูปแบบงาน: ${model.modeLabel}`),
          para(`จำนวนชั้น: ${model.info.floors} ชั้น`),

          para("สรุปผลการประเมิน", { bold: true, size: 24 }),
          para(`พื้นที่รวม (GFA): ${formatArea(c.gfa)}`),
          para(`ราคาประเมินรวม: ${formatBaht(c.grandTotal)}`, { bold: true }),
          para(`ช่วงราคาประเมิน (ต่ำ–สูง): ${formatBaht(c.grandTotalLow)} – ${formatBaht(c.grandTotalHigh)}`),
          para(`ราคาเฉลี่ยต่อตารางเมตร: ${c.gfa > 0 ? formatRatePerSqm(c.costPerSqm) : "-"}`),
          para(
            `ช่วงค่าจ้างสถาปนิกที่แนะนำ: ${formatBaht(model.architectFee.low)} – ${formatBaht(model.architectFee.high)}`,
          ),
          para(`ระยะเวลาก่อสร้างโดยประมาณ: ${model.duration.lowDays}–${model.duration.highDays} วัน`),

          para("ตารางรายการคำนวณ", { bold: true, size: 24 }),
          fullWidthTable([roomHeader, ...roomRows]),
          new Paragraph({ spacing: { after: 160 }, children: [] }),

          para("สรุปสำหรับสถาปนิก — โปรแกรมพื้นที่แยกตามชั้น", { bold: true, size: 24 }),
          ...floorTables,

          ...(model.feedbackComments.length > 0
            ? [
                para("ความคิดเห็นแนบจากลูกค้า", { bold: true, size: 22 }),
                ...model.feedbackComments.map((comment) =>
                  para(`${feedbackTagLabel(comment.tag)}: ${comment.text}`, { size: 18 }),
                ),
              ]
            : []),

          para("ข้อควรทราบ / ไม่รวมในราคานี้", { bold: true, size: 22 }),
          para(scopeExcluded.join(" · "), { size: 18 }),

          para("หมายเหตุสำคัญ", { bold: true, size: 22 }),
          para(DISCLAIMER_PRIMARY, { size: 18 }),
          para(DISCLAIMER_SCOPE, { size: 18 }),
          para(DISCLAIMER_SOURCE, { size: 18 }),

          para("แหล่งอ้างอิง", { bold: true, size: 22 }),
          para(SOURCE_NAME, { size: 18 }),
          para(SOURCE_URL, { size: 18 }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240 },
            children: [text(BRAND, { bold: true, size: 22 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [text(FB_CREDIT, { size: 18 })],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filenameBase}.docx`);
}
