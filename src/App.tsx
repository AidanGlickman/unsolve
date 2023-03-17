import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import Sudoku from './lib/sudoku';

async function genPuzzle(seed: number) {
  const puzzle = new Sudoku(seed);
  await puzzle.init();
  console.log(puzzle.boardToString());
  puzzle.removeAssertion([1, 1]);
  console.log(puzzle.boardToString());
}

function App() {
  // initialize the seed. It should be a number between 0 and 1000, but we'll
  // also want it to change with the input field, so we'll use state.
  const [seed, setSeed] = useState<number>(Math.floor(Math.random() * 1000));

  return (
    <div className="App">
      <label htmlFor="seed">Seed: </label>
      <input type="number" id="seed" name="seed" value={seed} onChange={(e) => setSeed(parseInt(e.target.value))} />
      <button onClick={() => genPuzzle(seed)}>Generate Puzzle</button>

    </div>
  )
}

export default App
