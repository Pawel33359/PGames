"use strict";
import Snake from "./games/snake.js";
import Tetris from "./games/tetris.js";
import {
  SNAKE_X,
  SNAKE_Y,
  SNAKE,
  TETRIS,
  TETRIS_X,
  TETRIS_Y,
} from "./config.js";

class App {
  // getting elements from document
  snakeBtn = document.getElementById("btn-snake");
  #games = [SNAKE, TETRIS];

  constructor() {
    // 1) creating objects
    this.snake = new Snake(SNAKE_X, SNAKE_Y, SNAKE);
    this.tetris = new Tetris(TETRIS_X, TETRIS_Y, TETRIS);

    // 2) Prepare menu
    this.setMenu();
  }

  setMenu() {
    this.#games.forEach((game) => {
      // 2a) GET HIGHSCORE FROM LOCALSTORAGE(or 0)
      const highscore = localStorage.getItem(`${game}-highscore`)
        ? localStorage.getItem(`${game}-highscore`)
        : 0;
      document.getElementById(`${game}-highscore`).innerHTML = highscore;
      // 2b) ATTATCH EVENT LISTENER TO MENU BTN
      document
        .getElementById(`btn-${game}`)
        .addEventListener("click", this[game].prepareGame.bind(this[game]));
    });
  }
}

new App();
