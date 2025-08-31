import { createSelector } from "@reduxjs/toolkit/react";
import type { AppState } from "../store";
import {
    selectCanvasSize,
    selectMeterBarHeight,
    selectPianoBarWidth,
} from "./pianoRollSelectors";
import {
    selectIsHoriOverflow,
    selectIsVertOverflow,
    selectScrollBarThickness,
} from "./scrollSelectors";

export const selectNotes = (state: { app: AppState }) => state.app.notes;

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
