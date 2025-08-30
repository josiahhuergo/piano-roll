import type { Graphics } from "pixi.js";
import { pitchIsBlackKey } from "../helpers/util";
import { useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import {
    selectLaneCount,
    selectLaneHeight,
    selectMaxPitch,
    selectMeterBarHeight,
    selectPianoBarHeight,
    selectPianoBarWidth,
    selectPianoBarX,
    selectPianoBarY,
    selectVertScrollAmount,
} from "../store/store";

export default function PianoBar() {
    const maxPitch = useSelector(selectMaxPitch);
    const laneHeight = useSelector(selectLaneHeight);
    const laneCount = useSelector(selectLaneCount);
    const meterBarHeight = useSelector(selectMeterBarHeight);
    const vertScrollAmount = useSelector(selectVertScrollAmount);

    const pianoBarX = useSelector(selectPianoBarX);
    const pianoBarY = useSelector(selectPianoBarY);
    const pianoBarWidth = useSelector(selectPianoBarWidth);
    const pianoBarHeight = useSelector(selectPianoBarHeight);

    const drawPianoBar = useCallback(
        (graphics: Graphics) => {
            console.log("Drawing piano bar");

            graphics.clear();

            for (let lane = 0; lane < laneCount; lane++) {
                const pitch = maxPitch - lane;
                const color = pitchIsBlackKey(pitch) ? 0x191919 : 0x444444;

                graphics
                    .rect(0, lane * laneHeight, pianoBarWidth, laneHeight)
                    .fill(color);

                const pitchClass = (maxPitch - lane) % 12;
                if (pitchClass == 4 || pitchClass == 11) {
                    graphics
                        .moveTo(0, lane * laneHeight)
                        .lineTo(pianoBarWidth, lane * laneHeight)
                        .stroke({ color: 0x191919 });
                }
            }
        },
        [laneCount, laneHeight, pianoBarWidth]
    );

    const maskRef = useRef(null);
    const drawMask = useCallback(
        (graphics: Graphics) => {
            console.log("Drawing piano bar mask");
            graphics.clear();
            graphics
                .rect(pianoBarX, pianoBarY, pianoBarWidth, pianoBarHeight)
                .fill("black");
        },
        [pianoBarX, pianoBarY, pianoBarWidth, pianoBarHeight]
    );

    return (
        <>
            <pixiGraphics ref={maskRef} draw={drawMask} />
            <pixiContainer
                y={meterBarHeight - vertScrollAmount}
                mask={maskRef?.current}
            >
                <pixiGraphics draw={drawPianoBar} />
            </pixiContainer>
        </>
    );
}
