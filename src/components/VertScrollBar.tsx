import type { FederatedPointerEvent, Graphics } from "pixi.js";
import { remap } from "../helpers/util";
import { useApplication } from "@pixi/react";
import { useCallback, useState } from "react";
import {
    selectCanvasSize,
    selectMeterBarHeight,
    selectNoteGridHeight,
    selectScrollBarThickness,
    selectTotalHeight,
    selectVertScrollAmount,
    setVertScroll,
    store,
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

    const [dragging, setDragging] = useState(false);
    const [clickVertScrollAmt, setClickVertScrollAmt] = useState(0);
    const [clickMouseY, setClickMouseY] = useState(0);

    const onPointerMove = (event: FederatedPointerEvent) => {
        if (dragging) {
            const scrollAmount = remap(
                clickVertScrollAmt + (event.screenY - clickMouseY),
                0,
                noteGridHeight - barHeight,
                0,
                totalHeight - noteGridHeight
            );
            store.dispatch(setVertScroll(scrollAmount));
        }
    };

    const onPointerUp = () => {
        if (dragging) {
            setDragging(false);

            stage.off("pointermove", onPointerMove);
            stage.off("pointerup", onPointerUp);
            stage.off("pointerupoutside", onPointerUp);
        }
    };

    const onPointerDown = (event: FederatedPointerEvent) => {
        setDragging(true);
        setClickVertScrollAmt(vertScrollAmount);
        setClickMouseY(event.screenY);

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
