import { createSlice } from "@reduxjs/toolkit";
import { calculateCanvasSize } from "../../helpers";
import type { Dimensions } from "../../types";

export interface ViewportState {
    canvasSize: Dimensions;
    vertScrollAmount: number;
    horiScrollAmount: number;
    scrollBarThickness: number;
    pianoBarWidth: number;
    meterBarHeight: number;
}

const initialState: ViewportState = {
    canvasSize: calculateCanvasSize(),
    vertScrollAmount: 300,
    horiScrollAmount: 0,
    scrollBarThickness: 12,
    pianoBarWidth: 80,
    meterBarHeight: 20,
};

export const viewportSlice = createSlice({
    name: "viewport",
    initialState,
    reducers: {
        updateCanvasSize: (state) => {
            state.canvasSize = calculateCanvasSize();
        },
        setVertScroll: (state, action) => {
            state.vertScrollAmount = action.payload.scrollAmount;
        },
        verticalScroll: (state, action) => {
            state.vertScrollAmount =
                state.vertScrollAmount + action.payload.scrollDelta;
        },
        setHoriScroll: (state, action) => {
            state.horiScrollAmount = action.payload.scrollAmount;
        },
        horizontalScroll: (state, action) => {
            state.horiScrollAmount =
                state.horiScrollAmount + action.payload.scrollDelta;
        },
    },
});
