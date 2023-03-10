"use strict";

import Game from "./game.js";

export default class Tetris extends Game {
  // Field holding Interval function so that it can be removed later
  #gameIntervalFunction;

  #tetrisShape = {}; //Field holding shape and color of all tetris blocks at the bottom
  #tetrisBlock = []; // Field holdin shape and color of current falling tetris block
  #tetrisStartingBlocks = [
    // Field holding all possible starting block shapes
    ["3,-1", "4,-1", "5,-1", "6,-1"],
    ["3,-1", "4,-1", "5,-1", "5,-2"],
    ["3,-1", "4,-1", "5,-1", "3,-2"],
    ["3,-1", "4,-1", "3,-2", "4,-2"],
    ["3,-1", "4,-1", "5,-1", "4,-2"],
    ["3,-1", "4,-1", "4,-2", "5,-2"],
    ["3,-2", "4,-2", "4,-1", "5,-1"],
  ];
  #tetrisColors = ["red", "purple", "yellow", "green", "blue", "orange"]; // Field holding all possible colors

  constructor(x, y, game) {
    super(x, y, game);
  }

  prepareGame() {
    // 1) PREPARE HTML AND CONTROLS FOR GAME
    super.prepareGame();
    this.setInstructionsAndButtons();
  }

  ////////////////////////////////////////////////////////////////
  // GAME LOGIC
  // CHECK WHICH BUTTON/KEY WAS CLICKED ON
  checkClicked(clicked, pause, speed) {
    // 1) GET METHOD FROM PARENT CLASS AND BUILD ON TOP OF THAT
    super.checkClicked(clicked, pause, speed);

    if (!this.isPaused) {
      // 2) GET STRING FOR SELECTED DIRECTION AND PUT CORRECT DIRECTION BASED ON CLICKED ELEMENT
      if (this.upMovementControls.includes(clicked)) this.rotateBlock(true);
      else if (this.leftMovementControls.includes(clicked))
        this.moveBlock("left");
      else if (this.downMovementControls.includes(clicked))
        this.rotateBlock(false);
      else if (this.rightMovementControls.includes(clicked))
        this.moveBlock("right");
      else return;
    }
  }

  rotateBlock(clockwise) {}
  moveBlock(direction) {}

  handleMovement() {}

  endGame() {
    super.endGame();
    // 1) SET ALL TETRIS OPTIONS TO DEFAULT
  }
  ////////////////////////////////////////////////////////////////
  // SET STYLE (HTML/CSS)
  setInstructionsAndButtons() {
    super.setInstructionsAndButtons(
      "ROTATE CLOCKWISE",
      "ROTATE COUNTERCLOCKWISE",
      '<ion-icon name="return-up-forward-outline"></ion-icon>',
      '<ion-icon name="return-up-back-outline"></ion-icon>'
    );
  }
}
