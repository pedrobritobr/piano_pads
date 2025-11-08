import React from "react";

export function NoteButton({ note, isActive, onClick }) {
  return (
    <button
      onClick={() => onClick(note.key, note.semitone)}
      className={`NoteButton ${isActive ? "active" : ""}`}
    >
      {note.key}
    </button>
  );
}
