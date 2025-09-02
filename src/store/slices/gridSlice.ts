import { createSlice } from "@reduxjs/toolkit";

export interface GridState {
    maxPitch: number;
    minPitch: number;
    laneHeight: number;
    beatWidth: number;
    beatCount: number;
}

const initialState: GridState = {
    maxPitch: 108,
    minPitch: 21,
    laneHeight: 19,
    beatWidth: 80,
    beatCount: 40,
};

export const gridSlice = createSlice({
    name: "grid",
    initialState,
    reducers: {},
});
