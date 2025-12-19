import type { Graphics } from "pixi.js";
import { useCallback, useEffect, useRef, useState, type Ref } from "react";
import { useSelector } from "react-redux";
import {
    selectBeatWidth,
    selectHoriScrollAmount,
    selectMeterBarHeight,
    selectNoteGridDimensions,
} from "../store/selectors";
import { useWindowEvent } from "../hooks";
import { useTick } from "@pixi/react";
import { selectStartTimeBeats } from "../store/selectors/transportSelectors";

function PlayheadMask({ ref }: { ref: Ref<Graphics> }) {
    const meterBarHeight = useSelector(selectMeterBarHeight);
    const { noteGridHeight, noteGridWidth } = useSelector(
        selectNoteGridDimensions
    );
    const playheadHeight = meterBarHeight + noteGridHeight;

    const drawMask = useCallback(
        (graphics: Graphics) => {
            graphics
                .clear()
                .rect(0, 0, noteGridWidth, playheadHeight)
                .fill("black");
        },
        [noteGridWidth, playheadHeight]
    );

    return <pixiGraphics ref={ref} draw={drawMask} />;
}

export default function Playhead() {
    const meterBarHeight = useSelector(selectMeterBarHeight);
    const { noteGridX, noteGridHeight } = useSelector(selectNoteGridDimensions);

    const playheadHeight = meterBarHeight + noteGridHeight;

    const draw = useCallback(
        (graphics: Graphics) => {
            graphics
                .clear()
                .moveTo(0, 0)
                .lineTo(0, playheadHeight)
                .stroke({ color: 0xffffff });
        },
        [playheadHeight]
    );

    const startTime = useSelector(selectStartTimeBeats);
    const maskRef = useRef(null);
    const containerRef = useRef(null);
    const [playPos, setPlayPos] = useState(0);
    const playTime = useRef(0);
    const isPlaying = useRef(false);
    const beatWidth = useSelector(selectBeatWidth);

    const animate = useCallback(() => {
        if (!isPlaying.current) {
            return;
        } else {
            const delta = Date.now() - playTime.current;
            const bpm = 120;

            setPlayPos(((bpm / 60) * (delta / 1000) + startTime) * beatWidth);
        }
    }, [beatWidth, startTime]);

    useTick(animate);

    useWindowEvent(
        "keydown",
        (event: KeyboardEvent) => {
            if (event.code == "Space") {
                if (isPlaying.current) {
                    isPlaying.current = false;
                    setPlayPos(startTime * beatWidth);
                } else {
                    isPlaying.current = true;
                    playTime.current = Date.now();
                }
            }
        },
        [startTime, beatWidth]
    );

    useEffect(() => {
        setPlayPos(startTime * beatWidth);
    }, [startTime, beatWidth]);

    const horiScrollAmount = useSelector(selectHoriScrollAmount);

    return (
        <pixiContainer x={noteGridX}>
            <PlayheadMask ref={maskRef} />
            <pixiContainer
                x={playPos - horiScrollAmount}
                mask={maskRef?.current}
                ref={containerRef}
            >
                <pixiGraphics draw={draw} />
            </pixiContainer>
        </pixiContainer>
    );
}
