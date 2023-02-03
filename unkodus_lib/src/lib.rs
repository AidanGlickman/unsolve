use itertools::iproduct;
use rand::prelude::*;
use wasm_bindgen::prelude::*;
use z3::ast::Ast;
use z3::{ast, Config, Context, Solver};

const BOARD_SIZE: usize = 9;

pub struct SudokuBoard {
    seed: u64,
    board: [[u8; BOARD_SIZE]; BOARD_SIZE],
}

impl SudokuBoard {
    pub fn new(seed: u64) -> Self {
        let mut board = [[0; BOARD_SIZE]; BOARD_SIZE];
        let mut rng = StdRng::seed_from_u64(seed);

        Self { seed, board }
    }

    fn fill_board(&mut board: &mut [[u8; BOARD_SIZE]; BOARD_SIZE], rng: &mut StdRng) {
        // a helper function to fill the board with a random valid sudoku
    }

    pub fn board_to_smt(&mut self) {
        // convert the board to a smt
        let ctx = &Context::new(&Config::new());
        let mut solver = Solver::new(ctx);

        // create the variables
        let cells: Vec<Vec<ast::BV>> = (0..BOARD_SIZE)
            .map(|rr| {
                (0..BOARD_SIZE)
                    .map(|cc| ast::BV::new_const(ctx, format!("cell_{}_{}", rr, cc), 16))
                    .collect()
            })
            .collect();

        let one = ast::BV::from_i64(ctx, 1, 16);
        let mask = ast::BV::from_i64(ctx, 0b11_1111_1110, 16);

        for i in 0..9 {
            // Values in row i must be distinct
            solver.assert(
                &one.bvshl(&cells[i][0])
                    .bvor(&one.bvshl(&cells[i][1]))
                    .bvor(&one.bvshl(&cells[i][2]))
                    .bvor(&one.bvshl(&cells[i][3]))
                    .bvor(&one.bvshl(&cells[i][4]))
                    .bvor(&one.bvshl(&cells[i][5]))
                    .bvor(&one.bvshl(&cells[i][6]))
                    .bvor(&one.bvshl(&cells[i][7]))
                    .bvor(&one.bvshl(&cells[i][8]))
                    ._eq(&mask),
            );

            // Values in column i must be distinct
            solver.assert(
                &one.bvshl(&cells[0][i])
                    .bvor(&one.bvshl(&cells[1][i]))
                    .bvor(&one.bvshl(&cells[2][i]))
                    .bvor(&one.bvshl(&cells[3][i]))
                    .bvor(&one.bvshl(&cells[4][i]))
                    .bvor(&one.bvshl(&cells[5][i]))
                    .bvor(&one.bvshl(&cells[6][i]))
                    .bvor(&one.bvshl(&cells[7][i]))
                    .bvor(&one.bvshl(&cells[8][i]))
                    ._eq(&mask),
            );

            // Values in square i must be distinct
            let square_row = (i / 3) * 3;
            let square_col = (i % 3) * 3;
            solver.assert(
                &one.bvshl(&cells[square_row][square_col])
                    .bvor(&one.bvshl(&cells[square_row][square_col + 1]))
                    .bvor(&one.bvshl(&cells[square_row][square_col + 2]))
                    .bvor(&one.bvshl(&cells[square_row + 1][square_col]))
                    .bvor(&one.bvshl(&cells[square_row + 1][square_col + 1]))
                    .bvor(&one.bvshl(&cells[square_row + 1][square_col + 2]))
                    .bvor(&one.bvshl(&cells[square_row + 2][square_col]))
                    .bvor(&one.bvshl(&cells[square_row + 2][square_col + 1]))
                    .bvor(&one.bvshl(&cells[square_row + 2][square_col + 2]))
                    ._eq(&mask),
            );
        }

        // set the values of the board
        let assumptions = iproduct!(0..9, 0..9)
            .filter(|(rr, cc)| self.board[*rr][*cc] != 0)
            .map(|(rr, cc)| {
                cells[rr][cc]
                    .bvshl(&ast::BV::from_i64(ctx, self.board[rr][cc] as i64, 16))
                    ._eq(&mask)
            })
            .collect::<Vec<_>>();
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
