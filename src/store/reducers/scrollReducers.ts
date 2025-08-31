import type { PayloadAction } from "@reduxjs/toolkit/react";
import { clamp } from "../../helpers/util";
import type { AppState } from "../store";
import {
    selectNoteGridHeight,
    selectNoteGridWidth,
} from "../selectors/noteGridSelectors";
import {
    selectTotalHeight,
    selectTotalWidth,
} from "../selectors/pianoRollSelectors";

export const setVertScroll = (
    state: AppState,
    action: PayloadAction<number>
) => {
    const totalHeight = selectTotalHeight({ app: state });
    const noteGridHeight = selectNoteGridHeight({ app: state });

    state.vertScrollAmount = clamp(
        action.payload,
        0,
        totalHeight - noteGridHeight
    );
};

export const verticalScroll = (
    state: AppState,
    action: PayloadAction<number>
) => {
    const totalHeight = selectTotalHeight({ app: state });
    const noteGridHeight = selectNoteGridHeight({ app: state });

    state.vertScrollAmount = clamp(
        state.vertScrollAmount + action.payload,
        0,
        totalHeight - noteGridHeight
    );
};

export const setHoriScroll = (
    state: AppState,
    action: PayloadAction<number>
) => {
    const totalWidth = selectTotalWidth({ app: state });
    const noteGridWidth = selectNoteGridWidth({ app: state });

    state.horiScrollAmount = clamp(
        action.payload,
        0,
        totalWidth - noteGridWidth
    );
};

export const horizontalScroll = (
    state: AppState,
    action: PayloadAction<number>
) => {
    const totalWidth = selectTotalWidth({ app: state });
    const noteGridWidth = selectNoteGridWidth({ app: state });

    state.horiScrollAmount = clamp(
        state.horiScrollAmount + action.payload,
        0,
        totalWidth - noteGridWidth
    );
};
