use rand::prelude::*;
use splr::*;
use wasm_bindgen::prelude::*;

struct SudokuBoard {
    seed: u64,
    board: [[u8; 9]; 9],
}

impl SudokuBoard {
    fn new(seed: u64) -> Self {
        let mut board = [[0; 9]; 9];
        let mut rng = StdRng::seed_from_u64(seed);

        Self { seed, board }
    }

    fn fill_board(&mut board: &mut [[u8; 9]; 9], rng: &mut StdRng) {
        // fill the board with a valid sudoku using backtracking
    }
}
