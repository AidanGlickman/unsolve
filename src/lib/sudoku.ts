import { Arith, Solver, Context } from 'z3-solver';
import Puzzle from './puzzle';

const BOARD_SIZE = 9;
const BOX_SIZE = 3;
class Sudoku extends Puzzle {
    private cells: Arith[][];
    constructor(seed: number) {
        super(seed);
        this.cells = [];
    }

    public async init(): Promise<void> {
        await super.init();
        if (this.Z3 === null || this.solver === null || this.assertions === null) {
            throw new Error("Z3 not initialized");
        }

        let cells = Array.from({ length: BOARD_SIZE }, (_, col) => Array.from({ length: BOARD_SIZE }, (_, row) => this.Z3.Int.const(`c_${row}_${col}`)));
        this.cells = cells;

        this.addConstraints();
        await this.addAssertions();
    }
    addConstraints(): void {
        if (this.solver === null || this.Z3 === null) {
            throw new Error("Solver not initialized");
        }

        // Each cell must be between 1 and BOARD_SIZE
        for (let row of this.cells){
            for (let cell of row){
                this.solver.add(cell.ge(1));
                this.solver.add(cell.le(BOARD_SIZE));
            }
        }

        // Values in each row must be unique
        for (let row of this.cells){
            this.solver.add(this.Z3.Distinct(...row));
        }

        // Values in each column must be unique
        for (let col = 0; col < BOARD_SIZE; col++){
            this.solver.add(this.Z3.Distinct(...this.cells.map(row => row[col])));
        }

        // Values in each box must be unique
        for (let boxRow = 0; boxRow < BOX_SIZE; boxRow++){
            for (let boxCol = 0; boxCol < BOX_SIZE; boxCol++){
                let boxCells = [];
                for (let row = 0; row < BOX_SIZE; row++){
                    for (let col = 0; col < BOX_SIZE; col++){
                        boxCells.push(this.cells[boxRow * BOX_SIZE + row][boxCol * BOX_SIZE + col]);
                    }
                }
                this.solver.add(this.Z3.Distinct(...boxCells));
            }
        }
    }

    async addAssertions(): Promise<void> {
        // TODO make the seed actually do something
        if (this.solver === null || this.Z3 === null || this.assertionsMap === null) {
            throw new Error("Solver not initialized");
        }
        let solution = await this.solver.check();
        if (solution === "unsat" || solution === "unknown") {
            throw new Error("Solver returned unsat or unknown. This indicates that the puzzle definition is fundamentally broken, or a bad assertion was added at some point.");
        }
        console.log(solution);
        let model = this.solver.model();
        // print the model for debugging
        console.log(model);
        // set values in assertions
        for (let row of this.cells){
            for (let cell of row){
                let value = model.get(cell) as Arith;
                this.assertionsMap.set(cell, value);
            }
        }
    }
}

export default Sudoku;
