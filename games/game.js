import { NORMAL_SPEED, FAST_SPEED } from "../config.js";

export default class Game {
  score = 0; //Field holding current score

  // Fields holdin info about pause and current speed
  isPaused = false;
  #ifFastSpeed = false;

  // Field holding Interval function so that it can be removed later
  #gameIntervalFunction;

  // Fields holding all movement controls names
  upMovementControls = ["w", "up-btn", "ArrowUp"];
  downMovementControls = ["s", "ArrowDown", "down-btn"];
  leftMovementControls = ["a", "ArrowLeft", "left-btn"];
  rightMovementControls = ["d", "ArrowRight", "right-btn"];

  // Fields holding document dom elements to not query for them multiple times
  #gameEl = document.getElementById("game");
  #menuEl = document.getElementById("menu");

  #mapEl = document.querySelector(`.game-map`);
  #scoreEl = document.querySelector(`.game-score`);
  #controlsEl = document.querySelector(`.game-controls`);

  #pauseEl = document.querySelector(".pause");
  #overlayEl = document.querySelector(".overlay");
  #speedBtnEl = document.getElementById("speed-btn");
  #gameOverEl = document.querySelector(".menu-game-over");

  upInstructionEl = document.getElementById("up-instruction");
  upBtnEl = document.getElementById("up-btn");

  constructor(x, y, game) {
    // 1) GET MAP SIZE AND SHAPE TO BE GENERATED
    this.x = x;
    this.y = y;
    this.game = game;

    // 2) GET BOUND FUNCTIONS FOR REMOVING EVENT LISTENER
    this.boundListenToControls = this.listenToControls.bind(this);
    this.boundListenToKeys = this.listenToKeys.bind(this);
    this.boundPauseGame = this.pauseGame.bind(this);
  }
  prepareGame() {
    // 1) TAKE CARE OF VISUAL SETUP
    this.toggleHidden();
    this.generateMap();
    this.insertScore();

    // 2) ATTACH EVENT LISTENERS TO CONTROLS
    this.attachListeners();

    // 3) START GAME
    this.startGame(NORMAL_SPEED);
  }

  ////////////////////////////////////////////////////////////////
  // PREPARE GAME SCREEN
  toggleHidden() {
    this.#menuEl.classList.toggle("hidden");
    this.#gameEl.classList.toggle("hidden");
  }

  // GENERATE GAME TILES AND GIVE THEM DATA
  generateMap() {
    this.#mapEl.classList.add(`${this.game}-map`);

    this.#mapEl.innerHTML = "";
    for (let i = 0; i < this.y; i++) {
      for (let j = 0; j < this.x; j++) {
        this.#mapEl.insertAdjacentHTML(
          "beforeend", // 00 01 02 ... 98 99
          `<div class="game-tile" data-pos="${j},${i}"></div>` //data-pos=x,y
        );
      }
    }
  }

  insertScore() {
    this.#scoreEl.innerHTML = `SCORE: ${this.score}`;
  }

  // SET UNIQUE INSTRUCITONS AND BUTTONS DEPENDING ON GAME
  setInstructionsAndButtons(upInstruction, upButton) {
    this.upInstructionEl.innerHTML = upInstruction;
    this.upBtnEl.innerHTML = upButton;
  }
  ////////////////////////////////////////////////////////////////
  // EVENT LISTENERS
  attachListeners() {
    // 1) ATTACH FUNCTIONS TO BTNS
    this.#controlsEl
      .querySelector(".controls-buttons")
      .addEventListener("click", this.boundListenToControls);

    // 2) ATTACH FUNCTIONS TO KEYS
    window.addEventListener("keydown", this.boundListenToKeys);

    // 3) ATTACH UNPAUSE WHEN CLICKED ON PAUSE OR OVERLAY
    this.#pauseEl.addEventListener("click", this.boundPauseGame);
    this.#overlayEl.addEventListener("click", this.boundPauseGame);
  }

  listenToControls(e) {
    // 1a) GET BTN AND CHECK IF FOUND
    const btn = e.target.closest(".controls-btn");
    if (!btn) return;

    // 1b) CALL checkClicked FN WITH ARGUMENTS FOR CHECKING BTNS
    this.checkClicked(btn.id, "pause-btn", "speed-btn");
  }

  listenToKeys(e) {
    // 2a) prevent default to avoid bug when clicking pause btn and then spacebar
    e.preventDefault();

    // 2b) CALL checkClicked FN WITH ARGUMENTS FOR CHECKING KEYS
    this.checkClicked(e.key, " ", "r");
  }

  // CHECK WHAT BTN/KEY WAS CLICKED ON
  checkClicked(clicked, pause, speed) {
    //1) CHECK PAUSE AND SPEED BTN/KEY
    if (clicked === pause) this.pauseGame();
    if (clicked === speed) this.changeSpeed();
    // REST IS DEFINED IN CHILD CLASS
  }

  // PAUSE
  pauseGame() {
    // 1) TOGGLE OVERLAY AND PAUSE SCREEN
    this.#pauseEl.classList.toggle("hidden");
    this.#overlayEl.classList.toggle("hidden");
    // 2) CHANGE isPaused TO OPPOSITE
    this.isPaused = !this.isPaused;
  }

  // SPEED
  changeSpeed() {
    // 1) CHANGE SPEED (NORMAL <-> FAST)
    this.#ifFastSpeed = !this.#ifFastSpeed;
    // 2) CHANGE ICON FOR BUTTON
    this.#speedBtnEl.innerHTML = this.#ifFastSpeed
      ? `<ion-icon name="play-forward-circle-outline"></ion-icon>`
      : `<ion-icon name="play-circle-outline"></ion-icon>`;
    //  3) GET NEW SPEED AND RESTART SETINTERVAL GAME FUNCTION
    const currentSpeed = this.#ifFastSpeed ? FAST_SPEED : NORMAL_SPEED;
    this.startGame(currentSpeed);
  }

  ////////////////////////////////////////////////////////////////
  // GAME

  //NEEDS TO BE DEFINED IN CHILD CLASS
  handleMovement() {}

  startGame(speed) {
    //  1)  REMOVE EXISTING SETINTERVAL FOR CHANGING SPEED
    if (this.#gameIntervalFunction) clearInterval(this.#gameIntervalFunction);
    //  2) START NEW SETINTERVAL WITH NEW SPEED
    this.#gameIntervalFunction = setInterval(
      this.handleMovement.bind(this),
      speed * 1000
    );
  }

  endGame() {
    // 1) REMOVE ALL LISTENERS
    this.#controlsEl.removeEventListener("click", this.boundListenToControls);
    window.removeEventListener("keydown", this.boundListenToKeys);
    this.#pauseEl.removeEventListener("click", this.boundPauseGame);
    this.#overlayEl.removeEventListener("click", this.boundPauseGame);

    // 2) CLEAR SETINTERVAL FUNCTION
    clearInterval(this.#gameIntervalFunction);

    // 2) CHECK HIGHSCORE
    const highscore = localStorage.getItem(`${this.game}-highscore`)
      ? localStorage.getItem(`${this.game}-highscore`)
      : 0;
    let newHighscore = false;
    if (this.score > highscore) {
      localStorage.setItem(`${this.game}-highscore`, this.score);
      document.getElementById(`${this.game}-highscore`).innerHTML = this.score;
      newHighscore = true;
    }

    // 3) TAKE CARE OF CSS CLASSESS AND HTML
    this.#mapEl.classList.remove(`${this.game}-map`);
    this.#mapEl.innerHTML = "";
    this.toggleHidden();

    this.#speedBtnEl.innerHTML = `<ion-icon name="play-circle-outline"></ion-icon>`;

    let gameOverMessage = newHighscore
      ? `CONGRATULATIONS, YOU SET NEW HIGHSCORE FOR ${this.game.toUpperCase()}: ${
          this.score
        }`
      : `YOUR SCORE IN ${this.game.toUpperCase()}: ${this.score}`;
    this.#gameOverEl.innerHTML = `!GAME OVER! <br> !${gameOverMessage}!`;

    // 4) SET VALUES BACK TO DEFAULT
    this.score = 0;
    this.isPaused = false;
    this.#ifFastSpeed = false;
  }
}
