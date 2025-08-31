import { createSelector } from "@reduxjs/toolkit/react";
import { selectCanvasSize, selectMeterBarHeight } from "./pianoRollSelectors";
import {
    selectIsHoriOverflow,
    selectScrollBarThickness,
} from "./scrollSelectors";

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
