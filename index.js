"use strict";
import Snake from "./games/snake.js";
import { SNAKE_X, SNAKE_Y, SNAKE } from "./config.js";

class App {
  // getting elements from document
  snakeBtn = document.getElementById("btn-snake");

  constructor() {
    // 1) creating objects
    this.snake = new Snake(SNAKE_X, SNAKE_Y, SNAKE);

    // 2) get highscore from cookies and put in html
    this.getHighscore(SNAKE);

    // 2)  listening to menu click events
    this.btnListeners();
  }

  getHighscore(game) {
    //Will get highscores from localstorage(if there are none then 0 points)
    const highscore = localStorage.getItem(`${game}-highscore`)
      ? localStorage.getItem(`${game}-highscore`)
      : 0;
    document.getElementById(`${game}-highscore`).innerHTML = highscore;
  }

  btnListeners() {
    this.snakeBtn.addEventListener(
      "click",
      this.snake.startSnake.bind(this.snake)
    );
  }
}

new App();
