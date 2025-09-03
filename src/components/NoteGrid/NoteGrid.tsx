import type { Graphics } from "pixi.js";
import { useCallback, useRef, type Ref } from "react";
import { useSelector } from "react-redux";
import {
    selectHoriScrollAmount,
    selectNoteGridDimensions,
    selectVertScrollAmount,
} from "../../store/selectors";
import Notes from "./Notes";
import NoteGridBackground from "./NoteGridBackground";

function NoteGridMask({ ref }: { ref: Ref<Graphics> }) {
    const { noteGridX, noteGridY, noteGridWidth, noteGridHeight } = useSelector(
        selectNoteGridDimensions
    );
    const drawMask = useCallback(
        (graphics: Graphics) => {
            graphics.clear();
            graphics
                .rect(noteGridX, noteGridY, noteGridWidth, noteGridHeight)
                .fill("black");
        },
        [noteGridX, noteGridY, noteGridWidth, noteGridHeight]
    );
    return <pixiGraphics ref={ref} draw={drawMask} />;
}

export default function NoteGrid() {
    const vertScrollAmount = useSelector(selectVertScrollAmount);
    const horiScrollAmount = useSelector(selectHoriScrollAmount);

    const { noteGridX, noteGridY } = useSelector(selectNoteGridDimensions);

    const maskRef = useRef(null);

    return (
        <>
            <NoteGridMask ref={maskRef} />
            <pixiContainer
                x={noteGridX - horiScrollAmount}
                y={noteGridY - vertScrollAmount}
                mask={maskRef?.current}
                sortableChildren={true}
            >
                <NoteGridBackground />
                <Notes />
            </pixiContainer>
        </>
    );
}
