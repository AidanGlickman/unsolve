import { Arith } from 'z3-solver'
import '../css/SudokuGrid.scss'
import { BOARD_SIZE, BOX_SIZE } from '../lib/sudoku'

interface Props {
    cells: string[][]
}

function isEndOfBox(cellIndex: number) {
    return cellIndex % BOX_SIZE == BOX_SIZE - 1 && cellIndex != BOARD_SIZE - 1
}

export function SudokuGrid({ cells, }: Props) {
    return <div className="sudoku-grid">
        {cells.map((row, rowIndex) => 
            <div className="sudoku-row" key={rowIndex}>
                {row.map((cell, colIndex) =>
                    <div className={`sudoku-cell ${isEndOfBox(rowIndex) ? "bottom" : ""} ${isEndOfBox(colIndex) ? "right" : ""}`} key={colIndex}>
                        <div className="sudoku-cell-contents">
                            {cell.toString()}
                        </div> 
                    </div>
                )}
            </div>
        )}
    </div>
}