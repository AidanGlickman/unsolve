use rand::prelude::*;
use splr::{
    types::{CNFDescription, Instantiate},
    *,
};
use wasm_bindgen::prelude::*;

struct SudokuBoard {
    seed: u64,
    board: [[u8; 9]; 9],
    solver: Solver,
}

impl SudokuBoard {
    fn new(seed: u64) -> Self {
        let mut board = [[0; 9]; 9];
        let mut rng = StdRng::seed_from_u64(seed);
        // Im not sure if solver is the correct struct for what we want to save, its possible that CNFDescription is better
        let mut solver = Solver::instantiate(&Config::default(), &CNFDescription::default());

        Self {
            seed,
            board,
            solver,
        }
    }

    fn fill_board(&mut self) {
        // fill the board with a valid sudoku using backtracking
    }

    fn board_to_cnf(&mut self) {
        // convert the board to a cnf
    }

    fn remove_pos(&mut self, pos: (usize, usize)) {
        // remove a given position from the board
    }
}

mod tests {
    use super::*;

    #[test]
    fn test_create_board() {
        let mut board = SudokuBoard::new(0);
        board.fill_board();
        board.board_to_cnf();
        board.remove_pos((0, 0));
    }
}
