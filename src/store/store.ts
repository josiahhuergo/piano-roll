import {
    configureStore,
    createSelector,
    createSlice,
} from "@reduxjs/toolkit/react";
import { calculateCanvasSize, clamp } from "../helpers/util";

interface Note {
    id: number;
    pitch: number;
    onset: number;
    duration: number;
}

interface AppState {
    notes: Note[];
    canvasSize: { width: number; height: number };
    scrollBarThickness: number;
    laneHeight: number;
    beatWidth: number;
    maxPitch: number;
    minPitch: number;
    beatCount: number;
    pianoBarWidth: number;
    meterBarHeight: number;
    vertScrollAmount: number;
    horiScrollAmount: number;
}

const initialState: AppState = {
    notes: [
        { id: 0, pitch: 60, onset: 0, duration: 4 },
        { id: 1, pitch: 64, onset: 0, duration: 4 },
        { id: 2, pitch: 71, onset: 0, duration: 4 },
        { id: 3, pitch: 84, onset: 5, duration: 1 },
        { id: 4, pitch: 83, onset: 6, duration: 1 },
        { id: 5, pitch: 79, onset: 7, duration: 2 },
    ],
    canvasSize: calculateCanvasSize(),
    scrollBarThickness: 12,
    laneHeight: 19,
    beatWidth: 80,
    maxPitch: 108,
    minPitch: 21,
    beatCount: 100,
    pianoBarWidth: 80,
    meterBarHeight: 20,
    vertScrollAmount: 300,
    horiScrollAmount: 0,
};

const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        updateCanvasSize: (state) => {
            state.canvasSize = calculateCanvasSize();
        },
        setVertScroll: (state, action) => {
            const totalHeight = selectTotalHeight({ app: state });
            const noteGridHeight = selectNoteGridHeight({ app: state });

            state.vertScrollAmount = clamp(
                action.payload,
                0,
                totalHeight - noteGridHeight
            );
        },
        verticalScroll: (state, action) => {
            const totalHeight = selectTotalHeight({ app: state });
            const noteGridHeight = selectNoteGridHeight({ app: state });

            state.vertScrollAmount = clamp(
                state.vertScrollAmount + action.payload,
                0,
                totalHeight - noteGridHeight
            );
        },
        setHoriScroll: (state, action) => {
            const totalWidth = selectTotalWidth({ app: state });
            const noteGridWidth = selectNoteGridWidth({ app: state });

            state.horiScrollAmount = clamp(
                action.payload,
                0,
                totalWidth - noteGridWidth
            );
        },
        horizontalScroll: (state, action) => {
            const totalWidth = selectTotalWidth({ app: state });
            const noteGridWidth = selectNoteGridWidth({ app: state });

            state.horiScrollAmount = clamp(
                state.horiScrollAmount + action.payload,
                0,
                totalWidth - noteGridWidth
            );
        },
    },
});

// Basic selectors
export const selectApp = (state: { app: AppState }) => state.app;
export const selectNotes = (state: { app: AppState }) => state.app.notes;
export const selectCanvasSize = (state: { app: AppState }) =>
    state.app.canvasSize;
export const selectScrollBarThickness = (state: { app: AppState }) =>
    state.app.scrollBarThickness;
export const selectLaneHeight = (state: { app: AppState }) =>
    state.app.laneHeight;
export const selectMaxPitch = (state: { app: AppState }) => state.app.maxPitch;
export const selectMinPitch = (state: { app: AppState }) => state.app.minPitch;
export const selectBeatWidth = (state: { app: AppState }) =>
    state.app.beatWidth;
export const selectBeatCount = (state: { app: AppState }) =>
    state.app.beatCount;
export const selectPianoBarWidth = (state: { app: AppState }) =>
    state.app.pianoBarWidth;
export const selectMeterBarHeight = (state: { app: AppState }) =>
    state.app.meterBarHeight;
export const selectVertScrollAmount = (state: { app: AppState }) =>
    state.app.vertScrollAmount;
export const selectHoriScrollAmount = (state: { app: AppState }) =>
    state.app.horiScrollAmount;

// Computed selectors
export const selectLaneCount = createSelector(
    [selectMaxPitch, selectMinPitch],
    (maxPitch, minPitch) => maxPitch - minPitch + 1
);

export const selectTotalWidth = createSelector(
    [selectBeatCount, selectBeatWidth],
    (beatCount, beatWidth) => beatCount * beatWidth
);

export const selectTotalHeight = createSelector(
    [selectLaneCount, selectLaneHeight],
    (laneCount, laneHeight) => laneCount * laneHeight
);

export const selectIsVertOverflow = createSelector(
    [selectTotalHeight, selectCanvasSize],
    (totalHeight, canvasSize) => totalHeight > canvasSize.height
);

export const selectIsHoriOverflow = createSelector(
    [selectTotalWidth, selectCanvasSize],
    (totalWidth, canvasSize) => totalWidth > canvasSize.width
);

// NoteGrid selectors
export const selectNoteGridX = selectPianoBarWidth;

export const selectNoteGridY = selectMeterBarHeight;

export const selectNoteGridWidth = createSelector(
    [
        selectIsVertOverflow,
        selectCanvasSize,
        selectPianoBarWidth,
        selectScrollBarThickness,
    ],
    (isVertOverflow, canvasSize, pianoBarWidth, scrollBarThickness) => {
        if (isVertOverflow) {
            return canvasSize.width - pianoBarWidth - scrollBarThickness;
        } else {
            return canvasSize.width - pianoBarWidth;
        }
    }
);

export const selectNoteGridHeight = createSelector(
    [
        selectIsHoriOverflow,
        selectCanvasSize,
        selectMeterBarHeight,
        selectScrollBarThickness,
    ],
    (isHoriOverflow, canvasSize, meterBarHeight, scrollBarThickness) => {
        if (isHoriOverflow) {
            return canvasSize.height - meterBarHeight - scrollBarThickness;
        } else {
            return canvasSize.height - meterBarHeight;
        }
    }
);

// Piano Bar selectors
export const selectPianoBarX = () => 0;

export const selectPianoBarY = selectMeterBarHeight;

export const selectPianoBarHeight = createSelector(
    [
        selectIsHoriOverflow,
        selectCanvasSize,
        selectMeterBarHeight,
        selectScrollBarThickness,
    ],
    (isHoriOverflow, canvasSize, meterBarHeight, scrollBarThickness) => {
        if (isHoriOverflow) {
            return canvasSize.height - meterBarHeight - scrollBarThickness;
        } else {
            return canvasSize.height - meterBarHeight;
        }
    }
);

// Meter Bar selectors
export const selectMeterBarX = selectPianoBarWidth;

export const selectMeterBarY = () => 0;

export const selectMeterBarWidth = createSelector(
    [
        selectIsVertOverflow,
        selectCanvasSize,
        selectPianoBarWidth,
        selectScrollBarThickness,
    ],
    (isVertOverflow, canvasSize, pianoBarWidth, scrollBarThickness) => {
        if (isVertOverflow) {
            return canvasSize.width - pianoBarWidth - scrollBarThickness;
        } else {
            return canvasSize.width - pianoBarWidth;
        }
    }
);

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
