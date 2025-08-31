import { configureStore, createSlice } from "@reduxjs/toolkit/react";
import { calculateCanvasSize } from "../helpers/util";
import type { Note } from "../types/types";
import * as pianoRollReducers from "./reducers/pianoRollReducers";
import * as scrollReducers from "./reducers/scrollReducers";

export interface AppState {
    canvasSize: { width: number; height: number };

    notes: Note[];

    maxPitch: number;
    minPitch: number;

    laneHeight: number;
    beatWidth: number;
    beatCount: number;

    pianoBarWidth: number;
    meterBarHeight: number;

    vertScrollAmount: number;
    horiScrollAmount: number;
    scrollBarThickness: number;
}

const initialState: AppState = {
    canvasSize: calculateCanvasSize(),

    notes: [
        { id: 0, pitch: 60, onset: 0, duration: 4, selected: false },
        { id: 1, pitch: 64, onset: 0, duration: 4, selected: false },
        { id: 2, pitch: 71, onset: 0, duration: 4, selected: false },
        { id: 3, pitch: 84, onset: 5, duration: 1, selected: false },
        { id: 4, pitch: 83, onset: 6, duration: 1, selected: false },
        { id: 5, pitch: 79, onset: 7, duration: 2, selected: false },
    ],

    maxPitch: 108,
    minPitch: 21,

    laneHeight: 19,
    beatWidth: 80,
    beatCount: 100,

    pianoBarWidth: 80,
    meterBarHeight: 20,

    vertScrollAmount: 300,
    horiScrollAmount: 0,
    scrollBarThickness: 12,
};

const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        ...pianoRollReducers,
        ...scrollReducers,
    },
});

// Basic selectors
// ========== THUNKS (Actions that can use selectors) ==========

export const {
    updateCanvasSize,
    setVertScroll,
    verticalScroll,
    setHoriScroll,
    horizontalScroll,
} = appSlice.actions;

// Store configuration
export const store = configureStore({
    reducer: {
        app: appSlice.reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
