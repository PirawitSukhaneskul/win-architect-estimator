import type { CSSProperties } from "react";
import { Copy, Trash2 } from "lucide-react";
import type { EstimateRoom, QualityLevel, RoomCategory } from "../types";
import { useStore } from "../state/store";
import { computeRoom } from "../lib/calc";
import { rateItems, rateItemsById } from "../data/rateItems";
import { categoryMeta, categoryOrder } from "../data/categories";
import { formatArea, formatBaht } from "../lib/format";
import { NumberInput, SegmentedControl, IconButton } from "./primitives";
import { PriceRangeSlider } from "./PriceRangeSlider";
import { useIsMobile } from "../lib/useIsMobile";

const QUALITY_OPTIONS: { value: QualityLevel; label: string }[] = [
  { value: "low", label: "ราคาต่ำ" },
  { value: "mid", label: "ปานกลาง" },
  { value: "high", label: "ราคาสูง" },
  { value: "premium", label: "พรีเมียม / พิเศษ" },
];

export function RoomEstimateRow({
  room,
  index,
  floors,
}: {
  room: EstimateRoom;
  index: number;
  floors: number;
}) {
  const { updateRoom, duplicateRoom, removeRoom } = useStore();
  const isMobile = useIsMobile();
  const comp = computeRoom(room);
  const rateItem = rateItemsById[room.rateItemId];

  const areaInvalid = room.areaPerRoomSqm <= 0;
  const qtyInvalid = room.quantity < 1;

  const accent = categoryMeta[room.category].accent;

  return (
    <article className="room-card" style={{ "--accent": accent } as CSSProperties}>
      <div className="room-card-head">
        <span className="room-index">{index + 1}</span>
        <input
          className="room-name-input"
          type="text"
          value={room.name}
          aria-label="ชื่อห้อง"
          onChange={(e) => updateRoom(room.id, { name: e.target.value })}
        />
        <select
          className="cat-select"
          value={room.category}
          aria-label="หมวดพื้นที่"
          onChange={(e) => updateRoom(room.id, { category: e.target.value as RoomCategory })}
        >
          {categoryOrder.map((c) => (
            <option key={c} value={c}>
              {categoryMeta[c].labelTh}
            </option>
          ))}
        </select>
        <div className="room-actions">
          <IconButton title="ทำสำเนาห้อง" onClick={() => duplicateRoom(room.id)}>
            <Copy size={15} />
          </IconButton>
          <IconButton title="ลบห้อง" variant="danger" onClick={() => removeRoom(room.id)}>
            <Trash2 size={15} />
          </IconButton>
        </div>
      </div>

      <div className="room-grid">
        <label className="mini-field">
          <span>ชั้น</span>
          <select
            value={room.floor}
            aria-label="ชั้น"
            onChange={(e) => updateRoom(room.id, { floor: Number(e.target.value) })}
          >
            {Array.from({ length: Math.max(1, floors) }, (_, i) => i + 1).map((f) => (
              <option key={f} value={f}>
                ชั้น {f}
              </option>
            ))}
          </select>
        </label>

        <label className="mini-field">
          <span>จำนวน</span>
          {isMobile ? (
            <select
              value={room.quantity}
              aria-label="จำนวนห้อง"
              onChange={(e) => updateRoom(room.id, { quantity: Number(e.target.value) })}
            >
              {Array.from({ length: 50 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} ห้อง
                </option>
              ))}
            </select>
          ) : (
            <NumberInput
              value={room.quantity}
              min={1}
              ariaLabel="จำนวนห้อง"
              invalid={qtyInvalid}
              onChange={(v) => updateRoom(room.id, { quantity: v })}
            />
          )}
        </label>

        <label className="mini-field">
          <span>พื้นที่/ห้อง</span>
          <NumberInput
            value={room.areaPerRoomSqm}
            min={0}
            step={0.5}
            suffix="ตร.ม."
            ariaLabel="พื้นที่ต่อห้อง"
            invalid={areaInvalid}
            onChange={(v) => updateRoom(room.id, { areaPerRoomSqm: v })}
          />
        </label>

        <div className="mini-field">
          <span>พื้นที่รวม</span>
          <strong className="mini-value">{formatArea(comp.totalArea)}</strong>
        </div>
      </div>

      <div className="room-quality">
        <span className="mini-label">คุณภาพ</span>
        {isMobile ? (
          <select
            className="quality-select"
            value={room.qualityLabel}
            aria-label="คุณภาพงานของห้อง"
            onChange={(e) =>
              updateRoom(room.id, {
                qualityLabel: e.target.value as QualityLevel,
                manualRate: false,
              })
            }
          >
            {QUALITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : (
          <SegmentedControl<QualityLevel>
            size="sm"
            ariaLabel="คุณภาพงานของห้อง"
            value={room.qualityLabel}
            onChange={(v) => updateRoom(room.id, { qualityLabel: v, manualRate: false })}
            options={[
              { value: "low", label: "ต่ำ" },
              { value: "mid", label: "กลาง" },
              { value: "high", label: "สูง" },
              { value: "premium", label: "พิเศษ" },
            ]}
          />
        )}
      </div>

      <label className="rate-map-field">
        <span className="mini-label">อ้างอิงราคา</span>
        <select
          value={room.rateItemId}
          aria-label="รายการราคาอ้างอิง"
          onChange={(e) => updateRoom(room.id, { rateItemId: e.target.value })}
        >
          {rateItems.map((item) => (
            <option key={item.id} value={item.id}>
              [{item.sourceCode}] {item.sourceCategoryName}
            </option>
          ))}
        </select>
      </label>

      {rateItem && (
        <PriceRangeSlider
          rateItem={rateItem}
          value={room.selectedRatePerSqm}
          manualRate={room.manualRate}
          onChangeRate={(rate, manual) =>
            updateRoom(room.id, { selectedRatePerSqm: rate, manualRate: manual })
          }
          onToggleManual={(manual) => updateRoom(room.id, { manualRate: manual })}
        />
      )}

      <input
        className="room-notes"
        type="text"
        placeholder="หมายเหตุ (ไม่บังคับ)"
        value={room.notes ?? ""}
        aria-label="หมายเหตุห้อง"
        onChange={(e) => updateRoom(room.id, { notes: e.target.value })}
      />

      <div className="room-cost-line">
        <span>ราคาห้องนี้</span>
        <strong>{formatBaht(comp.selectedCost)}</strong>
      </div>
    </article>
  );
}
