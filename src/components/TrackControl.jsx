import React from "react";

export function TrackControl({ track, volume, muted, isLandscape, onVolumeChange, onToggleMute }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-md flex flex-col items-center p-2
      ${isLandscape ? "w-[68px]" : "w-full max-w-[260px]"}`}
      style={{
        // display: "flex",
        // flexDirection: isLandscape ? "column" : "column",
        // alignItems: "center",
        // padding: "8px",
        // paddingBottom: "4px",
        // width: "70px",
        // height: "150px",
      }}
    >
      {isLandscape ? (
        <>
          {/* Landscape: track name (vertical, bottom-to-top) on the left, slider + mute on the right */}
          <div className="flex flex-col items-center">
            {/* Titulo */}
            <div
              className="flex items-center"
              style={{
                display: "flex",
                // flexDirection: "column",
                alignItems: "center",
                width: "55px",
                height: "100px",
              }}
            >
              <div
                className="text-sm font-medium text-gray-700"
                style={{
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                  whiteSpace: "nowrap",
                }}
              >
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
                style={{
                  width: "100px",
                  transform: "rotate(-90deg)",
                  marginLeft: "-30px",
                }}
                className="track-range appearance-none h-2 bg-gray-300 rounded-lg cursor-pointer"
              />

            </div>
            <button
              onClick={() => onToggleMute(track.base, track.name)}
              className={`mt-1 text-xs font-semibold py-1 px-2 rounded-lg transition`}
              style={{
                backgroundColor: muted ? "#9CA3AF" : "#6366F1",
                color: "#FFFFFF",
              }}
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
            className="track-range appearance-none w-full h-2 bg-gray-300 rounded-lg cursor-pointer"
          />
          <button
            onClick={() => onToggleMute(track.base, track.name)}
            className={`mt-1 text-xs font-semibold py-1 px-2 rounded-lg transition`}
            style={{
              backgroundColor: muted ? "#9CA3AF" : "#6366F1",
              color: "#FFFFFF",
            }}
          >
            {muted ? "U_m" : "Mute"}
          </button>
        </>
      )}

      {/* Name below removed as requested */}
    </div>
  );
}
