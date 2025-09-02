import type { ViewportState } from "../slices/viewportSlice";

export const selectCanvasSize = (state: { viewport: ViewportState }) =>
    state.viewport.canvasSize;
export const selectVertScrollAmount = (state: { viewport: ViewportState }) =>
    state.viewport.vertScrollAmount;
export const selectHoriScrollAmount = (state: { viewport: ViewportState }) =>
    state.viewport.horiScrollAmount;
export const selectScrollBarThickness = (state: { viewport: ViewportState }) =>
    state.viewport.scrollBarThickness;
export const selectPianoBarWidth = (state: { viewport: ViewportState }) =>
    state.viewport.pianoBarWidth;
export const selectMeterBarHeight = (state: { viewport: ViewportState }) =>
    state.viewport.meterBarHeight;
