import MeterBar from "./MeterBar";
import PianoBar from "./PianoBar";
import NoteGrid from "./NoteGrid";
import { extend } from "@pixi/react";
import { Container, FederatedWheelEvent, Graphics, Text } from "pixi.js";
import { useAppStore } from "../store/store";
import VertScrollBar from "./VertScrollBar";
import HoriScrollBar from "./HoriScrollBar";
import { useRef } from "react";

extend({ Container, Graphics, Text });

function Background() {
    const canvasSize = useAppStore((state) => state.canvasSize);
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
    const verticalScroll = useAppStore((state) => state.verticalScroll);
    const horizontalScroll = useAppStore((state) => state.horizontalScroll);

    return (
        <pixiContainer
            eventMode="static"
            onWheel={(event: FederatedWheelEvent) => {
                if (event.shiftKey) {
                    horizontalScroll(event.deltaY);
                } else {
                    verticalScroll(event.deltaY);
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
