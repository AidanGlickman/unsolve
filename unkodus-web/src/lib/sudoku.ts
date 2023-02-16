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
        let Z3 = this.Z3 as Context;
        let cells = Array.from({ length: BOARD_SIZE }, (_, col) => Array.from({ length: BOARD_SIZE }, (_, row) => Z3.Int.const(`c_${row}_${col}`)));
    }
    addConstraints(): void {
        let Z3 = this.Z3 as Context;
        let solver = this.solver as Solver;

        // Each cell must be between 1 and BOARD_SIZE
        for(let row of this.cells){
            for (let cell of row){
                solver.add(cell.ge(1));
                solver.add(cell.le(BOARD_SIZE));
            }
        }

        // Values in each row must be unique
        for(let row of this.cells){
            solver.add(Z3.Distinct(...row));
        }

        // Values in each column must be unique
        for(let col = 0; col < BOARD_SIZE; col++){
            solver.add(Z3.Distinct(...this.cells.map(row => row[col])));
        }

        // Values in each box must be unique
        for(let boxRow = 0; boxRow < BOX_SIZE; boxRow++){
            for(let boxCol = 0; boxCol < BOX_SIZE; boxCol++){
                let boxCells = [];
                for(let row = 0; row < BOX_SIZE; row++){
                    for(let col = 0; col < BOX_SIZE; col++){
                        boxCells.push(this.cells[boxRow * BOX_SIZE + row][boxCol * BOX_SIZE + col]);
                    }
                }
                solver.add(Z3.Distinct(...boxCells));
            }
        }
    }

    addAssertions(): void {
        throw new Error('Method not implemented.');
    }
}

export default Sudoku;
