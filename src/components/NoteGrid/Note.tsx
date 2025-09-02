import type { FederatedPointerEvent, Graphics } from "pixi.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { useApplication } from "@pixi/react";
import type { NoteUI } from "../../types";
import { useDispatch } from "react-redux";
import {
    deselectAllNotes,
    moveSelectedNotes,
    selectNote,
    store,
} from "../../store";
import { selectSelectedNotes } from "../../store/selectors";

export default function Note({
    note,
    beatWidth,
    laneHeight,
    maxPitch,
}: {
    note: NoteUI;
    beatWidth: number;
    laneHeight: number;
    maxPitch: number;
}) {
    const dispatch = useDispatch();

    const [isShiftPressed, setIsShiftPressed] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Shift") {
                setIsShiftPressed(true);
            }
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            if (event.key === "Shift") {
                setIsShiftPressed(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    const draw = useCallback(
        (graphics: Graphics) => {
            graphics.clear();

            graphics
                .rect(
                    note.onset * beatWidth,
                    (maxPitch - note.pitch) * laneHeight,
                    note.duration * beatWidth,
                    laneHeight
                )
                .fill(0x666666);

            if (note.selected) {
                graphics.stroke("0xffffff");
            } else {
                graphics.stroke("0x000000");
            }
        },
        [note, beatWidth, laneHeight, maxPitch]
    );

    const app = useApplication();
    const stage = app.app.stage;

    const isDragging = useRef(false);
    const clickMousePos = useRef({ x: 0, y: 0 });
    const initialNotePositions = useRef<
        Array<{ id: number; pitch: number; onset: number }>
    >([]);

    const onPointerMove = useCallback(
        (event: FederatedPointerEvent) => {
            if (
                !isDragging.current ||
                initialNotePositions.current.length === 0
            )
                return;

            const deltaX = event.globalX - clickMousePos.current.x;
            const deltaY = event.globalY - clickMousePos.current.y;

            const beatDelta = Math.round(deltaX / beatWidth);
            const pitchDelta = -Math.round(deltaY / laneHeight);

            const updates = initialNotePositions.current.map((note) => ({
                id: note.id,
                pitch: Math.max(0, Math.min(127, note.pitch + pitchDelta)),
                onset: Math.max(0, note.onset + beatDelta),
            }));

            dispatch(moveSelectedNotes(updates));
        },
        [dispatch, beatWidth, laneHeight]
    );

    const onPointerUp = useCallback(() => {
        isDragging.current = false;
        initialNotePositions.current = [];

        stage.off("pointermove", onPointerMove);
        stage.off("pointerup", onPointerUp);
        stage.off("pointerupoutside", onPointerUp);
    }, [stage, onPointerMove]);

    const zIndex = note.selected ? 1 : 0;

    const onPointerDown = useCallback(
        (event: FederatedPointerEvent) => {
            // Note selection
            if (!isShiftPressed) {
                dispatch(deselectAllNotes());
            }
            dispatch(
                selectNote({
                    id: note.id,
                })
            );

            // Note moving
            isDragging.current = true;
            clickMousePos.current = { x: event.globalX, y: event.globalY };

            const currentState = store.getState();
            const currentlySelectedNotes = selectSelectedNotes({
                notes: currentState.notes,
            });

            // Now this works correctly!
            initialNotePositions.current = currentlySelectedNotes.map(
                (note) => ({
                    id: note.id,
                    onset: note.onset,
                    pitch: note.pitch,
                })
            );

            stage.on("pointermove", onPointerMove);
            stage.on("pointerup", onPointerUp);
            stage.on("pointerupoutside", onPointerUp);
        },
        [dispatch, isShiftPressed, stage, note, onPointerMove, onPointerUp]
    );

    return (
        <pixiGraphics
            draw={draw}
            onPointerDown={onPointerDown}
            zIndex={zIndex}
        />
    );
}
