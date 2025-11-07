import React from "react";

export function TrackControl({ track, volume, muted, isLandscape, onVolumeChange, onToggleMute }) {
  return (
    <div
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
              value={Math.round(volume * 100)}
              onChange={(e) => onVolumeChange(track.id, e.target.valueAsNumber / 100, track.name)}
              aria-label={`Volume da faixa ${track.name}`}
              style={{
                width: "150px",
              }}
              className="track-range vertical-range appearance-none h-2 bg-gray-300 rounded-lg cursor-pointer"
            />
          </div>

          <button
            onClick={() => onToggleMute(track.id, track.name)}
            className={`mt-4 text-xs font-semibold py-1 px-2 rounded-lg transition ${
              muted
                ? "bg-gray-400 text-white"
                : "bg-indigo-500 text-white hover:bg-indigo-600"
            }`}
          >
            {muted ? "Desmutar" : "Mute"}
          </button>
        </>
      ) : (
        <>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(volume * 100)}
            onChange={(e) => onVolumeChange(track.id, e.target.valueAsNumber / 100, track.name)}
            aria-label={`Volume da faixa ${track.name}`}
            className="track-range appearance-none w-full h-2 bg-gray-300 rounded-lg cursor-pointer"
          />
          <button
            onClick={() => onToggleMute(track.id, track.name)}
            className={`mt-2 text-xs font-semibold py-1 px-2 rounded-lg transition ${
              muted
                ? "bg-gray-400 text-white"
                : "bg-indigo-500 text-white hover:bg-indigo-600"
            }`}
          >
            {muted ? "Desmutar" : "Mute"}
          </button>
        </>
      )}

      <div className="mt-3 text-sm font-medium text-gray-700 text-center">
        {track.name}
      </div>
    </div>
  );
}
