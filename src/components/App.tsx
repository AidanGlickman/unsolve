import { useEffect, useState } from 'react'
import '../css/App.scss'
import { BOARD_SIZE, BOX_SIZE, Sudoku } from '../lib/sudoku'
import { SudokuGrid } from './SudokuGrid';

const NBSP = '\xa0'; // nonbreaking space
const WINNING_SCORE = 64;

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
    const [revealed, setRevealed] = useState(false);
    const win = numbersRemoved >= WINNING_SCORE;

    async function genPuzzle(seed: number) {
        const puzzle = new Sudoku(seed);
        setFrozen(true);
        await puzzle.init();
        setFrozen(false);
        setSudoku(puzzle);
        setCounterExample(getDefaultCells());
        setCells(puzzle.getCellText());
        setOriginalCells(puzzle.getCellText());
        setRevealed(false);
    }

    async function eraseCell(row: number, col: number) {
        if (!sudoku) {
            return; // sudoku not yet initialized
        }

        if (!sudoku.hasAssertion([row, col])) {
            return; // cell already removed
        }

        sudoku.removeAssertion([row, col]);
        setCells(sudoku.getCellText());
        setFrozen(true);
        
        const isUnique = await sudoku.checkUniqueness();
        if (!isUnique.unique && isUnique.counterExample !== null) {
            const counterExample = sudoku.modelToGrid(isUnique.counterExample);
            setCounterExample(counterExample);
            setGameOver(true);
        } else {
            setFrozen(false);
            setNumbersRemoved(numbersRemoved + 1);
        }
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
        return sudoku && numbersRemoved > 0 && !revealed;
    }

    function undo() {
        if (!sudoku) {
            return;
        }

        if (win || !gameOver) {
            setNumbersRemoved(numbersRemoved - 1);
        }

        sudoku.undo();
        setGameOver(false);
        setFrozen(false);
        setCells(sudoku.getCellText());
    }

    function canReveal() {
        return sudoku && !revealed && !win;
    }

    function reveal() {
        if (!sudoku) {
            return;
        }

        const newCells = sudoku.minForm.map(row => row.map(str => str.replace('.', '')))

        setCells(newCells);
        setFrozen(true);
        setRevealed(true);
    }

    useEffect(() => {
        if (win) {
            setGameOver(true);
        }
    }, [numbersRemoved])

    return (
        <div className="app">
            <header className="title">
                <h1><em>un</em>solve</h1>
            </header>
            <main>
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
                <div className={"instructions" + (gameOver ? " game-over" : "") + (win ? " win" : "")}>
                    {gameOver ? (
                        win
                        ? "You win! No more numbers can be removed!"
                        : "Game over! The solution is not unique!"
                    ) : (
                        sudoku
                        ? "Click on any square to remove its number.\nKeep the solution unique!"
                        : 'Click "Generate Puzzle" to start a new game.'
                    )
                    }
                </div>
                <div className="stats">
                    Score: {numbersRemoved}
                </div>
                <div className="sudoku-grid-wrapper">
                    <div className="sudoku-grid-buttons">
                        <button
                            className="undo-button"
                            onClick={() => undo()}
                            disabled={!canUndo()}>
                            Undo
                        </button>

                        <button
                            className="reveal-button"
                            onClick={() => reveal()}
                            disabled={!canReveal()}>
                            Reveal
                        </button>
                    </div>
                    <SudokuGrid
                        cells={cells}
                        originalCells={originalCells}
                        counterExample={counterExample}
                        isOscillating={gameOver && !revealed && !win}
                        frozen={frozen}
                        onClickCell={eraseCell}
                    />
                </div>
                <div className="generation-settings">
                    <div className="seed-input">
                        <label htmlFor="seed">Seed:</label>
                        <input type="number" id="seed" name="seed" value={seed} onChange={(e) => setSeed(parseInt(e.target.value))} />
                    </div>
                    <div className="sudoku-grid-wrapper">
                        <div className="sudoku-grid-buttons">
                            <button
                                className="undo-button"
                                onClick={() => undo()}
                                disabled={!canUndo()}>
                                Undo
                            </button>

                            <button
                                className="reveal-button"
                                onClick={() => reveal()}
                                disabled={!canReveal()}>
                                Reveal
                            </button>
                        </div>
                        <SudokuGrid
                            cells={cells}
                            originalCells={originalCells}
                            counterExample={counterExample}
                            isOscillating={gameOver && !revealed}
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
            </main>
            <footer>
                Made by <a href="https://www.aidanglickman.com" target="_blank">Aidan Glickman</a>, <a href="https://aaronson.org" target="_blank">Adam Aaronson</a>, and <a href="https://github.com/aakashnarayan" target="_blank">Aakash Narayan</a> at UIUC | <a href="https://github.com/AidanGlickman/unsolve" target="_blank">GitHub</a>
            </footer>
        </div>
    )
}

export default App
