import type { Graphics } from "pixi.js";
import { remap } from "../helpers/util";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import {
    selectCanvasSize,
    selectHoriScrollAmount,
    selectNoteGridWidth,
    selectPianoBarWidth,
    selectScrollBarThickness,
    selectTotalWidth,
} from "../store/store";

function Background() {
    const scrollBarThickness = useSelector(selectScrollBarThickness);
    const noteGridWidth = useSelector(selectNoteGridWidth);

    const draw = useCallback(
        (graphics: Graphics) => {
            console.log("Drawing hori scroll bar background");

            graphics.clear();
            graphics
                .rect(0, 0, noteGridWidth, scrollBarThickness)
                .fill(0x151515);
        },
        [noteGridWidth, scrollBarThickness]
    );

    return <pixiGraphics draw={draw} />;
}

function Bar() {
    const scrollBarThickness = useSelector(selectScrollBarThickness);
    const horiScrollAmount = useSelector(selectHoriScrollAmount);
    const totalWidth = useSelector(selectTotalWidth);
    const noteGridWidth = useSelector(selectNoteGridWidth);

    const barWidth = remap(noteGridWidth, 0, totalWidth, 0, noteGridWidth);

    const barX = remap(
        horiScrollAmount,
        0,
        totalWidth - noteGridWidth,
        0,
        noteGridWidth - barWidth
    );

    const draw = useCallback(
        (graphics: Graphics) => {
            console.log("Drawing hori scroll bar");
            graphics.clear();
            graphics.rect(0, 0, barWidth, scrollBarThickness).fill(0x666666);
        },
        [noteGridWidth, totalWidth, scrollBarThickness]
    );

    return (
        <pixiContainer x={barX}>
            <pixiGraphics draw={draw} />
        </pixiContainer>
    );
}

export default function VertScrollBar() {
    const scrollBarThickness = useSelector(selectScrollBarThickness);
    const canvasSize = useSelector(selectCanvasSize);
    const pianoBarWidth = useSelector(selectPianoBarWidth);

    return (
        <pixiContainer
            x={pianoBarWidth}
            y={canvasSize.height - scrollBarThickness}
        >
            <Background />
            <Bar />
        </pixiContainer>
    );
}
