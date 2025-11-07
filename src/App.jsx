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

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
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
          className={`flex flex-wrap justify-center gap-2 mb-4 ${
            isLandscape ? "w-1/3" : "w-full"
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
