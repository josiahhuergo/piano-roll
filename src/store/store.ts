import { create } from "zustand";
import { calculateCanvasSize, clamp } from "../helpers/util";
import { createComputed } from "zustand-computed";

interface Note {
    id: number;
    pitch: number;
    onset: number;
    duration: number;
}

interface AppState {
    notes: Note[];

    canvasSize: { width: number; height: number };
    updateCanvasSize: () => void;

    scrollBarThickness: number;
    laneHeight: number;
    beatWidth: number;
    maxPitch: number;
    minPitch: number;
    beatCount: number;

    pianoBarWidth: number;
    meterBarHeight: number;

    dragging: boolean;
    setDragging: (val: boolean) => void;

    vertScrollAmount: number;
    setVertScroll: (amount: number) => void;
    verticalScroll: (delta: number) => void;
    isVertOverflow: () => boolean;

    horiScrollAmount: number;
    setHoriScroll: (amount: number) => void;
    horizontalScroll: (delta: number) => void;
    isHoriOverflow: () => boolean;
}

export const useAppStore = create<AppState>((set, get) => ({
    notes: [
        { id: 0, pitch: 60, onset: 0, duration: 4 },
        { id: 1, pitch: 64, onset: 0, duration: 4 },
        { id: 2, pitch: 71, onset: 0, duration: 4 },
        { id: 3, pitch: 84, onset: 5, duration: 1 },
        { id: 4, pitch: 83, onset: 6, duration: 1 },
        { id: 5, pitch: 79, onset: 7, duration: 2 },
    ],

    canvasSize: calculateCanvasSize(),

    updateCanvasSize: () => {
        set({ canvasSize: calculateCanvasSize() });
    },

    scrollBarThickness: 12,
    laneHeight: 19,
    beatWidth: 80,
    maxPitch: 108,
    minPitch: 21,
    beatCount: 100,

    pianoBarWidth: 80,
    meterBarHeight: 20,

    dragging: false,
    setDragging: (val) => {
        set({ dragging: val });
    },

    // VertScrollBar
    vertScrollAmount: 0,
    setVertScroll: (amount) => {
        const totalHeight = useTotalHeight();
        const noteGridHeight = useNoteGridHeight();

        set(() => {
            return {
                vertScrollAmount: clamp(
                    amount,
                    0,
                    totalHeight - noteGridHeight
                ),
            };
        });
    },
    verticalScroll: (delta) => {
        const totalHeight = useTotalHeight();
        const noteGridHeight = useNoteGridHeight();

        set((state) => {
            return {
                vertScrollAmount: clamp(
                    state.vertScrollAmount + delta,
                    0,
                    totalHeight - noteGridHeight
                ),
            };
        });
    },
    isVertOverflow: () => {
        const totalHeight = useTotalHeight();

        if (totalHeight > get().canvasSize.height) {
            return true;
        } else {
            return false;
        }
    },

    // HoriScrollBar
    horiScrollAmount: 0,
    setHoriScroll: (amount) => {
        const totalWidth = useTotalWidth();
        const noteGridWidth = useNoteGridWidth();

        set(() => {
            return {
                horiScrollAmount: clamp(amount, 0, totalWidth - noteGridWidth),
            };
        });
    },
    horizontalScroll: (delta) => {
        const totalWidth = useTotalWidth();
        const noteGridWidth = useNoteGridWidth();

        set((state) => {
            return {
                horiScrollAmount: clamp(
                    state.horiScrollAmount + delta,
                    0,
                    totalWidth - noteGridWidth
                ),
            };
        });
    },
    isHoriOverflow: () => {
        const totalWidth = useTotalWidth();

        if (totalWidth > get().canvasSize.width) {
            return true;
        } else {
            return false;
        }
    },
}));

export const useLaneCount = () =>
    useAppStore((state) => state.maxPitch - state.minPitch + 1);

export const useTotalWidth = () =>
    useAppStore((state) => state.beatCount * state.beatWidth);

export const useTotalHeight = () => {
    const laneCount = useLaneCount();
    const laneHeight = useAppStore((state) => state.laneHeight);
    return laneCount * laneHeight;
};

//------ NOTEGRID ---------

export const useNoteGridX = () => useAppStore((state) => state.pianoBarWidth);
export const useNoteGridY = () => useAppStore((state) => state.meterBarHeight);
export const useNoteGridWidth = () => {
    const isVertOverflow = useAppStore((state) => state.isVertOverflow);
    const canvasWidth = useAppStore((state) => state.canvasSize.width);
    const pianoBarWidth = useAppStore((state) => state.pianoBarWidth);
    const scrollBarThickness = useAppStore((state) => state.scrollBarThickness);

    if (isVertOverflow()) {
        return canvasWidth - pianoBarWidth - scrollBarThickness;
    } else {
        return canvasWidth - pianoBarWidth;
    }
};
export const useNoteGridHeight = () => {
    const isHoriOverflow = useAppStore((state) => state.isHoriOverflow);
    const canvasHeight = useAppStore((state) => state.canvasSize.height);
    const meterBarHeight = useAppStore((state) => state.meterBarHeight);
    const scrollBarThickness = useAppStore((state) => state.scrollBarThickness);

    if (isHoriOverflow()) {
        return canvasHeight - meterBarHeight - scrollBarThickness;
    } else {
        return canvasHeight - meterBarHeight;
    }
};

//-------- PIANO BAR ----------

export const usePianoBarX = () => 0;
export const usePianoBarY = () => useAppStore((state) => state.meterBarHeight);
export const usePianoBarHeight = () => {
    const isHoriOverflow = useAppStore((state) => state.isHoriOverflow);
    const canvasHeight = useAppStore((state) => state.canvasSize.height);
    const meterBarHeight = useAppStore((state) => state.meterBarHeight);
    const scrollBarThickness = useAppStore((state) => state.scrollBarThickness);

    if (isHoriOverflow()) {
        return canvasHeight - meterBarHeight - scrollBarThickness;
    } else {
        return canvasHeight - meterBarHeight;
    }
};

//--------- METER BAR ---------

export const useMeterBarX = () => useAppStore((state) => state.pianoBarWidth);
export const useMeterBarY = () => 0;
export const useMeterBarWidth = () => {
    const isVertOverflow = useAppStore((state) => state.isVertOverflow);
    const canvasWidth = useAppStore((state) => state.canvasSize.width);
    const pianoBarWidth = useAppStore((state) => state.pianoBarWidth);
    const scrollBarThickness = useAppStore((state) => state.scrollBarThickness);

    if (isVertOverflow()) {
        return canvasWidth - pianoBarWidth - scrollBarThickness;
    } else {
        return canvasWidth - pianoBarWidth;
    }
};
