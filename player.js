class Player {
  constructor(tetris, isCPU, sharedQueue) {
    this.isCPU = isCPU;

    this.sharedQueue = sharedQueue;
    // constant for drop intervals
    this.DROP_1 = 1000;
    this.DROP_2 = 900;
    this.DROP_3 = 800;
    this.DROP_4 = 670;
    this.DROP_5 = 550;
    this.DROP_6 = 390;
    this.DROP_7 = 240;
    this.DROP_8 = 160;
    this.DROP_9 = 80;

    this.Level = 1;

    this.thresh_2 = 1000;
    this.thresh_3 = 5000;
    this.thresh_4 = 15000;
    this.thresh_5 = 45000;
    this.thresh_6 = 90000;
    this.thresh_7 = 15000;
    this.thresh_8 = 22000;
    this.thresh_9 = 30000;

    this.DROP_FAST = 50;

    this.tetris = tetris; // ref to the tetris game instance
    this.arena = tetris.arena; // ref to the arena

    // initialize the counters
    this.dropCounter = 0;
    this.dropInterval = this.DROP_1;

    // initialize pos and matrix
    this.pos = { x: 0, y: 0 };
    this.matrix = null;
    this.score = 0;
    const pieces = "ILJOTSZ";
    this.index = 0;
    this.nextMatrix = this.sharedQueue.getNextPiece(this.index);
    this.index += 1;
    // start with a new piece
    this.reset();
    this.tetris.updateLevel(1);
  }

  // drop the piece down by one row
  drop() {
    this.pos.y++;
    if (this.arena.collide(this)) {
      this.pos.y--;
      this.arena.merge(this);
      this.reset();
      this.score += this.arena.sweep(this.Level);
      this.calc_level();
      this.tetris.updateScore(this.score);
    }
    this.dropCounter = 0;
  }

  calc_level() {
    if (this.score < this.thresh_2) {
      this.Level = 1;
      this.tetris.updateLevel(this.Level);
    } else if (this.score < this.thresh_3) {
      this.Level = 2;
      this.tetris.updateLevel(this.Level);
    } else if (this.score < this.thresh_4) {
      this.Level = 3;
      this.tetris.updateLevel(this.Level);
    } else if (this.score < this.thresh_5) {
      this.Level = 4;
      this.tetris.updateLevel(this.Level);
    } else if (this.score < this.thresh_6) {
      this.Level = 5;
      this.tetris.updateLevel(this.Level);
    } else if (this.score < this.thresh_7) {
      this.Level = 6;
      this.tetris.updateLevel(this.Level);
    } else if (this.score < this.thresh_8) {
      this.Level = 7;
      this.tetris.updateLevel(this.Level);
    } else if (this.score < this.thresh_9) {
      this.Level = 8;
      this.tetris.updateLevel(this.Level);
    } else {
      this.Level = 9;
      this.tetris.updateLevel(this.Level);
    }
    this.speed();
  }
  // move the piece left or right
  move(dir) {
    this.pos.x += dir;
    if (this.arena.collide(this)) {
      this.pos.x -= dir;
    }
  }

  // reset the piece to the top of the arena
  reset() {
    const pieces = "ILJOTSZ";
    this.matrix = this.nextMatrix;
    //console.log(this.matrix);
    this.nextMatrix = this.sharedQueue.getNextPiece(this.index);
    this.index += 1;
    this.pos.y = 0;
    this.pos.x =
      ((this.arena.matrix[0].length / 2) | 0) -
      ((this.matrix[0].length / 2) | 0);
    if (this.arena.collide(this)) {
      //console.log(this.isCPU);
      this.respawn = true;
    }
  }
  resetCPU() {
    this.arena.clear();
    this.tetris.updateScore(0);
    this.score = 0;
    this.dropInterval = this.DROP_1;
    this.Level = 1;
    this.reset();
    this.drop();
  }

  resetPlayer() {
    this.tetris.gamestate = false;
    this.tetris.gameover(this.score);
    this.showPopup();
    this.arena.clear();
  }

  // rotate the piece
  rotate(dir) {
    const pos = this.pos.x;
    let offset = 1;
    this._rotateMatrix(this.matrix, dir);

    while (this.arena.collide(this)) {
      this.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > this.matrix[0].length) {
        this._rotateMatrix(this.matrix, -dir);
        this.pos.x = pos;
        return;
      }
    }
  }

  // rotate the matrix (piece ) 90deg
  _rotateMatrix(matrix, dir) {
    // Transpose the matrix
    for (let y = 0; y < matrix.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
      }
    }

    // Reverse rows or columns based on direction
    if (dir > 0) {
      matrix.forEach((row) => row.reverse());
    } else {
      matrix.reverse();
    }
  }

  hardDrop() {
    while (!this.arena.collide(this)) {
      this.pos.y++;
    }
    this.pos.y--;
    this.drop();
  }

  simulatedrop() {
    let simyY = this.pos.y;
    while (!this.arena.collide(this)) {
      simyY++;
    }
  }

  speed() {
    if (this.Level === 9) {
      this.dropInterval = this.DROP_9;
    } else if (this.Level === 8) {
      this.dropInterval = this.DROP_8;
    } else if (this.Level === 7) {
      this.dropInterval = this.DROP_7;
    } else if (this.Level === 6) {
      this.dropInterval = this.DROP_6;
    } else if (this.Level === 5) {
      this.dropInterval = this.DROP_5;
    } else if (this.Level === 4) {
      this.dropInterval = this.DROP_4;
    } else if (this.Level === 3) {
      this.dropInterval = this.DROP_3;
    } else if (this.Level === 2) {
      this.dropInterval = this.DROP_2;
    } else {
      this.dropInterval = this.DROP_1;
    }
  }

  // Update the piece state based on elapsed time
  update(deltaTime) {
    if (!this.respawn) {
      if (this.isCPU) {
        this.performBestMove(deltaTime);
      } else {
        //console.log("player");
        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
          this.drop();
        }
      }
    } else {
      this.dropCounter += deltaTime;
      if (this.dropCounter > this.dropInterval + 1000) {
        if (this.isCPU) {
          this.resetCPU();
        }
      } else {
        this.resetPlayer();
      }
    }
  }

  simulateDrop() {
    const originalY = this.pos.y;

    // drop to botton
    while (!this.arena.collide(this)) {
      this.pos.y++;
    }
    // last move caused a collision move back a row
    this.pos.y--;

    // merge the piece with the arena and evaluate the state
    this.arena.merge(this);
    const linesCleared = this.arena.sweep();
    const height = this.getPileHeight();

    // Undo the merge
    this.arena.clearPiece(this);

    this.pos.y = originalY; // Restore the original position

    // (more lines cleared and lower height is better)
    // return a heuristic score function
    return linesCleared * 100 - height;
  }

  // calc the height of the highest occupied row
  getPileHeight() {
    const rows = this.arena.matrix;
    for (let y = 0; y < rows.length; ++y) {
      for (let x = 0; x < rows[y].length; ++x) {
        if (rows[y][x] !== 0) {
          return rows.length - y;
        }
      }
    }
    return 0;
  }

  // perform the best move based on a simple heuristic
  performBestMove(deltaTime) {
    let bestScore = -Infinity;
    let bestMove = null;

    const originalX = this.pos.x;
    const originalMatrix = this.matrix;

    // test all possible moves (rotations and translations)
    for (let rotation = 0; rotation < 4; rotation++) {
      for (
        let moveX = -this.arena.matrix[0].length / 2;
        moveX < this.arena.matrix[0].length;
        moveX++
      ) {
        this.pos.x = moveX;

        // Skip invalid positions
        if (this.arena.collide(this)) {
          continue;
        }

        const score = this.simulateDrop();

        if (score > bestScore) {
          bestScore = score;
          bestMove = { x: this.pos.x, rotation };
        }

        this.pos.x = originalX; // Restore position after testing
      }
      this.rotate(1); // Rotate piece
    }

    if (bestMove) {
      // Execute the best move
      this.matrix = originalMatrix;
      this.pos.x = bestMove.x;
      for (let i = 0; i < bestMove.rotation; i++) {
        this.rotate(1);
      }
      this.dropCounter += deltaTime;
      if (this.dropCounter > this.dropInterval) {
        this.drop();
      }
    } else {
      this.dropCounter += deltaTime;
      if (this.dropCounter > this.drop_Fast) {
        this.drop();
      }
    }
  }

  showPopup() {
    this.popUp = document.getElementById("popup");
    this.popUp.style.visibility = "visible";

    this.eventPopupListener();
  }

  eventPopupListener() {
    this.gameoverButton = document.querySelector(".again");
    this.popUp = document.getElementById("popup");
    this.gameoverButton.addEventListener("click", () => {
      this.popUp.style.visibility = "hidden";
      this.tetris.gamestate = true;
      this.arena.clear();
      this.tetris.updateScore(0);
      this.score = 0;
      this.dropInterval = this.DROP_1;
      this.Level = 1;
      this.tetris.update();
      this.drop();
    });
  }
}
