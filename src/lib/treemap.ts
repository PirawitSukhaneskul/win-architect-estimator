// Squarified treemap layout — produces rectangles whose areas are proportional
// to each item's value, packed to keep aspect ratios close to square.

export interface TreemapInput<T> {
  value: number;
  data: T;
}

export interface TreemapRect<T> {
  x: number;
  y: number;
  w: number;
  h: number;
  value: number;
  data: T;
}

function worstRatio<T>(
  row: { area: number; input: TreemapInput<T> }[],
  rowSum: number,
  side: number,
): number {
  if (rowSum <= 0 || side <= 0) return Infinity;
  const thickness = rowSum / side;
  let worst = 0;
  for (const item of row) {
    const length = item.area / thickness;
    if (length <= 0) return Infinity;
    worst = Math.max(worst, Math.max(thickness / length, length / thickness));
  }
  return worst;
}

export function squarify<T>(
  inputs: TreemapInput<T>[],
  X: number,
  Y: number,
  W: number,
  H: number,
): TreemapRect<T>[] {
  const filtered = inputs.filter((d) => d.value > 0).sort((a, b) => b.value - a.value);
  const total = filtered.reduce((s, d) => s + d.value, 0);
  const rects: TreemapRect<T>[] = [];
  if (total <= 0 || W <= 0 || H <= 0) return rects;

  const scale = (W * H) / total;
  const items = filtered.map((input) => ({ input, area: input.value * scale }));

  let x = X;
  let y = Y;
  let w = W;
  let h = H;
  let i = 0;

  while (i < items.length) {
    const horizontal = w >= h; // lay row across the longer side
    const side = Math.min(w, h);

    const row: { area: number; input: TreemapInput<T> }[] = [];
    let rowSum = 0;
    let best = Infinity;

    while (i < items.length) {
      const candidate = items[i];
      const testSum = rowSum + candidate.area;
      const testRow = [...row, candidate];
      const ratio = worstRatio(testRow, testSum, side);
      if (row.length === 0 || ratio <= best) {
        row.push(candidate);
        rowSum = testSum;
        best = ratio;
        i += 1;
      } else {
        break;
      }
    }

    const thickness = rowSum / side;
    let cursor = horizontal ? y : x;
    for (const item of row) {
      const length = item.area / thickness;
      if (horizontal) {
        rects.push({ x, y: cursor, w: thickness, h: length, value: item.input.value, data: item.input.data });
      } else {
        rects.push({ x: cursor, y, w: length, h: thickness, value: item.input.value, data: item.input.data });
      }
      cursor += length;
    }

    if (horizontal) {
      x += thickness;
      w -= thickness;
    } else {
      y += thickness;
      h -= thickness;
    }
  }

  return rects;
}
