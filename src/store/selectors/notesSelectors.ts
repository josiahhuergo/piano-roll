import { createSelector } from "@reduxjs/toolkit/react";
import type { NotesState } from "../slices/notesSlice";

// Base selectors
export const selectNotesSlice = (state: { notes: NotesState }) => state.notes;
export const selectNotesById = (state: { notes: NotesState }) =>
    state.notes.byId;
export const selectAllNoteIds = (state: { notes: NotesState }) =>
    state.notes.allIds;
export const selectSelectedNoteIds = (state: { notes: NotesState }) =>
    state.notes.selected;

// Derived selectors
export const selectAllNotes = createSelector(
    [selectNotesById, selectAllNoteIds],
    (byId, allIds) => allIds.map((id) => byId[id])
);

export const selectSelectedNotes = createSelector(
    [selectNotesById, selectSelectedNoteIds],
    (byId, selectedIds) => selectedIds.map((id) => byId[id])
);

export const selectNoteById = (id: string) =>
    createSelector([selectNotesById], (byId) => byId[id]);

export const selectIsNoteSelected = (id: string) =>
    createSelector([selectSelectedNoteIds], (selectedNoteIds) => {
        return selectedNoteIds.includes(id) ? true : false;
    });
