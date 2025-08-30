import { Application } from "@pixi/react";
import { useEffect, useRef } from "react";
import PianoRoll from "./components/PianoRoll";
import { useSelector } from "react-redux";
import { selectCanvasSize, store, updateCanvasSize } from "./store/store";

export default function App() {
    const canvasSize = useSelector(selectCanvasSize);

    const parentDiv = useRef(null);

    useEffect(() => {
        store.dispatch(updateCanvasSize());
    }, [store.dispatch]);

    useEffect(() => {
        const handleResize = () => store.dispatch(updateCanvasSize());

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [store.dispatch]);

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
