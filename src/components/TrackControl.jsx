import React from "react";

import MuteIcon from './icons/MuteIcon';
import VolumeIcon from './icons/VolumeIcon';

export function TrackControl({ track, volume, muted, isLandscape, onVolumeChange, onToggleMute }) {
  return (
    <div className="TrackControl">
      <div
        className="track-name"
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

      <button
        className={`track-mute ${muted ? "off" : "on"}`}
        onClick={() => onToggleMute(track.base, track.name)}
      >
        {muted ? <MuteIcon /> : <VolumeIcon />}
      </button>
    </div>
  );
}
