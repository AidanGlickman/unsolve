import { useEffect, useState } from 'react'
import '../css/SudokuGrid.scss'
import { BOARD_SIZE, BOX_SIZE } from '../lib/sudoku'

const OSCILLATION_MILLISECONDS = 750;

interface Props {
    cells: string[][]
    originalCells: string[][]
    counterExample: string[][]
    isOscillating: boolean
    onClickCell: (row: number, col: number) => void
    frozen: boolean
}

function isEndOfBox(cellIndex: number) {
    return cellIndex % BOX_SIZE == BOX_SIZE - 1 && cellIndex != BOARD_SIZE - 1
}

export function SudokuGrid({ cells, originalCells, counterExample, isOscillating, onClickCell, frozen }: Props) {
    const [showingCounterExample, setShowingCounterExample] = useState(false);

    function isCellWrong(rowIndex: number, colIndex: number) {
        return isOscillating && (originalCells[rowIndex][colIndex] !== counterExample[rowIndex][colIndex]);
    }

    function oscillate() {
        setTimeout(() => {
            setShowingCounterExample(!showingCounterExample)
        }, OSCILLATION_MILLISECONDS)
    }

    // oscillate every second
    useEffect(() => {
        if (isOscillating) {
            oscillate();
        }
    }, [showingCounterExample, isOscillating]);

    return <div className="sudoku-grid">
        {cells.map((row, rowIndex) => 
            <div className="sudoku-row" key={rowIndex}>
                {row.map((cell, colIndex) =>
                    <button
                        disabled={frozen}
                        className={`sudoku-cell ${isEndOfBox(rowIndex) ? "bottom" : ""} ${isEndOfBox(colIndex) ? "right" : ""}`}
                        onClick={() => onClickCell(rowIndex, colIndex)}
                        key={colIndex}>
                        <div className={`sudoku-cell-contents ${cell ? "" : "faded"} ${isCellWrong(rowIndex, colIndex) ? "wrong" : ""}`}>
                            {cell ? cell : ((showingCounterExample && isOscillating) ? counterExample[rowIndex][colIndex] : originalCells[rowIndex][colIndex])}
                        </div> 
                    </button>
                )}
            </div>
        )}
    </div>
}