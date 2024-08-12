const tetri = [];
const playerElements = document.querySelectorAll(".player");
const cpuElements = document.querySelectorAll(".cpu");

playerElements.forEach((element, index) => {
  const tetris = new Tetris(element);
  tetri.push(tetris);
});

cpuElements.forEach((element, index) => {
  const CPU = new Tetris(element);
  CPU.CPU = true;
  CPU.arena.isCPU = true;
  tetri.push(CPU);
});
const movementState = [
  { left: false, right: false, down: false }, // Player 1
  { left: false, right: false, down: false }, // Player 2
];

const moveInterval = 80; // Slower interval for smoother control
let movementIntervalId;
let initialDelayId;

// Function to handle continuous movement based on key states
const handleMovement = () => {
  movementState.forEach((state, index) => {
    const player = tetri[index].player;

    if (state.left) {
      player.move(-1); // Move left
    }
    if (state.right) {
      player.move(1); // Move right
    }
    if (state.down) {
      player.drop();
    }
  });
};

// Start continuous movement loop with controlled intervals
const startMovement = () => {
  if (!movementIntervalId) {
    initialDelayId = setTimeout(() => {
      movementIntervalId = setInterval(handleMovement, moveInterval);
    }, 200); // Initial delay before continuous movement starts
  }
};

// Stop continuous movement loop
const stopMovement = () => {
  if (movementIntervalId) {
    clearInterval(movementIntervalId);
    movementIntervalId = null;
  }
  if (initialDelayId) {
    clearTimeout(initialDelayId);
    initialDelayId = null;
  }
};

// Key listener function for handling key presses
const keyListener = (event) => {
  const keyBindings = [
    [65, 68, 87, 69, 83, 32, 8], // Player 1: A, D, Q, E, S, Space
    [72, 75, 89, 73, 74], // Player 2: H, K, Y, I, J
  ];

  keyBindings.forEach((keyCodes, index) => {
    const player = tetri[index].player;
    const state = movementState[index];

    if (event.type === "keydown" && !event.repeat) {
      if (event.keyCode === keyCodes[6]) {
        player.arena.clear();
        player.arena.score = 0;
        player.dropInterval = player.DROP_1; // Use player context
        player.Level = 1;
        player.tetris.updateLevel(1);
        player.tetris.updateScore(0);
        player.reset();
      } else if (event.keyCode === keyCodes[0]) {
        state.left = true;
        player.move(-1); // Immediate move
        startMovement();
      } else if (event.keyCode === keyCodes[1]) {
        state.right = true;
        player.move(1); // Immediate move
        startMovement();
      }

      if (event.keyCode === keyCodes[2]) {
        player.rotate(-1); // Rotate left
      } else if (event.keyCode === keyCodes[3]) {
        player.rotate(1); // Rotate right
      }

      if (event.keyCode === keyCodes[4]) {
        state.down = true;
        player.dropInterval = player.DROP_FAST;
        startMovement();
      }

      if (event.keyCode === keyCodes[5]) {
        player.hardDrop();
      }
    } else if (event.type === "keyup") {
      if (event.keyCode === keyCodes[0]) {
        state.left = false;
      } else if (event.keyCode === keyCodes[1]) {
        state.right = false;
      }

      if (event.keyCode === keyCodes[4]) {
        player.speed();
        state.down = false;
      }

      if (!state.left && !state.right && !state.down) {
        stopMovement();
      }
    }
  });
};

document.addEventListener("keydown", keyListener);
document.addEventListener("keyup", keyListener);
