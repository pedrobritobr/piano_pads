import { useRef, useState } from "react";
import * as Tone from "tone";
import { tracks } from "../constants/music";

export function useAudioPlayer(addLog) {
  const [currentNote, setCurrentNote] = useState(null);
  const [volumes, setVolumes] = useState(() => {
    const initVolumes = {};
    tracks.forEach((t) => {
      initVolumes[t.id] = 0.8;
    });
    return initVolumes;
  });
  const [muted, setMuted] = useState(() => {
    const initMuted = {};
    tracks.forEach((t) => {
      initMuted[t.id] = false;
    });
    return initMuted;
  });

  const playerRefs = useRef({});
  const volumesRef = useRef(volumes);
  const mutedRef = useRef(muted);
  const transport = Tone.getTransport();

  const FADE_TIME = 0.5;

  // Mantém as refs atualizadas
  volumesRef.current = volumes;
  mutedRef.current = muted;

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

        // Obtém o volume atual no momento do loop
        const currentVolume = mutedRef.current[track.id] ? 0 : volumesRef.current[track.id] ?? 0.8;

        next.start(startAt);
        next.volume.cancelAndHoldAtTime(time);
        current.volume.cancelAndHoldAtTime(time);

        next.volume.linearRampTo(Tone.gainToDb(currentVolume), FADE_TIME);
        current.volume.linearRampTo(-Infinity, FADE_TIME);

        [current, next] = [next, current];
        scheduleNext(time);
      }, crossfadeStart);
    }

    scheduleNext(startAt);

    playerRefs.current[track.id] = { playerA, playerB };
  };

  const stopAll = () => {
    addLog?.("Parando todas as faixas", "warning");
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

  const handleNoteClick = async (noteKey) => {
    const newNote = currentNote === noteKey ? null : noteKey;
    setCurrentNote(newNote);
    stopAll();

    if (!newNote) {
      addLog?.("Reprodução parada", "info");
      return;
    }

    addLog?.(`Nota selecionada: ${noteKey}`, "success");

    transport.seconds = 0;

    for (const track of tracks) {
      const file = `/samples/${track.base}/${newNote}.mp3`;
      const baseVolume = muted[track.id] ? 0 : volumes[track.id] ?? 0.8;

      addLog?.(`Carregando: ${track.name}`, "info");
      crossFade(file, baseVolume, track);
    }

    if (transport.state !== "started") {
      transport.start();
      addLog?.("Transport iniciado", "success");
    }
  };

  const handleVolumeChange = (trackId, newVolume, trackName) => {
    setVolumes((prev) => ({ ...prev, [trackId]: newVolume }));
    addLog?.(`Volume de ${trackName}: ${Math.round(newVolume * 100)}%`, "info");
    
    const refs = playerRefs.current[trackId];
    if (refs && !muted[trackId]) {
      refs.playerA.volume.value = Tone.gainToDb(newVolume);
      refs.playerB.volume.value = Tone.gainToDb(newVolume);
    }
  };

  const toggleMute = (trackId, trackName) => {
    setMuted((prev) => {
      const newMuted = !prev[trackId];
      addLog?.(`${trackName}: ${newMuted ? "Mutado" : "Desmutado"}`, "info");
      
      const refs = playerRefs.current[trackId];
      if (refs) {
        const newVol = newMuted ? 0 : volumes[trackId] ?? 0.8;
        refs.playerA.volume.value = Tone.gainToDb(newVol);
        refs.playerB.volume.value = Tone.gainToDb(newVol);
      }
      return { ...prev, [trackId]: newMuted };
    });
  };

  return {
    currentNote,
    volumes,
    muted,
    handleNoteClick,
    handleVolumeChange,
    toggleMute,
    stopAll,
  };
}
