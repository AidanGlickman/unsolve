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
