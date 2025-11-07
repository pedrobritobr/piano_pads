import React from "react";

export function NoteButton({ note, isActive, onClick, isLandscape }) {
  return (
    <button
      onClick={() => onClick(note.key)}
      className={`rounded-xl font-semibold transition-all text-base flex items-center justify-center
        ${
          isActive
            ? "bg-indigo-500 text-white scale-105"
            : "bg-gray-100 hover:bg-gray-200"
        }
        ${isLandscape ? "w-[60px] h-[60px]" : "w-[70px] h-[70px]"}`}
      aria-pressed={isActive}
    >
      {note.key}
    </button>
  );
}
