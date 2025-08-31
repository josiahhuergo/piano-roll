import { calculateCanvasSize } from "../../helpers/util";
import type { AppState } from "../store";

export const updateCanvasSize = (state: AppState) => {
    state.canvasSize = calculateCanvasSize();
};
