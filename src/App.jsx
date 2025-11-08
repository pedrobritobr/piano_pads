import React, { useEffect } from "react";
import "./App.scss";

import { notes, tracks, defaultVolume } from "./constants/music";
import { useLogs } from "./hooks/useLogs";
import { useWakeLock } from "./hooks/useWakeLock";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { useOrientation } from "./hooks/useOrientation";
import { WakeLockPrompt } from "./components/WakeLockPrompt";
import { NoteButton } from "./components/NoteButton";
import { TrackControl } from "./components/TrackControl";
import { LogsPanel } from "./components/LogsPanel";

import FullscreenIcon from "./components/icons/FullscreenIcon";
import FullscreenExitIcon from "./components/icons/FullscreenExitIcon";
import StopIcon from "./components/icons/StopIcon";

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
    }
    // document.body.classList.add("no-scroll");

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
      // prevent pinch/scroll if fullscreen, but allow interaction with range inputs
      if (!isFullscreen) return;
      try {
        const target = e.target;
        if (target && (target.tagName === 'INPUT' && target.type === 'range')) {
          // allow default to let the slider drag
          return;
        }
        // if touch originates inside a range (thumb), allow it
        if (target && target.closest && target.closest('input[type="range"]')) {
          return;
        }
      } catch (err) {
        // if anything goes wrong, fall back to preventing default to avoid scroll
      }
      e.preventDefault();
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
      if (request) {
        request.call(el);
        return;
      }

      // Fullscreen API not available (common on iOS Safari).
      // Inform the user because we can't force true fullscreen here.
      try {
        addLog(
          "Fullscreen não suportado neste navegador. No iOS use 'Adicionar à Tela de Início' para comportamento semelhante ao fullscreen.",
          "warning"
        );
      } catch (err) {
        // fallback to alert if addLog isn't available for any reason
        // eslint-disable-next-line no-alert
        alert(
          "Fullscreen não suportado neste navegador. No iOS use 'Adicionar à Tela de Início' para comportamento semelhante ao fullscreen."
        );
      }
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
    <div className="App">
      {/* Popup de Wake Lock */}
      {showWakeLockPrompt && (
        <WakeLockPrompt 
          onAccept={handleWakeLockAccept}
          onDecline={handleWakeLockDecline}
        />
            )}

      <div className="Main">
        <div className="OptionsPanel">
          <button onClick={toggleFullscreen}>
            {isFullscreen ? <FullscreenExitIcon size={20} /> : <FullscreenIcon size={20} />}
          </button>
          <button onClick={stopAll}>
            <StopIcon size={20} />
          </button>
        </div>

        <div className="Notes">
          {notes.map((n) => (
            <NoteButton
              key={n.key}
              note={n}
              isActive={currentNote === n.key}
              onClick={handleNoteClick}
              isLandscape={isLandscape}
            />
          ))}
        </div>
{/* 
        <div className="FilterControls">
          <p>HPF</p>
          <p>LPF</p>
        </div> */}

        <div className="MixerTracks">
          {tracks.map((track) => (
            <TrackControl
              key={track.base}
              track={track}
              volume={volumes[track.base] ?? defaultVolume}
              muted={muted[track.base]}
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
