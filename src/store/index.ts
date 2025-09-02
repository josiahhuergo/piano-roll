import { configureStore } from "@reduxjs/toolkit";
import { notesSlice } from "./slices/notesSlice";
import { viewportSlice } from "./slices/viewportSlice";
import { gridSlice } from "./slices/gridSlice";

export const store = configureStore({
    reducer: {
        viewport: viewportSlice.reducer,
        grid: gridSlice.reducer,
        notes: notesSlice.reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const {
    updateCanvasSize,
    setVertScroll,
    verticalScroll,
    setHoriScroll,
    horizontalScroll,
} = viewportSlice.actions;

export const {
    addNote,
    selectNote,
    deselectNote,
    selectAllNotes,
    deselectAllNotes,
    deleteSelectedNotes,
    moveSelectedNotes,
} = notesSlice.actions;
