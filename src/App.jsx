import React, { useEffect, useRef, useState } from "react";
import * as Tone from "tone";

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
    { id: 1, name: "Ambient Pad", base: "AMBIENTE PAD" },
    { id: 2, name: "Shimmer Pad", base: "SHIMMER PAD" },
    { id: 3, name: "Space Reverse Pad", base: "SPACE REVERSE PAD" },
    { id: 4, name: "Warm Pad", base: "WARM PAD" },
  ];

  const [currentNote, setCurrentNote] = useState(null);
  const [volumes, setVolumes] = useState({});
  const [muted, setMuted] = useState({});
  const [isLandscape, setIsLandscape] = useState(
    window.matchMedia("(orientation: landscape)").matches
  );

  const playerRefs = useRef({});
  const transport = Tone.getTransport();

  useEffect(() => {
    const initVolumes = {};
    const initMuted = {};
    tracks.forEach((t) => {
      initVolumes[t.id] = 0.8;
      initMuted[t.id] = false;
    });
    setVolumes(initVolumes);
    setMuted(initMuted);

    const listener = (e) => setIsLandscape(e.matches);
    const mq = window.matchMedia("(orientation: landscape)");
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  const handleNoteClick = async (noteKey) => {
    const newNote = currentNote === noteKey ? null : noteKey;
    setCurrentNote(newNote);
    stopAll();

    if (!newNote) return;

    transport.seconds = 0;

    const FADE_TIME = 4.0;
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

      crossFade(file, baseVolume, track);
    }

    if (transport.state !== "started") {
      transport.start();
    }
  };

  const handleVolumeChange = (trackId, newVolume) => {
    setVolumes((prev) => ({ ...prev, [trackId]: newVolume }));
    const refs = playerRefs.current[trackId];
    if (refs && !muted[trackId]) {
      refs.playerA.volume.value = Tone.gainToDb(newVolume);
      refs.playerB.volume.value = Tone.gainToDb(newVolume);
    }
  };

  const toggleMute = (trackId) => {
    setMuted((prev) => {
      const newMuted = !prev[trackId];
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
    </div>
  );
}
