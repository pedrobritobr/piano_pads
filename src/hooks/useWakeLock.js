import { useEffect, useRef, useState } from "react";

export function useWakeLock(addLog) {
  const [showWakeLockPrompt, setShowWakeLockPrompt] = useState(false);
  const wakeLockRef = useRef(null);
  const wakeLockRequested = useRef(false);

  const requestWakeLock = async () => {
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
        addLog?.("Wake Lock ativado - tela permanecerá ligada", "success");
        return true;
      }
    } catch (err) {
      addLog?.(`Erro ao ativar Wake Lock: ${err.message}`, "error");
      return false;
    }
  };

  const handleWakeLockAccept = async () => {
    setShowWakeLockPrompt(false);
    await requestWakeLock();
  };

  const handleWakeLockDecline = () => {
    setShowWakeLockPrompt(false);
    addLog?.("Wake Lock recusado pelo usuário", "warning");
  };

  useEffect(() => {
    // Mostrar popup para solicitar Wake Lock
    if ("wakeLock" in navigator && !wakeLockRequested.current) {
      setShowWakeLockPrompt(true);
      wakeLockRequested.current = true;
    } else if (!("wakeLock" in navigator)) {
      addLog?.("Wake Lock não suportado neste navegador", "warning");
    }

    // Reativa o Wake Lock quando a página volta a ficar visível
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && wakeLockRef.current === null) {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, []);

  return {
    showWakeLockPrompt,
    handleWakeLockAccept,
    handleWakeLockDecline,
  };
}
