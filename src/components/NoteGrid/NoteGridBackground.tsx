import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    selectBeatCount,
    selectBeatWidth,
    selectHoriScrollAmount,
    selectLaneCount,
    selectLaneHeight,
    selectMaxPitch,
    selectNoteGridDimensions,
    selectSnap,
    selectTotalHeight,
    selectTotalWidth,
    selectVertScrollAmount,
} from "../../store/selectors";
import type { FederatedPointerEvent, Graphics } from "pixi.js";
import { pitchIsBlackKey, snapFloor, snapRound } from "../../helpers";
import { addNote, clearSelection, setStartTimeBeats } from "../../store";
import { useDoubleClick } from "../../hooks";

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
        [laneCount, maxPitch, laneHeight, totalWidth]
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
        [laneCount, laneHeight, totalWidth, maxPitch]
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
    const dispatch = useDispatch();

    const laneHeight = useSelector(selectLaneHeight);
    const beatWidth = useSelector(selectBeatWidth);
    const maxPitch = useSelector(selectMaxPitch);

    const { noteGridX, noteGridY } = useSelector(selectNoteGridDimensions);
    const scrollX = useSelector(selectHoriScrollAmount);
    const scrollY = useSelector(selectVertScrollAmount);

    const snapAmt = useSelector(selectSnap);

    const onDoubleClick = useCallback(
        (event: FederatedPointerEvent) => {
            const clickX = event.globalX - noteGridX + scrollX;
            const clickY = event.globalY - noteGridY + scrollY;
            const pitch = Math.floor(maxPitch - clickY / laneHeight) + 1;
            const onset = snapFloor(clickX / beatWidth, snapAmt);

            dispatch(addNote({ pitch, onset, duration: 1 }));
        },
        [
            dispatch,
            maxPitch,
            laneHeight,
            beatWidth,
            noteGridX,
            noteGridY,
            scrollX,
            scrollY,
        ]
    );

    const onSingleClick = (event: FederatedPointerEvent) => {
        dispatch(clearSelection());

        const clickX = event.globalX - noteGridX + scrollX;
        const newStartTimeBeats = snapRound(clickX / beatWidth, snapAmt);
        dispatch(setStartTimeBeats(newStartTimeBeats));
    };

    const onPointerDown = useDoubleClick(onSingleClick, onDoubleClick);

    return (
        <pixiContainer onPointerDown={onPointerDown} eventMode="static">
            <KeyLanes />
            <BeatMarkers />
            <OctaveMarkers />
            <MeasureMarkers />
        </pixiContainer>
    );
}
