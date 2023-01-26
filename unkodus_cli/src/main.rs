use rand::Rng;
use unkodus_lib::SudokuBoard;
fn main() {
    println!("UnKODUS CLI...");
    let board_seed = std::env::args()
        .nth(1)
        .unwrap_or("No seed given".to_string());
    let board_seed = board_seed.parse::<u64>().unwrap_or({
        println!("No seed given, generating random seed");
        let mut rng = rand::thread_rng();
        rng.gen()
    });
    println!("Seed: {}", board_seed);

    let mut board = SudokuBoard::new(board_seed);
}
