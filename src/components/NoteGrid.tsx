import type { Graphics } from "pixi.js";
import {
    selectBeatCount,
    selectBeatWidth,
    selectHoriScrollAmount,
    selectLaneCount,
    selectLaneHeight,
    selectMaxPitch,
    selectMeterBarHeight,
    selectNoteGridHeight,
    selectNoteGridWidth,
    selectNoteGridX,
    selectNoteGridY,
    selectNotes,
    selectPianoBarWidth,
    selectTotalHeight,
    selectTotalWidth,
    selectVertScrollAmount,
} from "../store/store";
import { pitchIsBlackKey } from "../helpers/util";
import { useCallback, useRef } from "react";
import { useSelector } from "react-redux";

function KeyLanes() {
    const maxPitch = useSelector(selectMaxPitch);
    const laneHeight = useSelector(selectLaneHeight);
    const laneCount = useSelector(selectLaneCount);
    const totalWidth = useSelector(selectTotalWidth);

    const draw = useCallback(
        (graphics: Graphics) => {
            console.log("Drawing note grid key lanes");

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

    return <pixiGraphics draw={draw}></pixiGraphics>;
}

function BeatMarkers() {
    const beatCount = useSelector(selectBeatCount);
    const beatWidth = useSelector(selectBeatWidth);
    const totalHeight = useSelector(selectTotalHeight);

    const draw = useCallback(
        (graphics: Graphics) => {
            console.log("Drawing note grid beat markers");

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
            console.log("Drawing note grid octave markers");

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
            console.log("Drawing note grid measure markers");

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

function Notes() {
    const notesData = useSelector(selectNotes);
    const beatWidth = useSelector(selectBeatWidth);
    const laneHeight = useSelector(selectLaneHeight);
    const maxPitch = useSelector(selectMaxPitch);

    const notes = notesData.map((note) => (
        <pixiGraphics
            key={note.id}
            draw={useCallback((graphics: Graphics) => {
                console.log("Drawing note grid notes");

                graphics.clear();

                graphics
                    .rect(
                        note.onset * beatWidth,
                        (maxPitch - note.pitch) * laneHeight,
                        note.duration * beatWidth,
                        laneHeight
                    )
                    .fill(0x666666);
            }, [])}
        />
    ));

    return <>{notes}</>;
}

export default function NoteGrid() {
    const pianoBarWidth = useSelector(selectPianoBarWidth);
    const meterBarHeight = useSelector(selectMeterBarHeight);
    const vertScrollAmount = useSelector(selectVertScrollAmount);
    const horiScrollAmount = useSelector(selectHoriScrollAmount);

    const noteGridX = useSelector(selectNoteGridX);
    const noteGridY = useSelector(selectNoteGridY);
    const noteGridWidth = useSelector(selectNoteGridWidth);
    const noteGridHeight = useSelector(selectNoteGridHeight);
    // The mask restricts the view of the component to a rectangular region
    const maskRef = useRef(null);
    const drawMask = useCallback(
        (graphics: Graphics) => {
            console.log("Drawing note grid mask");
            graphics.clear();
            graphics
                .rect(noteGridX, noteGridY, noteGridWidth, noteGridHeight)
                .fill("black");
        },
        [noteGridX, noteGridY, noteGridWidth, noteGridHeight]
    );

    return (
        <>
            <pixiGraphics ref={maskRef} draw={drawMask} />
            <pixiContainer
                x={pianoBarWidth - horiScrollAmount}
                y={meterBarHeight - vertScrollAmount}
                mask={maskRef?.current}
            >
                <KeyLanes />
                <BeatMarkers />
                <OctaveMarkers />
                <MeasureMarkers />
                <Notes />
            </pixiContainer>
        </>
    );
}
