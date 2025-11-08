import React from "react";

export function TrackControl({ track, volume, muted, isLandscape, onVolumeChange, onToggleMute }) {
  return (
    <div className="TrackControl">
      <div>
        {/* Titulo */}
        <div>
          <div
            className="track-title"
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              whiteSpace: "nowrap",
            }}>
            {track.name}
          </div>

          <input
            className="track-volume"
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(volume * 100)}
            onChange={(e) => onVolumeChange(track.base, e.target.valueAsNumber / 100, track.name)}
          />

        </div>

        <button
          onClick={() => onToggleMute(track.base, track.name)}
        >
          {muted ? "Desmutar" : "Mute"}
        </button>
      </div>
    </div>
  );
}
