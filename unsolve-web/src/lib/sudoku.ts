import Puzzle from './puzzle';

class Sudoku extends Puzzle {
    constructor(seed: number) {
        super(seed);
    }
    addConstraints(): void {
        throw new Error('Method not implemented.');
    }

    addAssertions(): void {
        throw new Error('Method not implemented.');
    }

    generateSolution(): void {
        throw new Error('Method not implemented.');
    }
}

export default Sudoku;
