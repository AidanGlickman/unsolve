/*
 * Count number of Sudoku positions reduced by a factor of 9!*72^2=1881169920.
 * References:
 * Message-ID: <1116671780.101836.72980@g47g2000cwa.googlegroups.com>
 *
 * Author: Bertram Felgenhauer <bf3@inf.tu-dresden.de>
 *
 * History:
 * 2005-05-22: Initial version.
 * 2005-05-22: made inlining actually work, speedup ~1.25
 * 2005-05-23: v2: take box 23 configuration on command line.
 *
 * Note: this program makes heavy use of recursively instantiated templates
 * which some compilers may not be happy about. (icc 8.0 works now)
 *
 * Usage:
 * ./sudoku2 mult [[4,5,9,6,7,8],[7,8,3,9,2,1],[2,1,6,3,5,4]]
 *
 * Compile (example):
 * g++ -O2 -Wall -fomit-frame-pointer -march=athlon-xp sudoku2.cc -o sudoku2
 */

#include <iostream>
#include <cstdlib>

// #define DEBUG
#define PRINT

/* bit masks of used numbers for the 9 columns, rows and boxes. */
static int u[3][9];

#ifdef PRINT
static int v[9][9];
#endif

/*
 * get bit mask of numbers that are forbidden at position x, y
 */
static inline int mask(int x, int y)
{
    return u[0][x] | u[1][y] | u[2][(x/3)*3+(y/3)];
}

/*
 * place a number at x, y - m is the corresponding bit mask
 */
static inline void place(int x, int y, int m)
{
#ifdef DEBUG
    if ((mask(x, y) & m) || (m&(m-1))) {
        std::cerr << "error: place(" << x << "," << y << ","
                  << m << ")" << std::endl;
        std::exit(1);
    }
#endif
    u[0][x] += m;
    u[1][y] += m;
    u[2][(x/3)*3+(y/3)] += m;
#ifdef PRINT
    v[x][y] = m;
#endif
}

/*
 * counterpart to place()
 */
static inline void undo(int x, int y, int m)
{
#ifdef DEBUG
    if (!(u[0][x] & u[1][y] & u[2][(x/3)*3+(y/3)] & m) || (m&(m-1))) {
        std::cerr << "error: undo(" << x << "," << y << ","
                  << m << ")" << std::endl;
        std::exit(1);
    }
#endif
    u[0][x] -= m;
    u[1][y] -= m;
    u[2][(x/3)*3+(y/3)] -= m;
}

static unsigned long long solutions;

/*
 * the purpose of using a template here is to profit from constant folding
 * and from function inlining.
 */
template <int x, int y> static inline void search();

/*
 * we get here after placing all numbers --> count a solution.
 */
template<> static inline void search<8, 9>()
{
#ifdef DEBUG
    for (int i=0; i<9; i++)
        if (u[0][i] != 0777 ||
            u[1][i] != 0777 ||
            u[2][i] != 0777) {
            std::cerr << "error: incompletely filled board" << std::endl;
            std::exit(1);
        }
#endif
#ifdef PRINT
    for (int i=0; i<9; i++) {
        for (int j=0; j<9; j++) {
            int k;
            for (k=0; k<9; k++)
                if (v[i][j] & (1<<k))
                    break;
            std::cout << (char)('1'+k);
            if (j%3 == 2)
                std::cout << " ";
        }
        std::cout << std::endl;
        if (i==8)
            std::cout << "===========" << std::endl;
        else if (i%3 == 2)
            std::cout << std::endl;
    }
#endif
    if (solutions >= 200){
        exit(0);
    }
    solutions++;
    if (solutions % (1<<20) == 0)
        /* progress indicator */
        std::cout << solutions << "\r" << std::flush;
}

/*
 * fill everything except top left box, top row and left column.
 * we start by filling the first column, then first row, then
 * second column, then second row and so on.
 */
template <int x, int y> static inline void search()
{
    int m = 0777 ^ mask(x, y);
    while (m) {
        int i = m & -m; // extract lowest 1-bit from m.
        m -= i;
        place(x, y, i);
        search<(x>y ? x==3 && y<3 ? 8   : x-1 : y==8 ? 8   : x),
               (x>y ? x==3 && y<3 ? y+1 : y   : y==8 ? x+1 : y+1)>();
        undo(x, y, i);
    }
}

/*
 * table for remaining 6 entries of the first column with the following
 * constraints:
 * - entries 3,4,5 and entries 6,7,8 are are sorted
 * - entries 3 and 6 are sorted (i.e. entry 3 is 3)
 * this results in a reduction of factor 72 for each the first column
 * and the first row.
 */
static const int rem[10][6] = {
    { 3,4,5, 6,7,8, },
    { 3,4,6, 5,7,8, },
    { 3,4,7, 5,6,8, },
    { 3,4,8, 5,6,7, },
    { 3,5,6, 4,7,8, },
    { 3,5,7, 4,6,8, },
    { 3,5,8, 4,6,7, },
    { 3,6,7, 4,5,8, },
    { 3,6,8, 4,5,7, },
    { 3,7,8, 4,5,6, },
};

int main(int argc, char **argv)
{
    /* choice for first column, -1 for 'all' */
    int choice_v = -1;
    
    /* handle program args */
    if (argc < 3) {
        std::cerr << "error: 2 or 3 arguments expected." << std::endl;
        return 1;
    }
    if (argc > 3)
        choice_v = atoi(argv[3]);
    /* place upper left square - reduce by factor of 9! */
    for (int i=0; i<3; i++)
        for (int j=0; j<3; j++)
            place(i, j, 1<<(i*3+j));
    {
        char *p = argv[2];
        for (int y=0; y<3; y++)
            for (int x=3; x<9; x++) {
                while (*p && *p<'1' || *p>'9')
                    p++;
                if (!*p || (mask(y, x) & (1<<(*p-'1')))) {
                    std::cerr << "error: invalid initial configuration at "
                              << x << "," << y << " ('" << *p << "')"
                              << std::endl;
                    return 1;
                }
                place(y, x, 1<<(*p-'1'));
                p++;
            }
    }

    /* actual search */
    for (int v=0; v<10; v++) if (choice_v == -1 || v == choice_v) {
        for (int i=3; i<9; i++)
            place(i, 0, 1<<(rem[v][i-3]/3 + (rem[v][i-3]%3)*3));
        search<8, 1>();
        for (int i=3; i<9; i++)
            undo(i, 0, 1<<(rem[v][i-3]/3 + (rem[v][i-3]%3)*3));
    }

#if 0
    for (int i=0; i<3; i++)
        for (int j=0; j<3; j++)
            undo(i, j, 1<<(i+j*3));
    for (int i=0; i<9; i++)
        if (u[0][i] != 0 ||
            u[1][i] != 0 ||
            u[2][i] != 0) {
            std::cerr << "error: garbage left at end of program" << std::endl;
            std::exit(1);
        }
#endif
    std::cout << argv[2] << ": " << argv[1] << " * " << solutions << std::endl;
    return 0;
}
