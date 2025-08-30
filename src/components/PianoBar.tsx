import type { Graphics } from "pixi.js";
import {
    useAppStore,
    useLaneCount,
    usePianoBarHeight,
    usePianoBarX,
    usePianoBarY,
} from "../store/store";
import { pitchIsBlackKey } from "../helpers/util";
import { useCallback, useRef } from "react";

export default function PianoBar() {
    const maxPitch = useAppStore((state) => state.maxPitch);
    const laneHeight = useAppStore((state) => state.laneHeight);
    const laneCount = useLaneCount();
    const timeBarHeight = useAppStore((state) => state.meterBarHeight);
    const verticalScrollAmount = useAppStore((state) => state.vertScrollAmount);

    const pianoBarX = usePianoBarX();
    const pianoBarY = usePianoBarY();
    const pianoBarWidth = useAppStore((state) => state.pianoBarWidth);
    const pianoBarHeight = usePianoBarHeight();

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
                y={timeBarHeight - verticalScrollAmount}
                mask={maskRef?.current}
            >
                <pixiGraphics draw={drawPianoBar} />
            </pixiContainer>
        </>
    );
}
