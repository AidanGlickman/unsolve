import { useState } from 'react'
import '../css/App.scss'
import { BOARD_SIZE, BOX_SIZE, Sudoku } from '../lib/sudoku'
import { SudokuGrid } from './SudokuGrid';

const NBSP = '\xa0'; // nonbreaking space

function getDefaultCells(): string[][] {
    return Array(BOARD_SIZE).fill(Array(BOARD_SIZE).fill(NBSP));
}

function App() {
    // initialize the seed. It should be a number between 0 and 1000, but we'll
    // also want it to change with the input field, so we'll use state.
    const [seed, setSeed] = useState<number>(Math.floor(Math.random() * 1000));
    const [sudoku, setSudoku] = useState<Sudoku>();
    const [cells, setCells] = useState(getDefaultCells());
    const [originalCells, setOriginalCells] = useState(getDefaultCells());
    const [counterExample, setCounterExample] = useState(getDefaultCells());
    const [frozen, setFrozen] = useState(true);
    const [numbersRemoved, setNumbersRemoved] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    async function genPuzzle(seed: number) {
        const puzzle = new Sudoku(seed);
        setFrozen(true);
        await puzzle.init();
        setFrozen(false);
        setSudoku(puzzle);
        setCounterExample(getDefaultCells());
        setCells(puzzle.getCellText());
        setOriginalCells(puzzle.getCellText());
    }

    async function eraseCell(row: number, col: number) {
        if (!sudoku) {
            return; // sudoku not yet initialized
        }

        if (!sudoku.hasAssertion([row, col])) {
            return; // cell already removed
        }

        sudoku.removeAssertion([row, col]);
        setNumbersRemoved(numbersRemoved + 1);
        setCells(sudoku.getCellText());
        setFrozen(true);
        
        const isUnique = await sudoku.checkUniqueness();
        if (!isUnique.unique && isUnique.counterExample !== null) {
            const counterExample = sudoku.modelToGrid(isUnique.counterExample);
            setCounterExample(counterExample);
            setGameOver(true);
        } else {
            setFrozen(false);
        }
    }

    function oscillate() {

    }

    function startGame() {
        // reset everything
        setSudoku(undefined);
        setCells(getDefaultCells());
        setFrozen(true);
        setNumbersRemoved(0);
        setGameOver(false);

        // generate a puzzle
        genPuzzle(seed)
    }

    function canUndo() {
        return sudoku && numbersRemoved > 0 && !gameOver;
    }

    function undo() {
        if (!sudoku) {
            return;
        }

        sudoku.undo();
        setCells(sudoku.getCellText());
        setNumbersRemoved(numbersRemoved - 1);
    }

    return (
        <div className="app">
            <div className="title">
                <h1><em>un</em>solve</h1>
            </div>
            <div className={"instructions" + (gameOver ? " game-over" : "")}>
                {gameOver ?
                    "Game over! The solution is not unique!"
                    : sudoku ?
                        "Click on any square to remove its number.\nKeep the solution unique!"
                        :
                        'Click "Generate Puzzle" to start a new game.'
                }
            </div>
            <div className="stats">
                Score: {numbersRemoved}
            </div>
            <div className="sudoku-grid-wrapper">
                <button
                    className="undo-button"
                    onClick={() => undo()}
                    disabled={!canUndo()}>
                    Undo
                </button>
                <SudokuGrid
                    cells={cells}
                    originalCells={originalCells}
                    counterExample={counterExample}
                    isOscillating={gameOver}
                    frozen={frozen}
                    onClickCell={eraseCell}
                />
            </div>
            <div className="generation-settings">
                <div className="seed-input">
                    <label htmlFor="seed">Seed:</label>
                    <input type="number" id="seed" name="seed" value={seed} onChange={(e) => setSeed(parseInt(e.target.value))} />
                </div>
                <button onClick={() => startGame()}>Generate Puzzle</button>
            </div>
        </div>
    )
}

export default App
