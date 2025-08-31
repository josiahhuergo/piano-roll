import type { Graphics } from "pixi.js";
import { useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import {
    selectBeatCount,
    selectBeatWidth,
    selectMeterBarHeight,
    selectPianoBarWidth,
    selectTotalWidth,
} from "../store/selectors/pianoRollSelectors";
import { selectHoriScrollAmount } from "../store/selectors/scrollSelectors";
import {
    selectMeterBarWidth,
    selectMeterBarX,
    selectMeterBarY,
} from "../store/selectors/meterBarSelectors";

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

    const labels = Array.from({ length: beatCount }, (_, i) => i).filter(
        (i) => i == i
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
                />
            ))}
        </>
    );
}

function MeterBarArea() {
    const pianoBarWidth = useSelector(selectPianoBarWidth);
    const horiScrollAmount = useSelector(selectHoriScrollAmount);

    const meterBarX = useSelector(selectMeterBarX);
    const meterBarY = useSelector(selectMeterBarY);
    const meterBarWidth = useSelector(selectMeterBarWidth);
    const meterBarHeight = useSelector(selectMeterBarHeight);

    const maskRef = useRef(null);
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
