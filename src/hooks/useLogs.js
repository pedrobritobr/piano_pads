import { useState } from "react";

const isQA = import.meta.env.VITE_ENV === "qa";

export function useLogs() {
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);

  const addLog = (message, type = "info") => {
    if (!isQA) return; // Só registra logs em ambiente QA
    const timestamp = new Date().toLocaleTimeString("pt-BR");
    setLogs((prev) => [
      ...prev.slice(-50), // Mantém apenas os últimos 50 logs
      { message, type, timestamp, id: Date.now() },
    ]);
  };

  const clearLogs = () => setLogs([]);

  const toggleLogs = () => setShowLogs((prev) => !prev);

  return {
    logs,
    showLogs,
    addLog,
    clearLogs,
    toggleLogs,
    isQA,
  };
}
