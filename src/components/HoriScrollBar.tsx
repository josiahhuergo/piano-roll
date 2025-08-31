import type { FederatedPointerEvent, Graphics } from "pixi.js";
import { remap } from "../helpers/util";
import { useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import {
    selectCanvasSize,
    selectHoriScrollAmount,
    selectNoteGridWidth,
    selectPianoBarWidth,
    selectScrollBarThickness,
    selectTotalWidth,
    setHoriScroll,
    store,
} from "../store/store";
import { useApplication } from "@pixi/react";

function Background() {
    const scrollBarThickness = useSelector(selectScrollBarThickness);
    const noteGridWidth = useSelector(selectNoteGridWidth);

    const draw = useCallback(
        (graphics: Graphics) => {
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

    const app = useApplication();
    const stage = app.app.stage;

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
            graphics.clear();
            graphics.rect(0, 0, barWidth, scrollBarThickness).fill(0x666666);
        },
        [noteGridWidth, totalWidth, scrollBarThickness]
    );

    const dragging = useRef(false);
    const clickVertScrollAmt = useRef(0);
    const clickMouseX = useRef(0);

    const onPointerMove = useCallback(
        (event: FederatedPointerEvent) => {
            if (dragging.current) {
                const scrollAmount =
                    clickVertScrollAmt.current +
                    remap(
                        event.globalX - clickMouseX.current,
                        0,
                        noteGridWidth - barWidth,
                        0,
                        totalWidth - noteGridWidth
                    );

                store.dispatch(setHoriScroll(scrollAmount));
            }
        },
        [dragging, noteGridWidth, barWidth, totalWidth]
    );

    const onPointerUp = useCallback(() => {
        if (dragging) {
            dragging.current = false;

            stage.off("pointermove", onPointerMove);
            stage.off("pointerup", onPointerUp);
            stage.off("pointerupoutside", onPointerUp);
        }
    }, [dragging, onPointerMove]);

    const onPointerDown = useCallback(
        (event: FederatedPointerEvent) => {
            dragging.current = true;
            clickVertScrollAmt.current = horiScrollAmount;
            clickMouseX.current = event.globalX;

            stage.on("pointermove", onPointerMove);
            stage.on("pointerup", onPointerUp);
            stage.on("pointerupoutside", onPointerUp);
        },
        [horiScrollAmount, onPointerMove, onPointerUp]
    );

    return (
        <pixiContainer x={barX}>
            <pixiGraphics
                draw={draw}
                eventMode="static"
                onPointerDown={onPointerDown}
            />
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
