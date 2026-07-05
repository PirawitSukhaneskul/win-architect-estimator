import { RotateCcw } from "lucide-react";
import { useStore } from "../state/store";
import { GlassCard } from "./primitives";
import { RoomEstimateRow } from "./RoomEstimateRow";
import { AddRoomMenu } from "./AddRoomMenu";

export function RoomEstimateTable() {
  const { state, regenerateRooms } = useStore();
  const { rooms, info } = state;

  return (
    <GlassCard className="room-table" strong>
      <div className="room-table-head">
        <div>
          <h2 className="panel-title">รายการห้อง</h2>
          <p className="subsection-hint">แก้ไขจำนวน พื้นที่ คุณภาพ และราคาต่อห้องได้ทั้งหมด</p>
        </div>
        <div className="room-table-actions">
          <button
            type="button"
            className="btn-ghost"
            title="สร้างรายการห้องใหม่ตามประเภทอาคาร"
            onClick={() => {
              if (
                rooms.length === 0 ||
                window.confirm("สร้างรายการห้องใหม่ตามประเภทอาคาร? รายการปัจจุบันจะถูกแทนที่")
              ) {
                regenerateRooms();
              }
            }}
          >
            <RotateCcw size={15} /> รีเซ็ตห้องตามประเภท
          </button>
          <AddRoomMenu />
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="empty-state">เพิ่มรายการห้องเพื่อเริ่มคำนวณ</div>
      ) : (
        <div className="room-list">
          {rooms.map((room, i) => (
            <RoomEstimateRow key={room.id} room={room} index={i} floors={info.floors} />
          ))}
        </div>
      )}
    </GlassCard>
  );
}
