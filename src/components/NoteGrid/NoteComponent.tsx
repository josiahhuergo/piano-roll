import type { FederatedPointerEvent, Graphics } from "pixi.js";
import { useCallback, useEffect, useRef } from "react";
import { useApplication } from "@pixi/react";
import type { Note } from "../../types";
import { useDispatch, useSelector } from "react-redux";
import {
    clearSelection,
    deselectNote,
    selectNote,
    updateNote,
} from "../../store";
import {
    selectBeatWidth,
    selectIsDragging,
    selectIsNoteSelected,
    selectIsShiftDown,
    selectLaneHeight,
    selectMaxPitch,
    selectMinPitch,
    selectMouseDownPos,
    selectSelectedNotes,
} from "../../store/selectors";
import { clamp } from "../../helpers";

const useNoteInteraction = (note: Note) => {
    const app = useApplication();
    const stage = app.app.stage;

    const dispatch = useDispatch();

    const mouseDownPos = useSelector(selectMouseDownPos);
    const isDragging = useSelector(selectIsDragging);
    const isShiftDown = useSelector(selectIsShiftDown);

    const beatWidth = useSelector(selectBeatWidth);
    const laneHeight = useSelector(selectLaneHeight);
    const minPitch = useSelector(selectMinPitch);
    const maxPitch = useSelector(selectMaxPitch);

    const isNoteSelected = useSelector(selectIsNoteSelected(note.id));
    const selectedNotes = useSelector(selectSelectedNotes);

    const onPointerMove = useCallback(
        (event: FederatedPointerEvent) => {
            if (!isDragging) return;

            const deltaOnset = (event.globalX - mouseDownPos.x) / beatWidth;
            const deltaPitch = (event.globalY - mouseDownPos.y) / laneHeight;

            selectedNotes.forEach((note) => {
                const newPitch = clamp(
                    note.pitch - deltaPitch,
                    minPitch,
                    maxPitch
                );
                const newOnset = Math.max(0, note.onset + deltaOnset);

                dispatch(
                    updateNote({
                        id: note.id,
                        changes: { pitch: newPitch, onset: newOnset },
                    })
                );
            });
        },
        [dispatch, beatWidth, laneHeight, isDragging, minPitch, maxPitch]
    );

    const onPointerUp = useCallback(() => {
        stage.off("pointermove", onPointerMove);
        stage.off("pointerup", onPointerUp);
        stage.off("pointerupoutside", onPointerUp);
    }, [stage, onPointerMove]);

    const onPointerDown = useCallback(() => {
        if (isShiftDown && isNoteSelected) {
            dispatch(deselectNote({ id: note.id }));
        }
        if (isShiftDown && !isNoteSelected)
            dispatch(selectNote({ id: note.id }));
        if (!isShiftDown && !isNoteSelected) {
            dispatch(clearSelection());
            dispatch(selectNote({ id: note.id }));
        }

        stage.on("pointermove", onPointerMove);
        stage.on("pointerup", onPointerUp);
        stage.on("pointerupoutside", onPointerUp);
    }, [dispatch, isShiftDown, stage, note, onPointerMove, onPointerUp]);

    return onPointerDown;
};

export default function NoteComponent({ note }: { note: Note }) {
    const onPointerDown = useNoteInteraction(note);

    const beatWidth = useSelector(selectBeatWidth);
    const laneHeight = useSelector(selectLaneHeight);
    const maxPitch = useSelector(selectMaxPitch);
    const isNoteSelected = useSelector(selectIsNoteSelected(note.id));

    const draw = useCallback(
        (graphics: Graphics) => {
            graphics.clear();

            graphics
                .rect(0, 0, note.duration * beatWidth, laneHeight)
                .fill(0x666666);
            if (isNoteSelected) {
                graphics.stroke("0xffffff");
            } else {
                graphics.stroke("0x000000");
            }
        },
        [note, beatWidth, laneHeight, maxPitch, isNoteSelected]
    );

    const zIndex = isNoteSelected ? 1 : 0;

    return (
        <pixiContainer
            x={note.onset * beatWidth}
            y={(maxPitch - note.pitch) * laneHeight}
        >
            <pixiGraphics
                draw={draw}
                onPointerDown={onPointerDown}
                zIndex={zIndex}
            />
        </pixiContainer>
    );
}
