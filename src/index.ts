import { start } from "repl";
import * as Tone from "tone";

/*
TODO

- Clean up code
- Add transport controls, play/stop toggle between playing and not playing, 
    with a start position variable.
- Add synth that produces sound, like tone.js
- Play notes when pressing keys on piano bar left of frame
- Note creation, deletion, dragging across grid, etc.
    - Double click to add notes
    - Double click to delete
    - Click and drag to change time/pitch
    - Click and drag right side to change duration
- Add note selection
    - Shift click to add/remove note from selection
    - Click and drag over backdrop to create selection box
        - Create canvas layer in note grid, overlaying the notes
        - On mousedown, store click coordinates in variable.
        - On mousemove, draw selection rectangle between mouse's current coordinates and the starting coords.
        - On mouseup, clear drawing and find the notes which trigger within that interval of time and pitch.
- Add context menus
- Autoscroll to new region when playhead reaches end of frame
- Set playhead speed with respect to piano roll bpm
- Left click empty note grid to move playhead to nearest quantized x position
*/
class NoteSelection {
    
}

class Note {
    pitch: number;
    time: number;
    dur: number;

    constructor(pitch: number, time: number, dur: number) {
        this.pitch = pitch;
        this.time = time;
        this.dur = dur;
    }
}

class NoteGrid {
    pianoRoll: PianoRoll;
    frame: HTMLDivElement;
    width: number = 0;
    height: number = 0;
    noteGrid: HTMLDivElement;
    
    constructor(pianoRoll: PianoRoll) {
        this.pianoRoll = pianoRoll;
        this.frame = document.createElement("div");
        this.noteGrid = document.createElement("div");

        this.#createFrame();
        this.scrollToFirstNote();
        this.#drawBackdrop();
        this.#drawNotes();
    }

    #createFrame() {
        this.frame.id = "note-grid-frame"
        this.frame.style.position = "absolute";
        this.frame.style.top = this.pianoRoll.config.timeBarHeight + "px";
        this.frame.style.left = this.pianoRoll.config.pianoBarWidth + "px";
        this.width = this.pianoRoll.config.frameWidth;
        this.frame.style.width = this.width + "px";
        this.height = this.pianoRoll.config.frameHeight;
        this.frame.style.height = this.height + "px";
        this.frame.style.overflow = "scroll"; 
        this.frame.style.scrollbarWidth = "none";
        this.pianoRoll.frame.append(this.frame);
    }

    scrollToFirstNote() {
        let noteYPos = (this.pianoRoll.maxDrawPitch - this.pianoRoll.noteSet[0].pitch) * this.pianoRoll.config.noteHeight;
        let halfPageY = parseInt(this.frame.style.height) / 2;
        noteYPos = noteYPos - halfPageY;
        this.frame.scrollTop = noteYPos;
    }

    #drawBackdrop() {
        var canvas: HTMLCanvasElement = document.createElement("canvas");
        canvas.id = "backdrop";
        canvas.style.position = "absolute";

        canvas.height = this.pianoRoll.canvasHeight;
        canvas.width = this.pianoRoll.canvasWidth;

        const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;
        var colorOne = "rgb(80,80,80)";
        var colorTwo = "rgb(50,50,50)";
        var fillStyles = [colorOne, colorTwo, colorOne, colorTwo, colorOne, colorOne, colorTwo, colorOne, colorTwo, colorOne, colorTwo, colorOne];

        // Pitch lanes
        ctx.strokeStyle = "rgb(60,60,60)";
        ctx.lineWidth = 1;
        
        // These two for loops iterate through the pitches present in the piano roll, from high to low.
        let j = 0;
        for (let i=this.pianoRoll.maxDrawPitch; i>=this.pianoRoll.minDrawPitch; i--) { // Fill
            ctx.fillStyle = fillStyles[i%12];
            ctx.fillRect(0, this.pianoRoll.config.noteHeight * j, canvas.width, this.pianoRoll.config.noteHeight);
            j++;
        }
        j=0;
        for (let i=this.pianoRoll.maxDrawPitch; i>=this.pianoRoll.minDrawPitch; i--) { // Stroke
            if (i%12 === 11) {
                ctx.strokeStyle = "rgb(20,20,20)";
            } else {
                ctx.strokeStyle = colorTwo;
            }
            ctx.beginPath();
            ctx.moveTo(0, j * this.pianoRoll.config.noteHeight);
            ctx.lineTo(canvas.width, j * this.pianoRoll.config.noteHeight);
            ctx.stroke();
            j++;
        }

        // Time markers
        for (let i=0; i<this.pianoRoll.beatDrawCount; i++) {
            if (i%4 === 0) {
                ctx.strokeStyle = "rgb(20,20,20)";
            } else {
                ctx.strokeStyle = "rgb(40,40,40)";
            }
            ctx.beginPath();
            ctx.moveTo(i*this.pianoRoll.config.beatWidth, 0);
            ctx.lineTo(i*this.pianoRoll.config.beatWidth, canvas.height);
            ctx.stroke();
        }

        this.frame.append(canvas);
    }

    #drawNotes() {
        // Note: you want to draw the earliest notes first, because when two notes overlap, the leftmost note should always be on top.
        this.noteGrid.id = "note-grid";
        this.noteGrid.style.position = "absolute";
        this.frame.append(this.noteGrid);

        if (!this.pianoRoll.noteSet) return;

        for (let i=0; i<this.pianoRoll.noteSet.length; i++) {
            let note: HTMLButtonElement = document.createElement("button");
            note.style.position = "absolute";
            note.style.width = (this.pianoRoll.config.beatWidth * this.pianoRoll.noteSet[i].dur) + "px";
            note.style.height = this.pianoRoll.config.noteHeight + "px";
            note.style.left = (this.pianoRoll.config.beatWidth * this.pianoRoll.noteSet[i].time) + "px";
            note.style.top = (this.pianoRoll.config.noteHeight * (this.pianoRoll.maxDrawPitch - this.pianoRoll.noteSet[i].pitch)) + "px";
            note.innerHTML = this.pianoRoll.noteSet[i].pitch.toString();
            note.style.textAlign = "left";
            // note.style.verticalAlign = "middle";
            note.style.padding = 0+"px";
            note.style.fontSize = clamp(this.pianoRoll.config.noteHeight/1.5, 0, 10) + "px";
            this.noteGrid.append(note);
        }
    }

    get leftBound(): number {
        // returns x position of canvas on leftmost extreme of frame
        return this.frame.scrollLeft;
    }

    get rightBound(): number {
        // returns x position of canvas on rightmost extreme of frame
        return this.leftBound + this.width;
    }
}

class PianoBar {
    pianoRoll: PianoRoll;
    frame: HTMLDivElement;
    width: number;

    constructor(pianoRoll: PianoRoll) {
        this.pianoRoll = pianoRoll;
        this.width = pianoRoll.config.pianoBarWidth;
        this.frame = document.createElement("div");

        this.#createFrame();
        this.#draw();
    }

    #createFrame() {
        this.frame.id = "piano-bar-frame"
        this.frame.style.position = "absolute";
        this.frame.style.top = this.pianoRoll.config.timeBarHeight + "px";
        this.frame.style.width = this.width + "px";
        this.frame.style.height = this.pianoRoll.config.frameHeight + "px";
        this.frame.style.overflow = "scroll";
        this.frame.style.scrollbarWidth = "none";
        this.pianoRoll.frame.append(this.frame);
    }

    #draw() {
        var canvas: HTMLCanvasElement = document.createElement("canvas");
        canvas.id = "piano-bar";
        canvas.style.position = "absolute";

        canvas.height = this.pianoRoll.canvasHeight;
        canvas.width = this.width;

        const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;
        var colorOne = "white";
        var colorTwo = "black";
        var fillStyles = [colorOne, colorTwo, colorOne, colorTwo, colorOne, colorOne, colorTwo, colorOne, colorTwo, colorOne, colorTwo, colorOne];

        // Pitch lanes
        ctx.strokeStyle = "rgb(190,190,190)";
        ctx.lineWidth = 1;
        
        // These two for loops iterate through the pitches present in the piano roll, from high to low.
        let j = 0;
        for (let i=this.pianoRoll.maxDrawPitch; i>=this.pianoRoll.minDrawPitch; i--) { // Fill
            ctx.fillStyle = fillStyles[i%12];
            ctx.fillRect(0, this.pianoRoll.config.noteHeight * j, this.width, this.pianoRoll.config.noteHeight);
            j++;
        }
        j=0;
        for (let i=this.pianoRoll.maxDrawPitch; i>=this.pianoRoll.minDrawPitch; i--) { // Stroke
            if (i%12 === 11) {
                ctx.strokeStyle = "rgb(20,20,20)";
            } else {
                ctx.strokeStyle = colorTwo;
            }
            ctx.beginPath();
            ctx.moveTo(0, j * this.pianoRoll.config.noteHeight);
            ctx.lineTo(canvas.width, j * this.pianoRoll.config.noteHeight);
            ctx.stroke();
            j++;
        }

        this.frame.append(canvas);
    }
}

class TimeBar {
    pianoRoll: PianoRoll;
    frame: HTMLDivElement;
    height: number;

    constructor(pianoRoll: PianoRoll) {
        this.pianoRoll = pianoRoll;
        this.height = pianoRoll.config.timeBarHeight;
        this.frame = document.createElement("div");

        this.#createFrame();
        this.#draw();
    }

    #createFrame() {
        this.frame.id = "time-bar-frame";
        this.frame.style.position = "absolute";
        this.frame.style.left = this.pianoRoll.config.pianoBarWidth + "px";
        this.frame.style.width = this.pianoRoll.config.frameWidth + "px";
        this.frame.style.height = this.height + "px";
        this.frame.style.overflowX = "scroll";
        this.frame.style.overflowY = "hidden";
        this.frame.style.scrollbarWidth = "none";
        this.frame.style.backgroundColor = "dark gray";
        this.pianoRoll.frame.append(this.frame);
    }

    #draw() {
        var canvas: HTMLCanvasElement = document.createElement("canvas");
        canvas.id = "time-bar";
        canvas.width = this.pianoRoll.canvasWidth;
        canvas.height = this.height;
        var canvasFrame: HTMLDivElement = document.createElement("div");
        canvasFrame.style.width = canvas.width + "px";
        canvasFrame.style.height = canvas.height + "px";
        canvasFrame.style.overflow = "hidden";
        canvasFrame.style.position = "absolute";
        const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;

        ctx.strokeStyle = "rgb(50,50,50)";
        for (let i=0; i<this.pianoRoll.barDrawCount; i++) {
            ctx.beginPath();
            ctx.moveTo(i*4*this.pianoRoll.config.beatWidth, this.height / 3);
            ctx.lineTo(i*4*this.pianoRoll.config.beatWidth, this.height);
            ctx.stroke();

            let timeLabel = document.createElement("div");
            timeLabel.style.color = "gray";
            timeLabel.style.fontFamily = "Verdana";
            timeLabel.style.fontSize = "12px";
            timeLabel.style.position = "absolute";
            
            if (i === this.pianoRoll.barDrawCount - 1 && this.pianoRoll.beatDrawCount % 4 != 0) {
                let width = this.pianoRoll.beatDrawCount % 4;
                timeLabel.style.width = this.pianoRoll.config.beatWidth * width + "px";
            } else {
                timeLabel.style.width = this.pianoRoll.config.beatWidth * 16 + "px";
            }
            timeLabel.style.height = this.height + "px";
            timeLabel.style.left = i*this.pianoRoll.config.beatWidth * 4 + "px";
            timeLabel.style.textAlign = "left";
            timeLabel.style.paddingLeft = "5px";
            timeLabel.style.paddingTop = "10px";
            timeLabel.innerHTML = (i*4).toString();
            canvasFrame.append(timeLabel);
        }
        canvasFrame.append(canvas);
        this.frame.append(canvasFrame);
    }
}

class PlayHead {
    pianoRoll: PianoRoll;
    startTime: number = 0;
    playTime: number = 0;
    headPos: number = 0;
    noteCtx: CanvasRenderingContext2D;

    constructor(pianoRoll: PianoRoll) {
        this.pianoRoll = pianoRoll;

        var noteCanvas: HTMLCanvasElement = document.createElement("canvas");
        noteCanvas.id = "playhead"
        noteCanvas.style.position = "absolute";
        this.noteCtx = noteCanvas.getContext("2d")!;
        noteCanvas.width = this.pianoRoll.canvasWidth;
        noteCanvas.height = this.pianoRoll.canvasHeight;
        this.update = this.update.bind(this);
        this.pianoRoll.noteGrid.frame.append(noteCanvas);

        this.drawHead();
    }

    drawHead() {
        this.noteCtx.clearRect(0,0,this.pianoRoll.canvasWidth, this.pianoRoll.canvasHeight);
        this.noteCtx.beginPath();
        this.noteCtx.moveTo(this.headPos, 0);
        this.noteCtx.lineTo(this.headPos, this.pianoRoll.canvasHeight);
        this.noteCtx.strokeStyle = "white";
        this.noteCtx.lineWidth = 1;
        this.noteCtx.stroke();
    }

    play() {
        // Scrolls the note frame to the bar that startTime is located at.
        this.pianoRoll.noteGrid.frame.scrollLeft = Math.floor(this.startTime/this.pianoRoll.config.beatWidth/4)*4*this.pianoRoll.config.beatWidth;
        requestAnimationFrame(this.update);
    }

    stop() {
        this.headPos = this.startTime;
        this.playTime = 0;
        this.drawHead();
    }

    update(now: any) {
        if (Tone.getTransport().state === "stopped") return;
        if (this.playTime === 0) { this.playTime = now; }
        let factor = (1000 / this.pianoRoll.config.beatWidth * 60) / Tone.getTransport().bpm.value;
        this.headPos = (now - this.playTime) / factor + this.startTime;

        if (this.headPos >= this.pianoRoll.noteGrid.rightBound) {
            this.pianoRoll.noteGrid.frame.scrollLeft += this.pianoRoll.noteGrid.width;
        }
        if (this.headPos >= this.pianoRoll.canvasWidth) {
            this.pianoRoll.transport.stop();
        }
        
        if (Tone.getTransport().state === "started") {
            this.drawHead();
            requestAnimationFrame(this.update);
        }
    }
}

class SynthEngine {
    synth: Tone.Synth;

    constructor() {
        this.synth = new Tone.Synth().toDestination();
        this.synth.volume.value = -10;
    }

    playNote(pitch: number) {
        this.synth.triggerAttackRelease(numToPitchName(pitch), "8n");
    }
}

class Transport {
    pianoRoll: PianoRoll;
    synthEngine: SynthEngine;
    playHead: PlayHead;
    ctx: CanvasRenderingContext2D;
    button: HTMLButtonElement;
    playing: boolean = false;
    bgColor: string = "rgb(20,20,20)";

    constructor(pianoRoll: PianoRoll) {
        this.pianoRoll = pianoRoll;
        this.playHead = new PlayHead(this.pianoRoll);
        this.synthEngine = new SynthEngine();

        var canvas: HTMLCanvasElement = document.createElement("canvas");
        canvas.style.position = "absolute";
        canvas.style.top = "0px";
        canvas.style.left = "0px";
        canvas.width = this.pianoRoll.config.pianoBarWidth;
        canvas.height = this.pianoRoll.config.timeBarHeight;
        this.ctx = canvas.getContext("2d")!;

        this.button = document.createElement("button");
        this.#createButton();
        this.#drawPlay();        
        this.#setupListeners();

        this.button.append(canvas);
        this.pianoRoll.frame.append(this.button);
    }

    #createButton() {
        this.button.id = "transport-btn";
        this.button.style.position = "absolute";
        this.button.style.top = "0px";
        this.button.style.left = "0px";
        this.button.style.width = this.pianoRoll.config.pianoBarWidth + "px";
        this.button.style.height = this.pianoRoll.config.timeBarHeight + "px";
        this.button.style.border = "none";
        this.button.style.backgroundColor = "black";
        this.button.style.zIndex = "9";
    }

    #setupListeners() {
        // Listener for transport button click
        this.button.addEventListener("click", this.toggle.bind(this));
        // Listener for space bar press
        document.body.addEventListener("keydown", (event) => {
            if (event.key === " ") {
                this.toggle();
            }
        });
    }

    #drawPlay() {
        this.ctx.fillStyle = this.bgColor;
        this.ctx.fillRect(0, 0, this.pianoRoll.config.pianoBarWidth, this.pianoRoll.config.timeBarHeight);
        this.ctx.beginPath();
        this.ctx.moveTo(8/30*this.pianoRoll.config.timeBarHeight,7/30*this.pianoRoll.config.pianoBarWidth);
        this.ctx.lineTo(8/30*this.pianoRoll.config.timeBarHeight,23/30*this.pianoRoll.config.pianoBarWidth);
        this.ctx.lineTo(22/30*this.pianoRoll.config.timeBarHeight,15/30*this.pianoRoll.config.pianoBarWidth);
        this.ctx.closePath();
        this.ctx.fillStyle = "white";
        this.ctx.strokeStyle = "white";
        this.ctx.fill();
        this.ctx.stroke();
    }

    #drawStop() {
        this.ctx.fillStyle = this.bgColor;
        this.ctx.fillRect(0, 0, this.pianoRoll.config.pianoBarWidth, this.pianoRoll.config.timeBarHeight);
        this.ctx.beginPath();
        this.ctx.moveTo(8,7);
        this.ctx.lineTo(8,23);
        this.ctx.lineTo(22,23);
        this.ctx.lineTo(22,7);
        this.ctx.closePath();
        this.ctx.fillStyle = "white";
        this.ctx.strokeStyle = "white";
        this.ctx.fill();
        this.ctx.stroke();
    }

    play() {
        this.pianoRoll.noteGrid.scrollToFirstNote();
        this.playHead.play();
        this.#drawStop();
        Tone.getTransport().start();
    }

    stop() {
        this.playHead.stop();
        this.#drawPlay();
        Tone.getTransport().stop();
    }

    toggle() {
        if (!this.playing) {
            this.playing = true;
            this.play();
        } else {
            this.playing = false;
            this.stop();
        }
    }
}

class Config {
    frameWidth: number = 800;
    frameHeight: number = 600;
    beatWidth: number = 20;
    noteHeight: number = 15;
    pianoBarWidth: number = 30;
    timeBarHeight: number = 30;
}

class PianoRoll {
    frame: HTMLDivElement;
    noteSet: Note[];
    config: Config;
    noteGrid: NoteGrid;
    pianoBar: PianoBar;
    timeBar: TimeBar;
    part: Tone.Part;
    transport: Transport;
    playing: boolean = false;
    scrollSync: boolean = false;

    constructor(noteSet: Note[] = []) {
        this.noteSet = noteSet;

        // Convert Notes to Tone format
        let tones: string[][] = [];
        noteSet.forEach((note) => {
            tones.push([beatsToTransTime(note.time), numToPitchName(note.pitch)])
        });

        this.part = new Tone.Part(((time, note) => {
            // the notes given as the second element in the array
            // will be passed in as the second argument
            this.transport.synthEngine.synth.triggerAttackRelease(note, "0:1:0", time);
        }), tones).start(0);
        

        // Remove notes that can't be displayed
        let newNoteSet: Note[] = [];
        for (let i=0; i<this.noteSet.length; i++) {
            if (this.noteSet[i].pitch <= this.maxDrawPitch) {
                if (this.noteSet[i].pitch >= this.minDrawPitch) {
                    newNoteSet.push(this.noteSet[i]);
                }
            }
        }
        this.noteSet = newNoteSet;

        // Create config
        this.config = new Config();

        // Create entire frame
        this.frame = document.createElement("div");
        this.#createFrame();

        // Create Time Bar
        this.timeBar = new TimeBar(this);
        // Create piano bar
        this.pianoBar = new PianoBar(this);
        // Create note grid
        this.noteGrid = new NoteGrid(this);
        // Create transport controls
        this.transport = new Transport(this);  

        // Scroll sync
        this.#syncScrolling();
    }

    #createFrame() {
        // Create frame for entire piano roll
        this.frame.id = "piano-roll"
        this.frame.style.position = "absolute";
        $("body").append(this.frame);
    }

    #syncScrolling() {
        // Scroll sync. Add event listeners to notesFrame and pianoBarFrame, 
        // such that when one is scrolled, the other scrolls too.
        // Ideally, when one frame is scrolled, we'd remove the event listener from the other frame, 
        // perform the scroll, set scrollTop, then add the other event listener again.
        //
        this.scrollSync = false; // the scrollSync flag is something whose state needs to be stored in the object, 
        // allowing the firing of a frame's scroll event to disable the other frame's scroll event.
        this.noteGrid.frame.addEventListener("scroll", (event) => {
            if (this.scrollSync) {
                this.scrollSync = false;
                return;
            }
            this.scrollSync = true;
            this.pianoBar.frame.scrollTop = this.noteGrid.frame.scrollTop;
            this.timeBar.frame.scrollLeft = this.noteGrid.frame.scrollLeft;
        });
        this.pianoBar.frame.addEventListener("scroll", (event) => {
            if (this.scrollSync) {
                this.scrollSync = false;
                return;
            }
            this.scrollSync = true;
            this.noteGrid.frame.scrollTop = this.pianoBar.frame.scrollTop;
        });
        this.timeBar.frame.addEventListener("scroll", (event) => {
            if (this.scrollSync) {
                this.scrollSync = false;
                return;
            }
            this.scrollSync = true;
            this.noteGrid.frame.scrollLeft = this.timeBar.frame.scrollLeft;
        });
    }

    play() {
        this.playing = true;
        this.transport.play();
    }

    stop() {
        this.playing = false;
        this.transport.stop();
    }

    toggle() {
        if (!this.playing) {
            this.play();
        } else {
            this.stop();
        }
    }

    get canvasHeight() {
        return this.config.noteHeight * (this.maxDrawPitch - this.minDrawPitch + 1);
    }

    get canvasWidth() {
        if (this.beatsFitInFrame) {
            return this.config.frameWidth;
        } else {
            return this.config.beatWidth * this.beatDrawCount;
        }
    }

    get times() {
        let times: number[] = [];
        this.noteSet.forEach(function(note: Note) {
            times.push(note.time);
        });
        return times;
    }

    get minDrawPitch() {
        return 21;
    }

    get maxDrawPitch() {
        return 108;
    }

    get beatsFitInFrame() {
        let widthInBeats = Math.ceil(this.config.frameWidth / this.config.beatWidth);
        if ((max(this.times) - min(this.times)) < widthInBeats) {
            return true;
        } else {
            return false;
        }
    }

    get beatDrawCount() {
        if (this.beatsFitInFrame) {
            return Math.ceil(this.config.frameWidth / this.config.beatWidth);
        } else {
            return this.noteSet.slice(-1)[0].time + this.noteSet.slice(-1)[0].dur;
        }
    }

    get barDrawCount() {
        return Math.ceil(this.beatDrawCount / 4);
    }
}

// Some utility functions
function clamp(number: number, min: number, max: number) : number {
    return Math.max(min, Math.min(number, max));
}

function max(array: number[]) : number {
    let maximum = array[0];

    for (let i=1; i<array.length; i++) {
        if (maximum < array[i]) {
            maximum = array[i];
        }
    }
    
    return maximum;
}

function min(array: number[]) : number {
    let minimum = array[0];

    for (let i=1; i<array.length; i++) {
        if (minimum > array[i]) {
            minimum = array[i];
        }
    }
    
    return minimum;
}

function numToPitchName(pitchNum: number) : string {
    let noteNames: string[] = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]
    let pc: string = noteNames[pitchNum % 12];
    let octave: string = (Math.floor(pitchNum/12)-1).toString();
    return pc + octave
}

function beatsToTransTime(beatsIn: number) : string {
    let bars = Math.floor(beatsIn/4).toString();
    let beats = (beatsIn % 4).toString();
    return bars+":"+beats+":0";
}

// Test function that creates the notes we use in the PianoRoll
function makeNotes() : Note[] {
    let pitches = [90];
    let scale = [
        -2,-2,-3,2,-2,-2,-3,9,
        -2,-2,-3,2,-2,-2,-3,9,
        -2,-2,-3,2,-2,-2,-3,-1,
        2,1,2,1,2,1,2,1
    ];
    let scaleIdx = 0;
    for (let i=0; i<scale.length*16; i++) {
        pitches.push(pitches.slice(-1)[0] + scale[scaleIdx]);
        scaleIdx = (scaleIdx + 1) % scale.length;
    }
    let notes: Note[] = [];
    for (let i=0; i<pitches.length; i++) {
        notes.push(new Note(pitches[i], i, 1));
    }
    return notes;
}

// Main program
var pianoRoll: PianoRoll;
$(function() {    
    document.body.addEventListener("click", Tone.start);
    document.body.addEventListener("keydown", Tone.start);
    let notes = makeNotes();
    pianoRoll = new PianoRoll(notes);
    Tone.getTransport().bpm.value = 800;
});