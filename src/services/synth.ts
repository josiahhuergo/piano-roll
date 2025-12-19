import * as Tone from "tone";
import type { Note } from "../types";

function numToPitchName(pitchNum: number): string {
    let noteNames: string[] = [
        "C",
        "C#",
        "D",
        "D#",
        "E",
        "F",
        "F#",
        "G",
        "G#",
        "A",
        "A#",
        "B",
    ];
    let pc: string = noteNames[pitchNum % 12];
    let octave: string = (Math.floor(pitchNum / 12) - 1).toString();
    return pc + octave;
}

function beatsToTransTime(beatsIn: number): string {
    let bars = Math.floor(beatsIn / 4).toString();
    let beats = (beatsIn % 4).toString();
    return bars + ":" + beats + ":0";
}

export class Synth {
    notes: string[][];
    part: Tone.Part;
    bpm: number;
    synth: Tone.PolySynth;
    playing: boolean;

    constructor(bpm: number = 120) {
        this.notes = [];
        this.bpm = bpm;
        this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
        this.synth.volume.value = -10;
        this.part = new Tone.Part();
        this.playing = false;
    }

    async startSynth() {
        await Tone.start();
    }

    updateNotes(newNotes: Note[]) {
        this.part.stop(0);

        let notes = newNotes.map((note) => ({
            pitch: numToPitchName(note.pitch),
            time: beatsToTransTime(note.onset),
            duration: beatsToTransTime(note.duration),
        }));

        this.part = new Tone.Part((time, value) => {
            this.synth.triggerAttackRelease(value.pitch, value.duration, time);
        }, notes).start(0);
    }

    play(startTimeInBeats: number) {
        this.playing = true;
        console.log(beatsToTransTime(startTimeInBeats));

        Tone.getTransport().start(0, beatsToTransTime(startTimeInBeats));
    }

    stop() {
        this.playing = false;
        Tone.getTransport().stop();
        this.synth.releaseAll();
    }
}
