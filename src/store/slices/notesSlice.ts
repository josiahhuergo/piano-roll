import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Note } from "../../types";

export interface NotesState {
    byId: Record<string, Note>;
    allIds: string[];
    selected: string[];
    nextId: number;
}

const initialState: NotesState = {
    byId: {},
    allIds: [],
    selected: [],
    nextId: 0,
};

export const notesSlice = createSlice({
    name: "notes",
    initialState,
    reducers: {
        addNote: (state, action: PayloadAction<Omit<Note, "id">>) => {
            const { pitch, onset, duration } = action.payload;
            const isDuplicate = Object.values(state.byId).some(
                (note) =>
                    note.pitch === pitch &&
                    note.onset === onset &&
                    note.duration === duration
            );

            if (isDuplicate) return;

            const id = state.nextId.toString();
            const note: Note = { ...action.payload, id };
            state.byId[id] = note;
            state.allIds.push(id);
            state.nextId++;
        },
        updateNote: (
            state,
            action: PayloadAction<{ id: string; changes: Partial<Note> }>
        ) => {
            const { id, changes } = action.payload;
            if (state.byId[id]) {
                state.byId[id] = { ...state.byId[id], ...changes };
            }
        },
        deleteNote: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            delete state.byId[id];
            state.allIds = state.allIds.filter((noteId) => noteId !== id);
            state.selected = state.selected.filter((noteId) => noteId !== id);
        },
        selectNote: (state, action: PayloadAction<{ id: string }>) => {
            const { id } = action.payload;
            if (!state.selected.includes(id)) {
                state.selected.push(id);
            }
        },
        deselectNote: (state, action: PayloadAction<{ id: string }>) => {
            const { id: noteId } = action.payload;
            if (state.selected.includes(noteId)) {
                const newSelected = state.selected.filter((id) => id != noteId);
                state.selected = newSelected;
            }
        },
        clearSelection: (state) => {
            state.selected = [];
        },
    },
});
