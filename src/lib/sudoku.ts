import { Arith, Context } from 'z3-solver';
import Puzzle from './puzzle';
import MWCRandom from './random';
import puzzles from '../data/sudoku/puzzles'

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
        if (this.solver === null || this.Z3 === null || this.assertionsMap === null) {
            throw new Error("Solver not initialized");
        }
        let numInSet: number = Math.floor(this.random.random() * puzzles.length);
        let puzzle = puzzles[numInSet];

        puzzle = this.randomSwaps(puzzle);
        
        for(let i = 0; i < BOARD_SIZE*BOARD_SIZE; i++){
            let col = i % BOARD_SIZE;
            let row = Math.floor(i / BOARD_SIZE);
            let val = puzzle[i];
            this.assertionsMap.set(this.cells[row][col], this.Z3.Int.val(val));
        }
    }

    private randomSwaps(puzzle: string){
        // generate a random mapping between numbers 1-9 and numbers 1-9
        let mapping = new Map<number, number>();
        let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        for(let i = 0; i < 9; i++){
            let num = numbers.splice(Math.floor(this.random.random() * numbers.length), 1)[0];
            mapping.set(i+1, num);
        }
        // swap the numbers in the puzzle
        let newPuzzle = "";
        for(let i = 0; i < BOARD_SIZE*BOARD_SIZE; i++){
            let val = puzzle[i];
            newPuzzle += mapping.get(parseInt(val))?.toString();
        }
        return newPuzzle;
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
        this.removedAssertions.push([key, this.assertionsMap.get(key) as Arith]);
        this.assertionsMap.delete(key);
    }

    public undo() {
        if(this.assertionsMap === null){
            throw new Error("Solver not initialized");
        }
        if(this.removedAssertions.length === 0) throw new Error("No assertions to undo");
        let [key, value] = this.removedAssertions.pop() as [Arith, Arith];
        this.assertionsMap.set(key, value);
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
