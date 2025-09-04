import { createSlice } from "@reduxjs/toolkit";

export interface InputState {
    isCtrlDown: boolean;
    isShiftDown: boolean;
    isMouseDown: boolean;
    mouseDownPos: { x: number; y: number };
    isDragging: boolean;
}

const initialState: InputState = {
    isCtrlDown: false,
    isShiftDown: false,
    isMouseDown: false,
    mouseDownPos: { x: 0, y: 0 },
    isDragging: false,
};

export const inputSlice = createSlice({
    name: "input",
    initialState,
    reducers: {
        pressCtrl: (state) => {
            if (state.isCtrlDown) return;
            if (!state.isCtrlDown) state.isCtrlDown = true;
        },
        releaseCtrl: (state) => {
            if (state.isCtrlDown) state.isCtrlDown = false;
        },
        pressShift: (state) => {
            if (state.isShiftDown) return;
            if (!state.isShiftDown) state.isShiftDown = true;
        },
        releaseShift: (state) => {
            if (state.isShiftDown) state.isShiftDown = false;
        },
        pressMouse: (state, action) => {
            state.mouseDownPos = action.payload;
            if (!state.isMouseDown) state.isMouseDown = true;
        },
        releaseMouse: (state) => {
            if (state.isMouseDown) {
                state.isMouseDown = false;
                state.isDragging = false;
            }
        },
        setDragging: (state, action) => {
            state.isDragging = action.payload;
        },
    },
});
