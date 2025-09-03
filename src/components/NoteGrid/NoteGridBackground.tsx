import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    selectBeatCount,
    selectBeatWidth,
    selectLaneCount,
    selectLaneHeight,
    selectMaxPitch,
    selectTotalHeight,
    selectTotalWidth,
} from "../../store/selectors";
import type { Graphics } from "pixi.js";
import { pitchIsBlackKey } from "../../helpers";
import { clearSelection } from "../../store";

function KeyLanes() {
    const dispatch = useDispatch();

    const maxPitch = useSelector(selectMaxPitch);
    const laneHeight = useSelector(selectLaneHeight);
    const laneCount = useSelector(selectLaneCount);
    const totalWidth = useSelector(selectTotalWidth);

    const draw = useCallback(
        (graphics: Graphics) => {
            graphics.clear();

            for (let lane = 0; lane < laneCount; lane++) {
                const pitch = maxPitch - lane;
                const color = pitchIsBlackKey(pitch) ? 0x191919 : 0x1d1d1d;

                graphics
                    .rect(0, lane * laneHeight, totalWidth, laneHeight)
                    .fill(color);

                graphics
                    .moveTo(0, lane * laneHeight)
                    .lineTo(totalWidth, lane * laneHeight)
                    .stroke({ color: 0x212121 });
            }
        },
        [laneCount, laneHeight, totalWidth]
    );

    const click = useCallback(() => dispatch(clearSelection()), [dispatch]);

    return <pixiGraphics draw={draw} onClick={click}></pixiGraphics>;
}

function BeatMarkers() {
    const beatCount = useSelector(selectBeatCount);
    const beatWidth = useSelector(selectBeatWidth);
    const totalHeight = useSelector(selectTotalHeight);

    const draw = useCallback(
        (graphics: Graphics) => {
            graphics.clear();

            for (let beat = 0; beat < beatCount; beat++) {
                if (beat % 4 != 0) {
                    graphics
                        .moveTo(beat * beatWidth, 0)
                        .lineTo(beat * beatWidth, totalHeight)
                        .stroke({ width: 1, color: 0x242424 });
                }
            }
        },
        [beatCount, beatWidth, totalHeight]
    );

    return <pixiGraphics draw={draw}></pixiGraphics>;
}

function OctaveMarkers() {
    const laneCount = useSelector(selectLaneCount);
    const maxPitch = useSelector(selectMaxPitch);
    const totalWidth = useSelector(selectTotalWidth);
    const laneHeight = useSelector(selectLaneHeight);

    const draw = useCallback(
        (graphics: Graphics) => {
            graphics.clear();

            for (let lane = 0; lane < laneCount; lane++) {
                const pitch = maxPitch - lane;
                if (pitch % 12 == 11) {
                    graphics.moveTo(0, lane * laneHeight);
                    graphics.lineTo(totalWidth, lane * laneHeight);
                    graphics.stroke({ width: 1, color: 0x303030 });
                }
            }
        },
        [laneCount, laneHeight, totalWidth]
    );

    return <pixiGraphics draw={draw}></pixiGraphics>;
}

function MeasureMarkers() {
    const beatCount = useSelector(selectBeatCount);
    const beatWidth = useSelector(selectBeatWidth);
    const totalHeight = useSelector(selectTotalHeight);

    const draw = useCallback(
        (graphics: Graphics) => {
            graphics.clear();

            for (let beat = 0; beat < beatCount; beat++) {
                if (beat % 4 == 0) {
                    graphics
                        .moveTo(beat * beatWidth, 0)
                        .lineTo(beat * beatWidth, totalHeight)
                        .stroke({ width: 1, color: 0x303030 });
                }
            }
        },
        [beatCount, beatWidth, totalHeight]
    );

    return <pixiGraphics draw={draw}></pixiGraphics>;
}

export default function NoteGridBackground() {
    return (
        <>
            <KeyLanes />
            <BeatMarkers />
            <OctaveMarkers />
            <MeasureMarkers />
        </>
    );
}
