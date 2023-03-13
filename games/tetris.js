"use strict";

import Game from "./game.js";

export default class Tetris extends Game {
  //Field holding array of lines(y) holding shape and color of all tetris blocks at the bottom | y:{x,color}
  #tetrisShape = [];
  // Field holdin shape and color of current falling tetris block
  #tetrisBlock = {
    shape: [],
    color: "",
    currentRotation: 0,
    blockNumber: 0, // To get all possible shapes from #tetrisStartingBlocks
  };

  // Field holding all possible starting block shapes and their rotation shapes
  #tetrisStartingBlocks = [
    [
      //I Shape
      ["3,-1", "4,-1", "5,-1", "6,-1"],
      ["4,-1", "4,-2", "4,-3", "4,-4"],
    ],
    [
      //L Shape
      ["3,-1", "4,-1", "5,-1", "5,-2"],
      ["4,-1", "5,-1", "4,-2", "4,-3"],
      ["3,-1", "3,-2", "4,-2", "5,-2"],
      ["5,-1", "5,-2", "5,-3", "4,-3"],
    ],
    [
      //J Shape
      ["3,-1", "4,-1", "5,-1", "3,-2"],
      ["4,-1", "4,-2", "4,-3", "5,-3"],
      ["3,-2", "4,-2", "5,-2", "5,-1"],
      ["4,-1", "5,-1", "5,-2", "5,-3"],
    ],
    [
      //O Shape
      ["3,-1", "4,-1", "3,-2", "4,-2"],
    ],
    [
      //T Shape
      ["3,-1", "4,-1", "5,-1", "4,-2"],
      ["4,-1", "4,-2", "5,-2", "4,-3"],
      ["3,-2", "4,-1", "5,-2", "4,-2"],
      ["4,-2", "5,-1", "5,-2", "5,-3"],
    ],
    [
      //S Shape
      ["3,-1", "4,-1", "4,-2", "5,-2"],
      ["4,-2", "5,-1", "4,-3", "5,-2"],
    ],
    [
      //Z Shape
      ["3,-2", "4,-1", "4,-2", "5,-1"],
      ["4,-1", "4,-2", "5,-2", "5,-3"],
    ],
  ];
  #tetrisColors = ["red", "purple", "yellow", "green", "blue", "orange"]; // Field holding all possible colors

  constructor(x, y, game) {
    super(x, y, game);
  }

  prepareGame() {
    // 1) PREPARE HTML AND CONTROLS FOR GAME
    super.prepareGame();
    this.setInstructionsAndButtons();

    // 2) FILL TETRIS SHAPE WITH ARRAYS FOR EACH Y COORD
    this.fillTetrisShape();
  }

  fillTetrisShape() {
    for (let y = 0; y <= 19; y++) {
      this.#tetrisShape.push([]);
    }
  }

  ////////////////////////////////////////////////////////////////
  // GAME LOGIC
  // CHECK WHICH BUTTON/KEY WAS CLICKED ON
  checkClicked(clicked, pause, speed) {
    // 1) GET METHOD FROM PARENT CLASS AND BUILD ON TOP OF THAT
    super.checkClicked(clicked, pause, speed);

    if (!this.isPaused) {
      // 2) GET STRING FOR SELECTED DIRECTION AND PUT CORRECT DIRECTION BASED ON CLICKED ELEMENT
      if (this.upMovementControls.includes(clicked)) this.handleRotateBlock();
      else if (this.leftMovementControls.includes(clicked))
        this.handleMoveBlock("left");
      else if (this.downMovementControls.includes(clicked))
        this.handleMovement();
      else if (this.rightMovementControls.includes(clicked))
        this.handleMoveBlock("right");
      else return;
    }
  }

  handleRotateBlock() {
    // 1) ROTATE BLOCK
    let newRotation = 0;
    if (
      this.#tetrisBlock.currentRotation + 1 <
      this.#tetrisStartingBlocks[this.#tetrisBlock.blockNumber].length
    )
      newRotation = this.#tetrisBlock.currentRotation + 1;

    // 1b) GET CURRENT POSITION
    const rotatedBlockShape = this.#tetrisBlock.shape.map((pos, i) => {
      const [x, y] = pos.split(",");
      // get starting position for old and new rotation from:
      // array with starting blocks[current block rotation][current position index]
      const [oldStartX, oldStartY] =
        this.#tetrisStartingBlocks[this.#tetrisBlock.blockNumber][
          this.#tetrisBlock.currentRotation
        ][i].split(",");
      const [newStartX, newStartY] =
        this.#tetrisStartingBlocks[this.#tetrisBlock.blockNumber][newRotation][
          i
        ].split(",");

      // get new x and y based on old and new starting shapes
      const newX = +x + +newStartX - +oldStartX;
      const newY = +y + +newStartY - +oldStartY;

      return `${newX},${newY}`;
    });

    // 2) CHECK IF BLOCK CAN MOVE
    if (!this.checkBlock(rotatedBlockShape, "move")) return;

    // 3) MOVE BLOCK TO CHOSEN DIRECTION AND SET NEW ROTATION
    this.moveTetrisBlock(rotatedBlockShape);
    this.#tetrisBlock.currentRotation = newRotation;
  }
  handleMoveBlock(direction) {
    // 1) GET NEW BLOCK POSITION
    const movedBlockShape = [];
    this.#tetrisBlock.shape.forEach((pos) => {
      const newPosition = this.getMovePosition(
        pos,
        direction === "left" ? -1 : 1
      );
      movedBlockShape.push(newPosition);
    });

    // 2) CHECK IF BLOCK CAN MOVE
    if (!this.checkBlock(movedBlockShape, "move")) return;

    // 3) MOVE BLOCK TO CHOSEN DIRECTION
    this.moveTetrisBlock(movedBlockShape);
  }

  handleMovement() {
    // 1) MAKE SURE GAME ISNT PAUSED
    if (this.isPaused) return;

    // 2) CHECK IF THERE IS NO TETRIS BLOCK FALLING
    if (
      this.#tetrisBlock.shape.length === 0 &&
      this.#tetrisBlock.color === ""
    ) {
      this.generateNewTetrisBlock();
    }

    // CREATE FALLEN BLOCK
    const fallenBlockShape = this.#tetrisBlock.shape.map((pos) => {
      return this.getFallPosition(pos);
    });

    // 3) CHECK IF BLOCK CAN FALL OVER
    if (!this.checkBlock(fallenBlockShape, "fall")) {
      // 3a) CHECK IF GAME OVER
      if (this.checkIfGameOver()) {
        this.endGame();
        return;
      }

      // 3b) SET BLOCK IN TETRISSHAPE AND CLEAN TETRISBLOCK
      this.#tetrisBlock.shape.forEach((pos) => {
        const [x, y] = pos.split(",");
        this.#tetrisShape[+y].push({ x: +x, color: this.#tetrisBlock.color });
      });
      this.setTetrisBlockToDefault();

      // 3c) CHECK IF A LINE IS FULL IN TETRIS SHAPE
      this.checkRemoveLine();

      return;
    }
    // 4) MAKE BLOCK FALL DOWN AND SET CLASSES
    this.moveTetrisBlock(fallenBlockShape);
  }

  // GENERATE NEW TETRIS BLOCK
  generateNewTetrisBlock() {
    // 2a) GET RANDOM BLOCK NUMBER, ALL POSIBBLE SHAPES OF A BLOCK, AND RANDOM ROTATION
    this.#tetrisBlock.blockNumber = Math.floor(
      Math.random() * this.#tetrisStartingBlocks.length
    );

    const tetrisBlockShape =
      this.#tetrisStartingBlocks[this.#tetrisBlock.blockNumber];

    this.#tetrisBlock.currentRotation = Math.floor(
      Math.random() * tetrisBlockShape.length
    );

    // 2b) SET NEW TETRIS BLOCK WITH RANDOM COLOR
    this.#tetrisBlock.shape =
      tetrisBlockShape[this.#tetrisBlock.currentRotation];
    this.#tetrisBlock.color =
      this.#tetrisColors[Math.floor(Math.random() * this.#tetrisColors.length)];
  }

  moveTetrisBlock(newBlockShape) {
    this.clearBlockStyle();
    this.#tetrisBlock.shape = newBlockShape;
    this.setBlockStyle();
  }

  setTetrisBlockToDefault() {
    this.#tetrisBlock.shape = [];
    this.#tetrisBlock.color = "";
    this.#tetrisBlock.blockNumber = 0;
    this.#tetrisBlock.currentRotation = 0;
  }

  endGame() {
    super.endGame();
    // 1) SET ALL TETRIS OPTIONS TO DEFAULT
    this.#tetrisShape = [];
    this.setTetrisBlockToDefault();
  }

  ////////////////////////////////////////////////////////////////
  // CHECKS FOR FALLING AND MOVEMENT
  checkBlock(blockShape, action) {
    // 1) GET ALL SHAPE POSITIONS OF ALREADY FALLEN TETRIS BLOCKS
    const tetrisShapePos = this.getTetrisShapeArr();
    // 2) CHECK IF BLOCK ISN'T STOPPED
    let canGo = true;
    const checkGo =
      action === "fall" ? this.checkBlockFall() : this.checkBlockMove();

    blockShape.forEach((pos) => {
      if (tetrisShapePos.includes(pos) || checkGo(pos)) canGo = false;
    });
    return canGo;
  }

  // RETURN FUNCTION THAT CHECKS EITHER FALLING OR MOVING TO SIDES
  checkBlockFall() {
    return (pos) => +pos.split(",")[1] > this.y - 1;
  }
  checkBlockMove(pos) {
    return (pos) => pos.split(",")[0] > this.x - 1 || +pos.split(",")[0] < 0;
  }

  checkRemoveLine() {
    // 1) GET WHICH LINES ARE FULL
    let linesToRemove = [];
    this.#tetrisShape.forEach((line, y) => {
      if (line.length === 10) linesToRemove.push(y);
    });

    // 2) CHECK HOW MANY LINES TO REMOVE AND SET POINTS
    if (linesToRemove.length === 0) return;
    if (linesToRemove.length === 1) this.score = this.score + 1;
    if (linesToRemove.length === 2) this.score = this.score + 3;
    if (linesToRemove.length === 3) this.score = this.score + 5;
    if (linesToRemove.length === 4) this.score = this.score + 8;
    this.insertScore();

    linesToRemove.forEach((y) => {
      //3) REMOVE LINE FROM TETRISSHAPE ARRAY AND ADD EMPTY ARRAY AT BEGINNING
      this.#tetrisShape.splice(y, 1);
      this.#tetrisShape.unshift([]);
    });

    this.clearGameMapStyle();
    this.setTetrisShapeStyle();
  }

  checkIfGameOver() {
    // 1) CHECK IF BLOCK PART IN IN AT LEAST -1 y POSITION
    let gameOver = false;
    this.#tetrisBlock.shape.forEach((pos) => {
      const y = +pos.split(",")[1];
      if (y < 0) gameOver = true;
    });
    return gameOver;
  }

  // GET ALL POSITIONS IN OF FALLEN TETRIS BLOCKS
  getTetrisShapeArr() {
    let tetrisShapePos = [];
    if (this.#tetrisShape.length !== 0)
      for (let y = 0; y <= 19; y++) {
        const line = this.#tetrisShape[y].map((el) => `${el.x},${y}`);
        if (line.length !== 0) tetrisShapePos.push(...line);
      }
    return tetrisShapePos;
  }

  ////////////////////////////////////////////////////////////////
  // POSITION X,Y
  // GET NEW POSTION BLOCK PART WILL HAVE AFTER FALLING
  getMovePosition(pos, movDir) {
    const [x, y] = pos.split(",");
    const newX = +x + movDir;
    const newPos = `${newX},${y}`;

    return newPos;
  }
  getFallPosition(pos) {
    const [x, y] = pos.split(",");
    const newY = +y + 1;
    const newPos = `${x},${newY}`;

    return newPos;
  }

  ////////////////////////////////////////////////////////////////
  // SET STYLE (HTML/CSS)
  setInstructionsAndButtons() {
    super.setInstructionsAndButtons(
      "ROTATE CLOCKWISE",
      '<ion-icon name="refresh-outline"></ion-icon>'
    );
  }

  // CLEAR AND SET COLOR FOR FALLING BLOCK
  clearBlockStyle() {
    this.#tetrisBlock.shape.forEach((pos) => {
      const gameTile = document.querySelector(`[data-pos="${pos}"]`);
      if (gameTile)
        gameTile.classList.remove(`tetris-${this.#tetrisBlock.color}`);
    });
  }
  setBlockStyle() {
    this.#tetrisBlock.shape.forEach((pos) => {
      const gameTile = document.querySelector(`[data-pos="${pos}"]`);
      if (gameTile) gameTile.classList.add(`tetris-${this.#tetrisBlock.color}`);
    });
  }

  clearGameMapStyle() {
    for (let i = 0; i < this.y; i++) {
      for (let j = 0; j < this.x; j++) {
        document.querySelector(`[data-pos="${j},${i}"]`).className =
          "game-tile";
      }
    }
  }
  setTetrisShapeStyle() {
    this.#tetrisShape.forEach((line, y) => {
      if (line.length !== 0) {
        line.forEach((el) => {
          document
            .querySelector(`[data-pos="${el.x},${y}"]`)
            .classList.add(`tetris-${el.color}`);
        });
      }
    });
  }
}
