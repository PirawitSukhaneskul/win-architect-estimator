import { useState } from "react";
import { StoreProvider, useStore } from "./state/store";
import type { View } from "./nav";
import { GlassNav } from "./components/GlassNav";
import { EstimatorPage } from "./components/EstimatorPage";
import { ResultReport } from "./components/ResultReport";
import { ReferencePage } from "./components/ReferencePage";
import { HistoryPage } from "./components/HistoryPage";
import { PreSubmitDisclaimerModal } from "./components/PreSubmitDisclaimerModal";
import { CreditFooter } from "./components/CreditFooter";
import { computeEstimate } from "./lib/calc";

function AppInner() {
  const { state, saveReport } = useStore();
  const [view, setView] = useState<View>("estimator");
  const [modalOpen, setModalOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const navigate = (v: View) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openCalc = () => {
    const c = computeEstimate(state);
    if (c.gfa <= 0) {
      setView("estimator");
      return;
    }
    setModalOpen(true);
  };

  const confirmCalc = () => {
    saveReport();
    setAcknowledged(true);
    setModalOpen(false);
    navigate("result");
  };

  return (
    <div className="app-shell">
      <GlassNav
        view={view}
        onNavigate={navigate}
        resultEnabled={acknowledged}
        onCalculate={() => {
          setView("estimator");
          openCalc();
        }}
      />

      <main className="app-main">
        {view === "estimator" && (
          <EstimatorPage onNavigate={navigate} onCalculate={openCalc} />
        )}
        {view === "result" &&
          (acknowledged ? (
            <ResultReport onNavigate={navigate} />
          ) : (
            <div className="gate-notice">
              กรุณากด “คำนวณราคา” และยืนยันหมายเหตุก่อนดูผลประเมิน
            </div>
          ))}
        {view === "reference" && <ReferencePage />}
        {view === "history" && <HistoryPage onNavigate={navigate} />}
      </main>

      <CreditFooter />

      <PreSubmitDisclaimerModal
        open={modalOpen}
        onConfirm={confirmCalc}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  );
}
