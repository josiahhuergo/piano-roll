import { createSlice } from "@reduxjs/toolkit";
import type { NoteUI } from "../../types";

export interface NotesState {
    notes: NoteUI[];
    nextId: number;
}

const initialState: NotesState = {
    notes: [],
    nextId: 0,
};

export const notesSlice = createSlice({
    name: "notes",
    initialState,
    reducers: {
        addNote: (state, action) => {
            const { pitch, onset, duration } = action.payload;

            const existingNote = state.notes.find(
                (note) =>
                    note.pitch === pitch &&
                    note.onset === onset &&
                    note.duration === duration
            );

            if (existingNote) return;

            state.notes.push({
                pitch,
                onset,
                duration,
                id: Date.now() + Math.random(),
                selected: false,
            });
        },
        selectNote: (state, action) => {
            const selectedNote = state.notes.find(
                (note) => note.id === action.payload.id
            )!;

            selectedNote.selected = true;
        },
        deselectNote: (state, action) => {
            const selectedNote = state.notes.find(
                (note) => note.id == action.payload.id
            );

            if (!selectedNote) {
                throw new Error("Note not found.");
            }

            selectedNote.selected = false;
        },
        selectAllNotes: (state) => {
            state.notes.forEach((note) => (note.selected = true));
        },
        deselectAllNotes: (state) => {
            state.notes.forEach((note) => (note.selected = false));
        },
        deleteSelectedNotes: (state) => {
            state.notes = state.notes.filter((note) => !note.selected);
        },
        moveSelectedNotes: (state, action) => {
            const updateMap = new Map<
                number,
                { id: number; pitch: number; onset: number }
            >(
                action.payload.map(
                    (update: { id: number; pitch: number; onset: number }) => [
                        update.id,
                        update,
                    ]
                )
            );

            state.notes.forEach((note) => {
                if (note.selected) {
                    const update = updateMap.get(note.id);
                    if (update) {
                        note.onset = update.onset;
                        note.pitch = update.pitch;
                    }
                }
            });
        },
    },
});
