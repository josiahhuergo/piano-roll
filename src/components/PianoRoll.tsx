import MeterBar from "./MeterBar";
import PianoBar from "./PianoBar";
import NoteGrid from "./NoteGrid";
import { extend } from "@pixi/react";
import { Container, FederatedWheelEvent, Graphics, Text } from "pixi.js";
import VertScrollBar from "./VertScrollBar";
import HoriScrollBar from "./HoriScrollBar";
import { useRef } from "react";
import { useSelector } from "react-redux";
import {
    horizontalScroll,
    selectCanvasSize,
    store,
    verticalScroll,
} from "../store/store";

extend({ Container, Graphics, Text });

function Background() {
    const canvasSize = useSelector(selectCanvasSize);
    let i = useRef(0);

    return (
        <pixiGraphics
            draw={(graphics: Graphics) => {
                console.log("-------REDRAW TIME!-------", i);
                i.current += 1;
                console.log("Drawing piano roll background");

                graphics.clear();

                graphics
                    .rect(0, 0, canvasSize.width, canvasSize.height)
                    .fill(0x252525);
            }}
        ></pixiGraphics>
    );
}

export default function PianoRoll() {
    return (
        <pixiContainer
            eventMode="static"
            onWheel={(event: FederatedWheelEvent) => {
                if (event.shiftKey) {
                    store.dispatch(horizontalScroll(event.deltaY));
                } else {
                    store.dispatch(verticalScroll(event.deltaY));
                }
                event.stopPropagation();
                event.preventDefault();
            }}
        >
            <Background />
            <MeterBar />
            <PianoBar />
            <NoteGrid />
            <VertScrollBar />
            <HoriScrollBar />
        </pixiContainer>
    );
}
