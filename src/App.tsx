import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import Sudoku from './lib/sudoku';

async function genPuzzle(seed: number) {
  const puzzle = new Sudoku(seed);
  await puzzle.init();
  console.log(puzzle);
}

function App() {
  const seed: number = Math.floor(Math.random() * 1000);

  return (
    <div className="App">
      <label htmlFor="seed">Seed: </label>
      <input type="number" defaultValue={seed} />
      <button onClick={() => genPuzzle(seed)}>Generate Puzzle</button>

    </div>
  )
}

export default App
