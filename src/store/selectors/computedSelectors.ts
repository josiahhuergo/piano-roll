import { createSelector } from "@reduxjs/toolkit";
import {
    selectCanvasSize,
    selectMeterBarHeight,
    selectPianoBarWidth,
    selectScrollBarThickness,
} from "./viewportSelectors";
import { selectTotalHeight, selectTotalWidth } from "./gridSelectors";

export const selectIsVertOverflow = createSelector(
    [selectTotalHeight, selectCanvasSize],
    (totalHeight, canvasSize) => totalHeight > canvasSize.height
);
export const selectIsHoriOverflow = createSelector(
    [selectTotalWidth, selectCanvasSize],
    (totalWidth, canvasSize) => totalWidth > canvasSize.width
);

export const selectNoteGridDimensions = createSelector(
    [
        selectIsVertOverflow,
        selectIsHoriOverflow,
        selectCanvasSize,
        selectPianoBarWidth,
        selectScrollBarThickness,
        selectMeterBarHeight,
    ],
    (
        isVertOverflow,
        isHoriOverflow,
        canvasSize,
        pianoBarWidth,
        scrollBarThickness,
        meterBarHeight
    ) => {
        return {
            noteGridX: pianoBarWidth,
            noteGridY: meterBarHeight,
            noteGridWidth: isVertOverflow
                ? canvasSize.width - pianoBarWidth - scrollBarThickness
                : canvasSize.width - pianoBarWidth,
            noteGridHeight: isHoriOverflow
                ? canvasSize.height - meterBarHeight - scrollBarThickness
                : canvasSize.height - meterBarHeight,
        };
    }
);

export const selectPianoBarDimensions = createSelector(
    [
        selectMeterBarHeight,
        selectIsHoriOverflow,
        selectCanvasSize,
        selectScrollBarThickness,
        selectPianoBarWidth,
    ],
    (
        meterBarHeight,
        isHoriOverflow,
        canvasSize,
        scrollBarThickness,
        pianoBarWidth
    ) => {
        return {
            pianoBarX: 0,
            pianoBarY: meterBarHeight,
            pianoBarWidth: pianoBarWidth,
            pianoBarHeight: isHoriOverflow
                ? canvasSize.height - meterBarHeight - scrollBarThickness
                : canvasSize.height - meterBarHeight,
        };
    }
);

export const selectMeterBarDimensions = createSelector(
    [
        selectPianoBarWidth,
        selectIsVertOverflow,
        selectCanvasSize,
        selectScrollBarThickness,
        selectMeterBarHeight,
    ],
    (
        pianoBarWidth,
        isVertOverflow,
        canvasSize,
        scrollBarThickness,
        meterBarHeight
    ) => {
        return {
            meterBarX: pianoBarWidth,
            meterBarY: 0,
            meterBarWidth: isVertOverflow
                ? canvasSize.width - pianoBarWidth - scrollBarThickness
                : canvasSize.width - pianoBarWidth,
            meterBarHeight: meterBarHeight,
        };
    }
);
