import { createSlice } from "@reduxjs/toolkit/react";

export interface TransportState {
    startTimeBeats: number;
}

const initialState: TransportState = {
    startTimeBeats: 0,
};

export const transportSlice = createSlice({
    name: "transport",
    initialState,
    reducers: {
        setStartTimeBeats: (state, action) => {
            state.startTimeBeats = action.payload;
        },
    },
});
