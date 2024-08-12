class Tetris {
  constructor(element, isCPU = false) {
    this.element = element;
    this.canvas = this.element.querySelector(".tetris");
    this.nextFigure = this.element.querySelector(".next");
    this.context = this.canvas.getContext("2d");
    this.nextContext = this.nextFigure.getContext("2d");
    this.context.scale(20, 20); // Scale the drawing context for rendering
    this.gamestate = true;
    this.arena = new Arena(12, 20); // Initialize the game arena
    this.player = new Player(this, isCPU); // Initialize the player

    // Define colors for the different Tetris pieces
    this.colors = [
      null, // Index 0 is unused
      "#FF0D72", // I piece
      "#0DC2FF", // J piece
      "#0DFF72", // L piece
      "#F538FF", // O piece
      "#FF8E0D", // S piece
      "#FFE138", // T piece
      "#3877FF", // Z piece
    ];

    // Start the game loop
    let lastTime = 0;

    this.update();
    this.player.drop();

    this.updateScore(0);
  }
  update(time = 0) {
    if (!this.gamestate) return;

    const deltaTime = time - this.lastTime;
    this.lastTime = time;
    // Update the player state
    this.player.update(deltaTime);

    this.draw();
    // Request the next frame
    requestAnimationFrame((time) => this.update(time));
  }
  // Draw the entire game state on the canvas
  draw() {
    this.context.fillStyle = "#000";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGrid();

    this.drawMatrix(this.arena.matrix, { x: 0, y: 0 }, this.context);
    this.drawMatrix(this.player.matrix, this.player.pos, this.context);
    this.nextContext.fillStyle = "black";
    this.nextContext.scale(20, 20);
    this.nextFigure.width = 4 * 20; // 4 blocks wide
    this.nextFigure.height = 4 * 20; // 4 blocks tall

    this.nextContext.fillRect(0, 0, 4, 4);
    this.drawMatrix(
      this.player.nextMatrix,
      { x: 0, y: 0 },
      this.nextContext,
      20
    );
  }

  drawGrid() {
    this.context.strokeStyle = "#333";
    this.context.lineWidth = 0.08;
    this.context.height = 20;
    this.context.width = 12;

    // Draw vertical grid lines
    for (let x = 1; x < 12; x++) {
      this.context.beginPath();
      this.context.moveTo(x, 0);
      this.context.lineTo(x, this.context.height);
      this.context.stroke();
    }

    // Draw horizontal grid lines
    for (let y = 1; y < 30; y++) {
      this.context.beginPath();
      this.context.moveTo(0, y);
      this.context.lineTo(this.context.width, y);
      this.context.stroke();
    }
  }

  // Draw a matrix (arena or piece) at a specific offset
  drawMatrix(matrix, offset, context, scale = 1) {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          context.fillStyle = this.colors[value];
          context.fillRect(
            (x + offset.x) * scale,
            (y + offset.y) * scale,
            scale,
            scale
          );
        }
      });
    });
  }

  // Update the score display on the page
  updateScore(score) {
    this.element.querySelector(".score").innerText = "Score: " + score; // Set the score text
  }
  updateLevel(level) {
    this.element.querySelector(".lvl").innerText = "Level: " + level; // Set the score text
  }
  gameover(score) {
    this.element.querySelector(".gameover").innerText = "Final Score: " + score; // Set the score text
  }
}
