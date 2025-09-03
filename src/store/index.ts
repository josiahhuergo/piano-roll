import { configureStore } from "@reduxjs/toolkit";
import { notesSlice } from "./slices/notesSlice";
import { viewportSlice } from "./slices/viewportSlice";
import { gridSlice } from "./slices/gridSlice";
import { inputSlice } from "./slices/inputSlice";

export const store = configureStore({
    reducer: {
        viewport: viewportSlice.reducer,
        grid: gridSlice.reducer,
        notes: notesSlice.reducer,
        input: inputSlice.reducer,
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

export const {
    pressCtrl,
    releaseCtrl,
    pressShift,
    releaseShift,
    pressMouse,
    releaseMouse,
    setDragging,
} = inputSlice.actions;
