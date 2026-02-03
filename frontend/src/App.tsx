import { useState } from "react";
import { LandingSplash } from "./components/LandingSplash";
import { Dashboard } from "./components/Dashboard";
import { motion, AnimatePresence } from "motion/react";

type View = "landing" | "dashboard";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("landing");

  const renderView = () => {
    switch (currentView) {
      case "landing":
        return (
          <LandingSplash
            onOpenDashboard={() => setCurrentView("dashboard")}
          />
        );
      case "dashboard":
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D0D0D] to-[#1A1A1A]">
            <Dashboard />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#EDEDED]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}