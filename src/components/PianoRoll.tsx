import MeterBar from "./MeterBar";
import PianoBar from "./PianoBar";
import NoteGrid from "./NoteGrid/NoteGrid";
import { extend } from "@pixi/react";
import {
    Container,
    FederatedPointerEvent,
    FederatedWheelEvent,
    Graphics,
    Text,
} from "pixi.js";
import VertScrollBar from "./ScrollBar/VertScrollBar";
import HoriScrollBar from "./ScrollBar/HoriScrollBar";
import { useDispatch, useSelector } from "react-redux";
import {
    selectCanvasSize,
    selectIsDragging,
    selectIsMouseDown,
    selectMouseDownPos,
} from "../store/selectors";
import { useCallback } from "react";
import {
    horizontalScroll,
    pressCtrl,
    pressMouse,
    pressShift,
    releaseMouse,
    setDragging,
    verticalScroll,
} from "../store";

extend({ Container, Graphics, Text });

function PianoRollBackground() {
    const canvasSize = useSelector(selectCanvasSize);

    const draw = useCallback(
        (graphics: Graphics) => {
            graphics.clear();
            graphics
                .rect(0, 0, canvasSize.width, canvasSize.height)
                .fill(0x252525);
        },
        [canvasSize]
    );

    return <pixiGraphics draw={draw}></pixiGraphics>;
}

export default function PianoRoll() {
    const dispatch = useDispatch();

    const mouseDownPos = useSelector(selectMouseDownPos);
    const isDragging = useSelector(selectIsDragging);
    const isMouseDown = useSelector(selectIsMouseDown);

    const wheel = useCallback(
        (event: FederatedWheelEvent) => {
            if (event.shiftKey) {
                dispatch(horizontalScroll({ scrollDelta: event.deltaY }));
            } else {
                dispatch(verticalScroll({ scrollDelta: event.deltaY }));
            }
            event.stopPropagation();
            event.preventDefault();
        },
        [dispatch]
    );

    const pointerDown = useCallback(
        (event: FederatedPointerEvent) => {
            dispatch(
                pressMouse({ mousePos: { x: event.offsetX, y: event.offsetY } })
            );
        },
        [dispatch]
    );

    const pointerUp = useCallback(() => {
        dispatch(releaseMouse());
    }, [dispatch]);

    const pointerMove = useCallback(
        (event: FederatedPointerEvent) => {
            if (
                isMouseDown &&
                !isDragging &&
                (event.global.x != mouseDownPos.x ||
                    event.global.y != mouseDownPos.y)
            ) {
                dispatch(setDragging(true));
            }
        },
        [dispatch, mouseDownPos, isMouseDown, isDragging]
    );

    return (
        <pixiContainer
            eventMode="static"
            onWheel={wheel}
            onPointerDown={pointerDown}
            onPointerUp={pointerUp}
            onPointerMove={pointerMove}
        >
            <PianoRollBackground />
            <MeterBar />
            <PianoBar />
            <NoteGrid />
            <VertScrollBar />
            <HoriScrollBar />
        </pixiContainer>
    );
}
