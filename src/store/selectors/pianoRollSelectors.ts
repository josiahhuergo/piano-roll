import { createSelector } from "@reduxjs/toolkit/react";
import type { AppState } from "../store";

export const selectCanvasSize = (state: { app: AppState }) =>
    state.app.canvasSize;

export const selectPianoBarWidth = (state: { app: AppState }) =>
    state.app.pianoBarWidth;
export const selectMeterBarHeight = (state: { app: AppState }) =>
    state.app.meterBarHeight;

export const selectMaxPitch = (state: { app: AppState }) => state.app.maxPitch;
export const selectMinPitch = (state: { app: AppState }) => state.app.minPitch;

export const selectLaneHeight = (state: { app: AppState }) =>
    state.app.laneHeight;
export const selectBeatWidth = (state: { app: AppState }) =>
    state.app.beatWidth;
export const selectBeatCount = (state: { app: AppState }) =>
    state.app.beatCount;

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
