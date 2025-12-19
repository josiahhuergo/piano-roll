import { configureStore } from "@reduxjs/toolkit";
import { notesSlice } from "./slices/notesSlice";
import { viewportSlice } from "./slices/viewportSlice";
import { gridSlice } from "./slices/gridSlice";
import { transportSlice } from "./slices/transportSlice";

export const store = configureStore({
    reducer: {
        viewport: viewportSlice.reducer,
        grid: gridSlice.reducer,
        notes: notesSlice.reducer,
        transport: transportSlice.reducer,
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
    updateNote,
    deleteNote,
    selectNote,
    deselectNote,
    clearSelection,
} = notesSlice.actions;

export const { setStartTimeBeats } = transportSlice.actions;
