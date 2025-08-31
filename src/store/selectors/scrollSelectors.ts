import { createSelector } from "@reduxjs/toolkit/react";
import type { AppState } from "../store";
import {
    selectCanvasSize,
    selectTotalHeight,
    selectTotalWidth,
} from "./pianoRollSelectors";

export const selectVertScrollAmount = (state: { app: AppState }) =>
    state.app.vertScrollAmount;
export const selectHoriScrollAmount = (state: { app: AppState }) =>
    state.app.horiScrollAmount;

export const selectScrollBarThickness = (state: { app: AppState }) =>
    state.app.scrollBarThickness;

export const selectIsVertOverflow = createSelector(
    [selectTotalHeight, selectCanvasSize],
    (totalHeight, canvasSize) => totalHeight > canvasSize.height
);
export const selectIsHoriOverflow = createSelector(
    [selectTotalWidth, selectCanvasSize],
    (totalWidth, canvasSize) => totalWidth > canvasSize.width
);
