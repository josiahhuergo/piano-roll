import type { FederatedPointerEvent, Graphics } from "pixi.js";
import { remap } from "../../helpers";
import { useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useApplication } from "@pixi/react";
import {
    selectCanvasSize,
    selectHoriScrollAmount,
    selectNoteGridDimensions,
    selectPianoBarDimensions,
    selectScrollBarThickness,
    selectTotalWidth,
} from "../../store/selectors";
import { setHoriScroll } from "../../store";

function Background() {
    const scrollBarThickness = useSelector(selectScrollBarThickness);
    const { noteGridWidth } = useSelector(selectNoteGridDimensions);

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
    const dispatch = useDispatch();

    const scrollBarThickness = useSelector(selectScrollBarThickness);
    const horiScrollAmount = useSelector(selectHoriScrollAmount);
    const totalWidth = useSelector(selectTotalWidth);
    const { noteGridWidth } = useSelector(selectNoteGridDimensions);

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
        [totalWidth, scrollBarThickness]
    );

    const isDragging = useRef(false);
    const clickVertScrollAmt = useRef(0);
    const clickMouseX = useRef(0);

    const onPointerMove = useCallback(
        (event: FederatedPointerEvent) => {
            if (!isDragging.current) return;

            const scrollAmount =
                clickVertScrollAmt.current +
                remap(
                    event.globalX - clickMouseX.current,
                    0,
                    noteGridWidth - barWidth,
                    0,
                    totalWidth - noteGridWidth
                );

            dispatch(setHoriScroll({ scrollAmount }));
        },
        [noteGridWidth, barWidth, totalWidth]
    );

    const onPointerUp = useCallback(() => {
        if (!isDragging) return;

        isDragging.current = false;

        stage.off("pointermove", onPointerMove);
        stage.off("pointerup", onPointerUp);
        stage.off("pointerupoutside", onPointerUp);
    }, [stage, onPointerMove]);

    const onPointerDown = useCallback(
        (event: FederatedPointerEvent) => {
            isDragging.current = true;
            clickVertScrollAmt.current = horiScrollAmount;
            clickMouseX.current = event.globalX;

            stage.on("pointermove", onPointerMove);
            stage.on("pointerup", onPointerUp);
            stage.on("pointerupoutside", onPointerUp);
        },
        [stage, horiScrollAmount, onPointerMove, onPointerUp]
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
    const { pianoBarWidth } = useSelector(selectPianoBarDimensions);

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
