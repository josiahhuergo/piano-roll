import { createSlice } from "@reduxjs/toolkit/react";

export interface TransportState {
    startTimeBeats: number;
}

const initialState: TransportState = {
    startTimeBeats: 0,
};

export const transportSlice = createSlice({
    name: "viewport",
    initialState,
    reducers: {
        setStartTimeBeats: (state, action) => {
            console.log("SETTING NEW START TIME");
            console.log(action.payload);

            state.startTimeBeats = action.payload;
        },
    },
});
