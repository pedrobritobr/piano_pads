import React, { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import packageJson from "../package.json";

const isQA = import.meta.env.VITE_ENV === "qa";

export default function TrackMixer() {
  const notes = [
    { key: "C", label: "Dó" },
    { key: "Cb", label: "Dó#" },
    { key: "D", label: "Ré" },
    { key: "Db", label: "Ré#" },
    { key: "E", label: "Mi" },
    { key: "F", label: "Fá" },
    { key: "Fb", label: "Fá#" },
    { key: "G", label: "Sol" },
    { key: "Gb", label: "Sol#" },
    { key: "A", label: "Lá" },
    { key: "Ab", label: "Lá#" },
    { key: "B", label: "Si" },
  ];

  const tracks = [
    // { id: 1, name: "Ambient Pad", base: "AMBIENTE PAD" },
    // { id: 2, name: "Shimmer Pad", base: "SHIMMER PAD" },
    { id: 3, name: "Space Reverse Pad", base: "SPACE REVERSE PAD" },
    // { id: 4, name: "Warm Pad", base: "WARM PAD" },
  ];

  const [currentNote, setCurrentNote] = useState(null);
  const [volumes, setVolumes] = useState({});
  const [muted, setMuted] = useState({});
  const [isLandscape, setIsLandscape] = useState(
    window.matchMedia("(orientation: landscape)").matches
  );
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [showWakeLockPrompt, setShowWakeLockPrompt] = useState(false);

  const playerRefs = useRef({});
  const transport = Tone.getTransport();
  const wakeLockRef = useRef(null);
  const wakeLockRequested = useRef(false);

  // Função helper para adicionar logs
  const addLog = (message, type = "info") => {
    if (!isQA) return; // Só registra logs em ambiente QA
    const timestamp = new Date().toLocaleTimeString("pt-BR");
    setLogs((prev) => [
      ...prev.slice(-50), // Mantém apenas os últimos 50 logs
      { message, type, timestamp, id: Date.now() },
    ]);
  };

  useEffect(() => {
    const initVolumes = {};
    const initMuted = {};
    tracks.forEach((t) => {
      initVolumes[t.id] = 0.8;
      initMuted[t.id] = false;
    });
    setVolumes(initVolumes);
    setMuted(initMuted);

    addLog("Aplicativo inicializado", "success");

    const listener = (e) => {
      setIsLandscape(e.matches);
      addLog(`Orientação alterada: ${e.matches ? "Paisagem" : "Retrato"}`, "info");
    };
    const mq = window.matchMedia("(orientation: landscape)");
    mq.addEventListener("change", listener);

    // Mostrar popup para solicitar Wake Lock
    if ("wakeLock" in navigator && !wakeLockRequested.current) {
      setShowWakeLockPrompt(true);
      wakeLockRequested.current = true;
    } else if (!("wakeLock" in navigator)) {
      addLog("Wake Lock não suportado neste navegador", "warning");
    }

    // Reativa o Wake Lock quando a página volta a ficar visível
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && wakeLockRef.current === null) {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      mq.removeEventListener("change", listener);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, []);

  // Função para ativar o Wake Lock
  const requestWakeLock = async () => {
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
        addLog("Wake Lock ativado - tela permanecerá ligada", "success");
        return true;
      }
    } catch (err) {
      addLog(`Erro ao ativar Wake Lock: ${err.message}`, "error");
      return false;
    }
  };

  const handleWakeLockAccept = async () => {
    setShowWakeLockPrompt(false);
    await requestWakeLock();
  };

  const handleWakeLockDecline = () => {
    setShowWakeLockPrompt(false);
    addLog("Wake Lock recusado pelo usuário", "warning");
  };

  const handleNoteClick = async (noteKey) => {
    const newNote = currentNote === noteKey ? null : noteKey;
    setCurrentNote(newNote);
    stopAll();

    if (!newNote) {
      addLog("Reprodução parada", "info");
      return;
    }

    addLog(`Nota selecionada: ${notes.find(n => n.key === newNote)?.label}`, "success");

    transport.seconds = 0;

    const FADE_TIME = 0.5;
    const crossFade = async (file, baseVolume, track) => {
      const playerA = new Tone.Player({
          url: file,
          loop: true,
          autostart: false,
      }).toDestination();

      const playerB = new Tone.Player({
          url: file,
          loop: true,
          autostart: false,
      }).toDestination();

      await Promise.all([playerA.load(file), playerB.load(file)]);

      playerA.volume.value = Tone.gainToDb(baseVolume);
      playerB.volume.value = -Infinity;

      const duration = playerA.buffer.duration;
      let current = playerA;
      let next = playerB;

      const startAt = transport.seconds + 0.2;
      function scheduleNext(startTime) {
        const crossfadeStart = startTime + duration - FADE_TIME;
        current.start(startTime);

        transport.scheduleOnce(async (time) => {
          if (!next.buffer.loaded) return;

          next.start(startAt);
          next.volume.cancelAndHoldAtTime(time);
          current.volume.cancelAndHoldAtTime(time);

          next.volume.linearRampTo(Tone.gainToDb(baseVolume), FADE_TIME);
          current.volume.linearRampTo(-Infinity, FADE_TIME);

          [current, next] = [next, current];
          scheduleNext(time);
        }, crossfadeStart);
      }

      scheduleNext(startAt);

      playerRefs.current[track.id] = { playerA, playerB };
    };

    for (const track of tracks) {
      const file = `/samples/${track.base}/${newNote}.mp3`;

      const baseVolume = muted[track.id] ? 0 : volumes[track.id] ?? 0.8;

      addLog(`Carregando: ${track.name}`, "info");
      crossFade(file, baseVolume, track);
    }

    if (transport.state !== "started") {
      transport.start();
      addLog("Transport iniciado", "success");
    }
  };

  const handleVolumeChange = (trackId, newVolume) => {
    setVolumes((prev) => ({ ...prev, [trackId]: newVolume }));
    const track = tracks.find(t => t.id === trackId);
    addLog(`Volume de ${track?.name}: ${Math.round(newVolume * 100)}%`, "info");
    const refs = playerRefs.current[trackId];
    if (refs && !muted[trackId]) {
      refs.playerA.volume.value = Tone.gainToDb(newVolume);
      refs.playerB.volume.value = Tone.gainToDb(newVolume);
    }
  };

  const toggleMute = (trackId) => {
    setMuted((prev) => {
      const newMuted = !prev[trackId];
      const track = tracks.find(t => t.id === trackId);
      addLog(`${track?.name}: ${newMuted ? "Mutado" : "Desmutado"}`, "info");
      const refs = playerRefs.current[trackId];
      if (refs) {
        const newVol = newMuted ? 0 : volumes[trackId] ?? 0.8;
        refs.playerA.volume.value = Tone.gainToDb(newVol);
        refs.playerB.volume.value = Tone.gainToDb(newVol);
      }
      return { ...prev, [trackId]: newMuted };
    });
  };

  const stopAll = () => {
    addLog("Parando todas as faixas", "warning");
    Object.values(playerRefs.current).forEach(({ playerA, playerB }) => {
      try {
        playerA.stop();
        playerB.stop();
      } catch {}
    });
    playerRefs.current = {};
    transport.stop();
    transport.cancel(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      {/* Popup de Wake Lock */}
      {showWakeLockPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-4">
              <div className="text-4xl mb-3">🔒</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Manter Tela Ligada
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Deseja manter a tela do dispositivo sempre ativa durante o uso do aplicativo? 
                Isso evita que a tela desligue automaticamente enquanto você toca.
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleWakeLockDecline}
                className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
              >
                Não
              </button>
              <button
                onClick={handleWakeLockAccept}
                className="flex-1 py-3 px-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition"
              >
                Sim, manter ligada
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`w-full max-w-5xl ${
          isLandscape
            ? "flex flex-row justify-between items-start"
            : "flex flex-col items-center"
        }`}
      >
        {/* Notes */}
        <div
          className={`flex flex-wrap justify-center gap-2 mb-4 ${
            isLandscape ? "w-1/3" : "w-full"
          }`}
        >
          {notes.map((n) => (
            <button
              key={n.key}
              onClick={() => handleNoteClick(n.key)}
              className={`rounded-xl font-semibold transition-all text-base flex items-center justify-center
                ${
                  currentNote === n.key
                    ? "bg-indigo-500 text-white scale-105"
                    : "bg-gray-100 hover:bg-gray-200"
                }
                ${isLandscape ? "w-[60px] h-[60px]" : "w-[70px] h-[70px]"}`}
              aria-pressed={currentNote === n.key}
            >
              {n.label}
            </button>
          ))}
          <div className="mt-8 flex justify-between items-center w-full max-w-5xl">
            <button
              onClick={stopAll}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition"
            >
              Parar
            </button>
          </div>
        </div>

        {/* Tracks */}
        <div
          className={`flex gap-2 ${
            isLandscape
              ? "w-2/3 flex-row justify-center"
              : "w-full flex-col items-center"
          }`}
        >
          {tracks.map((track) => (
            <div
              key={track.id}
              className={`bg-white rounded-2xl shadow-md flex flex-col items-center p-4
              ${isLandscape ? "w-[80px]" : "w-full max-w-[260px]"}`}
            >
              {isLandscape ? (
                <>
                  <div className="flex items-center justify-center h-[160px]">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={Math.round((volumes[track.id] ?? 0.8) * 100)}
                      onChange={(e) =>
                        handleVolumeChange(track.id, e.target.valueAsNumber / 100)
                      }
                      aria-label={`Volume da faixa ${track.name}`}
                      style={{
                        transform: "rotate(-90deg)",
                        width: "150px",
                      }}
                      className="appearance-none h-2 bg-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={() => toggleMute(track.id)}
                    className={`mt-4 text-xs font-semibold py-1 px-2 rounded-lg transition ${
                      muted[track.id]
                        ? "bg-gray-400 text-white"
                        : "bg-indigo-500 text-white hover:bg-indigo-600"
                    }`}
                  >
                    {muted[track.id] ? "Desmutar" : "Mute"}
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={Math.round((volumes[track.id] ?? 0.8) * 100)}
                    onChange={(e) =>
                      handleVolumeChange(track.id, e.target.valueAsNumber / 100)
                    }
                    aria-label={`Volume da faixa ${track.name}`}
                    className="appearance-none w-full h-2 bg-gray-300 rounded-lg cursor-pointer"
                  />
                  <button
                    onClick={() => toggleMute(track.id)}
                    className={`mt-2 text-xs font-semibold py-1 px-2 rounded-lg transition ${
                      muted[track.id]
                        ? "bg-gray-400 text-white"
                        : "bg-indigo-500 text-white hover:bg-indigo-600"
                    }`}
                  >
                    {muted[track.id] ? "Desmutar" : "Mute"}
                  </button>
                </>
              )}

              <div className="mt-3 text-sm font-medium text-gray-700 text-center">
                {track.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QA Tools - Versão, Logs e Botão */}
      {isQA && (
        <>
          {/* Versão do App */}
          <div className="fixed bottom-2 right-2 text-xs text-gray-400">
            v{packageJson.version}
          </div>

          {/* Painel de Logs */}
          {showLogs && (
            <div className="fixed bottom-16 left-4 right-4 max-w-3xl mx-auto h-64 bg-gray-900 text-white rounded-lg shadow-2xl overflow-hidden z-40">
              <div className="bg-gray-800 px-4 py-2 flex justify-between items-center">
                <span className="font-semibold text-sm">Console de Logs</span>
                <button
                  onClick={() => setLogs([])}
                  className="text-xs bg-red-500 hover:bg-red-600 px-2 py-1 rounded transition"
                >
                  Limpar
                </button>
              </div>
              <div className="overflow-y-auto h-[calc(100%-2.5rem)] p-3 space-y-1 text-xs font-mono">
                {logs.length === 0 ? (
                  <div className="text-gray-400 text-center py-4">Nenhum log ainda</div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-2 rounded ${
                        log.type === "error"
                          ? "bg-red-900/50 text-red-200"
                          : log.type === "warning"
                          ? "bg-yellow-900/50 text-yellow-200"
                          : log.type === "success"
                          ? "bg-green-900/50 text-green-200"
                          : "bg-gray-800 text-gray-300"
                      }`}
                    >
                      <span className="text-gray-500">[{log.timestamp}]</span>{" "}
                      {log.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Botão para mostrar/ocultar logs */}
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="fixed bottom-2 left-2 bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-semibold hover:bg-gray-700 transition z-50"
          >
            {showLogs ? "Ocultar Logs" : "Mostrar Logs"}
          </button>
        </>
      )}
    </div>
  );
}
