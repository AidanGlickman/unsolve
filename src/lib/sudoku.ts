import { Arith, Context } from 'z3-solver';
import Puzzle from './puzzle';

export const BOARD_SIZE = 9;
export const BOX_SIZE = 3;
const NBSP = '\xa0'; // nonbreaking space

export class Sudoku extends Puzzle {
    private cells: Arith[][];
    constructor(seed: number) {
        super(seed);
        this.cells = [];
    }

    public async init(): Promise<void> {
        await super.init();
        
        if (this.Z3 === null || this.solver === null || this.assertionsMap === null) {
            throw new Error("Z3 not initialized");
        }

        let Z3 = this.Z3 as Context<"main">; // Not sure why this is necessary, everything else works fine

        let cells = Array.from({ length: BOARD_SIZE }, (_, col) => Array.from({ length: BOARD_SIZE }, (_, row) => Z3.Int.const(`c_${row}_${col}`)));
        this.cells = cells;

        this.addConstraints();
        await this.addAssertions();
        await this.createOriginalSolutionRestriction();
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

    public hasAssertion(val: [number, number]): boolean {
        if(this.assertionsMap === null){
            throw new Error("Solver not initialized");
        }
        let key = this.cells[val[0]][val[1]];

        return this.assertionsMap.has(key);
    }

    public removeAssertion(val: [number, number]): void {
        if(this.assertionsMap === null){
            throw new Error("Solver not initialized");
        }
        let key = this.cells[val[0]][val[1]];

        if(!this.assertionsMap.has(key)) throw new Error("No such assertion to delete");
        this.assertionsMap.delete(key);
    }

    public boardToString(): string {
        if(this.assertionsMap === null || this.Z3 === null){
            throw new Error("Solver not initialized");
        }
        let board = "";
        for(let i = 0; i < BOARD_SIZE; i++){
            let row = "";
            for(let j = 0; j < BOARD_SIZE; j++){
                let cell = this.cells[i][j];
                let valString;
                if(this.assertionsMap.has(cell)){
                    let value = this.assertionsMap.get(cell);
                    valString = value?.toString();
                }
                else valString = "_";
                row += valString + " ";
                if(j % BOX_SIZE === BOX_SIZE - 1){
                    row += "| ";
                }
            }
            board += row + "\n";
            if(i % BOX_SIZE === BOX_SIZE - 1){
                board += "---------------------\n";
            }
        }
        return board;
    }

    public getCellText(): string[][] {
        let cellText: string[][] = []
        for (let rowIndex = 0; rowIndex < BOARD_SIZE; rowIndex++) {
            cellText.push([])
            for (let colIndex = 0; colIndex < BOARD_SIZE; colIndex++) {
                let cell = this.cells[rowIndex][colIndex];
                let valString = NBSP;
                if (this.assertionsMap?.has(cell)) {
                    let value = this.assertionsMap.get(cell);
                    if (value) {
                        valString = value.toString();
                    }
                }
                cellText[cellText.length - 1].push(valString)
            }
        }
        return cellText;
    }
}

export default Sudoku;
