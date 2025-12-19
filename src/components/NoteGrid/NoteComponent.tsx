import { Graphics, type Container, type FederatedPointerEvent } from "pixi.js";
import type { Note } from "../../types";
import { useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import {
    selectBeatWidth,
    selectIsNoteSelected,
    selectLaneHeight,
    selectMaxPitch,
} from "../../store/selectors";

function DragHandle({
    note,
    onStartDragDur,
    onSelect,
}: {
    note: Note;
    onStartDragDur: (event: FederatedPointerEvent) => void;
    onSelect: (note: Note, isShiftDown: boolean) => void;
}) {
    const laneHeight = useSelector(selectLaneHeight);
    const beatWidth = useSelector(selectBeatWidth);
    const dragSize = useRef(10);
    const ref = useRef(new Graphics());

    const x = note.duration * beatWidth - dragSize.current / 2;

    const draw = useCallback(
        (graphics: Graphics) => {
            graphics.rect(0, 0, dragSize.current, laneHeight).fill("white");
            graphics.alpha = 0;
        },
        [laneHeight]
    );

    const handlePointerDown = useCallback(
        (event: FederatedPointerEvent) => {
            onSelect(note, event.shiftKey);
            onStartDragDur(event);

            event.stopPropagation();
        },
        [note]
    );

    const onPointerOver = useCallback((event: FederatedPointerEvent) => {
        ref.current.cursor = "ew-resize";
    }, []);

    return (
        <pixiContainer x={x}>
            <pixiGraphics
                ref={ref}
                draw={draw}
                onPointerDown={handlePointerDown}
                onPointerOver={onPointerOver}
                eventMode="dynamic"
            />
        </pixiContainer>
    );
}

interface NoteComponentProps {
    note: Note;
    onStartDragPos: (note: Note, event: FederatedPointerEvent) => void;
    onStartDragDur: (event: FederatedPointerEvent) => void;
    onSelect: (note: Note, isShiftDown: boolean) => void;
    registerGraphics: (noteId: string, graphics: Graphics | null) => void;
    registerContainer: (noteId: string, container: Container | null) => void;
}

export default function NoteComponent({
    note,
    onStartDragPos,
    onStartDragDur,
    onSelect,
    registerGraphics,
    registerContainer,
}: NoteComponentProps) {
    const beatWidth = useSelector(selectBeatWidth);
    const laneHeight = useSelector(selectLaneHeight);
    const maxPitch = useSelector(selectMaxPitch);
    const isNoteSelected = useSelector(selectIsNoteSelected(note.id));

    const handleNoteMove = useCallback(
        (event: FederatedPointerEvent) => {
            onSelect(note, event.shiftKey);

            onStartDragPos(note, event);
        },
        [note, onSelect, onStartDragPos]
    );

    const draw = useCallback(
        (graphics: Graphics) => {
            graphics.clear();

            graphics
                .rect(0, 0, note.duration * beatWidth, laneHeight)
                .fill(0x666666);

            if (isNoteSelected) {
                graphics.stroke({ width: 1, color: 0xffffff });
            } else {
                graphics.stroke({ width: 1, color: 0x000000 });
            }
        },
        [note, beatWidth, laneHeight, isNoteSelected]
    );

    const containerRef = useCallback(
        (container: Container | null) => {
            registerContainer(note.id, container);
        },
        [note, registerContainer]
    );

    const graphicsRef = useCallback(
        (graphics: Graphics | null) => {
            registerGraphics(note.id, graphics);
        },
        [note, registerGraphics]
    );

    return (
        <pixiContainer
            x={note.onset * beatWidth}
            y={(maxPitch - note.pitch) * laneHeight}
            ref={containerRef}
        >
            <pixiGraphics
                ref={graphicsRef}
                draw={draw}
                eventMode="static"
                onPointerDown={handleNoteMove}
            />
            <DragHandle
                note={note}
                onStartDragDur={onStartDragDur}
                onSelect={onSelect}
            />
        </pixiContainer>
    );
}
