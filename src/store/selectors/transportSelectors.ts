import type { TransportState } from "../slices/transportSlice";

export const selectStartTimeBeats = (state: { transport: TransportState }) =>
    state.transport.startTimeBeats;
