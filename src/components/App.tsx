import { Application } from "@pixi/react";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    selectAllNotes,
    selectCanvasSize,
    selectSelectedNotes,
} from "../store/selectors";
import { deleteNote, updateCanvasSize } from "../store";
import { useWindowEvent } from "../hooks";
import PianoRoll from "./PianoRoll";
import { Synth } from "../services/synth";
import { selectStartTimeBeats } from "../store/selectors/transportSelectors";

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
        dispatch(updateCanvasSize());
    }, [dispatch]);

    const selectedNotes = useSelector(selectSelectedNotes);
    const allNotes = useSelector(selectAllNotes);
    const startTimeInBeats = useSelector(selectStartTimeBeats);

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
            }
        },
        [dispatch, selectedNotes, allNotes]
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
