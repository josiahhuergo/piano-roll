import MeterBar from "./MeterBar";
import PianoBar from "./PianoBar";
import NoteGrid from "./NoteGrid/NoteGrid";
import { extend } from "@pixi/react";
import { Container, FederatedWheelEvent, Graphics, Text } from "pixi.js";
import VertScrollBar from "./ScrollBar/VertScrollBar";
import HoriScrollBar from "./ScrollBar/HoriScrollBar";
import { useDispatch, useSelector } from "react-redux";
import {
    selectCanvasSize,
    selectHoriScrollAmount,
    selectMaxHoriScroll,
    selectMaxVertScroll,
    selectVertScrollAmount,
} from "../store/selectors";
import { useCallback } from "react";
import { setHoriScroll, setVertScroll } from "../store";
import { clamp } from "../helpers";

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

    const horiScrollAmount = useSelector(selectHoriScrollAmount);
    const vertScrollAmount = useSelector(selectVertScrollAmount);
    const maxHoriScroll = useSelector(selectMaxHoriScroll);
    const maxVertScroll = useSelector(selectMaxVertScroll);

    const wheel = useCallback(
        (event: FederatedWheelEvent) => {
            if (event.shiftKey) {
                const newHoriScroll = clamp(
                    horiScrollAmount + event.deltaY,
                    0,
                    maxHoriScroll
                );
                dispatch(setHoriScroll({ scrollAmount: newHoriScroll }));
            } else {
                const newVertScroll = clamp(
                    vertScrollAmount + event.deltaY,
                    0,
                    maxVertScroll
                );
                dispatch(setVertScroll({ scrollAmount: newVertScroll }));
            }
            event.stopPropagation();
            event.preventDefault();
        },
        [
            dispatch,
            horiScrollAmount,
            vertScrollAmount,
            maxHoriScroll,
            maxVertScroll,
        ]
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
