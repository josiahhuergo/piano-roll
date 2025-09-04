import { Application } from "@pixi/react";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectCanvasSize } from "../store/selectors";
import {
    addNote,
    pressCtrl,
    pressShift,
    releaseCtrl,
    releaseShift,
    updateCanvasSize,
} from "../store";
import { useWindowEvent } from "../hooks";
import PianoRoll from "./PianoRoll";

export default function App() {
    const canvasSize = useSelector(selectCanvasSize);
    const dispatch = useDispatch();

    const parentDiv = useRef(null);

    useEffect(() => {
        // Adding notes for testing purposes
        dispatch(addNote({ pitch: 60, onset: 0, duration: 4 }));
        dispatch(addNote({ pitch: 64, onset: 1, duration: 3 }));
        dispatch(addNote({ pitch: 67, onset: 2, duration: 6 }));
        dispatch(addNote({ pitch: 71, onset: 3, duration: 5 }));
        dispatch(addNote({ pitch: 74, onset: 4, duration: 1 }));
        dispatch(addNote({ pitch: 78, onset: 5, duration: 2 }));

        dispatch(updateCanvasSize());
    }, [dispatch]);

    useWindowEvent(
        "keydown",
        (event: KeyboardEvent) => {
            switch (event.key) {
                case "Delete":
                    // dispatch(deleteSelectedNotes());
                    break;
                case "Shift":
                    event.preventDefault();
                    dispatch(pressShift());
                    break;
                case "Control":
                    event.preventDefault();
                    dispatch(pressCtrl());
                    break;
                case "Alt":
                    event.preventDefault();
                    break;
            }
        },
        [dispatch]
    );

    useWindowEvent(
        "keyup",
        (event: KeyboardEvent) => {
            switch (event.key) {
                case "Shift":
                    dispatch(releaseShift());
                    break;
                case "Control":
                    dispatch(releaseCtrl());
                    break;
            }
        },
        [dispatch]
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
