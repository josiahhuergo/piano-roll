import type { FederatedPointerEvent, Graphics } from "pixi.js";
import { useAppStore, useNoteGridHeight, useTotalHeight } from "../store/store";
import { remap } from "../helpers/util";
import { useApplication } from "@pixi/react";
import { useCallback } from "react";

function Background() {
    const scrollBarThickness = useAppStore((state) => state.scrollBarThickness);
    const noteGridHeight = useNoteGridHeight();
    const canvasHeight = useAppStore((state) => state.canvasSize.height);

    const draw = useCallback(
        (graphics: Graphics) => {
            console.log("Drawing vert scroll bar background");
            graphics.clear();
            graphics
                .rect(0, 0, scrollBarThickness, noteGridHeight)
                .fill(0x151515);
        },
        [canvasHeight]
    );

    return <pixiGraphics draw={draw} />;
}

function Bar() {
    const scrollBarThickness = useAppStore((state) => state.scrollBarThickness);
    const vertScrollAmount = useAppStore((state) => state.vertScrollAmount);
    const totalHeight = useTotalHeight();
    const noteGridHeight = useNoteGridHeight();
    const verticalScroll = useAppStore((state) => state.verticalScroll);

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

    const dragging = useAppStore((state) => state.dragging);
    const setDragging = useAppStore((state) => state.setDragging);

    const onPointerMove = (event: FederatedPointerEvent) => {
        if (dragging) {
            verticalScroll(event.movementY);
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

    const onPointerDown = () => {
        setDragging(true);

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
    const scrollBarThickness = useAppStore((state) => state.scrollBarThickness);
    const meterBarHeight = useAppStore((state) => state.meterBarHeight);
    const canvasWidth = useAppStore((state) => state.canvasSize.width);

    return (
        <pixiContainer x={canvasWidth - scrollBarThickness} y={meterBarHeight}>
            <Background />
            <Bar />
        </pixiContainer>
    );
}
