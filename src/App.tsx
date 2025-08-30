import { Application } from "@pixi/react";
import { useEffect, useRef } from "react";
import PianoRoll from "./components/PianoRoll";
import { useAppStore } from "./store/store";

export default function App() {
    const { canvasSize, updateCanvasSize } = useAppStore();
    const parentDiv = useRef(null);

    useEffect(() => {
        updateCanvasSize();
    }, []);

    useEffect(() => {
        window.addEventListener("resize", updateCanvasSize);
        return () => window.removeEventListener("resize", updateCanvasSize);
    }, [updateCanvasSize]);

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
