import React from "react";

export function NoteButton({ note, isActive, onClick, isLandscape }) {
  return (
    <button
      onClick={() => onClick(note.key, note.semitone)}
      className="NoteButton"
      aria-pressed={isActive}
    >
      {note.key}
    </button>
  );
}
