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
    synth: Tone.PolySynth | null;
    playing: boolean;
    initialized: boolean;

    constructor(bpm: number = 120) {
        this.notes = [];
        this.bpm = bpm;
        this.synth = null; // Don't create until user interaction
        this.part = new Tone.Part();
        this.playing = false;
        this.initialized = false;
    }

    async startSynth() {
        if (this.initialized) return;
        
        await Tone.start();
        
        // Now create the synth after user gesture
        this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
        this.synth.volume.value = -10;
        
        // Set the transport BPM
        Tone.getTransport().bpm.value = this.bpm;
        
        this.initialized = true;
    }

    updateNotes(newNotes: Note[]) {
        if (!this.synth) return; // Guard against uninitialized synth
        
        // Stop and dispose old part if it exists
        if (this.part) {
            try {
                this.part.stop(0);
                this.part.dispose();
            } catch (e) {
                // Part might already be stopped/disposed, ignore error
            }
        }

        let notes = newNotes.map((note) => ({
            pitch: numToPitchName(note.pitch),
            time: beatsToTransTime(note.onset),
            duration: beatsToTransTime(note.duration),
        }));

        this.part = new Tone.Part((time, value) => {
            this.synth!.triggerAttackRelease(value.pitch, value.duration, time);
        }, notes);
        
        // Start the part at position 0 in the timeline
        this.part.start(0);
    }

    play(startTimeInBeats: number) {
        if (!this.synth) return; // Guard against uninitialized synth
        
        this.playing = true;
        
        // Start transport at current time, but at the specified beat position
        Tone.getTransport().start("+0", beatsToTransTime(startTimeInBeats));
    }

    stop() {
        if (!this.synth) return; // Guard against uninitialized synth
        
        this.playing = false;
        Tone.getTransport().stop();
        Tone.getTransport().position = 0;
        this.synth.releaseAll();
    }
}