import React, { useEffect } from "react";
import { notes, tracks } from "./constants/music";
import { useLogs } from "./hooks/useLogs";
import { useWakeLock } from "./hooks/useWakeLock";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { useOrientation } from "./hooks/useOrientation";
import { WakeLockPrompt } from "./components/WakeLockPrompt";
import { NoteButton } from "./components/NoteButton";
import { TrackControl } from "./components/TrackControl";
import { LogsPanel } from "./components/LogsPanel";

export default function TrackMixer() {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const { logs, showLogs, addLog, clearLogs, toggleLogs, isQA } = useLogs();
  const { showWakeLockPrompt, handleWakeLockAccept, handleWakeLockDecline } = useWakeLock(addLog);
  const {
    currentNote,
    volumes,
    muted,
    handleNoteClick,
    handleVolumeChange,
    toggleMute,
    stopAll,
  } = useAudioPlayer(addLog);
  const isLandscape = useOrientation();

  useEffect(() => {
    addLog("Aplicativo inicializado", "success");
  }, []);

  useEffect(() => {
    function onFullScreenChange() {
      const fs = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(fs);
      // toggle body class to prevent scrolling when in fullscreen
      // if (fs) document.body.classList.add("no-scroll");
      // else document.body.classList.remove("no-scroll");
      document.body.classList.add("no-scroll");
    }

    document.addEventListener("fullscreenchange", onFullScreenChange);
    document.addEventListener("webkitfullscreenchange", onFullScreenChange);
    document.addEventListener("mozfullscreenchange", onFullScreenChange);
    document.addEventListener("MSFullscreenChange", onFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", onFullScreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullScreenChange);
      document.removeEventListener("mozfullscreenchange", onFullScreenChange);
      document.removeEventListener("MSFullscreenChange", onFullScreenChange);
    };
  }, []);

  // Prevent zoom and scroll behaviors while fullscreen is active
  useEffect(() => {
    function onWheel(e) {
      if (e.ctrlKey) e.preventDefault();
    }

    function onKeyDown(e) {
      // prevent Ctrl/Cmd + +/-/0 and Ctrl/Cmd + mousewheel zoom shortcuts
      if ((e.ctrlKey || e.metaKey) && ["=", "+", "-", "0"].includes(e.key)) {
        e.preventDefault();
      }
    }

    function onTouchMove(e) {
      // prevent pinch/scroll if fullscreen
      if (isFullscreen) e.preventDefault();
    }

    if (isFullscreen) {
      window.addEventListener("wheel", onWheel, { passive: false });
      window.addEventListener("keydown", onKeyDown, { passive: false });
      window.addEventListener("touchmove", onTouchMove, { passive: false });
    } else {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchmove", onTouchMove);
    }

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [isFullscreen]);

  function toggleFullscreen() {
    if (!isFullscreen) {
      const el = document.documentElement;
      const request =
        el.requestFullscreen ||
        el.webkitRequestFullscreen ||
        el.mozRequestFullScreen ||
        el.msRequestFullscreen;
      if (request) request.call(el);
    } else {
      const exit =
        document.exitFullscreen ||
        document.webkitExitFullscreen ||
        document.mozCancelFullScreen ||
        document.msExitFullscreen;
      if (exit) exit.call(document);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="w-full flex justify-end mb-2">
        <button
          onClick={toggleFullscreen}
          className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md shadow-sm"
        >
          {isFullscreen ? "Sair Fullscreen" : "Entrar Fullscreen"}
        </button>
      </div>
      {/* Popup de Wake Lock */}
      {showWakeLockPrompt && (
        <WakeLockPrompt 
          onAccept={handleWakeLockAccept}
          onDecline={handleWakeLockDecline}
        />
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
          className={`mb-4 ${
            isLandscape
              ? "w-1/3 grid grid-cols-4 grid-rows-3 gap-2"
              : "flex flex-wrap justify-center gap-2 w-full"
          }`}
        >
          {notes.map((n) => (
            <NoteButton
              key={n.key}
              note={n}
              isActive={currentNote === n.key}
              onClick={handleNoteClick}
              isLandscape={isLandscape}
            />
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
            <TrackControl
              key={track.id}
              track={track}
              volume={volumes[track.id] ?? 0.8}
              muted={muted[track.id]}
              isLandscape={isLandscape}
              onVolumeChange={handleVolumeChange}
              onToggleMute={toggleMute}
            />
          ))}
        </div>
      </div>

      {/* QA Tools */}
      {isQA && (
        <LogsPanel
          logs={logs}
          showLogs={showLogs}
          onToggleLogs={toggleLogs}
          onClearLogs={clearLogs}
        />
      )}
    </div>
  );
}
