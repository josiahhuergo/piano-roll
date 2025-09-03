import type { FederatedPointerEvent, Graphics } from "pixi.js";
import { remap } from "../../helpers";
import { useApplication } from "@pixi/react";
import { useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    selectMeterBarHeight,
    selectNoteGridDimensions,
    selectScrollBarThickness,
    selectTotalHeight,
    selectVertScrollAmount,
    selectVertScrollBarDimensions,
} from "../../store/selectors";
import { setVertScroll } from "../../store";

function Background() {
    const scrollBarThickness = useSelector(selectScrollBarThickness);
    const { noteGridHeight } = useSelector(selectNoteGridDimensions);

    const draw = useCallback(
        (graphics: Graphics) => {
            graphics.clear();
            graphics
                .rect(0, 0, scrollBarThickness, noteGridHeight)
                .fill(0x151515);
        },
        [scrollBarThickness, noteGridHeight]
    );

    return <pixiGraphics draw={draw} />;
}

function Bar() {
    const dispatch = useDispatch();

    const { vertScrollBarY, vertScrollBarWidth, vertScrollBarHeight } =
        useSelector(selectVertScrollBarDimensions);

    const vertScrollAmount = useSelector(selectVertScrollAmount);
    const totalHeight = useSelector(selectTotalHeight);
    const { noteGridHeight } = useSelector(selectNoteGridDimensions);

    const app = useApplication();
    const stage = app.app.stage;

    const draw = useCallback(
        (graphics: Graphics) => {
            graphics.clear();
            graphics
                .rect(0, 0, vertScrollBarWidth, vertScrollBarHeight)
                .fill(0x666666);
        },
        [vertScrollBarWidth, vertScrollBarHeight]
    );

    const isDragging = useRef(false);
    const clickVertScrollAmt = useRef(0);
    const clickMouseY = useRef(0);

    const onPointerMove = useCallback(
        (event: FederatedPointerEvent) => {
            if (!isDragging.current) return;

            const scrollAmount =
                clickVertScrollAmt.current +
                remap(
                    event.globalY - clickMouseY.current,
                    0,
                    noteGridHeight - vertScrollBarHeight,
                    0,
                    totalHeight - noteGridHeight
                );

            dispatch(setVertScroll({ scrollAmount }));
        },
        [dispatch, noteGridHeight, vertScrollBarHeight, totalHeight]
    );

    const onPointerUp = useCallback(() => {
        if (!isDragging) return;

        isDragging.current = false;

        stage.off("pointermove", onPointerMove);
        stage.off("pointerup", onPointerUp);
        stage.off("pointerupoutside", onPointerUp);
    }, [stage, onPointerMove]);

    const onPointerDown = useCallback(
        (event: FederatedPointerEvent) => {
            isDragging.current = true;
            clickVertScrollAmt.current = vertScrollAmount;
            clickMouseY.current = event.globalY;

            stage.on("pointermove", onPointerMove);
            stage.on("pointerup", onPointerUp);
            stage.on("pointerupoutside", onPointerUp);
        },
        [stage, vertScrollAmount, onPointerMove, onPointerUp]
    );

    return (
        <pixiContainer y={vertScrollBarY}>
            <pixiGraphics
                draw={draw}
                eventMode="static"
                onPointerDown={onPointerDown}
            />
        </pixiContainer>
    );
}

export default function VertScrollBar() {
    const { vertScrollBarX } = useSelector(selectVertScrollBarDimensions);
    const meterBarHeight = useSelector(selectMeterBarHeight);

    return (
        <pixiContainer x={vertScrollBarX} y={meterBarHeight}>
            <Background />
            <Bar />
        </pixiContainer>
    );
}
