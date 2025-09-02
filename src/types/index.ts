export interface Note {
    pitch: number;
    onset: number;
    duration: number;
}

export interface NoteUI extends Note {
    id: number;
    selected: boolean;
}
export interface Dimensions {
    width: number;
    height: number;
}

export interface Position {
    x: number;
    y: number;
}
