use rand::prelude::*;

use wasm_bindgen::prelude::*;
use z3::{ast, Config, Context, Solver};

pub struct SudokuBoard {
    seed: u64,
    board: [[u8; 9]; 9],
    solver: Solver,
}

impl SudokuBoard {
    pub fn new(seed: u64) -> Self {
        let mut board = [[0; 9]; 9];
        let mut rng = StdRng::seed_from_u64(seed);
        let ctx = &Context::new(&Config::default());
        let solver = Solver::new(ctx);

        Self {
            seed,
            board,
            solver,
        }
    }

    fn fill_board(&mut board: &mut [[u8; 9]; 9], rng: &mut StdRng) {
        // a helper function to fill the board with a random valid sudoku
    }

    pub fn board_to_smt(&mut self) {
        // convert the board to a smt
        let b = self.board;
        let s = self.solver;
        let puzz = [[Int(); 9]; 9];
        // basic sudoku rules
        // all values must be between 1 and 9, inclusive
        for r in (0..9) {
            for c in (0..9) {
                s.add(puzz[r][c] >= 1);
                s.add(puzz[r][c] <= 9);
            }
        }
        // all rows must have distinct values
        s.add(distinct(puzz[r]));
        // all cols must have distinct values
        for c in (0..9) {
            let mut vec = Vec::new();
            for r in (0..9) {
                vec.push(puzz[r][c]);
            }
            s.add(distinct(vec));
        }
        
        // all 3x3 subgrids must have distinct values
        for i in (0..3) {
            for j in (0..3) {
                let mut vec = Vec::new();
                for r in (0..3) {
                    for c in (0..3) {
                        vec.push(puzz[3*i + r][3*j + c]);
                    }
                }
                s.add(distinct(vec));
            }
        }
    }

    pub fn remove_pos(&mut self, pos: i32) {
        // remove the assignment of a value to a position, then verify that the puzzle is still unique
    }
}

mod tests {
    use super::*;

    #[test]
    fn test_create_board() {
        let mut board = SudokuBoard::new(0);
    }
}
