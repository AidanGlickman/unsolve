import { Arith } from 'z3-solver'

interface Props {
    boardSize: number
    boxSize: number
    cells: Arith[][]
}

export function Sudoku({ boardSize, boxSize, cells }: Props) {
    return <div className="sudoku">
        {cells.map(row => row.map(
            cell => <div className="sudoku-cell">
                {cell.toString()}
            </div>
        ))}
    </div>
}