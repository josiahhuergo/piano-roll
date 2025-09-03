import { createSelector } from "@reduxjs/toolkit";
import {
    selectCanvasSize,
    selectHoriScrollAmount,
    selectMeterBarHeight,
    selectPianoBarWidth,
    selectScrollBarThickness,
    selectVertScrollAmount,
} from "./viewportSelectors";
import { selectTotalHeight, selectTotalWidth } from "./gridSelectors";
import { remap } from "../../helpers";

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

export const selectVertScrollBarDimensions = createSelector(
    [
        selectCanvasSize,
        selectScrollBarThickness,
        selectVertScrollAmount,
        selectTotalHeight,
        selectNoteGridDimensions,
    ],
    (
        canvasSize,
        scrollBarThickness,
        vertScrollAmount,
        totalHeight,
        noteGridDimensions
    ) => {
        const noteGridHeight = noteGridDimensions.noteGridHeight;
        const vertScrollBarHeight = remap(
            noteGridHeight,
            0,
            totalHeight,
            0,
            noteGridHeight
        );
        return {
            vertScrollBarX: canvasSize.width - scrollBarThickness,
            vertScrollBarY: remap(
                vertScrollAmount,
                0,
                totalHeight - noteGridHeight,
                0,
                noteGridHeight - vertScrollBarHeight
            ),
            vertScrollBarWidth: scrollBarThickness,
            vertScrollBarHeight,
        };
    }
);

export const selectHoriScrollBarDimensions = createSelector(
    [
        selectCanvasSize,
        selectScrollBarThickness,
        selectHoriScrollAmount,
        selectTotalHeight,
        selectNoteGridDimensions,
    ],
    (
        canvasSize,
        scrollBarThickness,
        horiScrollAmount,
        totalWidth,
        noteGridDimensions
    ) => {
        const noteGridWidth = noteGridDimensions.noteGridWidth;
        const horiScrollBarWidth = remap(
            noteGridWidth,
            0,
            totalWidth,
            0,
            noteGridWidth
        );
        return {
            horiScrollBarX: remap(
                horiScrollAmount,
                0,
                totalWidth - noteGridWidth,
                0,
                noteGridWidth - horiScrollBarWidth
            ),
            horiScrollBarY: canvasSize.height - scrollBarThickness,
            horiScrollBarWidth: horiScrollBarWidth,
            horiScrollBarHeight: scrollBarThickness,
        };
    }
);
