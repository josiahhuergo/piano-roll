import { createSelector } from "@reduxjs/toolkit/react";
import type { GridState } from "../slices/gridSlice";

export const selectMaxPitch = (state: { grid: GridState }) =>
    state.grid.maxPitch;
export const selectMinPitch = (state: { grid: GridState }) =>
    state.grid.minPitch;
export const selectLaneHeight = (state: { grid: GridState }) =>
    state.grid.laneHeight;
export const selectBeatWidth = (state: { grid: GridState }) =>
    state.grid.beatWidth;
export const selectBeatCount = (state: { grid: GridState }) =>
    state.grid.beatCount;

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
