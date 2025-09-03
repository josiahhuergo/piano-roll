import MeterBar from "./MeterBar";
import PianoBar from "./PianoBar";
import NoteGrid from "./NoteGrid/NoteGrid";
import { extend } from "@pixi/react";
import { Container, FederatedWheelEvent, Graphics, Text } from "pixi.js";
import VertScrollBar from "./ScrollBar/VertScrollBar";
import HoriScrollBar from "./ScrollBar/HoriScrollBar";
import { useDispatch, useSelector } from "react-redux";
import { selectCanvasSize } from "../store/selectors";
import { useCallback } from "react";
import { horizontalScroll, verticalScroll } from "../store";

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

    return (
        <pixiContainer eventMode="static" onWheel={wheel}>
            <PianoRollBackground />
            <MeterBar />
            <PianoBar />
            <NoteGrid />
            <VertScrollBar />
            <HoriScrollBar />
        </pixiContainer>
    );
}
