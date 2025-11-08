import React from "react";

export function TrackControl({ track, volume, muted, isLandscape, onVolumeChange, onToggleMute }) {
  return (
    <div className="TrackControl">
      {isLandscape ? (
        <>
          {/* Landscape: track name (vertical, bottom-to-top) on the left, slider + mute on the right */}
          <div>
            {/* Titulo */}
              <div>
              <div style={{
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                  whiteSpace: "nowrap",
                }}>
                {track.name}
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={Math.round(volume * 100)}
                onChange={(e) => onVolumeChange(track.base, e.target.valueAsNumber / 100, track.name)}
                aria-label={`Volume da faixa ${track.name}`}
                className="track-range"
              />

            </div>
            <button
              onClick={() => onToggleMute(track.base, track.name)}
            >
              {muted ? "Desmutar" : "Mute"}
            </button>
          </div>
        </>
      ) : (
        <>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(volume * 100)}
            onChange={(e) => onVolumeChange(track.base, e.target.valueAsNumber / 100, track.name)}
            aria-label={`Volume da faixa ${track.name}`}
            className="track-range"
          />
          <button onClick={() => onToggleMute(track.base, track.name)}>
            {muted ? "Desmute" : "Mute"}
          </button>
        </>
      )}

      {/* Name below removed as requested */}
    </div>
  );
}
