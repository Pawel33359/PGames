import { NORMAL_SPEED, FAST_SPEED, SNAKE } from "../config.js";

export default class Game {
  score = 0; //Field holding current score

  // Fields holdin info about pause and current speed
  isPaused = false;
  #fastSpeed = false;

  #handleGameControlsFn; // Field holding Child's class handlecontrolsfunction
  #handleGameMovementFn; // Field holding Child's class handlemovementfunction
  #gameIntervalFunction; // Field holding setIntervalFunction so that it can be cleared

  // Fields holding all movement controls names
  #upMovementControls = ["w", "up-btn", "ArrowUp"];
  #downMovementControls = ["s", "ArrowDown", "down-btn"];
  #leftMovementControls = ["a", "ArrowLeft", "left-btn"];
  #rightMovementControls = ["d", "ArrowRight", "right-btn"];

  // Fields holding document dom elements to not query for them multiple times
  #gameEl = document.getElementById("game");
  #menuEl = document.getElementById("menu");

  #mapEl = document.querySelector(`.game-map`);
  #scoreEl = document.querySelector(`.game-score`);
  #controlsEl = document.querySelector(`.game-controls`);

  #pauseEl = document.querySelector(".pause");
  #overlayEl = document.querySelector(".overlay");

  #upInstructionEl = document.getElementById("up-instruction");
  #downInstructionEl = document.getElementById("down-instruction");
  #upBtnEl = document.getElementById("up-btn");
  #downBtnEl = document.getElementById("down-btn");
  #speedBtnEl = document.getElementById("speed-btn");

  #gameOverEl = document.querySelector(".menu-game-over");

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
  prepareGame(handleGameControlsFn, handleGameMovementFn) {
    // 1) PUT GAME FUNCTIONS AS CLASS PROPERTY TO AVOID PASSING DOWN THROUGH MULTIPLE FUNCTIONS
    this.#handleGameControlsFn = handleGameControlsFn;
    this.#handleGameMovementFn = handleGameMovementFn;

    // 2) TAKE CARE OF VISUAL SETUP
    this.toggleHidden();
    this.generateMap();
    this.insertScore();
    this.setInstructionsAndButtons();

    // 3) ATTACH EVENT LISTENERS TO CONTROLS
    this.attachListeners();

    // 4) START GAME
    this.startGame(NORMAL_SPEED);
  }

  ////////////////////////////////////////////////////////////////
  // PREPARE GAME SCREEN
  toggleHidden() {
    this.#menuEl.classList.toggle("hidden");
    this.#gameEl.classList.toggle("hidden");
  }

  // Generate game tiles in game map element and give them data
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

  setInstructionsAndButtons() {
    if (this.game === SNAKE) {
      this.#upInstructionEl.innerHTML = "MOVE UP";
      this.#downInstructionEl.innerHTML = "MOVE DOWN";

      this.#upBtnEl.innerHTML = '<ion-icon name="arrow-up-outline"></ion-icon>';
      this.#downBtnEl.innerHTML =
        '<ion-icon name="arrow-down-outline"></ion-icon>';
    }
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
    //1) CHECK PAUSE BTN/KEY (return to stop function going forward)
    if (clicked === pause) return this.pauseGame();

    //2)CHECK IF GAME IS PAUSED
    if (!this.isPaused) {
      //3) CHECK SPEED BTN/KEY
      if (clicked === speed) this.changeSpeed();
      else {
        // 4) GET STRING FOR SELECTED DIRECTION AND PUT CORRECT DIRECTION BASED ON CLICKED ELEMENT
        let selectedDirection;

        if (this.#upMovementControls.includes(clicked))
          selectedDirection = "up";
        else if (this.#leftMovementControls.includes(clicked))
          selectedDirection = "left";
        else if (this.#downMovementControls.includes(clicked))
          selectedDirection = "down";
        else if (this.#rightMovementControls.includes(clicked))
          selectedDirection = "right";
        else return;

        this.#handleGameControlsFn(selectedDirection);
      }
    }
  }

  // PAUSE ( maybe option to leave game (maybe save state in cookies))
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
    this.#fastSpeed = !this.#fastSpeed;
    // 2) CHANGE ICON FOR BUTTON
    this.#speedBtnEl.innerHTML = this.#fastSpeed
      ? `<ion-icon name="play-forward-circle-outline"></ion-icon>`
      : `<ion-icon name="play-circle-outline"></ion-icon>`;

    //  3) GET NEW SPEED AND RESTART SETINTERVAL GAME FUNCTION
    const currentSpeed = this.#fastSpeed ? FAST_SPEED : NORMAL_SPEED;
    this.startGame(currentSpeed);
  }

  ////////////////////////////////////////////////////////////////
  // GAME
  startGame(speed) {
    //  1)  REMOVE EXISTING SETINTERVAL FOR CHANGING SPEED
    if (this.#gameIntervalFunction) clearInterval(this.#gameIntervalFunction);

    //  2) START NEW SETINTERVAL WITH NEW SPEED
    this.#gameIntervalFunction = setInterval(
      this.#handleGameMovementFn,
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

    // 3) CHECK HIGHSCORE
    const highscore = localStorage.getItem(`${this.game}-highscore`)
      ? localStorage.getItem(`${this.game}-highscore`)
      : 0;

    let newHighscore = false;

    if (this.score > highscore) {
      localStorage.setItem(`${this.game}-highscore`, this.score);
      document.getElementById(`${this.game}-highscore`).innerHTML = this.score;
      newHighscore = true;
    }
    // 4) TAKE CARE OF CSS CLASSESS AND HTML
    this.#mapEl.classList.remove(`${this.game}-map`);
    this.toggleHidden();

    let gameOverMessage = newHighscore
      ? `CONGRATULATIONS, YOU SET NEW HIGHSCORE FOR ${this.game.toUpperCase()}: ${
          this.score
        }`
      : `YOUR SCORE IN ${this.game.toUpperCase()}: ${this.score}`;

    this.#gameOverEl.innerHTML = `!GAME OVER! <br> !${gameOverMessage}!`;

    // 5) SET VALUES BACK TO DEFAULT
    this.score = 0;
    this.isPaused = false;
    this.#fastSpeed = false;
  }
}
