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
    noteGrid: HTMLDivElement;
    
    constructor(pianoRoll: PianoRoll) {
        this.pianoRoll = pianoRoll;
        this.frame = document.createElement("div");
        this.noteGrid = document.createElement("div");

        this.#createFrame();
        this.#drawBackdrop();
        this.#drawNotes();
    }

    #createFrame() {
        console.log(this.pianoRoll);
        this.frame.id = "note-grid-frame"
        this.frame.style.position = "absolute";
        this.frame.style.top = this.pianoRoll.timeBar.height + "px";
        this.frame.style.left = this.pianoRoll.pianoBar.width + "px";
        this.frame.style.width = this.pianoRoll.frameWidth + "px";
        this.frame.style.height = this.pianoRoll.frameHeight + "px";
        this.frame.style.overflow = "scroll"; 
        this.frame.style.scrollbarWidth = "none";
        this.pianoRoll.frame.append(this.frame);
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
            ctx.fillRect(0, this.pianoRoll.noteHeight * j, canvas.width, this.pianoRoll.noteHeight);
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
            ctx.moveTo(0, j * this.pianoRoll.noteHeight);
            ctx.lineTo(canvas.width, j * this.pianoRoll.noteHeight);
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
            ctx.moveTo(i*this.pianoRoll.beatWidth, 0);
            ctx.lineTo(i*this.pianoRoll.beatWidth, canvas.height);
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
            note.style.width = (this.pianoRoll.beatWidth * this.pianoRoll.noteSet[i].dur) + "px";
            note.style.height = this.pianoRoll.noteHeight + "px";
            note.style.left = (this.pianoRoll.beatWidth * this.pianoRoll.noteSet[i].time) + "px";
            note.style.top = (this.pianoRoll.noteHeight * (this.pianoRoll.maxDrawPitch - this.pianoRoll.noteSet[i].pitch)) + "px";
            note.innerHTML = this.pianoRoll.noteSet[i].pitch.toString();
            note.style.textAlign = "left";
            // note.style.verticalAlign = "middle";
            note.style.padding = 0+"px";
            note.style.fontSize = clamp(this.pianoRoll.noteHeight/1.5, 0, 10) + "px";
            this.noteGrid.append(note);
        }
    }
}

class PianoBar {
    pianoRoll: PianoRoll;
    frame: HTMLDivElement;
    width: number = 30;

    constructor(pianoRoll: PianoRoll) {
        this.pianoRoll = pianoRoll;
        this.frame = document.createElement("div");

        this.#createFrame();
        this.#draw();
    }

    #createFrame() {
        this.frame.id = "piano-bar-frame"
        this.frame.style.position = "absolute";
        this.frame.style.top = this.pianoRoll.timeBar.height + "px";
        this.frame.style.width = this.width + "px";
        this.frame.style.height = this.pianoRoll.frameHeight + "px";
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
            ctx.fillRect(0, this.pianoRoll.noteHeight * j, this.width, this.pianoRoll.noteHeight);
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
            ctx.moveTo(0, j * this.pianoRoll.noteHeight);
            ctx.lineTo(canvas.width, j * this.pianoRoll.noteHeight);
            ctx.stroke();
            j++;
        }

        this.frame.append(canvas);
    }
}

class TimeBar {
    pianoRoll: PianoRoll;
    frame: HTMLDivElement;
    height: number = 30;

    constructor(pianoRoll: PianoRoll) {
        this.pianoRoll = pianoRoll;
        this.frame = document.createElement("div");

        this.#createFrame();
        this.#draw();
    }

    #createFrame() {
        this.frame.id = "time-bar-frame";
        this.frame.style.position = "absolute";
        this.frame.style.left = this.pianoRoll.pianoBar.width + "px";
        this.frame.style.width = this.pianoRoll.frameWidth + "px";
        this.frame.style.height = this.height + "px";
        this.frame.style.overflow = "scroll";
        this.frame.style.scrollbarWidth = "none";
        this.frame.style.backgroundColor = "dark gray";
        this.pianoRoll.frame.append(this.frame);
    }

    #draw() {
        var canvas: HTMLCanvasElement = document.createElement("canvas");
        canvas.id = "time-bar";
        canvas.width = this.pianoRoll.canvasWidth;
        canvas.height = this.height;
        const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;

        ctx.strokeStyle = "rgb(50,50,50)";
        for (let i=0; i<this.pianoRoll.beatDrawCount; i++) {
            if (i%4 === 0) {
                ctx.beginPath();
                ctx.moveTo(i*this.pianoRoll.beatWidth, this.height / 3);
                ctx.lineTo(i*this.pianoRoll.beatWidth, this.height);
                ctx.stroke();

                let timeLabel = document.createElement("div");
                timeLabel.style.color = "gray";
                timeLabel.style.fontFamily = "Verdana";
                timeLabel.style.fontSize = "12px";
                timeLabel.style.position = "absolute";
                timeLabel.style.width = this.pianoRoll.beatWidth * 4 + "px";
                timeLabel.style.height = this.height + "px";
                timeLabel.style.left = i*this.pianoRoll.beatWidth + "px";
                timeLabel.style.textAlign = "left";
                timeLabel.style.paddingLeft = "5px";
                timeLabel.style.paddingTop = "10px";
                timeLabel.innerHTML = i.toString();
                this.frame.append(timeLabel);
            }
        }
        
        this.frame.append(canvas);
    }
}

class Transport {
    pianoRoll: PianoRoll;
    ctx: CanvasRenderingContext2D;
    button: HTMLButtonElement;

    constructor(pianoRoll: PianoRoll) {
        this.pianoRoll = pianoRoll;
        var canvas: HTMLCanvasElement = document.createElement("canvas");
        this.button = document.createElement("button");
        this.ctx = canvas.getContext("2d")!;

        this.button.id = "transport-btn";
        this.button.style.position = "absolute";
        this.button.style.top = "0px";
        this.button.style.left = "0px";
        this.button.style.width = this.pianoRoll.pianoBar.width + "px";
        this.button.style.height = this.pianoRoll.timeBar.height + "px";
        this.button.style.border = "none";
        this.button.style.backgroundColor = "black";
        
        this.button.addEventListener('click', () => { this.#toggle.bind(this) });

        canvas.style.position = "absolute";
        canvas.style.top = "0px";
        canvas.style.left = "0px";
        canvas.width = this.pianoRoll.pianoBar.width;
        canvas.height = this.pianoRoll.timeBar.height;

        this.#drawPlay();        

        this.button.append(canvas);
        this.pianoRoll.frame.append(this.button);
    }

    #toggle() {
        if (this.pianoRoll.playing) { 
            this.pianoRoll.playing = false;
            this.#drawPlay();
            this.pianoRoll.playHead.toggle();
        } else {
            this.pianoRoll.playing = true;
            this.#drawStop();
            this.pianoRoll.playHead.toggle();
        }
    }

    #drawPlay() {
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.pianoRoll.pianoBar.width, this.pianoRoll.timeBar.height);
        this.ctx.beginPath();
        this.ctx.moveTo(8,7);
        this.ctx.lineTo(8,23);
        this.ctx.lineTo(22,15);
        this.ctx.closePath();
        this.ctx.fillStyle = "white";
        this.ctx.strokeStyle = "white";
        this.ctx.fill();
        this.ctx.stroke();
    }

    #drawStop() {
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.pianoRoll.pianoBar.width, this.pianoRoll.timeBar.height);
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
}

class PianoRoll {
    frame: HTMLDivElement;
    frameWidth: number;
    frameHeight: number;
    bpm: number;
    playing: boolean;
    noteSet: Note[];
    beatWidth: number;
    noteHeight: number;
    noteGrid: NoteGrid;
    pianoBar: PianoBar;
    timeBar: TimeBar;
    // transport: Transport;
    playHead: PlayHead;
    ignore: boolean;

    constructor(noteSet: Note[] = [], frameWidth: number = 800, frameHeight: number = 600, beatWidth: number = 28, noteHeight: number = 18) {
        this.noteSet = noteSet;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.beatWidth = beatWidth;
        this.noteHeight = noteHeight;
        this.bpm = 120;
        this.ignore = false;
        this.playing = false;

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

        // Create entire frame
        this.frame = document.createElement("div");
        this.#createFrame();

        // Create transport controls
        // this.transport = new Transport(this);  
        // Create Time Bar
        this.timeBar = new TimeBar(this);
        // Create piano bar
        this.pianoBar = new PianoBar(this);
        // Create note grid
        this.noteGrid = new NoteGrid(this);
        // Create play head
        this.playHead = new PlayHead(this);

        // Scroll sync
        this.#syncScrolling();
        this.#scrollToFirstNote();
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
        this.ignore = false; // the ignore flag is something whose state needs to be stored in the object, 
        // allowing the firing of a frame's scroll event to disable the other frame's scroll event.
        this.noteGrid.frame.addEventListener("scroll", (event) => {
            if (this.ignore) {
                this.ignore = false;
                return;
            }
            this.ignore = true;
            this.pianoBar.frame.scrollTop = this.noteGrid.frame.scrollTop;
            this.timeBar.frame.scrollLeft = this.noteGrid.frame.scrollLeft;
        });
        this.pianoBar.frame.addEventListener("scroll", (event) => {
            if (this.ignore) {
                this.ignore = false;
                return;
            }
            this.ignore = true;
            this.noteGrid.frame.scrollTop = this.pianoBar.frame.scrollTop;
        });
        this.timeBar.frame.addEventListener("scroll", (event) => {
            if (this.ignore) {
                this.ignore = false;
                return;
            }
            this.ignore = true;
            this.noteGrid.frame.scrollLeft = this.timeBar.frame.scrollTop;
        });
    }

    #scrollToFirstNote() {
        let noteYPos = (this.maxDrawPitch - this.pitches[0]) * this.noteHeight;
        let halfPageY = parseInt(this.noteGrid.frame.style.height) / 2;
        noteYPos = noteYPos - halfPageY;
        this.noteGrid.frame.scrollTop = noteYPos;
    }

    get canvasHeight() {
        return this.noteHeight * (this.maxDrawPitch - this.minDrawPitch + 1);
    }

    get canvasWidth() {
        if (this.beatsFitInFrame) {
            return this.frameWidth;
        } else {
            return this.beatWidth * this.beatDrawCount;
        }
    }

    get pitches() {
        let pitches: number[] = [];
        this.noteSet.forEach(function(note: Note) {
            pitches.push(note.pitch);
        });
        return pitches;
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
        //return max(this.pitches) + this.pitchMargins;
        return 108;
    }

    get pitchesFitInFrame() {
        let heightInPitches = Math.ceil(this.frameHeight / this.noteHeight);
        // if difference between max(this.pitches) and min(this.pitches) is less than heightInPitches, return Math.ceil etc...
        if (this.pitchRange < heightInPitches) {
            return true;
        } else {
            return false;
        }
    }

    get beatsFitInFrame() {
        let widthInBeats = Math.ceil(this.frameWidth / this.beatWidth);
        if ((max(this.times) - min(this.times)) < widthInBeats) {
            return true;
        } else {
            return false;
        }
    }

    get pitchRange() {
        return max(this.pitches) - min(this.pitches);
    }

    get beatDrawCount() {
        if (this.beatsFitInFrame) {
            return Math.ceil(this.frameWidth / this.beatWidth);
        } else {
            return this.noteSet.slice(-1)[0].time + this.noteSet.slice(-1)[0].dur;
        }
    }
}

class PlayHead {
    pianoRoll: PianoRoll;
    playing: boolean;
    startTime: number;
    headPos: number;
    playTime: number;
    noteCtx: CanvasRenderingContext2D;
    // timeCtx: CanvasRenderingContext2D;

    constructor(pianoRoll: PianoRoll) {
        this.pianoRoll = pianoRoll;
        this.playing = false;
        this.startTime = 0; // Start position
        this.headPos = 0; // Playhead drawn position

        var noteCanvas: HTMLCanvasElement = document.createElement("canvas");
        noteCanvas.style.position = "absolute";
        noteCanvas.id = "playhead"
        this.noteCtx = noteCanvas.getContext("2d")!;
        noteCanvas.width = this.pianoRoll.canvasWidth;
        noteCanvas.height = this.pianoRoll.canvasHeight;
        this.playTime = 0;
        this.update = this.update.bind(this);
        this.pianoRoll.noteGrid.frame.append(noteCanvas);

        this.drawHead();
    }

    drawHead() {
        // Draw on note grid
        this.noteCtx.clearRect(0,0,this.pianoRoll.canvasWidth, this.pianoRoll.canvasHeight);
        this.noteCtx.beginPath();
        this.noteCtx.moveTo(this.headPos, 0);
        this.noteCtx.lineTo(this.headPos, this.pianoRoll.canvasHeight);
        this.noteCtx.strokeStyle = "white";
        this.noteCtx.lineWidth = 1;
        this.noteCtx.stroke();

        // Draw on time bar
    }

    play() {
        this.playing = true;
        requestAnimationFrame(this.update);
    }

    stop() {
        this.playing = false;
        this.headPos = this.startTime;
        this.playTime = 0;
        this.drawHead();
    }

    toggle() {
        if (this.playing) {
            this.stop();
        } else {
            this.play();
        }
    }

    update(now: any) {
        if (!this.playing) return;

        if (!this.playTime) { this.playTime = now }
        let elapsed = now - this.playTime;
        this.headPos = (elapsed/200) * this.pianoRoll.beatWidth;

        if (this.headPos >= this.pianoRoll.canvasWidth) {
            this.stop();
        }
        
        if (this.playing) {
            this.drawHead();
            requestAnimationFrame(this.update);
        }
    }
}


var pianoRoll: PianoRoll;

$(document).ready(function() {    
    let notes = makeNotes();
    pianoRoll = new PianoRoll(notes);

    document.body.onkeydown = function(e) {
        if (e.key == " ") {
            pianoRoll.playHead.toggle();
        }
    }
});



function clamp(number: number, min: number, max: number) : number {
    return Math.max(min, Math.min(number, max));
  }

function makeNotes() {
    let pitches = [41];
    let scale = [2,1,2];
    let scaleIdx = 0;
    for (let i=0; i<30; i++) {
        pitches.push(pitches.slice(-1)[0] + scale[scaleIdx]);
        scaleIdx = (scaleIdx + 1) % scale.length;
    }
    let notes: Note[] = [];
    for (let i=0; i<pitches.length; i++) {
        notes.push(new Note(pitches[i], i, 1));
    }
    return notes;
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
