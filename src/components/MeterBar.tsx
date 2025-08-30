import type { Graphics } from "pixi.js";
import {
    useAppStore,
    useMeterBarWidth,
    useMeterBarX,
    useMeterBarY,
    useTotalWidth,
} from "../store/store";
import { useCallback, useRef } from "react";

function Background() {
    const totalWidth = useTotalWidth();
    const meterBarHeight = useAppStore((state) => state.meterBarHeight);

    const draw = useCallback(
        (graphics: Graphics) => {
            console.log("Drawing meter bar background");
            graphics.clear();
            graphics.rect(0, 0, totalWidth, meterBarHeight).fill(0x252525);
        },
        [totalWidth, meterBarHeight]
    );

    return <pixiGraphics draw={draw} />;
}

function MeasureLines() {
    const beatCount = useAppStore((state) => state.beatCount);
    const beatWidth = useAppStore((state) => state.beatWidth);
    const meterBarHeight = useAppStore((state) => state.meterBarHeight);

    const draw = useCallback(
        (graphics: Graphics) => {
            console.log("Drawing meter bar measure lines");

            graphics.clear();
            for (let beat = 0; beat < beatCount; beat++) {
                if (beat % 4 == 0) {
                    graphics
                        .moveTo(beat * beatWidth, 0)
                        .lineTo(beat * beatWidth, meterBarHeight)
                        .stroke({ width: 1, color: 0x303030 });
                }
            }
        },
        [beatCount, beatWidth, meterBarHeight]
    );

    return <pixiGraphics draw={draw} />;
}

function BeatNumbers() {
    const beatCount = useAppStore((state) => state.beatCount);
    const beatWidth = useAppStore((state) => state.beatWidth);

    const labels = Array.from({ length: beatCount }, (_, i) => i).filter(
        (i) => i % 4 == 0
    );

    return (
        <>
            {labels.map((i) => (
                <pixiText
                    text={i}
                    key={i}
                    style={{
                        fill: 0x555555,
                        fontSize: 11,
                        align: "left",
                        lineHeight: 18,
                    }}
                    x={beatWidth * i + 6}
                ></pixiText>
            ))}
        </>
    );
}

function MeterBarArea() {
    const pianoBarWidth = useAppStore((state) => state.pianoBarWidth);
    const horiScrollAmount = useAppStore((state) => state.horiScrollAmount);

    const meterBarX = useMeterBarX();
    const meterBarY = useMeterBarY();
    const meterBarWidth = useMeterBarWidth();
    const meterBarHeight = useAppStore((state) => state.meterBarHeight);

    const maskRef = useRef(null);
    const drawMask = useCallback(
        (graphics: Graphics) => {
            console.log("Drawing meter bar mask");

            graphics.clear();
            graphics
                .rect(meterBarX, meterBarY, meterBarWidth, meterBarHeight)
                .fill("black");
        },
        [meterBarX, meterBarY, meterBarWidth, meterBarHeight]
    );

    return (
        <>
            <pixiGraphics ref={maskRef} draw={drawMask} />
            <pixiContainer
                x={pianoBarWidth - horiScrollAmount}
                mask={maskRef?.current}
            >
                <Background />
                <MeasureLines />
                <BeatNumbers />
            </pixiContainer>
        </>
    );
}

export default function MeterBar() {
    return (
        <>
            <MeterBarArea />
        </>
    );
}
