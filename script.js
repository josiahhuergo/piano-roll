/*
TODO

- Clean up code
- Add time bar with positions in beats, like 0, 4, 8, 12, etc.
- Add transport controls, play/stop toggle between playing and not playing, 
    with a start position variable.
- Add synth that produces sound, like tone.js
- Play notes when pressing keys on piano bar left of frame
- Note creation, deletion, dragging across grid, etc.
- Scroll with moving playhead in chunks
- Set playhead speed with respect to piano roll bpm
*/

class Note {
    constructor(pitch, time, dur) {
        this.pitch = pitch;
        this.time = time;
        this.dur = dur;
    }
}

class PianoRoll {
    constructor(noteSet = [], frameWidth = 800, frameHeight = 600, beatWidth = 28, noteHeight = 18) {
        this.noteSet = noteSet;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.beatWidth = beatWidth;
        this.noteHeight = noteHeight;
        this.bpm = 120;
        this.pitchMargins = 0;
        this.pianoBarWidth = 30;
        this.timeBarHeight = 30;

        // Remove notes that can't be displayed
        let newNoteSet = [];
        for (let i=0; i<this.noteSet.length; i++) {
            if (this.noteSet[i].pitch <= this.maxDrawPitch) {
                if (this.noteSet[i].pitch >= this.minDrawPitch) {
                    newNoteSet.push(this.noteSet[i]);
                }
            }
        }
        this.noteSet = newNoteSet;

        // Create entire frame
        this.#createWholeFrame();
        // Create notesFrame and insert into document
        this.#createNotesFrame();
        // Create play/stop button
        this.#createTransport();
        // Create timeBarFrame up top
        this.#createTimeBarFrame();
        // Create time bar
        this.#createTimeBar();
        // Create pianoBarFrame on the left
        this.#createPianoBarFrame();
        // Create piano bar
        this.#drawPianoBar();
        // Create piano grid this.backdrop
        this.#drawBackdrop();
        // Create note grid
        this.#drawNotes();
        // Draw play head
        this.#drawPlayhead();

        // Scroll sync
        this.#syncScrolling();
        this.scrollToFirstNote();
    }

    #createTransport() {

    }

    #createTimeBarFrame() {
        this.timeBarFrame = document.createElement("div");
        this.timeBarFrame.id = "time-bar-frame";
        this.timeBarFrame.style.position = "absolute";
        this.timeBarFrame.style.left = this.pianoBarWidth + "px";
        this.timeBarFrame.style.width = this.frameWidth + "px";
        this.timeBarFrame.style.height = this.timeBarHeight + "px";
        this.timeBarFrame.style.overflow = "scroll";
        this.timeBarFrame.style.scrollbarWidth = "none";
        this.timeBarFrame.style.backgroundColor = "rgb(111,111,111)";
        this.wholeFrame.append(this.timeBarFrame);
    }

    #createTimeBar() {
        
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
        });
        this.pianoBarFrame.addEventListener("scroll", (event) => {
            if (this.ignore) {
                this.ignore = false;
                return;
            }
            this.ignore = true;
            this.notesFrame.scrollTop = this.pianoBarFrame.scrollTop;
        });
    }

    #createPianoBarFrame() {
        this.pianoBarFrame = document.createElement("div");
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
        this.wholeFrame = document.createElement("div");
        this.wholeFrame.id = "piano-roll-frame"
        this.wholeFrame.style.position = "absolute";
        $("body").append(this.wholeFrame);
    }

    #createNotesFrame() {
        this.notesFrame = document.createElement("div");
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

    #drawPlayhead() {
        this.playHead = new PlayHead(this.canvasWidth, this.canvasHeight, this.beatWidth);
        this.notesFrame.append(this.playHead.canvas);
    }

    #drawBackdrop() {
        this.backdrop = document.createElement("canvas");
        this.backdrop.id = "backdrop";
        this.backdrop.style.position = "absolute";

        this.backdrop.height = this.canvasHeight;
        this.backdrop.width = this.canvasWidth;

        const ctx = this.backdrop.getContext("2d");
        var colorOne = "rgb(80,80,80)";
        var colorTwo = "rgb(50,50,50)";
        var fillStyles = [colorOne, colorTwo, colorOne, colorTwo, colorOne, colorOne, colorTwo, colorOne, colorTwo, colorOne, colorTwo, colorOne];

        // Pitch lanes
        ctx.strokeStyle = "rgb(60,60,60)";
        ctx.strokeWidth = 1;
        
        // These two for loops iterate through the pitches present in the piano roll, from high to low.
        // j is another iterator that runs from 0 to pitchDrawRange-1.
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
        this.noteGrid = document.createElement("div");
        this.noteGrid.id = "note-grid";
        this.noteGrid.style.position = "absolute";
        this.notesFrame.append(this.noteGrid);

        if (!this.noteSet) return;

        for (let i=0; i<this.noteSet.length; i++) {
            let note = document.createElement("button");
            note.style.position = "absolute";
            note.style.width = (this.beatWidth * this.noteSet[i].dur) + "px";
            note.style.height = this.noteHeight + "px";
            note.style.left = (this.beatWidth * this.noteSet[i].time) + "px";
            note.style.top = (this.noteHeight * (this.maxDrawPitch - this.noteSet[i].pitch)) + "px";
            note.innerHTML = this.noteSet[i].pitch;
            note.style.textAlign = "left";
            // note.style.verticalAlign = "middle";
            note.style.padding = 0+"px";
            note.style.fontSize = clamp(this.noteHeight/1.5, 0, 10) + "px";
            this.noteGrid.append(note);
        }
    }

    #drawPianoBar() {
        this.pianoBar = document.createElement("canvas");
        this.pianoBar.id = "piano-bar";
        this.pianoBar.style.position = "absolute";

        this.pianoBar.height = this.canvasHeight;
        this.pianoBar.width = this.pianoBarWidth;

        const ctx = this.pianoBar.getContext("2d");
        var colorOne = "white";
        var colorTwo = "black";
        var fillStyles = [colorOne, colorTwo, colorOne, colorTwo, colorOne, colorOne, colorTwo, colorOne, colorTwo, colorOne, colorTwo, colorOne];

        // Pitch lanes
        ctx.strokeStyle = "rgb(190,190,190)";
        ctx.strokeWidth = 1;
        
        // These two for loops iterate through the pitches present in the piano roll, from high to low.
        // j is another iterator that runs from 0 to pitchDrawRange-1.
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
        // if (this.pitchesFitInFrame) {
        //     return this.frameHeight;
        // } else {
        //     return this.noteHeight * this.pitchDrawRange; 
        // }
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
        let pitches = [];
        this.noteSet.forEach(function(note) {
            pitches.push(note.pitch);
        });
        return pitches;
    }

    get times() {
        let times = [];
        this.noteSet.forEach(function(note) {
            times.push(note.time);
        });
        return times;
    }

    get minDrawPitch() {
        //return this.maxDrawPitch - this.pitchDrawRange;
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

    get pitchDrawRange() {
        // if (this.pitchesFitInFrame) {
        //     return Math.ceil(this.backdrop.height / this.noteHeight);
        // } else {
            return this.pitchRange + (this.pitchMargins * 2) + 1;
        // }
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
    constructor(width, height, beatWidth) {
        this.start = 0; // Start position
        this.playing = false;
        this.beatWidth = beatWidth;
        this.x = 0; // Playhead drawn position
        this.canvas = document.createElement("canvas");
        this.canvas.style.position = "absolute";
        this.canvas.id = "playhead"
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = width;
        this.canvas.height = height;
        this.playTime = 0;
        this.current_time;
        this.update = this.update.bind(this);

        this.drawHead();
    }

    drawHead() {
        this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, 0);
        this.ctx.lineTo(this.x, this.canvas.height);
        this.ctx.strokeStyle = "white";
        this.ctx.strokeWidth = 1;
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

    update(now) {
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

var pianoroll;

$(document).ready(function() {    
    let notes = makeNotes();
    pianoroll = new PianoRoll(notes, window.width, window.height);

    document.body.onkeyup = function(e) {
        if (e.key == " ") {
            pianoroll.playHead.toggle();
        }
    }
});



function clamp(number, min, max) {
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
    let notes = [];
    for (let i=0; i<pitches.length; i++) {
        notes.push(new Note(pitches[i], i, 1));
    }
    return notes;
}

function max(array) {
    let maximum = array[0];

    for (let i=1; i<array.length; i++) {
        if (maximum < array[i]) {
            maximum = array[i];
        }
    }
    
    return maximum;
}

function min(array) {
    let minimum = array[0];

    for (let i=1; i<array.length; i++) {
        if (minimum > array[i]) {
            minimum = array[i];
        }
    }
    
    return minimum;
}

function clone(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}