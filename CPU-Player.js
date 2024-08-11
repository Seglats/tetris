class CPUPlayer extends Player {
    constructor(tetris) {
        super(tetris);
    }

    // Make a move based on a simple heuristic
    makeMove() {
        let bestScore = -1;
        let bestRotation = 0;
        let bestX = 0;
        
        // Try all rotations
        for (let rotation = 0; rotation < 4; rotation++) {
            this._rotateMatrix(this.matrix, rotation);
            
            // Try all possible positions
            for (let x = -this.matrix[0].length; x < this.arena.matrix[0].length; x++) {
                this.pos.x = x;
                
                if (!this.arena.collide(this)) {
                    let y = this._getDropHeight();
                    this.pos.y = y;
                    
                    // Calculate a simple score (lower y position is better)
                    let score = y;
                    
                    // Choose the move with the best score
                    if (score > bestScore) {
                        bestScore = score;
                        bestRotation = rotation;
                        bestX = x;
                    }
                }
            }
            
            // Rotate back to the original position
            this._rotateMatrix(this.matrix, -rotation);
        }
        
        // Execute the best move
        for (let i = 0; i < bestRotation; i++) {
            this.rotate(1);
        }
        this.pos.x = bestX;
        this.hardDrop();
    }

    // Calculate how far down the piece can go before colliding
    _getDropHeight() {
        let originalY = this.pos.y;
        while (!this.arena.collide(this)) {
            this.pos.y++;
        }
        this.pos.y--;
        let dropHeight = this.pos.y;
        this.pos.y = originalY;
        return dropHeight;
    }

    // Override the update method to make the AI play the game
    update(deltaTime) {
        super.update(deltaTime);
        this.makeMove();
    }
}