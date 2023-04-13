import '../css/SudokuGrid.scss'
import { BOARD_SIZE, BOX_SIZE } from '../lib/sudoku'

interface Props {
    cells: string[][]
    onClickCell: (row: number, col: number) => void
    frozen: boolean
}

function isEndOfBox(cellIndex: number) {
    return cellIndex % BOX_SIZE == BOX_SIZE - 1 && cellIndex != BOARD_SIZE - 1
}

export function SudokuGrid({ cells, onClickCell, frozen }: Props) {
    return <div className="sudoku-grid">
        {cells.map((row, rowIndex) => 
            <div className="sudoku-row" key={rowIndex}>
                {row.map((cell, colIndex) =>
                    <button
                        disabled={frozen}
                        className={`sudoku-cell ${isEndOfBox(rowIndex) ? "bottom" : ""} ${isEndOfBox(colIndex) ? "right" : ""}`}
                        onClick={() => onClickCell(rowIndex, colIndex)}
                        key={colIndex}>
                        <div className="sudoku-cell-contents">
                            {cell.toString()}
                        </div> 
                    </button>
                )}
            </div>
        )}
    </div>
}