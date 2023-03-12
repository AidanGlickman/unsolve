import { assert, expect, test } from 'vitest'
import Sudoku from '../lib/sudoku';

test('no test', () => {
    expect(true).toBe(true)
})

test("Z3 is able to access the SharedArrayBuffer", async () => {
    const testPuzzle = new Sudoku(111);
    expect(async () => { await testPuzzle.init() }).not.toThrow()
})
