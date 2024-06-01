new EventSource('/esbuild').addEventListener('change', () => location.reload());
"use strict";
(() => {
  // src/index.ts
  var SynthEngine = class {
    // synth: Tone.Synth;
    constructor() {
      this.playNote(60);
    }
    playNote(pitch) {
    }
  };
  var Note = class {
    constructor(pitch, time, dur) {
      this.pitch = pitch;
      this.time = time;
      this.dur = dur;
    }
  };
  var NoteGrid = class {
    constructor(pianoRoll2) {
      this.pianoRoll = pianoRoll2;
      this.frame = document.createElement("div");
      this.noteGrid = document.createElement("div");
      this.#createFrame();
      this.#drawBackdrop();
      this.#drawNotes();
    }
    #createFrame() {
      this.frame.id = "note-grid-frame";
      this.frame.style.position = "absolute";
      this.frame.style.top = this.pianoRoll.config.timeBarHeight + "px";
      this.frame.style.left = this.pianoRoll.config.pianoBarWidth + "px";
      this.frame.style.width = this.pianoRoll.config.frameWidth + "px";
      this.frame.style.height = this.pianoRoll.config.frameHeight + "px";
      this.frame.style.overflow = "scroll";
      this.frame.style.scrollbarWidth = "none";
      this.pianoRoll.frame.append(this.frame);
    }
    #drawBackdrop() {
      var canvas = document.createElement("canvas");
      canvas.id = "backdrop";
      canvas.style.position = "absolute";
      canvas.height = this.pianoRoll.canvasHeight;
      canvas.width = this.pianoRoll.canvasWidth;
      const ctx = canvas.getContext("2d");
      var colorOne = "rgb(80,80,80)";
      var colorTwo = "rgb(50,50,50)";
      var fillStyles = [colorOne, colorTwo, colorOne, colorTwo, colorOne, colorOne, colorTwo, colorOne, colorTwo, colorOne, colorTwo, colorOne];
      ctx.strokeStyle = "rgb(60,60,60)";
      ctx.lineWidth = 1;
      let j = 0;
      for (let i = this.pianoRoll.maxDrawPitch; i >= this.pianoRoll.minDrawPitch; i--) {
        ctx.fillStyle = fillStyles[i % 12];
        ctx.fillRect(0, this.pianoRoll.config.noteHeight * j, canvas.width, this.pianoRoll.config.noteHeight);
        j++;
      }
      j = 0;
      for (let i = this.pianoRoll.maxDrawPitch; i >= this.pianoRoll.minDrawPitch; i--) {
        if (i % 12 === 11) {
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
      for (let i = 0; i < this.pianoRoll.beatDrawCount; i++) {
        if (i % 4 === 0) {
          ctx.strokeStyle = "rgb(20,20,20)";
        } else {
          ctx.strokeStyle = "rgb(40,40,40)";
        }
        ctx.beginPath();
        ctx.moveTo(i * this.pianoRoll.config.beatWidth, 0);
        ctx.lineTo(i * this.pianoRoll.config.beatWidth, canvas.height);
        ctx.stroke();
      }
      this.frame.append(canvas);
    }
    #drawNotes() {
      this.noteGrid.id = "note-grid";
      this.noteGrid.style.position = "absolute";
      this.frame.append(this.noteGrid);
      if (!this.pianoRoll.noteSet) return;
      for (let i = 0; i < this.pianoRoll.noteSet.length; i++) {
        let note = document.createElement("button");
        note.style.position = "absolute";
        note.style.width = this.pianoRoll.config.beatWidth * this.pianoRoll.noteSet[i].dur + "px";
        note.style.height = this.pianoRoll.config.noteHeight + "px";
        note.style.left = this.pianoRoll.config.beatWidth * this.pianoRoll.noteSet[i].time + "px";
        note.style.top = this.pianoRoll.config.noteHeight * (this.pianoRoll.maxDrawPitch - this.pianoRoll.noteSet[i].pitch) + "px";
        note.innerHTML = this.pianoRoll.noteSet[i].pitch.toString();
        note.style.textAlign = "left";
        note.style.padding = "0px";
        note.style.fontSize = clamp(this.pianoRoll.config.noteHeight / 1.5, 0, 10) + "px";
        this.noteGrid.append(note);
      }
    }
  };
  var PianoBar = class {
    constructor(pianoRoll2) {
      this.width = 30;
      this.pianoRoll = pianoRoll2;
      this.frame = document.createElement("div");
      this.#createFrame();
      this.#draw();
    }
    #createFrame() {
      this.frame.id = "piano-bar-frame";
      this.frame.style.position = "absolute";
      this.frame.style.top = this.pianoRoll.config.timeBarHeight + "px";
      this.frame.style.width = this.width + "px";
      this.frame.style.height = this.pianoRoll.config.frameHeight + "px";
      this.frame.style.overflow = "scroll";
      this.frame.style.scrollbarWidth = "none";
      this.pianoRoll.frame.append(this.frame);
    }
    #draw() {
      var canvas = document.createElement("canvas");
      canvas.id = "piano-bar";
      canvas.style.position = "absolute";
      canvas.height = this.pianoRoll.canvasHeight;
      canvas.width = this.width;
      const ctx = canvas.getContext("2d");
      var colorOne = "white";
      var colorTwo = "black";
      var fillStyles = [colorOne, colorTwo, colorOne, colorTwo, colorOne, colorOne, colorTwo, colorOne, colorTwo, colorOne, colorTwo, colorOne];
      ctx.strokeStyle = "rgb(190,190,190)";
      ctx.lineWidth = 1;
      let j = 0;
      for (let i = this.pianoRoll.maxDrawPitch; i >= this.pianoRoll.minDrawPitch; i--) {
        ctx.fillStyle = fillStyles[i % 12];
        ctx.fillRect(0, this.pianoRoll.config.noteHeight * j, this.width, this.pianoRoll.config.noteHeight);
        j++;
      }
      j = 0;
      for (let i = this.pianoRoll.maxDrawPitch; i >= this.pianoRoll.minDrawPitch; i--) {
        if (i % 12 === 11) {
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
  };
  var TimeBar = class {
    constructor(pianoRoll2) {
      this.height = 30;
      this.pianoRoll = pianoRoll2;
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
      var canvas = document.createElement("canvas");
      canvas.id = "time-bar";
      canvas.width = this.pianoRoll.canvasWidth;
      canvas.height = this.height;
      var canvasFrame = document.createElement("div");
      canvasFrame.style.width = canvas.width + "px";
      canvasFrame.style.height = canvas.height + "px";
      canvasFrame.style.overflow = "hidden";
      canvasFrame.style.position = "absolute";
      const ctx = canvas.getContext("2d");
      ctx.strokeStyle = "rgb(50,50,50)";
      for (let i = 0; i < this.pianoRoll.barDrawCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 4 * this.pianoRoll.config.beatWidth, this.height / 3);
        ctx.lineTo(i * 4 * this.pianoRoll.config.beatWidth, this.height);
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
          console.log(timeLabel.style.width);
        }
        timeLabel.style.height = this.height + "px";
        timeLabel.style.left = i * this.pianoRoll.config.beatWidth * 4 + "px";
        timeLabel.style.textAlign = "left";
        timeLabel.style.paddingLeft = "5px";
        timeLabel.style.paddingTop = "10px";
        timeLabel.innerHTML = i.toString();
        canvasFrame.append(timeLabel);
      }
      canvasFrame.append(canvas);
      this.frame.append(canvasFrame);
    }
  };
  var Transport = class {
    constructor(pianoRoll2) {
      this.bgColor = "rgb(20,20,20)";
      this.pianoRoll = pianoRoll2;
      var canvas = document.createElement("canvas");
      this.button = document.createElement("button");
      this.ctx = canvas.getContext("2d");
      this.button.id = "transport-btn";
      this.button.style.position = "absolute";
      this.button.style.top = "0px";
      this.button.style.left = "0px";
      this.button.style.width = this.pianoRoll.config.pianoBarWidth + "px";
      this.button.style.height = this.pianoRoll.config.timeBarHeight + "px";
      this.button.style.border = "none";
      this.button.style.backgroundColor = "black";
      this.button.style.zIndex = "9";
      canvas.style.position = "absolute";
      canvas.style.top = "0px";
      canvas.style.left = "0px";
      canvas.width = this.pianoRoll.config.pianoBarWidth;
      canvas.height = this.pianoRoll.config.timeBarHeight;
      this.drawPlay();
      this.button.append(canvas);
      this.pianoRoll.frame.append(this.button);
    }
    drawPlay() {
      this.ctx.fillStyle = this.bgColor;
      this.ctx.fillRect(0, 0, this.pianoRoll.config.pianoBarWidth, this.pianoRoll.config.timeBarHeight);
      this.ctx.beginPath();
      this.ctx.moveTo(8, 7);
      this.ctx.lineTo(8, 23);
      this.ctx.lineTo(22, 15);
      this.ctx.closePath();
      this.ctx.fillStyle = "white";
      this.ctx.strokeStyle = "white";
      this.ctx.fill();
      this.ctx.stroke();
    }
    drawStop() {
      this.ctx.fillStyle = this.bgColor;
      this.ctx.fillRect(0, 0, this.pianoRoll.config.pianoBarWidth, this.pianoRoll.config.timeBarHeight);
      this.ctx.beginPath();
      this.ctx.moveTo(8, 7);
      this.ctx.lineTo(8, 23);
      this.ctx.lineTo(22, 23);
      this.ctx.lineTo(22, 7);
      this.ctx.closePath();
      this.ctx.fillStyle = "white";
      this.ctx.strokeStyle = "white";
      this.ctx.fill();
      this.ctx.stroke();
    }
  };
  var Config = class {
    constructor() {
      this.frameWidth = 800;
      this.frameHeight = 600;
      this.bpm = 120;
      this.beatWidth = 28;
      this.noteHeight = 18;
      this.pianoBarWidth = 30;
      this.timeBarHeight = 30;
    }
  };
  var PianoRoll = class {
    constructor(noteSet = []) {
      this.playing = false;
      this.scrollSync = false;
      this.noteSet = noteSet;
      let newNoteSet = [];
      for (let i = 0; i < this.noteSet.length; i++) {
        if (this.noteSet[i].pitch <= this.maxDrawPitch) {
          if (this.noteSet[i].pitch >= this.minDrawPitch) {
            newNoteSet.push(this.noteSet[i]);
          }
        }
      }
      this.noteSet = newNoteSet;
      this.config = new Config();
      this.synthEngine = new SynthEngine();
      this.frame = document.createElement("div");
      this.#createFrame();
      this.transport = new Transport(this);
      this.timeBar = new TimeBar(this);
      this.pianoBar = new PianoBar(this);
      this.noteGrid = new NoteGrid(this);
      this.playHead = new PlayHead(this);
      this.#syncScrolling();
      this.#scrollToFirstNote();
      this.#setupListeners();
    }
    #setupListeners() {
      this.transport.button.addEventListener("click", this.toggle.bind(this));
      document.body.addEventListener("keydown", (event) => {
        if (event.key === " ") {
          this.toggle();
        }
      });
    }
    #createFrame() {
      this.frame.id = "piano-roll";
      this.frame.style.position = "absolute";
      $("body").append(this.frame);
    }
    #syncScrolling() {
      this.scrollSync = false;
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
    #scrollToFirstNote() {
      let noteYPos = (this.maxDrawPitch - this.noteSet[0].pitch) * this.config.noteHeight;
      let halfPageY = parseInt(this.noteGrid.frame.style.height) / 2;
      noteYPos = noteYPos - halfPageY;
      this.noteGrid.frame.scrollTop = noteYPos;
    }
    play() {
      this.playing = true;
      this.transport.drawStop();
      this.playHead.play();
    }
    stop() {
      this.playing = false;
      this.transport.drawPlay();
      this.playHead.stop();
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
      let times = [];
      this.noteSet.forEach(function(note) {
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
      if (max(this.times) - min(this.times) < widthInBeats) {
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
  };
  var PlayHead = class {
    // timeCtx: CanvasRenderingContext2D; // render on time bar too
    constructor(pianoRoll2) {
      this.startTime = 0;
      this.headPos = 0;
      this.playTime = 0;
      this.pianoRoll = pianoRoll2;
      var noteCanvas = document.createElement("canvas");
      noteCanvas.id = "playhead";
      noteCanvas.style.position = "absolute";
      this.noteCtx = noteCanvas.getContext("2d");
      noteCanvas.width = this.pianoRoll.canvasWidth;
      noteCanvas.height = this.pianoRoll.canvasHeight;
      this.update = this.update.bind(this);
      this.pianoRoll.noteGrid.frame.append(noteCanvas);
      this.drawHead();
    }
    drawHead() {
      this.noteCtx.clearRect(0, 0, this.pianoRoll.canvasWidth, this.pianoRoll.canvasHeight);
      this.noteCtx.beginPath();
      this.noteCtx.moveTo(this.headPos, 0);
      this.noteCtx.lineTo(this.headPos, this.pianoRoll.canvasHeight);
      this.noteCtx.strokeStyle = "white";
      this.noteCtx.lineWidth = 1;
      this.noteCtx.stroke();
    }
    play() {
      requestAnimationFrame(this.update);
    }
    stop() {
      this.headPos = this.startTime;
      this.playTime = 0;
      this.drawHead();
    }
    update(now) {
      if (!this.pianoRoll.playing) return;
      if (!this.playTime) {
        this.playTime = now;
      }
      let elapsed = now - this.playTime;
      this.headPos = elapsed / 200 * this.pianoRoll.config.beatWidth;
      if (this.headPos >= this.pianoRoll.canvasWidth) {
        this.stop();
      }
      if (this.pianoRoll.playing) {
        this.drawHead();
        requestAnimationFrame(this.update);
      }
    }
  };
  function clamp(number, min2, max2) {
    return Math.max(min2, Math.min(number, max2));
  }
  function max(array) {
    let maximum = array[0];
    for (let i = 1; i < array.length; i++) {
      if (maximum < array[i]) {
        maximum = array[i];
      }
    }
    return maximum;
  }
  function min(array) {
    let minimum = array[0];
    for (let i = 1; i < array.length; i++) {
      if (minimum > array[i]) {
        minimum = array[i];
      }
    }
    return minimum;
  }
  function makeNotes() {
    let pitches = [41];
    let scale = [2, 1, 2];
    let scaleIdx = 0;
    for (let i = 0; i < 30; i++) {
      pitches.push(pitches.slice(-1)[0] + scale[scaleIdx]);
      scaleIdx = (scaleIdx + 1) % scale.length;
    }
    let notes = [];
    for (let i = 0; i < pitches.length; i++) {
      notes.push(new Note(pitches[i], i, 1));
    }
    return notes;
  }
  var pianoRoll;
  $(function() {
    let notes = makeNotes();
    pianoRoll = new PianoRoll(notes);
  });
})();
//# sourceMappingURL=bundle.js.map
