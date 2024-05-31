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

class PianoRoll {
    noteSet: Note[];
    frameWidth: number;
    frameHeight: number;
    beatWidth: number;
    playing: boolean;
    noteHeight: number;
    bpm: number;
    pianoBarWidth: number;
    timeBarHeight: number;
    timeBarFrame: HTMLDivElement;
    wholeFrame: HTMLDivElement;
    pianoBarFrame: HTMLDivElement;
    notesFrame: HTMLDivElement;
    transportBtn: HTMLButtonElement;
    transportCanvas: HTMLCanvasElement;
    transportView: CanvasRenderingContext2D;
    timeBar: HTMLCanvasElement;
    pianoBar: HTMLCanvasElement;
    backdrop: HTMLCanvasElement;
    noteGrid: HTMLDivElement;
    playHead: PlayHead;
    ignore: boolean;

    constructor(noteSet: Note[] = [], frameWidth: number = 800, frameHeight: number = 600, beatWidth: number = 28, noteHeight: number = 18) {
        this.noteSet = noteSet;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.beatWidth = beatWidth;
        this.noteHeight = noteHeight;
        this.bpm = 120;
        this.pianoBarWidth = 30;
        this.timeBarHeight = 30;
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
        this.wholeFrame = document.createElement("div");
        this.#createWholeFrame();
        // Create transport controls
        this.transportCanvas = document.createElement("canvas");
        this.transportView = this.transportCanvas.getContext("2d")!;
        this.transportBtn = document.createElement("button");
        this.#createTransport();
        // Create timeBarFrame up top
        this.timeBarFrame = document.createElement("div");
        this.#createTimeBarFrame();
        // Create pianoBarFrame on the left
        this.pianoBarFrame = document.createElement("div");
        this.#createPianoBarFrame();
        // Create notesFrame and insert into document
        this.notesFrame = document.createElement("div");
        this.#createNotesFrame();
        // Create play/stop button
        this.#createTransport();
        // Create time bar
        this.timeBar = document.createElement("canvas");
        this.#createTimeBar();
        // Create piano bar
        this.pianoBar = document.createElement("canvas");
        this.#drawPianoBar();
        // Create piano grid this.backdrop
        this.backdrop = document.createElement("canvas");
        this.#drawBackdrop();
        // Create note grid
        this.noteGrid = document.createElement("div");
        this.#drawNotes();
        // Create play head
        this.playHead = new PlayHead(this.canvasWidth, this.canvasHeight, this.beatWidth);
        this.notesFrame.append(this.playHead.canvas);

        // Scroll sync
        this.#syncScrolling();
        this.scrollToFirstNote();
    }

    #createTransport() {
        this.transportBtn.id = "transport-btn";
        this.transportBtn.style.position = "absolute";
        this.transportBtn.style.top = "0px";
        this.transportBtn.style.left = "0px";
        this.transportBtn.style.width = this.pianoBarWidth + "px";
        this.transportBtn.style.height = this.timeBarHeight + "px";
        this.transportBtn.style.border = "none";
        this.transportBtn.style.backgroundColor = "black";
        
        this.transportBtn.addEventListener('click', () => { this.#toggle.bind(this) });

        this.transportCanvas.id = "time-control";
        this.transportCanvas.style.position = "absolute";
        this.transportCanvas.style.top = "0px";
        this.transportCanvas.style.left = "0px";
        this.transportCanvas.width = this.pianoBarWidth;
        this.transportCanvas.height = this.timeBarHeight;

        this.#drawPlay();        

        this.transportBtn.append(this.transportCanvas);
        this.wholeFrame.append(this.transportBtn);
    }

    #toggle() {
        console.log("we're toggling, baby");
        if (this.playing) { 
            this.playing = false;
            this.#drawPlay();
            this.playHead.toggle();
        } else {
            this.playing = true;
            this.#drawStop();
            this.playHead.toggle();
        }
    }

    #drawPlay() {
        let ctx: CanvasRenderingContext2D = this.transportView;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.pianoBarWidth, this.timeBarHeight);
        ctx.beginPath();
        ctx.moveTo(8,7);
        ctx.lineTo(8,23);
        ctx.lineTo(22,15);
        ctx.closePath();
        ctx.fillStyle = "white";
        ctx.strokeStyle = "white";
        ctx.fill();
        ctx.stroke();
    }

    #drawStop() {
        let ctx: CanvasRenderingContext2D = this.transportView;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.pianoBarWidth, this.timeBarHeight);
        ctx.beginPath();
        ctx.moveTo(8,7);
        ctx.lineTo(8,23);
        ctx.lineTo(22,23);
        ctx.lineTo(22,7);
        ctx.closePath();
        ctx.fillStyle = "white";
        ctx.strokeStyle = "white";
        ctx.fill();
        ctx.stroke();
    }

    #createTimeBarFrame() {
        this.timeBarFrame.id = "time-bar-frame";
        this.timeBarFrame.style.position = "absolute";
        this.timeBarFrame.style.left = this.pianoBarWidth + "px";
        this.timeBarFrame.style.width = this.frameWidth + "px";
        this.timeBarFrame.style.height = this.timeBarHeight + "px";
        this.timeBarFrame.style.overflow = "scroll";
        this.timeBarFrame.style.scrollbarWidth = "none";
        this.timeBarFrame.style.backgroundColor = "dark gray";
        this.wholeFrame.append(this.timeBarFrame);
    }

    #createTimeBar() {
        this.timeBar.id = "time-bar";
        this.timeBar.width = this.canvasWidth;
        this.timeBar.height = this.timeBarHeight;
        const ctx: CanvasRenderingContext2D = this.timeBar.getContext("2d")!;

        ctx.strokeStyle = "rgb(50,50,50)";
        for (let i=0; i<this.beatDrawCount; i++) {
            if (i%4 === 0) {
                ctx.beginPath();
                ctx.moveTo(i*this.beatWidth, this.timeBarHeight / 3);
                ctx.lineTo(i*this.beatWidth, this.timeBarHeight);
                ctx.stroke();

                let timeLabel = document.createElement("div");
                timeLabel.style.color = "gray";
                timeLabel.style.fontFamily = "Verdana";
                timeLabel.style.fontSize = "12px";
                timeLabel.style.position = "absolute";
                timeLabel.style.width = this.beatWidth * 4 + "px";
                timeLabel.style.height = this.timeBarHeight + "px";
                timeLabel.style.left = i*this.beatWidth + "px";
                timeLabel.style.textAlign = "left";
                timeLabel.style.paddingLeft = "5px";
                timeLabel.style.paddingTop = "10px";
                timeLabel.innerHTML = i.toString();
                this.timeBarFrame.append(timeLabel);
            }
        }
        
        this.timeBarFrame.append(this.timeBar);
    }

    #syncScrolling() {
        // Scroll sync. Add event listeners to notesFrame and pianoBarFrame, 
        // such that when one is scrolled, the other scrolls too.
        // Ideally, when one frame is scrolled, we'd remove the event listener from the other frame, 
        // perform the scroll, set scrollTop, then add the other event listener again.
        //
        this.ignore = false; // the ignore flag is something whose state needs to be stored in the object, 
        // allowing the firing of a frame's scroll event to disable the other frame's scroll event.
        this.notesFrame.addEventListener("scroll", (event) => {
            if (this.ignore) {
                this.ignore = false;
                return;
            }
            this.ignore = true;
            this.pianoBarFrame.scrollTop = this.notesFrame.scrollTop;
            this.timeBarFrame.scrollLeft = this.notesFrame.scrollLeft;
        });
        this.pianoBarFrame.addEventListener("scroll", (event) => {
            if (this.ignore) {
                this.ignore = false;
                return;
            }
            this.ignore = true;
            this.notesFrame.scrollTop = this.pianoBarFrame.scrollTop;
        });
        this.timeBarFrame.addEventListener("scroll", (event) => {
            if (this.ignore) {
                this.ignore = false;
                return;
            }
            this.ignore = true;
            this.notesFrame.scrollLeft = this.timeBarFrame.scrollTop;
        });
    }

    #createPianoBarFrame() {
        this.pianoBarFrame.id = "piano-bar-frame"
        this.pianoBarFrame.style.position = "absolute";
        this.pianoBarFrame.style.top = this.timeBarHeight + "px";
        this.pianoBarFrame.style.width = this.pianoBarWidth + "px";
        this.pianoBarFrame.style.height = this.frameHeight + "px";
        this.pianoBarFrame.style.overflow = "scroll";
        this.pianoBarFrame.style.scrollbarWidth = "none";
        this.wholeFrame.append(this.pianoBarFrame);
    }

    #createWholeFrame() {
        // Create frame for entire piano roll
        this.wholeFrame.id = "piano-roll-frame"
        this.wholeFrame.style.position = "absolute";
        $("body").append(this.wholeFrame);
    }

    #createNotesFrame() {
        this.notesFrame.id = "note-grid-frame"
        this.notesFrame.style.position = "absolute";
        this.notesFrame.style.top = this.timeBarHeight + "px";
        this.notesFrame.style.left = this.pianoBarWidth + "px";
        this.notesFrame.style.width = this.frameWidth + "px";
        this.notesFrame.style.height = this.frameHeight + "px";
        this.notesFrame.style.overflow = "scroll"; 
        this.notesFrame.style.scrollbarWidth = "none";
        this.wholeFrame.append(this.notesFrame);
    }

    #drawBackdrop() {
        this.backdrop.id = "backdrop";
        this.backdrop.style.position = "absolute";

        this.backdrop.height = this.canvasHeight;
        this.backdrop.width = this.canvasWidth;

        const ctx: CanvasRenderingContext2D = this.backdrop.getContext("2d")!;
        var colorOne = "rgb(80,80,80)";
        var colorTwo = "rgb(50,50,50)";
        var fillStyles = [colorOne, colorTwo, colorOne, colorTwo, colorOne, colorOne, colorTwo, colorOne, colorTwo, colorOne, colorTwo, colorOne];

        // Pitch lanes
        ctx.strokeStyle = "rgb(60,60,60)";
        ctx.lineWidth = 1;
        
        // These two for loops iterate through the pitches present in the piano roll, from high to low.
        let j = 0;
        for (let i=this.maxDrawPitch; i>=this.minDrawPitch; i--) { // Fill
            ctx.fillStyle = fillStyles[i%12];
            ctx.fillRect(0, this.noteHeight * j, this.backdrop.width, this.noteHeight);
            j++;
        }
        j=0;
        for (let i=this.maxDrawPitch; i>=this.minDrawPitch; i--) { // Stroke
            if (i%12 === 11) {
                ctx.strokeStyle = "rgb(20,20,20)";
            } else {
                ctx.strokeStyle = colorTwo;
            }
            ctx.beginPath();
            ctx.moveTo(0, j * this.noteHeight);
            ctx.lineTo(this.backdrop.width, j * this.noteHeight);
            ctx.stroke();
            j++;
        }

        // Time markers
        for (let i=0; i<this.beatDrawCount; i++) {
            if (i%4 === 0) {
                ctx.strokeStyle = "rgb(20,20,20)";
            } else {
                ctx.strokeStyle = "rgb(40,40,40)";
            }
            ctx.beginPath();
            ctx.moveTo(i*this.beatWidth, 0);
            ctx.lineTo(i*this.beatWidth, this.backdrop.height);
            ctx.stroke();
        }

        this.notesFrame.append(this.backdrop);
    }

    #drawNotes() {
        // Note: you want to draw the earliest notes first, because when two notes overlap, the leftmost note should always be on top.
        this.noteGrid.id = "note-grid";
        this.noteGrid.style.position = "absolute";
        this.notesFrame.append(this.noteGrid);

        if (!this.noteSet) return;

        for (let i=0; i<this.noteSet.length; i++) {
            let note: HTMLButtonElement = document.createElement("button");
            note.style.position = "absolute";
            note.style.width = (this.beatWidth * this.noteSet[i].dur) + "px";
            note.style.height = this.noteHeight + "px";
            note.style.left = (this.beatWidth * this.noteSet[i].time) + "px";
            note.style.top = (this.noteHeight * (this.maxDrawPitch - this.noteSet[i].pitch)) + "px";
            note.innerHTML = this.noteSet[i].pitch.toString();
            note.style.textAlign = "left";
            // note.style.verticalAlign = "middle";
            note.style.padding = 0+"px";
            note.style.fontSize = clamp(this.noteHeight/1.5, 0, 10) + "px";
            this.noteGrid.append(note);
        }
    }

    #drawPianoBar() {
        this.pianoBar.id = "piano-bar";
        this.pianoBar.style.position = "absolute";

        this.pianoBar.height = this.canvasHeight;
        this.pianoBar.width = this.pianoBarWidth;

        const ctx: CanvasRenderingContext2D = this.pianoBar.getContext("2d")!;
        var colorOne = "white";
        var colorTwo = "black";
        var fillStyles = [colorOne, colorTwo, colorOne, colorTwo, colorOne, colorOne, colorTwo, colorOne, colorTwo, colorOne, colorTwo, colorOne];

        // Pitch lanes
        ctx.strokeStyle = "rgb(190,190,190)";
        ctx.lineWidth = 1;
        
        // These two for loops iterate through the pitches present in the piano roll, from high to low.
        let j = 0;
        for (let i=this.maxDrawPitch; i>=this.minDrawPitch; i--) { // Fill
            ctx.fillStyle = fillStyles[i%12];
            ctx.fillRect(0, this.noteHeight * j, this.pianoBarWidth, this.noteHeight);
            j++;
        }
        j=0;
        for (let i=this.maxDrawPitch; i>=this.minDrawPitch; i--) { // Stroke
            if (i%12 === 11) {
                ctx.strokeStyle = "rgb(20,20,20)";
            } else {
                ctx.strokeStyle = colorTwo;
            }
            ctx.beginPath();
            ctx.moveTo(0, j * this.noteHeight);
            ctx.lineTo(this.pianoBar.width, j * this.noteHeight);
            ctx.stroke();
            j++;
        }

        this.pianoBarFrame.append(this.pianoBar);
    }

    scrollToFirstNote() {
        let noteYPos = (this.maxDrawPitch - this.pitches[0]) * this.noteHeight;
        let halfPageY = parseInt(this.notesFrame.style.height) / 2;
        noteYPos = noteYPos - halfPageY;
        this.notesFrame.scrollTop = noteYPos;
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
    start: number;
    playing: boolean;
    beatWidth: number;
    x: number;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    playTime: number;


    constructor(width: number, height: number, beatWidth: number) {
        this.start = 0; // Start position
        this.playing = false;
        this.beatWidth = beatWidth;
        this.x = 0; // Playhead drawn position
        this.canvas = document.createElement("canvas");
        this.canvas.style.position = "absolute";
        this.canvas.id = "playhead"
        this.ctx = this.canvas.getContext("2d")!;
        this.canvas.width = width;
        this.canvas.height = height;
        this.playTime = 0;
        this.update = this.update.bind(this);

        this.drawHead();
    }

    drawHead() {
        this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, 0);
        this.ctx.lineTo(this.x, this.canvas.height);
        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }

    play() {
        this.playing = true;
        requestAnimationFrame(this.update);
    }

    stop() {
        this.playing = false;
        this.x = this.start;
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
        this.x = (elapsed/200) * this.beatWidth;

        if (this.x >= this.canvas.width) {
            this.stop();
        }
        
        if (this.playing) {
            this.drawHead();
            requestAnimationFrame(this.update);
        }
    }
}

var pianoroll: PianoRoll;

$(document).ready(function() {    
    let notes = makeNotes();
    pianoroll = new PianoRoll(notes);

    document.body.onkeydown = function(e) {
        if (e.key == " ") {
            pianoroll.playHead.toggle();
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
