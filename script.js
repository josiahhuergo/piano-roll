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

        // Create flexbox that holds pianoBarFrame and notesFrame
        this.wholeFrame = document.createElement("div");
        this.wholeFrame.style.position = "absolute";
        this.wholeFrame.style.padding = 15;
        this.wholeFrame.style.margin = -15;
        $("body").append(this.wholeFrame);

        // Create pianoBarFrame on the left
        this.pianoBarFrame = document.createElement("div");
        this.pianoBarFrame.style.position = "absolute";
        this.pianoBarFrame.style.width = this.pianoBarWidth + "px";
        this.pianoBarFrame.style.height = frameHeight + "px";
        this.pianoBarFrame.style.overflow = "scroll";
        this.pianoBarFrame.style.scrollbarWidth = "none";
        this.pianoBarFrame.style.padding = 15;
        this.pianoBarFrame.style.margin = -15;
        this.wholeFrame.append(this.pianoBarFrame);

        // Create piano bar
        this.#drawPianoBar();

        // Create notesFrame and insert into document
        this.notesFrame = document.createElement("div");
        this.notesFrame.style.position = "absolute";
        this.notesFrame.style.left = this.pianoBarWidth + "px";
        this.notesFrame.style.width = frameWidth + "px";
        this.notesFrame.style.height = frameHeight + "px";
        this.notesFrame.style.overflow = "scroll"; 
        this.notesFrame.style.scrollbarWidth = "none";
        this.wholeFrame.append(this.notesFrame);

        // Create piano grid this.backdrop
        this.#drawBackdrop();

        // Create note grid
        this.#drawNotes();

        // Draw play head
        this.#drawPlayhead();

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

        this.notesFrame.scrollTop = this.backdrop.height;
    }

    #drawPlayhead() {
        // this.playHead = document.createElement("")
    }

    #drawBackdrop() {
        this.backdrop = document.createElement("canvas");
        this.backdrop.style.position = "absolute";

        this.backdrop.height = this.canvasHeight;

        if (this.beatsFitInFrame) {
            this.backdrop.width = this.frameWidth;
        } else {
            this.backdrop.width = this.beatWidth * this.beatDrawCount;
        }

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
        for (let i=this.maxDrawPitch; i>this.minDrawPitch; i--) { // Fill
            ctx.fillStyle = fillStyles[i%12];
            ctx.fillRect(0, this.noteHeight * j, this.backdrop.width, this.noteHeight);
            j++;
        }
        j=0;
        for (let i=this.maxDrawPitch; i>this.minDrawPitch; i--) { // Stroke
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
        for (let i=this.maxDrawPitch; i>this.minDrawPitch; i--) { // Fill
            ctx.fillStyle = fillStyles[i%12];
            ctx.fillRect(0, this.noteHeight * j, this.pianoBarWidth, this.noteHeight);
            j++;
        }
        j=0;
        for (let i=this.maxDrawPitch; i>this.minDrawPitch; i--) { // Stroke
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

    get canvasHeight() {
        if (this.pitchesFitInFrame) {
            return this.frameHeight;
        } else {
            return this.noteHeight * this.pitchDrawRange; 
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
        return this.maxDrawPitch - this.pitchDrawRange;
    }

    get maxDrawPitch() {
        return max(this.pitches) + this.pitchMargins;
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
        let widthInBeats = Math.ceil(this.backdrop.width / this.beatWidth);
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
        if (this.pitchesFitInFrame) {
            return Math.ceil(this.backdrop.height / this.noteHeight);
        } else {
            return this.pitchRange + (this.pitchMargins * 2) + 1;
        }
    }

    get beatDrawCount() {
        if (this.beatsFitInFrame) {
            return Math.ceil(this.backdrop.width / this.beatWidth);
        } else {
            return this.noteSet.slice(-1)[0].time + this.noteSet.slice(-1)[0].dur;
        }
    }
}

var pianoroll;

$(document).ready(function() {    
    let notes = makeNotes();
    pianoroll = new PianoRoll(notes);
});


















/*


The Island of Far Away Things...


*/














function clamp(number, min, max) {
    return Math.max(min, Math.min(number, max));
  }

function makeNotes() {
    let pitches = [30];
    let scale = [2,1,2];
    let scaleIdx = 0;
    for (let i=0; i<40; i++) {
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