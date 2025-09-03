import type { InputState } from "../slices/inputSlice";

export const selectIsCtrlDown = (state: { input: InputState }) =>
    state.input.isCtrlDown;
export const selectIsShiftDown = (state: { input: InputState }) =>
    state.input.isShiftDown;
export const selectIsMouseDown = (state: { input: InputState }) =>
    state.input.isMouseDown;
export const selectMouseDownPos = (state: { input: InputState }) =>
    state.input.mouseDownPos;
export const selectIsDragging = (state: { input: InputState }) =>
    state.input.isDragging;
