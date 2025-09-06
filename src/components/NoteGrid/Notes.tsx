import { useDispatch, useSelector } from "react-redux";
import { useApplication } from "@pixi/react";
import {
    selectAllNotes,
    selectBeatWidth,
    selectLaneHeight,
    selectMaxPitch,
    selectMinPitch,
    selectSelectedNotes,
} from "../../store/selectors";
import { useCallback, useEffect, useRef } from "react";
import type { Note } from "../../types";
import type { Container, FederatedPointerEvent, Graphics } from "pixi.js";
import { clamp } from "../../helpers";
import {
    clearSelection,
    deselectNote,
    selectNote,
    updateNote,
} from "../../store";
import NoteComponent from "./NoteComponent";

function useNoteInteraction() {
    const app = useApplication();
    const stage = app.app.stage;
    const dispatch = useDispatch();

    const allNotes = useSelector(selectAllNotes);
    const beatWidth = useSelector(selectBeatWidth);
    const laneHeight = useSelector(selectLaneHeight);
    const minPitch = useSelector(selectMinPitch);
    const maxPitch = useSelector(selectMaxPitch);
    const selectedNotes = useSelector(selectSelectedNotes);

    const dragStateRef = useRef({
        isDragging: false,
        draggedNoteIds: new Set<string>(),
        initialMousePos: { x: 0, y: 0 },
        initialNotePositions: new Map<
            string,
            { pitch: number; onset: number }
        >(),
        currentNotes: new Map<string, Note>(),
    });

    useEffect(() => {
        const noteMap = new Map();
        allNotes.forEach((note) => noteMap.set(note.id, note));
        dragStateRef.current.currentNotes = noteMap;
    }, [allNotes]);

    const noteGraphicsRefs = useRef<Map<string, Graphics>>(new Map());
    const noteContainerRefs = useRef<Map<string, Container>>(new Map());

    const redrawDraggedNotes = useCallback(() => {
        const dragState = dragStateRef.current;
        if (!dragState.isDragging) return;

        dragState.draggedNoteIds.forEach((noteId) => {
            const graphics = noteGraphicsRefs.current.get(noteId);
            const note = dragState.currentNotes.get(noteId);
            if (!graphics || !note) return;

            // Clear and redraw at new position
            graphics.clear();
            graphics
                .rect(0, 0, note.duration * beatWidth, laneHeight)
                .fill(0x666666);

            // Note outline
            const isSelected = dragState.draggedNoteIds.has(noteId);
            if (isSelected) {
                graphics.stroke({ width: 1, color: 0xffffff });
            } else {
                graphics.stroke({ width: 1, color: 0x000000 });
            }
        });
    }, [beatWidth, laneHeight]);

    const handlePointerMove = useCallback(
        (event: FederatedPointerEvent) => {
            const dragState = dragStateRef.current;
            if (!dragState.isDragging) return;

            const deltaX = event.globalX - dragState.initialMousePos.x;
            const deltaY = event.globalY - dragState.initialMousePos.y;
            const deltaOnset = deltaX / beatWidth;
            const deltaPitch = deltaY / laneHeight;

            // Update positions in cache and move containers
            dragState.draggedNoteIds.forEach((noteId) => {
                const initialPos = dragState.initialNotePositions.get(noteId);
                const noteContainer = noteContainerRefs.current.get(noteId);
                if (!initialPos || !noteContainer) return;

                const newPitch = Math.round(
                    clamp(initialPos.pitch - deltaPitch, minPitch, maxPitch)
                );
                const newOnset = Math.round(
                    Math.max(0, initialPos.onset + deltaOnset)
                );

                // Update cached note data
                let cachedNote = dragState.currentNotes.get(noteId);
                if (cachedNote) {
                    const newNote = {
                        ...cachedNote,
                        pitch: newPitch,
                        onset: newOnset,
                    };
                    dragState.currentNotes.set(noteId, newNote);
                }

                // Move container directly (no React re-render)
                noteContainer.x = newOnset * beatWidth;
                noteContainer.y = (maxPitch - newPitch) * laneHeight;
            });

            // Optional: Manually redraw if needed
            redrawDraggedNotes();
        },
        [beatWidth, laneHeight, minPitch, maxPitch]
    );

    const registerNoteGraphics = useCallback(
        (noteId: string, graphics: Graphics | null) => {
            if (graphics) {
                noteGraphicsRefs.current.set(noteId, graphics);
            } else {
                noteGraphicsRefs.current.delete(noteId);
            }
        },
        []
    );

    const registerNoteContainer = useCallback(
        (noteId: string, container: Container | null) => {
            if (container) {
                noteContainerRefs.current.set(noteId, container);
            } else {
                noteContainerRefs.current.delete(noteId);
            }
        },
        []
    );

    const handlePointerUp = useCallback(() => {
        const dragState = dragStateRef.current;

        dragState.draggedNoteIds.forEach((noteId) => {
            const note = dragState.currentNotes.get(noteId)!;

            dispatch(
                updateNote({
                    id: note.id,
                    changes: { pitch: note.pitch, onset: note.onset },
                })
            );
        });

        dragState.isDragging = false;
        dragState.draggedNoteIds.clear();
        dragState.initialNotePositions.clear();

        stage.off("pointermove", handlePointerMove);
        stage.off("pointerup", handlePointerUp);
        stage.off("pointerupoutside", handlePointerUp);
    }, [stage, handlePointerMove]);

    const startDrag = useCallback(
        (targetNote: Note, event: FederatedPointerEvent) => {
            const isTargetSelected = selectedNotes.some(
                (n) => n.id === targetNote.id
            );
            const notesToDrag = isTargetSelected ? selectedNotes : [targetNote];

            dragStateRef.current = {
                isDragging: true,
                draggedNoteIds: new Set(notesToDrag.map((n) => n.id)),
                initialMousePos: { x: event.globalX, y: event.globalY },
                initialNotePositions: new Map(
                    notesToDrag.map((n) => [
                        n.id,
                        { pitch: n.pitch, onset: n.onset },
                    ])
                ),
                currentNotes: dragStateRef.current.currentNotes,
            };

            stage.on("pointermove", handlePointerMove);
            stage.on("pointerup", handlePointerUp);
            stage.on("pointerupoutside", handlePointerUp);
        },
        [selectedNotes, stage, handlePointerMove, handlePointerUp]
    );

    const handleNoteSelect = useCallback(
        (targetNote: Note, isShiftDown: boolean) => {
            const isTargetSelected = selectedNotes.some(
                (n) => n.id === targetNote.id
            );

            if (isShiftDown && isTargetSelected) {
                dispatch(deselectNote({ id: targetNote.id }));
            } else if (isShiftDown && !isTargetSelected) {
                dispatch(selectNote({ id: targetNote.id }));
            } else if (!isShiftDown && !isTargetSelected) {
                dispatch(clearSelection());
                dispatch(selectNote({ id: targetNote.id }));
            }
        },
        [selectedNotes, dispatch]
    );

    return {
        dragStateRef,
        startDrag,
        handleNoteSelect,
        registerNoteGraphics,
        registerNoteContainer,
    };
}

export default function Notes() {
    const {
        dragStateRef,
        startDrag,
        handleNoteSelect,
        registerNoteGraphics,
        registerNoteContainer,
    } = useNoteInteraction();

    const notes = Array.from(dragStateRef.current.currentNotes.values()).map(
        (note) => (
            <NoteComponent
                key={note.id}
                note={note}
                onStartDrag={startDrag}
                onSelect={handleNoteSelect}
                registerGraphics={registerNoteGraphics}
                registerContainer={registerNoteContainer}
            />
        )
    );

    return <>{notes}</>;
}
