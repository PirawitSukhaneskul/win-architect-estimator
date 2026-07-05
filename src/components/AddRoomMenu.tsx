import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { useStore } from "../state/store";
import { commonRoomTemplates } from "../data/buildingPresets";
import { categoryMeta } from "../data/categories";

export function AddRoomMenu() {
  const { addRoom } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="add-room" ref={ref}>
      <button type="button" className="btn-outline" onClick={() => setOpen((o) => !o)}>
        <Plus size={16} /> เพิ่มห้อง
      </button>
      {open && (
        <div className="add-room-menu glass-strong" role="menu">
          {commonRoomTemplates.map((t) => (
            <button
              key={t.labelTh}
              type="button"
              role="menuitem"
              className="add-room-item"
              onClick={() => {
                addRoom(t);
                setOpen(false);
              }}
            >
              <span className="dot" style={{ background: categoryMeta[t.category].fill }} />
              <span>{t.labelTh}</span>
              <span className="add-room-area">{t.areaSqm} ตร.ม.</span>
            </button>
          ))}
          <button
            type="button"
            role="menuitem"
            className="add-room-item is-custom"
            onClick={() => {
              addRoom();
              setOpen(false);
            }}
          >
            <Plus size={14} /> ห้องกำหนดเอง
          </button>
        </div>
      )}
    </div>
  );
}
