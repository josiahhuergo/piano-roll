import { createSelector } from "@reduxjs/toolkit/react";
import type { NotesState } from "../slices/notesSlice";

export const selectNotes = (state: { notes: NotesState }) => state.notes.notes;

export const selectSelectedNotes = createSelector([selectNotes], (notes) => {
    return notes.filter((note) => note.selected);
});
