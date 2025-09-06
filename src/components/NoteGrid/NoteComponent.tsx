import type { Container, FederatedPointerEvent, Graphics } from "pixi.js";
import type { Note } from "../../types";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import {
    selectBeatWidth,
    selectIsNoteSelected,
    selectLaneHeight,
    selectMaxPitch,
} from "../../store/selectors";

interface NoteComponentProps {
    note: Note;
    onStartDrag: (note: Note, event: FederatedPointerEvent) => void;
    onSelect: (note: Note, isShiftDown: boolean) => void;
    registerGraphics: (noteId: string, graphics: Graphics | null) => void;
    registerContainer: (noteId: string, container: Container | null) => void;
}

export default function NoteComponent({
    note,
    onStartDrag,
    onSelect,
    registerGraphics,
    registerContainer,
}: NoteComponentProps) {
    const beatWidth = useSelector(selectBeatWidth);
    const laneHeight = useSelector(selectLaneHeight);
    const maxPitch = useSelector(selectMaxPitch);
    const isNoteSelected = useSelector(selectIsNoteSelected(note.id));

    const handlePointerDown = useCallback(
        (event: FederatedPointerEvent) => {
            onSelect(note, event.shiftKey);

            onStartDrag(note, event);
        },
        [note, onSelect, onStartDrag]
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

    const zIndex = isNoteSelected ? 1 : 0;

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
                onPointerDown={handlePointerDown}
                zIndex={zIndex}
            />
        </pixiContainer>
    );
}
