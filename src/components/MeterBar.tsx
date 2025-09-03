import type { Graphics } from "pixi.js";
import { useCallback, useRef, type Ref } from "react";
import { useSelector } from "react-redux";
import {
    selectBeatCount,
    selectBeatWidth,
    selectHoriScrollAmount,
    selectMeterBarDimensions,
    selectMeterBarHeight,
    selectTotalWidth,
} from "../store/selectors";

function Background() {
    const totalWidth = useSelector(selectTotalWidth);
    const meterBarHeight = useSelector(selectMeterBarHeight);

    const draw = useCallback(
        (graphics: Graphics) => {
            graphics.clear();
            graphics.rect(0, 0, totalWidth, meterBarHeight).fill(0x252525);
        },
        [totalWidth, meterBarHeight]
    );

    return <pixiGraphics draw={draw} />;
}

function MeasureLines() {
    const beatCount = useSelector(selectBeatCount);
    const beatWidth = useSelector(selectBeatWidth);
    const meterBarHeight = useSelector(selectMeterBarHeight);

    const draw = useCallback(
        (graphics: Graphics) => {
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
    const beatCount = useSelector(selectBeatCount);
    const beatWidth = useSelector(selectBeatWidth);

    const beatNumbers = Array.from({ length: beatCount }, (_, i) => i).filter(
        (i) => i == i
    );

    const beatLabels = beatNumbers.map((i) => (
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
        />
    ));

    return <>{beatLabels}</>;
}

function MeterBarMask({ ref }: { ref: Ref<Graphics> }) {
    const { meterBarX, meterBarY, meterBarWidth, meterBarHeight } = useSelector(
        selectMeterBarDimensions
    );
    const drawMask = useCallback(
        (graphics: Graphics) => {
            graphics.clear();
            graphics
                .rect(meterBarX, meterBarY, meterBarWidth, meterBarHeight)
                .fill("black");
        },
        [meterBarX, meterBarY, meterBarWidth, meterBarHeight]
    );
    return (
        <>
            <pixiGraphics ref={ref} draw={drawMask} />
        </>
    );
}

export default function MeterBar() {
    const horiScrollAmount = useSelector(selectHoriScrollAmount);

    const { meterBarX } = useSelector(selectMeterBarDimensions);

    const maskRef = useRef(null);

    return (
        <>
            <MeterBarMask ref={maskRef} />
            <pixiContainer
                x={meterBarX - horiScrollAmount}
                mask={maskRef?.current}
            >
                <Background />
                <MeasureLines />
                <BeatNumbers />
            </pixiContainer>
        </>
    );
}
