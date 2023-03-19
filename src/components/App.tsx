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
  const [cells, setCells] = useState<string[][]>(getDefaultCells());

  async function genPuzzle(seed: number) {
    const puzzle = new Sudoku(seed);
    await puzzle.init();
    console.log(puzzle.boardToString());
    setCells(puzzle.getCellText());
  }

  return (
    <div className="app">
      <div className="sudoku-grid-wrapper">
        <SudokuGrid
          cells={cells}
        />
      </div>
      <div className="generation-settings">
        <div className="seed-input">
          <label htmlFor="seed">Seed:</label>
          <input type="number" id="seed" name="seed" value={seed} onChange={(e) => setSeed(parseInt(e.target.value))} />
        </div>
        <button onClick={() => genPuzzle(seed)}>Generate Puzzle</button>
      </div>
    </div>
  )
}

export default App
