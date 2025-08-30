import type { Graphics } from "pixi.js";
import { useAppStore, useNoteGridWidth, useTotalWidth } from "../store/store";
import { remap } from "../helpers/util";
import { useCallback } from "react";

function Background() {
    const scrollBarThickness = useAppStore((state) => state.scrollBarThickness);
    const noteGridWidth = useNoteGridWidth();

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
    const scrollBarThickness = useAppStore((state) => state.scrollBarThickness);
    const horiScrollAmount = useAppStore((state) => state.horiScrollAmount);
    const totalWidth = useTotalWidth();
    const noteGridWidth = useNoteGridWidth();

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
    const scrollBarThickness = useAppStore((state) => state.scrollBarThickness);
    const canvasHeight = useAppStore((state) => state.canvasSize.height);
    const pianoBarWidth = useAppStore((state) => state.pianoBarWidth);

    return (
        <pixiContainer x={pianoBarWidth} y={canvasHeight - scrollBarThickness}>
            <Background />
            <Bar />
        </pixiContainer>
    );
}
