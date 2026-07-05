import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type {
  BuildingPreset,
  EstimateRoom,
  EstimateState,
  FeedbackComment,
  ProjectInfo,
  QualityLevel,
  SavedReport,
} from "../types";
import { buildingPresetsById } from "../data/buildingPresets";
import type { RoomTemplate } from "../data/buildingPresets";
import { rateItemsById } from "../data/rateItems";
import { rateForQuality, resolveBounds } from "../lib/grade";
import { uid } from "../lib/id";

const STORAGE_KEY = "win-architect-estimate-v1";
const HISTORY_KEY = "win-architect-history-v1";

function defaultInfo(): ProjectInfo {
  return {
    projectName: "",
    clientName: "",
    location: "",
    mode: "new_build",
    buildingTypeId: "house",
    floors: buildingPresetsById["house"].defaultFloors,
    defaultQuality: "mid",
    hasDemolition: false,
    demolitionPercent: 8,
    renovationComplexity: "medium",
  };
}

export function instantiateRooms(
  preset: BuildingPreset,
  quality: QualityLevel,
): EstimateRoom[] {
  return preset.suggestedRooms.map((rp) => {
    const rateItem = rateItemsById[rp.defaultRateItemId];
    const q = rp.defaultQuality ?? quality;
    return {
      id: uid("room"),
      roomPresetKey: rp.key,
      name: rp.labelTh,
      category: rp.category,
      floor: rp.defaultFloor ?? 1,
      quantity: rp.defaultQty,
      areaPerRoomSqm: rp.defaultAreaSqm,
      rateItemId: rp.defaultRateItemId,
      selectedRatePerSqm: rateItem ? rateForQuality(rateItem, q) : 0,
      qualityLabel: q,
      manualRate: false,
    };
  });
}

function initialState(): EstimateState {
  const info = defaultInfo();
  return {
    info,
    rooms: instantiateRooms(buildingPresetsById[info.buildingTypeId], info.defaultQuality),
    feedbackComments: [],
  };
}

type Action =
  | { type: "patchInfo"; patch: Partial<ProjectInfo> }
  | { type: "setBuildingType"; buildingTypeId: string }
  | { type: "applyGlobalQuality"; quality: QualityLevel }
  | { type: "addRoom"; template?: RoomTemplate }
  | { type: "updateRoom"; id: string; patch: Partial<EstimateRoom> }
  | { type: "duplicateRoom"; id: string }
  | { type: "removeRoom"; id: string }
  | { type: "regenerateRooms" }
  | { type: "addFeedback"; comment: FeedbackComment }
  | { type: "markFeedbackSynced"; id: string }
  | { type: "reset" }
  | { type: "load"; state: EstimateState };

function reducer(state: EstimateState, action: Action): EstimateState {
  switch (action.type) {
    case "patchInfo":
      return { ...state, info: { ...state.info, ...action.patch } };

    case "setBuildingType": {
      const preset = buildingPresetsById[action.buildingTypeId];
      if (!preset) return state;
      return {
        ...state,
        info: {
          ...state.info,
          buildingTypeId: action.buildingTypeId,
          floors: preset.defaultFloors,
        },
        rooms: instantiateRooms(preset, state.info.defaultQuality),
      };
    }

    case "applyGlobalQuality": {
      return {
        ...state,
        info: { ...state.info, defaultQuality: action.quality },
        rooms: state.rooms.map((r) => {
          if (r.manualRate) return r;
          const item = rateItemsById[r.rateItemId];
          if (!item) return r;
          return {
            ...r,
            qualityLabel: action.quality,
            selectedRatePerSqm: rateForQuality(item, action.quality),
          };
        }),
      };
    }

    case "addRoom": {
      const t = action.template;
      const rateItemId =
        t?.preferredRateItemId ??
        buildingPresetsById[state.info.buildingTypeId]?.defaultRateItemId ??
        "house-concrete-1";
      const item = rateItemsById[rateItemId];
      const q = state.info.defaultQuality;
      const newRoom: EstimateRoom = {
        id: uid("room"),
        name: t?.labelTh ?? "ห้องกำหนดเอง",
        category: t?.category ?? "public",
        floor: 1,
        quantity: 1,
        areaPerRoomSqm: t?.areaSqm ?? 12,
        rateItemId,
        selectedRatePerSqm: item ? rateForQuality(item, q) : 0,
        qualityLabel: q,
        manualRate: false,
      };
      return { ...state, rooms: [...state.rooms, newRoom] };
    }

    case "updateRoom": {
      return {
        ...state,
        rooms: state.rooms.map((r) => {
          if (r.id !== action.id) return r;
          const patched = { ...r, ...action.patch };
          // If the rate item changed (and not a manual rate), re-derive the
          // selected rate from the new item at the row's current quality.
          if (
            action.patch.rateItemId &&
            action.patch.rateItemId !== r.rateItemId &&
            !patched.manualRate
          ) {
            const item = rateItemsById[patched.rateItemId];
            if (item) {
              patched.selectedRatePerSqm = rateForQuality(item, patched.qualityLabel);
            }
          }
          // If quality changed via segmented control (not manual), re-derive.
          if (
            action.patch.qualityLabel &&
            action.patch.qualityLabel !== r.qualityLabel &&
            !patched.manualRate &&
            action.patch.selectedRatePerSqm === undefined
          ) {
            const item = rateItemsById[patched.rateItemId];
            if (item) {
              patched.selectedRatePerSqm = rateForQuality(item, patched.qualityLabel);
            }
          }
          return patched;
        }),
      };
    }

    case "duplicateRoom": {
      const idx = state.rooms.findIndex((r) => r.id === action.id);
      if (idx === -1) return state;
      const copy: EstimateRoom = {
        ...state.rooms[idx],
        id: uid("room"),
        name: `${state.rooms[idx].name} (สำเนา)`,
      };
      const rooms = [...state.rooms];
      rooms.splice(idx + 1, 0, copy);
      return { ...state, rooms };
    }

    case "removeRoom":
      return { ...state, rooms: state.rooms.filter((r) => r.id !== action.id) };

    case "regenerateRooms": {
      const preset = buildingPresetsById[state.info.buildingTypeId];
      if (!preset) return state;
      return { ...state, rooms: instantiateRooms(preset, state.info.defaultQuality) };
    }

    case "addFeedback":
      return { ...state, feedbackComments: [action.comment, ...(state.feedbackComments ?? [])] };

    case "markFeedbackSynced":
      return {
        ...state,
        feedbackComments: (state.feedbackComments ?? []).map((c) =>
          c.id === action.id ? { ...c, synced: true } : c,
        ),
      };

    case "reset":
      return initialState();

    case "load":
      return { ...action.state, feedbackComments: action.state.feedbackComments ?? [] };

    default:
      return state;
  }
}

interface StoreValue {
  state: EstimateState;
  history: SavedReport[];
  patchInfo: (patch: Partial<ProjectInfo>) => void;
  setBuildingType: (id: string) => void;
  applyGlobalQuality: (q: QualityLevel) => void;
  addRoom: (template?: RoomTemplate) => void;
  updateRoom: (id: string, patch: Partial<EstimateRoom>) => void;
  duplicateRoom: (id: string) => void;
  removeRoom: (id: string) => void;
  regenerateRooms: () => void;
  reset: () => void;
  addFeedback: (comment: FeedbackComment) => void;
  markFeedbackSynced: (id: string) => void;
  saveReport: () => void;
  deleteReport: (id: string) => void;
  loadReport: (id: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function loadPersisted(): EstimateState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EstimateState;
    if (!parsed?.info || !Array.isArray(parsed.rooms)) return null;
    return { ...parsed, feedbackComments: parsed.feedbackComments ?? [] };
  } catch {
    return null;
  }
}

function loadHistory(): SavedReport[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedReport[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    () => loadPersisted() ?? initialState(),
  );
  const [history, dispatchHistory] = useReducer(historyReducer, undefined, loadHistory);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota errors */
    }
  }, [state]);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      /* ignore */
    }
  }, [history]);

  const value = useMemo<StoreValue>(
    () => ({
      state,
      history,
      patchInfo: (patch) => dispatch({ type: "patchInfo", patch }),
      setBuildingType: (id) => dispatch({ type: "setBuildingType", buildingTypeId: id }),
      applyGlobalQuality: (q) => dispatch({ type: "applyGlobalQuality", quality: q }),
      addRoom: (template) => dispatch({ type: "addRoom", template }),
      updateRoom: (id, patch) => dispatch({ type: "updateRoom", id, patch }),
      duplicateRoom: (id) => dispatch({ type: "duplicateRoom", id }),
      removeRoom: (id) => dispatch({ type: "removeRoom", id }),
      regenerateRooms: () => dispatch({ type: "regenerateRooms" }),
      reset: () => dispatch({ type: "reset" }),
      addFeedback: (comment) => dispatch({ type: "addFeedback", comment }),
      markFeedbackSynced: (id) => dispatch({ type: "markFeedbackSynced", id }),
      saveReport: () =>
        dispatchHistory({
          type: "add",
          report: {
            id: uid("report"),
            createdAt: new Date().toISOString(),
            info: state.info,
            rooms: state.rooms,
            feedbackComments: state.feedbackComments,
          },
        }),
      deleteReport: (id) => dispatchHistory({ type: "remove", id }),
      loadReport: (id) => {
        const report = history.find((r) => r.id === id);
        if (report) {
          dispatch({
            type: "load",
            state: {
              info: report.info,
              rooms: report.rooms,
              feedbackComments: report.feedbackComments ?? [],
            },
          });
        }
      },
    }),
    [state, history],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

type HistoryAction =
  | { type: "add"; report: SavedReport }
  | { type: "remove"; id: string };

function historyReducer(state: SavedReport[], action: HistoryAction): SavedReport[] {
  switch (action.type) {
    case "add":
      return [action.report, ...state].slice(0, 20);
    case "remove":
      return state.filter((r) => r.id !== action.id);
    default:
      return state;
  }
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

// Re-exported so components can show slider bounds without re-importing grade.
export { resolveBounds };
