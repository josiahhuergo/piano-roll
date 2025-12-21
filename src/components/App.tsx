import { Application } from "@pixi/react";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    selectAllNotes,
    selectCanvasSize,
    selectSelectedNotes,
} from "../store/selectors";
import { addNote, clearSelection, deleteNote, updateCanvasSize } from "../store";
import { useWindowEvent } from "../hooks";
import PianoRoll from "./PianoRoll";
import { Synth } from "../services/synth";
import { selectStartTimeBeats } from "../store/selectors/transportSelectors";
import type { Note } from "../types";

export default function App() {
    const canvasSize = useSelector(selectCanvasSize);
    const dispatch = useDispatch();

    const parentDiv = useRef(null);

    const synth = useRef(new Synth(120));

    useEffect(() => {
        window.addEventListener("click", async () => {
            await synth.current.startSynth();
        });
    }, []);
    useEffect(() => {
        window.addEventListener("keydown", async () => {
            await synth.current.startSynth();
        });
    }, []);

    useEffect(() => {
        const size = updateCanvasSize();
        console.log(size);
        dispatch(size);
    }, [dispatch]);

    const selectedNotes = useSelector(selectSelectedNotes);
    const allNotes = useSelector(selectAllNotes);
    const startTimeInBeats = useSelector(selectStartTimeBeats);

    // Store copied notes
    const copiedNotes = useRef<Note[]>([]);

    useWindowEvent(
        "keydown",
        (event: KeyboardEvent) => {
            if (event.key == "Delete") {
                selectedNotes.forEach((note) => {
                    dispatch(deleteNote({ id: note.id }));
                });
            } else if (event.code == "Space") {
                if (synth.current.playing) {
                    synth.current.stop();
                } else if (!synth.current.playing) {
                    synth.current.updateNotes(allNotes);
                    synth.current.play(startTimeInBeats);
                }
            } else if ((event.ctrlKey || event.metaKey) && event.key === "c") {
                // Copy selected notes
                if (selectedNotes.length > 0) {
                    copiedNotes.current = selectedNotes.map(note => ({ ...note }));
                    event.preventDefault();
                }
            } else if ((event.ctrlKey || event.metaKey) && event.key === "v") {
                // Paste notes at playhead
                if (copiedNotes.current.length > 0) {
                    // Find the earliest onset time in copied notes
                    const minOnset = Math.min(...copiedNotes.current.map(n => n.onset));
                    const offsetFromPlayhead = startTimeInBeats - minOnset;

                    // Clear current selection
                    dispatch(clearSelection());

                    // Paste notes with offset and collect their IDs to select them
                    copiedNotes.current.forEach((note) => {
                        const newOnset = note.onset + offsetFromPlayhead;
                        // The addNote action automatically selects the new note
                        dispatch(addNote({
                            pitch: note.pitch,
                            onset: newOnset,
                            duration: note.duration,
                        }));
                    });

                    event.preventDefault();
                }
            }
        },
        [dispatch, selectedNotes, allNotes, startTimeInBeats]
    );

    useWindowEvent(
        "resize",
        () => {
            dispatch(updateCanvasSize());
        },
        [dispatch]
    );

    return (
        <div
            ref={parentDiv}
            style={{
                width: `${canvasSize.width}px`,
                height: `${canvasSize.height}px`,
            }}
        >
            <Application
                resizeTo={parentDiv}
                backgroundColor={0x161616}
                eventMode="static"
            >
                <PianoRoll />
            </Application>
        </div>
    );
}