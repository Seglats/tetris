class Player {
  constructor(tetris) {
    this.CPU = false;
    // constant for drop intervals
    this.DROP_1 = 1000;
    this.DROP_2 = 900;
    this.DROP_3 = 800;
    this.DROP_4 = 700;
    this.DROP_5 = 600;
    this.DROP_6 = 500;
    this.DROP_7 = 400;
    this.DROP_8 = 300;
    this.DROP_9 = 200;

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
    this.dropInterval = 1000;

    // initialize pos and matrix
    this.pos = { x: 0, y: 0 };
    this.matrix = null;
    this.score = 0;
    const pieces = "ILJOTSZ";
    this.nextMatrix = createPiece(
      pieces[Math.floor(Math.random() * pieces.length)]
    );

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
    this.nextMatrix = createPiece(
      pieces[Math.floor(Math.random() * pieces.length)]
    );

    this.pos.y = 0;
    this.pos.x =
      ((this.arena.matrix[0].length / 2) | 0) -
      ((this.matrix[0].length / 2) | 0);
    if (this.arena.collide(this)) {
      console.log("gameover");
      this.tetris.gamestate = false;
      this.tetris.gameover(this.score);
      this.showPopup();
      this.arena.clear();
    }
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
    //console.log(this.dropCounter)
    this.dropCounter += deltaTime;
    if (this.dropCounter > this.dropInterval) {
      //console.log("test2")
      this.drop();
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
