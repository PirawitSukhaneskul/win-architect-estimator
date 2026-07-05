# WIN ARCHITECT — Construction Cost Estimator

A Thai-language web app for **preliminary architectural construction cost estimation**.
It turns a room-by-room program into a budget range, a schematic spatial (massing)
preview, a recommended architect-fee range, an estimated construction duration, and an
exportable report (PDF / Word).

> **หมายเหตุ:** เป็นการประเมินราคาเบื้องต้นเท่านั้น เพื่อวางงบประมาณคร่าว ๆ ก่อนปรึกษา/จ้างสถาปนิก

**Live:** https://pirawitsukhaneskul.github.io/win-architect-estimator/

## Features

- Project setup — สร้างใหม่ / รีโนเวต, building-type presets, floors, global quality
- Auto-generated, fully editable room rows (quantity, area, floor, quality, rate)
- Price slider bounded to the source low–high range, extendable to a premium/custom band (up to 2×) with clear BOQ warnings
- Renovation logic based on scope level (light/medium/heavy) + demolition + risk — not simply "new build + extras"
- Live summary: GFA, cost range, cost/m², recommended architect fee, construction duration
- Schematic spatial block preview (squarified treemap, grouped by floor)
- Pre-submit disclaimer acknowledgement, result report, and a `สรุปสำหรับสถาปนิก` section
- Reference page: quality definitions with icons, price database, scope in/out, formulas
- Feedback capture (local + optional Google Sheet webhook)
- PDF (print pipeline) and Word (`docx`) export; localStorage history

## Data source

Rates are seeded from the **2569 column** of *บัญชีราคามาตรฐานต่อหน่วย โรงเรือนสิ่งปลูกสร้าง,
สมาคมประเมินค่าทรัพย์สินแห่งประเทศไทย พ.ศ. 2568-2569*
(https://www.thaiappraisal.org/thai/value/value.php). They are starter values in
`src/data/rateItems.ts` and should be verified against the official document before
production quoting.

## Tech

React 19 · TypeScript · Vite · plain CSS (iOS-glass design system) · lucide-react · docx.

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```

Optional: set `VITE_FEEDBACK_WEBHOOK_URL` to post feedback to a Google Apps Script webhook.

## Credit

Built by **WIN ARCHITECT** · FB PAGE: WIN ARCHITECT
