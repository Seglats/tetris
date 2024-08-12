class Queue {
    constructor() {
        this.pieces = "ILJOTSZ";
        this.queue = [];
        this.generateQueue();
    }

    generateQueue() {
        const leng = this.queue.length;
        while (this.queue.length < leng+50) {
            const randomPiece = this.pieces[Math.floor(Math.random() * this.pieces.length)];
            this.queue.push(createPiece(randomPiece));
            // console.log(this.queue.length);
        }
    }

    getNextPiece(index) {
        // console.log(index, this.queue.length);
        if (index >= this.queue.length) {
            // console.log("generate")
            this.generateQueue(); 
        }
        return structuredClone(this.queue[index]); // Return the next piece and remove it from the queue
    }
}
