import React from "react";

export function NoteButton({ note, isActive, onClick, isLandscape }) {
  return (
    <button
      onClick={() => onClick(note.key)}
      className={`rounded-xl font-semibold transition-all flex items-center justify-center
        ${
          isActive
            ? "bg-indigo-500 text-white scale-105"
            : "bg-gray-100 hover:bg-gray-200"
        }
        ${isLandscape ? "w-[80px] h-[80px] text-lg" : "w-[96px] h-[96px] text-xl"}`}
      aria-pressed={isActive}
    >
      {note.key}
    </button>
  );
}
