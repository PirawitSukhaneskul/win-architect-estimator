import { useMemo, useState } from "react";
import type { EstimateRoom } from "../types";
import { computeRoom } from "../lib/calc";
import { squarify } from "../lib/treemap";
import { categoryMeta, categoryOrder } from "../data/categories";
import { formatArea } from "../lib/format";

const WALL = "#3f4652";
const VB_W = 200;
const VB_H_BASE = 130;

interface FloorData {
  floor: number;
  rooms: EstimateRoom[];
  gfa: number;
}

export function SpatialBlockPreview({
  rooms,
  captureId,
  allowFloorTabs = false,
}: {
  rooms: EstimateRoom[];
  captureId?: string;
  allowFloorTabs?: boolean;
}) {
  const floors = useMemo<FloorData[]>(() => {
    const map = new Map<number, EstimateRoom[]>();
    for (const r of rooms) {
      const area = Math.max(0, r.quantity) * Math.max(0, r.areaPerRoomSqm);
      if (area <= 0) continue;
      if (!map.has(r.floor)) map.set(r.floor, []);
      map.get(r.floor)!.push(r);
    }
    return [...map.entries()]
      .map(([floor, fRooms]) => ({
        floor,
        rooms: fRooms,
        gfa: fRooms.reduce(
          (s, r) => s + r.quantity * r.areaPerRoomSqm,
          0,
        ),
      }))
      .sort((a, b) => a.floor - b.floor);
  }, [rooms]);

  const [activeFloor, setActiveFloor] = useState<number | null>(null);
  const maxGfa = Math.max(1, ...floors.map((f) => f.gfa));

  if (floors.length === 0) {
    return <div className="empty-state small">ยังไม่มีพื้นที่สำหรับแสดงผัง</div>;
  }

  const shown =
    allowFloorTabs && activeFloor !== null
      ? floors.filter((f) => f.floor === activeFloor)
      : floors;

  return (
    <div className="spatial-preview" id={captureId}>
      {allowFloorTabs && floors.length > 1 && (
        <div className="floor-tabs">
          <button
            type="button"
            className={`floor-tab ${activeFloor === null ? "is-active" : ""}`}
            onClick={() => setActiveFloor(null)}
          >
            ทุกชั้น
          </button>
          {floors.map((f) => (
            <button
              key={f.floor}
              type="button"
              className={`floor-tab ${activeFloor === f.floor ? "is-active" : ""}`}
              onClick={() => setActiveFloor(f.floor)}
            >
              ชั้น {f.floor}
            </button>
          ))}
        </div>
      )}

      {shown.map((f) => (
        <FloorDiagram key={f.floor} floor={f} scale={f.gfa / maxGfa} />
      ))}

      <ul className="spatial-legend">
        {categoryOrder.map((c) => (
          <li key={c}>
            <span className="legend-swatch" style={{ background: categoryMeta[c].fill }} />
            {categoryMeta[c].labelTh}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FloorDiagram({ floor, scale }: { floor: FloorData; scale: number }) {
  const vbH = Math.round(VB_H_BASE * (0.6 + 0.4 * scale));

  const rects = useMemo(() => {
    const ordered = [...floor.rooms].sort(
      (a, b) =>
        categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category),
    );
    const inputs = ordered.map((room) => ({
      value: computeRoom(room).totalArea,
      data: room,
    }));
    return squarify(inputs, 0, 0, VB_W, vbH);
  }, [floor, vbH]);

  return (
    <figure className="floor-figure">
      <figcaption>
        ชั้น {floor.floor} · {formatArea(floor.gfa)}
      </figcaption>
      <svg
        viewBox={`0 0 ${VB_W} ${vbH}`}
        className="floor-svg"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`ผังพื้นที่ ชั้น ${floor.floor}`}
      >
        {rects.map((rect) => {
          const room = rect.data;
          const meta = categoryMeta[room.category];
          const showText = rect.w > 24 && rect.h > 15;
          const showSub = rect.w > 30 && rect.h > 24;
          const totalArea = room.quantity * room.areaPerRoomSqm;
          return (
            <g key={room.id}>
              <rect
                x={rect.x + 0.75}
                y={rect.y + 0.75}
                width={Math.max(0, rect.w - 1.5)}
                height={Math.max(0, rect.h - 1.5)}
                rx={2}
                fill={meta.fill}
                stroke={WALL}
                strokeWidth={1.4}
              />
              <title>
                {room.name} · {room.quantity} ห้อง · {formatArea(totalArea)}
              </title>
              {showText && (
                <text
                  x={rect.x + rect.w / 2}
                  y={rect.y + rect.h / 2 - (showSub ? 3 : 0)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="block-name"
                >
                  {clip(room.name, rect.w)}
                </text>
              )}
              {showSub && (
                <text
                  x={rect.x + rect.w / 2}
                  y={rect.y + rect.h / 2 + 7}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="block-sub"
                >
                  {room.quantity > 1 ? `${room.quantity}× · ` : ""}
                  {Math.round(totalArea)} ตร.ม.
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

function clip(name: string, w: number): string {
  const max = Math.max(4, Math.floor(w / 4));
  return name.length > max ? `${name.slice(0, max - 1)}…` : name;
}
