import type { FederatedPointerEvent, Graphics } from "pixi.js";
import { remap } from "../helpers/util";
import { useApplication } from "@pixi/react";
import { useCallback } from "react";
import {
    selectCanvasSize,
    selectDragging,
    selectMeterBarHeight,
    selectNoteGridHeight,
    selectScrollBarThickness,
    selectTotalHeight,
    selectVertScrollAmount,
    setDragging,
    store,
    verticalScroll,
} from "../store/store";
import { useSelector } from "react-redux";

function Background() {
    const scrollBarThickness = useSelector(selectScrollBarThickness);
    const noteGridHeight = useSelector(selectNoteGridHeight);

    const draw = useCallback(
        (graphics: Graphics) => {
            console.log("Drawing vert scroll bar background");
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
    const scrollBarThickness = useSelector(selectScrollBarThickness);
    const vertScrollAmount = useSelector(selectVertScrollAmount);
    const totalHeight = useSelector(selectTotalHeight);
    const noteGridHeight = useSelector(selectNoteGridHeight);

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
            console.log("Drawing vert scroll bar");
            graphics.clear();
            graphics.rect(0, 0, scrollBarThickness, barHeight).fill(0x666666);
        },
        [scrollBarThickness, noteGridHeight, totalHeight]
    );

    const dragging = useSelector(selectDragging);

    const onPointerMove = (event: FederatedPointerEvent) => {
        if (dragging) {
            store.dispatch(verticalScroll(event.movementY));
        }
    };

    const onPointerUp = () => {
        if (dragging) {
            store.dispatch(setDragging(false));

            stage.off("pointermove", onPointerMove);
            stage.off("pointerup", onPointerUp);
            stage.off("pointerupoutside", onPointerUp);
        }
    };

    const onPointerDown = () => {
        store.dispatch(setDragging(true));

        stage.on("pointermove", onPointerMove);
        stage.on("pointerup", onPointerUp);
        stage.on("pointerupoutside", onPointerUp);
    };

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
