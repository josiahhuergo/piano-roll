import { useDispatch, useSelector } from "react-redux";
import { useApplication } from "@pixi/react";
import {
    selectAllNotes,
    selectBeatWidth,
    selectLaneHeight,
    selectMaxPitch,
    selectMinPitch,
    selectSnap,
    selectSelectedNoteIds,
} from "../../store/selectors";
import { useCallback, useEffect, useRef } from "react";
import type { Note } from "../../types";
import type { Container, FederatedPointerEvent, Graphics } from "pixi.js";
import { clamp, snapRound } from "../../helpers";
import {
    clearSelection,
    deleteNote,
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
    const selectedNoteIds = useSelector(selectSelectedNoteIds);
    const beatWidth = useSelector(selectBeatWidth);
    const laneHeight = useSelector(selectLaneHeight);
    const minPitch = useSelector(selectMinPitch);
    const maxPitch = useSelector(selectMaxPitch);
    const snapAmt = useSelector(selectSnap);

    const dragStateRef = useRef({
        isDragging: false,
        draggedNoteIds: new Set<string>(),
        initialMousePos: { x: 0, y: 0 },
        initialNotePositions: new Map<
            string,
            { pitch: number; onset: number; duration: number }
        >(),
        currentNotes: new Map<string, Note>(),
    });

    // Sync draggedNoteIds with Redux selection when not dragging
    useEffect(() => {
        const dragState = dragStateRef.current;
        if (!dragState.isDragging) {
            dragState.draggedNoteIds = new Set(selectedNoteIds);
        }
    }, [selectedNoteIds]);

    useEffect(() => {
        const noteMap = new Map();
        allNotes.forEach((note) => noteMap.set(note.id, note));
        dragStateRef.current.currentNotes = noteMap;
    }, [allNotes]);

    const noteGraphicsRefs = useRef<Map<string, Graphics>>(new Map());
    const noteContainerRefs = useRef<Map<string, Container>>(new Map());

    const resolveNoteCollisions = useCallback((movedNoteIds: Set<string>) => {
        const dragState = dragStateRef.current;
        const updates: Array<{ id: string; changes: Partial<Note> }> = [];
        const deletions: Array<string> = [];

        const movedNotes = Array.from(movedNoteIds)
            .map((id) => dragState.currentNotes.get(id))
            .filter(Boolean) as Note[];

        const unselectedNotes = Array.from(
            dragState.currentNotes.values()
        ).filter((note) => !movedNoteIds.has(note.id));

        movedNotes.forEach((movedNote) => {
            unselectedNotes.forEach((unselectedNote) => {
                if (movedNote.pitch === unselectedNote.pitch) {
                    const movedNoteEnd = movedNote.onset + movedNote.duration;
                    const unselectedNoteEnd =
                        unselectedNote.onset + unselectedNote.duration;

                    if (
                        movedNote.onset > unselectedNote.onset &&
                        movedNote.onset < unselectedNoteEnd
                    ) {
                        const newDuration =
                            movedNote.onset - unselectedNote.onset;
                        if (newDuration > 0) {
                            updates.push({
                                id: unselectedNote.id,
                                changes: { duration: newDuration },
                            });

                            const cachedNote = dragState.currentNotes.get(
                                unselectedNote.id
                            );
                            if (cachedNote) {
                                dragState.currentNotes.set(unselectedNote.id, {
                                    ...cachedNote,
                                    duration: newDuration,
                                });
                            }
                        } else {
                            deletions.push(unselectedNote.id);
                        }
                    }

                    if (
                        unselectedNote.onset >= movedNote.onset &&
                        unselectedNote.onset < movedNoteEnd
                    ) {
                        deletions.push(unselectedNote.id);
                    }
                }
            });
        });

        return { updates, deletions };
    }, []);

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

            // Note outline - check if selected
            const isSelected = dragState.draggedNoteIds.has(noteId);
            if (isSelected) {
                graphics.stroke({ width: 1, color: 0xffffff });
            } else {
                graphics.stroke({ width: 1, color: 0x000000 });
            }
        });
    }, [beatWidth, laneHeight]);

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

    const handlePointerMovePos = useCallback(
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
                const newOnset = snapRound(
                    Math.max(0, initialPos.onset + deltaOnset),
                    snapAmt
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
        },
        [beatWidth, laneHeight, minPitch, maxPitch, snapAmt]
    );

    const handlePointerUpPos = useCallback(() => {
        const dragState = dragStateRef.current;

        const { updates, deletions } = resolveNoteCollisions(
            dragState.draggedNoteIds
        );

        updates.forEach((update) => {
            dispatch(updateNote(update));
        });

        deletions.forEach((noteId) => {
            dispatch(deleteNote({ id: noteId }));
        });

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
        dragState.initialNotePositions.clear();

        stage.off("pointermove", handlePointerMovePos);
        stage.off("pointerup", handlePointerUpPos);
        stage.off("pointerupoutside", handlePointerUpPos);
    }, [stage, handlePointerMovePos, dispatch, resolveNoteCollisions]);

    const startDragPos = useCallback(
        (targetNote: Note, event: FederatedPointerEvent) => {
            // Use current draggedNoteIds which is synced with Redux
            const isTargetSelected = dragStateRef.current.draggedNoteIds.has(
                targetNote.id
            );

            const selected = Array.from(dragStateRef.current.draggedNoteIds)
                .map((id) => dragStateRef.current.currentNotes.get(id)!)
                .filter(Boolean);

            const notesToDrag = isTargetSelected ? selected : [targetNote];

            dragStateRef.current = {
                isDragging: true,
                draggedNoteIds: new Set(notesToDrag.map((n) => n.id)),
                initialMousePos: { x: event.globalX, y: event.globalY },
                initialNotePositions: new Map(
                    notesToDrag.map((n) => [
                        n.id,
                        {
                            pitch: n.pitch,
                            onset: n.onset,
                            duration: n.duration,
                        },
                    ])
                ),
                currentNotes: dragStateRef.current.currentNotes,
            };

            stage.on("pointermove", handlePointerMovePos);
            stage.on("pointerup", handlePointerUpPos);
            stage.on("pointerupoutside", handlePointerUpPos);
        },
        [stage, handlePointerMovePos, handlePointerUpPos]
    );

    const handlePointerMoveDur = useCallback(
        (event: FederatedPointerEvent) => {
            const dragState = dragStateRef.current;
            if (!dragState.isDragging) return;

            const deltaX = event.globalX - dragState.initialMousePos.x;
            const deltaDuration = snapRound(deltaX / beatWidth, snapAmt);

            // Update positions in cache
            dragState.draggedNoteIds.forEach((noteId) => {
                const initialPos = dragState.initialNotePositions.get(noteId);
                if (!initialPos) return;

                const newDuration = Math.max(
                    snapAmt,
                    initialPos.duration + deltaDuration
                );

                // Update cached note data
                let cachedNote = dragState.currentNotes.get(noteId);
                if (cachedNote) {
                    const newNote = {
                        ...cachedNote,
                        duration: newDuration,
                    };
                    dragState.currentNotes.set(noteId, newNote);
                }
            });

            // Redraw notes with new duration
            redrawDraggedNotes();
        },
        [beatWidth, snapAmt, redrawDraggedNotes]
    );

    const handlePointerUpDur = useCallback(() => {
        const dragState = dragStateRef.current;

        dragState.draggedNoteIds.forEach((noteId) => {
            const note = dragState.currentNotes.get(noteId)!;

            dispatch(
                updateNote({
                    id: note.id,
                    changes: { duration: note.duration },
                })
            );
        });

        dragState.isDragging = false;
        dragState.initialNotePositions.clear();

        stage.off("pointermove", handlePointerMoveDur);
        stage.off("pointerup", handlePointerUpDur);
        stage.off("pointerupoutside", handlePointerUpDur);
    }, [stage, handlePointerMoveDur, dispatch]);

    const startDragDur = useCallback(
        (event: FederatedPointerEvent) => {
            const selected = Array.from(dragStateRef.current.draggedNoteIds)
                .map((id) => dragStateRef.current.currentNotes.get(id)!)
                .filter(Boolean);

            dragStateRef.current = {
                isDragging: true,
                draggedNoteIds: dragStateRef.current.draggedNoteIds,
                initialMousePos: { x: event.globalX, y: event.globalY },
                initialNotePositions: new Map(
                    selected.map((n) => [
                        n.id,
                        {
                            pitch: n.pitch,
                            onset: n.onset,
                            duration: n.duration,
                        },
                    ])
                ),
                currentNotes: dragStateRef.current.currentNotes,
            };

            stage.on("pointermove", handlePointerMoveDur);
            stage.on("pointerup", handlePointerUpDur);
            stage.on("pointerupoutside", handlePointerUpDur);
        },
        [stage, handlePointerMoveDur, handlePointerUpDur]
    );

    const handleNoteSelect = useCallback(
        (targetNote: Note, isShiftDown: boolean) => {
            const dragState = dragStateRef.current;

            const isTargetSelected = dragState.draggedNoteIds.has(
                targetNote.id
            );

            if (isShiftDown && isTargetSelected) {
                // Deselect
                dragState.draggedNoteIds.delete(targetNote.id);
                dispatch(deselectNote({ id: targetNote.id }));
            } else if (isShiftDown && !isTargetSelected) {
                // Add to selection
                dragState.draggedNoteIds.add(targetNote.id);
                dispatch(selectNote({ id: targetNote.id }));
            } else if (!isShiftDown && !isTargetSelected) {
                // Replace selection
                dragState.draggedNoteIds.clear();
                dragState.draggedNoteIds.add(targetNote.id);
                dispatch(clearSelection());
                dispatch(selectNote({ id: targetNote.id }));
            }
            // If !isShiftDown && isTargetSelected, do nothing (about to drag)
        },
        [dispatch]
    );

    return {
        dragStateRef,
        startDragPos,
        startDragDur,
        handleNoteSelect,
        registerNoteGraphics,
        registerNoteContainer,
    };
}

export default function Notes() {
    const {
        startDragPos,
        startDragDur,
        handleNoteSelect,
        registerNoteGraphics,
        registerNoteContainer,
    } = useNoteInteraction();

    const allNotes = useSelector(selectAllNotes);

    const notes = allNotes.map((note) => (
        <NoteComponent
            key={note.id}
            note={note}
            onStartDragPos={startDragPos}
            onStartDragDur={startDragDur}
            onSelect={handleNoteSelect}
            registerGraphics={registerNoteGraphics}
            registerContainer={registerNoteContainer}
        />
    ));

    return <>{notes}</>;
}
