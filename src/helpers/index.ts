import type { Dimensions } from "../types";

export const calculateCanvasSize = (): Dimensions => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    return { width: width, height: height };
};

export function logVar(name: string, value: any) {
    console.log(`${name}: ${value}`);
}

export function pitchIsBlackKey(pitch: number): boolean {
    const blackKeys = [1, 3, 6, 8, 10];
    return blackKeys.includes(pitch % 12);
}

export function clamp(num: number, min: number, max: number): number {
    return Math.min(Math.max(num, min), max);
}

export function remap(
    value: number,
    fromMin: number,
    fromMax: number,
    toMin: number,
    toMax: number
): number {
    return ((value - fromMin) / (fromMax - fromMin)) * (toMax - toMin) + toMin;
}

export function snap(value: number, snapValue: number): number {
    return Math.round(value / snapValue) * snapValue;
}
