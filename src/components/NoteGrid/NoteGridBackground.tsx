import { useCallback, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    selectAllNotes,
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
import { addNote, clearSelection, selectNote, setStartTimeBeats } from "../../store";
import { useDoubleClick } from "../../hooks";
import { useApplication } from "@pixi/react";
import type { Note } from "../../types";

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

    return <pixiGraphics draw={draw}></pixiGraphics>;
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

function SelectionBox({ 
    startX, 
    startY, 
    endX, 
    endY 
}: { 
    startX: number; 
    startY: number; 
    endX: number; 
    endY: number;
}) {
    const draw = useCallback(
        (graphics: Graphics) => {
            graphics.clear();
            
            const x = Math.min(startX, endX);
            const y = Math.min(startY, endY);
            const width = Math.abs(endX - startX);
            const height = Math.abs(endY - startY);
            
            // Draw semi-transparent fill
            graphics.rect(x, y, width, height).fill({ color: 0x4a90e2, alpha: 0.2 });
            
            // Draw border
            graphics.rect(x, y, width, height).stroke({ color: 0x4a90e2, width: 1 });
        },
        [startX, startY, endX, endY]
    );

    return <pixiGraphics draw={draw} />;
}

export default function NoteGridBackground() {
    const dispatch = useDispatch();
    const app = useApplication();
    const stage = app.app.stage;

    const laneHeight = useSelector(selectLaneHeight);
    const beatWidth = useSelector(selectBeatWidth);
    const maxPitch = useSelector(selectMaxPitch);
    const allNotes = useSelector(selectAllNotes);

    const { noteGridX, noteGridY } = useSelector(selectNoteGridDimensions);
    const scrollX = useSelector(selectHoriScrollAmount);
    const scrollY = useSelector(selectVertScrollAmount);

    const snapAmt = useSelector(selectSnap);

    // Selection box state
    const [selectionBox, setSelectionBox] = useState<{
        startX: number;
        startY: number;
        endX: number;
        endY: number;
    } | null>(null);
    
    const isDraggingBox = useRef(false);
    const selectionStartPos = useRef({ x: 0, y: 0 });
    const isShiftPressed = useRef(false);

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
            snapAmt,
        ]
    );

    const handleBoxDrag = useCallback(
        (event: FederatedPointerEvent) => {
            if (!isDraggingBox.current) return;

            const currentX = event.globalX - noteGridX + scrollX;
            const currentY = event.globalY - noteGridY + scrollY;

            setSelectionBox({
                startX: selectionStartPos.current.x,
                startY: selectionStartPos.current.y,
                endX: currentX,
                endY: currentY,
            });
        },
        [noteGridX, noteGridY, scrollX, scrollY]
    );

    const handleBoxEnd = useCallback(
        (event: FederatedPointerEvent) => {
            if (!isDraggingBox.current) {
                stage.off("pointermove", handleBoxDrag);
                stage.off("pointerup", handleBoxEnd);
                stage.off("pointerupoutside", handleBoxEnd);
                return;
            }

            const endX = event.globalX - noteGridX + scrollX;
            const endY = event.globalY - noteGridY + scrollY;

            const boxLeft = Math.min(selectionStartPos.current.x, endX);
            const boxRight = Math.max(selectionStartPos.current.x, endX);
            const boxTop = Math.min(selectionStartPos.current.y, endY);
            const boxBottom = Math.max(selectionStartPos.current.y, endY);

            const boxWidth = boxRight - boxLeft;
            const boxHeight = boxBottom - boxTop;

            if (boxWidth > 5 || boxHeight > 5) {
                // This is a drag selection
                if (!isShiftPressed.current) {
                    dispatch(clearSelection());
                }

                // Find notes that intersect with the selection box
                allNotes.forEach((note: Note) => {
                    const noteLeft = note.onset * beatWidth;
                    const noteRight = (note.onset + note.duration) * beatWidth;
                    const noteTop = (maxPitch - note.pitch) * laneHeight;
                    const noteBottom = noteTop + laneHeight;

                    const intersects = !(
                        noteRight < boxLeft ||
                        noteLeft > boxRight ||
                        noteBottom < boxTop ||
                        noteTop > boxBottom
                    );

                    if (intersects) {
                        dispatch(selectNote({ id: note.id }));
                    }
                });
            } else {
                // This is just a click - clear selection and set playhead
                if (!isShiftPressed.current) {
                    dispatch(clearSelection());
                }

                const newStartTimeBeats = snapRound(
                    selectionStartPos.current.x / beatWidth,
                    snapAmt
                );
                dispatch(setStartTimeBeats(newStartTimeBeats));
            }

            isDraggingBox.current = false;
            setSelectionBox(null);

            stage.off("pointermove", handleBoxDrag);
            stage.off("pointerup", handleBoxEnd);
            stage.off("pointerupoutside", handleBoxEnd);
        },
        [
            noteGridX,
            noteGridY,
            scrollX,
            scrollY,
            allNotes,
            beatWidth,
            laneHeight,
            maxPitch,
            snapAmt,
            dispatch,
            stage,
            handleBoxDrag,
        ]
    );

    const onSingleClick = useCallback(
        (event: FederatedPointerEvent) => {
            // Start selection box drag
            isDraggingBox.current = true;
            isShiftPressed.current = event.shiftKey;

            const clickX = event.globalX - noteGridX + scrollX;
            const clickY = event.globalY - noteGridY + scrollY;

            selectionStartPos.current = { x: clickX, y: clickY };
            setSelectionBox({
                startX: clickX,
                startY: clickY,
                endX: clickX,
                endY: clickY,
            });

            // Set up drag handlers
            stage.on("pointermove", handleBoxDrag);
            stage.on("pointerup", handleBoxEnd);
            stage.on("pointerupoutside", handleBoxEnd);
        },
        [noteGridX, noteGridY, scrollX, scrollY, stage, handleBoxDrag, handleBoxEnd]
    );

    const onPointerDown = useDoubleClick(onSingleClick, onDoubleClick);

    return (
        <pixiContainer onPointerDown={onPointerDown} eventMode="static">
            <KeyLanes />
            <BeatMarkers />
            <OctaveMarkers />
            <MeasureMarkers />
            {selectionBox && (
                <SelectionBox
                    startX={selectionBox.startX}
                    startY={selectionBox.startY}
                    endX={selectionBox.endX}
                    endY={selectionBox.endY}
                />
            )}
        </pixiContainer>
    );
}