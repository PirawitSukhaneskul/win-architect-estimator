// Thai-locale formatting helpers.

const bahtFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 1,
});

export function formatBaht(value: number): string {
  if (!Number.isFinite(value)) return "-";
  return bahtFormatter.format(Math.round(value));
}

/** Compact baht for headline numbers, e.g. "฿1.25 ล้าน". */
export function formatBahtCompact(value: number): string {
  if (!Number.isFinite(value)) return "-";
  if (value >= 1_000_000) {
    return `฿${decimalFormatter.format(value / 1_000_000)} ล้าน`;
  }
  return formatBaht(value);
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "-";
  return numberFormatter.format(value);
}

export function formatArea(value: number): string {
  if (!Number.isFinite(value)) return "0 ตร.ม.";
  return `${decimalFormatter.format(value)} ตร.ม.`;
}

export function formatRatePerSqm(value: number): string {
  return `${formatNumber(Math.round(value))} บาท/ตร.ม.`;
}

export function todayISODate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Buddhist-era, human-friendly date for report headers. */
export function formatThaiDate(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
