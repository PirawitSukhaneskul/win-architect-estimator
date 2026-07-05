import { buildingPresets } from "../data/buildingPresets";
import { iconFor } from "./iconMap";

export function BuildingPresetPicker({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="preset-grid" role="radiogroup" aria-label="ประเภทอาคาร">
      {buildingPresets.map((preset) => {
        const Icon = iconFor(preset.icon);
        const active = preset.id === selectedId;
        return (
          <button
            key={preset.id}
            type="button"
            role="radio"
            aria-checked={active}
            className={`preset-card ${active ? "is-active" : ""}`}
            onClick={() => onSelect(preset.id)}
          >
            <span className="preset-icon">
              <Icon size={22} />
            </span>
            <span className="preset-label">{preset.labelTh}</span>
            <span className="preset-desc">{preset.descriptionTh}</span>
          </button>
        );
      })}
    </div>
  );
}
