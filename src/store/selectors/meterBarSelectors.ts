import { createSelector } from "@reduxjs/toolkit/react";
import { selectCanvasSize, selectPianoBarWidth } from "./pianoRollSelectors";
import {
    selectIsVertOverflow,
    selectScrollBarThickness,
} from "./scrollSelectors";

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
