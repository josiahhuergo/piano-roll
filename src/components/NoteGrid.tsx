import type { Graphics } from "pixi.js";
import {
    useAppStore,
    useLaneCount,
    useNoteGridHeight,
    useNoteGridWidth,
    useNoteGridX,
    useNoteGridY,
    useTotalHeight,
    useTotalWidth,
} from "../store/store";
import { pitchIsBlackKey } from "../helpers/util";
import { useCallback, useRef } from "react";

function KeyLanes() {
    const maxPitch = useAppStore((state) => state.maxPitch);
    const laneHeight = useAppStore((state) => state.laneHeight);
    const laneCount = useLaneCount();
    const totalWidth = useTotalWidth();

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
    const beatCount = useAppStore((state) => state.beatCount);
    const beatWidth = useAppStore((state) => state.beatWidth);
    const totalHeight = useTotalHeight();

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
    const laneCount = useLaneCount();
    const maxPitch = useAppStore((state) => state.maxPitch);
    const totalWidth = useTotalWidth();
    const laneHeight = useAppStore((state) => state.laneHeight);

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
    const beatCount = useAppStore((state) => state.beatCount);
    const beatWidth = useAppStore((state) => state.beatWidth);
    const totalHeight = useTotalHeight();

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
    const notesData = useAppStore((state) => state.notes);
    const beatWidth = useAppStore((state) => state.beatWidth);
    const laneHeight = useAppStore((state) => state.laneHeight);
    const maxPitch = useAppStore((state) => state.maxPitch);

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
    const pianoBarWidth = useAppStore((state) => state.pianoBarWidth);
    const timeBarHeight = useAppStore((state) => state.meterBarHeight);
    const vertScrollAmount = useAppStore((state) => state.vertScrollAmount);
    const horiScrollAmount = useAppStore((state) => state.horiScrollAmount);

    const noteGridX = useNoteGridX();
    const noteGridY = useNoteGridY();
    const noteGridWidth = useNoteGridWidth();
    const noteGridHeight = useNoteGridHeight();

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
                y={timeBarHeight - vertScrollAmount}
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
