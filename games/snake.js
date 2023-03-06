"use strict";

import Game from "./game.js";

export default class Snake extends Game {
  // position: "x,y"
  #snake = []; //Array holding snake positions(first el of array is snake's head)
  #apple; //Field holding apple position

  #direction = "right"; //Field holding current snake direction
  #snakeNeckDirection = "left"; //Field holding direction from head to next snake part
  #oppositeDirectionsList = {
    // Field holding all oposite direction options
    up: "down",
    down: "up",
    right: "left",
    left: "right",
  };

  #allButtonEl = document.querySelectorAll(".direction-btn");

  // x,y - number of x and y game tiles
  // game - string holding name of the game
  constructor(x, y, game) {
    super(x, y, game);
  }

  ////////////////////////////////////////////////////////////////
  startSnake() {
    // 1) PREPARE HTML AND CONTROLS FOR GAME
    this.prepareGame(
      this.handleSnakeControls.bind(this),
      this.handleSnakeMovement.bind(this)
    );

    // 2) SET SNAKE, AND APPLE
    this.setSnakeInitialPosition();
    this.setApplePosition();

    // 3) GIVE DISABLED CLASS TO BUTTON=SNAKENECK AND DIRECTIONARROW TO SNAKE HEAD
    this.setDisabledButtonStyle();
    this.setSnakeArrowIcon();

    // // 4) START GAME
    // this.startGame(NORMAL_SPEED);
  }

  ////////////////////////////////////////////////////////////////
  // GAME LOGIC

  // SET SNAKE DIRECTION DEPENDING WHAT WAS CLICKED
  handleSnakeControls(selectedDirection) {
    // 2) CHECK IF USER DIDN'T CHOOSE TO GO BACKWARDS
    if (selectedDirection === this.#snakeNeckDirection) return;

    // 3) SET NEW MOVEMENT DIRECTION
    this.#direction = selectedDirection;
    this.setSnakeArrowIcon();
  }

  // MOVE ONE TICK
  handleSnakeMovement() {
    // 1) MAKE SURE GAME ISNT PAUSED
    if (this.isPaused) return;

    // 2) MOVE SNAKE
    this.moveSnake();

    // 3) CHECK IF GAME OVER AND STOP REST OF THE FUNCTION IF SO
    if (this.checkIfGameOver()) return;

    // 4) CHECK IF SNAKE ATE APPLE
    this.checkIfAteApple();

    // 5) SET STYLE AND ICON TO NEW HEAD
    this.setSnakeArrowIcon();
    this.setSnakeBodyStyle(this.#snake[0]);
    this.setSnakeNeckShape();

    // 6) SET NEW SNAKENECKDIRECTION TO OPPOSITE OF DIRECTION
    this.#snakeNeckDirection = this.#oppositeDirectionsList[this.#direction];
    this.setDisabledButtonStyle();
  }

  // left=x-1 right=x+1 up=y-1 down=y+1
  moveSnake() {
    // 2a) GET SNAKE HEAD POSITION COORDs
    let [x, y] = this.#snake[0].split(",");
    // 2b) MOVE SNAKE HEAD TO NEW POSITION
    if (this.#direction === "left") x--;
    else if (this.#direction === "right") x++;
    else if (this.#direction === "up") y--;
    else if (this.#direction === "down") y++;

    // 2c) ADD NEW SNAKE HEAD AT HE BEGINNING OF SNAKE ARR
    const snakeHead = `${x},${y}`;
    this.#snake.unshift(snakeHead);
  }

  checkIfAteApple() {
    if (this.#snake[0] === this.#apple) {
      //  3a) MAKE NEW APPLE AND INCREASE SCORE
      this.setApplePosition();
      this.score++;
      this.insertScore();
    } else {
      // 3b) REMOVE SNAKE TAIL IF NO APPLE
      this.clearSnakeTailBodyStyle();
      this.#snake.pop();
    }
  }

  checkIfGameOver() {
    // 4a) GET SNAKEHEADCOORDS AND SNAKE ARRAY WITH NO HEAD
    const [x, y] = this.#snake[0].split(",");
    const headlessSnake = this.#snake.slice(1);

    // 4b) SNAKE HEAD OVER THE MAP OR INSIDE OWN BODY(NOT COUNTING HEAD)
    if (
      +x > this.x - 1 ||
      +x < 0 ||
      +y > this.y - 1 ||
      +y < 0 ||
      headlessSnake.includes(this.#snake[0])
    ) {
      // 4c) SET ALL OPTIONS TO DEFAULT
      this.#snake = [];
      this.#apple = undefined;
      this.#direction = "right";
      this.#snakeNeckDirection = "left";
      // 4d) CALL endGame() FROM GAME CLASS
      this.endGame();
      return true;
    }
    return false;
  }
  ////////////////////////////////////////////////////////////////
  // POSITION X,Y

  setSnakeInitialPosition() {
    // 1) GET MIDDLE OF MAP HEIGHT (-1 to look better positioned)
    const middle = this.y / 2 - 1;

    // 2) CREATE INITIAL SNAKE WITH LENGTH OF 4
    for (let i = 0; i < 4; i++) {
      // 2a) GET SNAKE PART POSITION AND PUT IT IN THE BEGINNING OF SNAKE ARRAY
      const snakePartPosition = `${i + 1},${middle}`; //(+1 to look better positioned)
      this.#snake.unshift(snakePartPosition);

      // 2b) ADD CLASS TO RIGHT GAME TILES
      this.setSnakeBodyStyle(snakePartPosition);
    }
  }

  setApplePosition() {
    // 1) IF THERE IS APPLE ALREADY CLEAR
    if (this.#apple) this.clearAppleStyle();

    // 2) GET NEW APPLE POSITION
    let ifApple = false;
    let newApple;
    while (!ifApple) {
      // 2a) GET RANDOM APPLE POSITION
      const coordX = Math.floor(Math.random() * this.x);
      const coordY = Math.floor(Math.random() * this.y);
      newApple = `${coordX},${coordY}`;

      // 2b) CHECK TO MAKE SURE APPLE AND SNAKE DONT SHARE SAME POSITION
      if (!this.#snake.includes(newApple)) ifApple = true;
    }

    // 2c) SET NEW APPLE POSITION
    this.#apple = newApple;

    // 3) ADD CLASS TO GAME-TILE
    this.setAppleStyle();
  }

  ////////////////////////////////////////////////////////////////
  // SET STYLE (HTML/CSS)

  setSnakeBodyStyle(newBodyPosition) {
    // 1) GET SNAKE BODY PART ELEMENT FROM DOM
    const snakeBodyPart = document.querySelector(
      `[data-pos="${newBodyPosition}"]`
    );

    // 2) ADD TO BODY PART BODY CLASS AND SHAPE CLASS
    snakeBodyPart.classList.add("snake-body");
    snakeBodyPart.classList.add(
      `snake-body-${this.#direction}-${
        this.#oppositeDirectionsList[this.#direction] //opposite of direction to make sure shape is either vertical or horizontal
      }`
    );
  }

  clearSnakeTailBodyStyle() {
    // GET LAST ELEMENT OF SNAKE AND REMOVE FROM DOM ELEMENT EVERY CLASS EXCEPT GAMETILE
    const snakeTail = this.#snake[this.#snake.length - 1];
    document.querySelector(`[data-pos="${snakeTail}"]`).className = "game-tile";
  }

  setDisabledButtonStyle() {
    // 1) REMOVE DISABLED CLASS FROM ALL BUTTONS
    this.#allButtonEl.forEach((el) => {
      el.classList.remove("controls-disabled");
    });
    // 2) ADD DISABLED CLASS TO BUTTON IN SNAKENECK DIRECTION
    document
      .getElementById(`${this.#snakeNeckDirection}-btn`)
      .classList.add("controls-disabled");
  }

  setSnakeArrowIcon() {
    // 1) CLEAR ARROW ICON FROM SNAKE NECK
    document.querySelector(`[data-pos="${this.#snake[1]}"]`).innerHTML = ``;

    // 2) GET RIGHT ICON FOR ARROW DEPENDING ON CURRENT DIRECTION
    let arrowDir;
    if (this.#direction === "right") arrowDir = "forward";
    else if (this.#direction === "left") arrowDir = "back";
    else arrowDir = this.#direction;

    // 3) PUT THAT ARROW IN SNAKE'S HEAD
    document.querySelector(
      `[data-pos="${this.#snake[0]}"]`
    ).innerHTML = `<ion-icon name="chevron-${arrowDir}-outline"></ion-icon>`;
  }

  setAppleStyle() {
    // GET APPLE ELEMENT FROM DOM AND SET APPLE CLASS AND ICON
    const appleEl = document.querySelector(`[data-pos="${this.#apple}"]`);

    appleEl.classList.add("snake-apple");
    appleEl.innerHTML = `<ion-icon name="nutrition-outline"></ion-icon>`;
  }
  clearAppleStyle() {
    // GET APPLE ELEMENT FROM DOM AND REMOVE APPLE CLASS AND ICON
    const appleEl = document.querySelector(`[data-pos="${this.#apple}"]`);

    appleEl.classList.remove("snake-apple");
    appleEl.innerHTML = ``;
  }

  setSnakeNeckShape() {
    // 1) GET SNAKE NECK AND OVERWRITE CLASSES WITH BASIC CLASSES
    const snakeNeck = document.querySelector(`[data-pos="${this.#snake[1]}"]`);
    snakeNeck.className = "game-tile snake-body";
    // 2) ADD CORRECT SHAPE CLASS TO NECK (OPPOSITE OF DIRECTION BECAUSE CSSCLASSES NAMED AFTER BORDERS)
    snakeNeck.classList.add(
      `snake-body-${this.#oppositeDirectionsList[this.#direction]}-${
        this.#oppositeDirectionsList[this.#snakeNeckDirection]
      }`
    );
  }
}
