import type { FederatedPointerEvent, Graphics } from "pixi.js";
import { remap } from "../../helpers";
import { useApplication } from "@pixi/react";
import { useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    selectCanvasSize,
    selectMeterBarHeight,
    selectNoteGridDimensions,
    selectScrollBarThickness,
    selectTotalHeight,
    selectVertScrollAmount,
} from "../../store/selectors";
import { setVertScroll } from "../../store";

function Background() {
    const scrollBarThickness = useSelector(selectScrollBarThickness);
    const { noteGridHeight } = useSelector(selectNoteGridDimensions);

    const draw = useCallback(
        (graphics: Graphics) => {
            graphics.clear();
            graphics
                .rect(0, 0, scrollBarThickness, noteGridHeight)
                .fill(0x151515);
        },
        [scrollBarThickness, noteGridHeight]
    );

    return <pixiGraphics draw={draw} />;
}

function Bar() {
    const dispatch = useDispatch();
    const scrollBarThickness = useSelector(selectScrollBarThickness);
    const vertScrollAmount = useSelector(selectVertScrollAmount);
    const totalHeight = useSelector(selectTotalHeight);
    const { noteGridHeight } = useSelector(selectNoteGridDimensions);

    const app = useApplication();
    const stage = app.app.stage;

    const barHeight = remap(noteGridHeight, 0, totalHeight, 0, noteGridHeight);

    const barY = remap(
        vertScrollAmount,
        0,
        totalHeight - noteGridHeight,
        0,
        noteGridHeight - barHeight
    );

    const draw = useCallback(
        (graphics: Graphics) => {
            graphics.clear();
            graphics.rect(0, 0, scrollBarThickness, barHeight).fill(0x666666);
        },
        [scrollBarThickness, barHeight]
    );

    const isDragging = useRef(false);
    const clickVertScrollAmt = useRef(0);
    const clickMouseY = useRef(0);

    const onPointerMove = useCallback(
        (event: FederatedPointerEvent) => {
            if (!isDragging.current) return;

            const scrollAmount =
                clickVertScrollAmt.current +
                remap(
                    event.globalY - clickMouseY.current,
                    0,
                    noteGridHeight - barHeight,
                    0,
                    totalHeight - noteGridHeight
                );

            dispatch(setVertScroll({ scrollAmount }));
        },
        [dispatch, noteGridHeight, barHeight, totalHeight]
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
            clickVertScrollAmt.current = vertScrollAmount;
            clickMouseY.current = event.globalY;

            stage.on("pointermove", onPointerMove);
            stage.on("pointerup", onPointerUp);
            stage.on("pointerupoutside", onPointerUp);
        },
        [stage, vertScrollAmount, onPointerMove, onPointerUp]
    );

    return (
        <pixiContainer y={barY}>
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
    const meterBarHeight = useSelector(selectMeterBarHeight);
    const canvasSize = useSelector(selectCanvasSize);

    return (
        <pixiContainer
            x={canvasSize.width - scrollBarThickness}
            y={meterBarHeight}
        >
            <Background />
            <Bar />
        </pixiContainer>
    );
}
