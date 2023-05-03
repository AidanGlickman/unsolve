/*
 * Determine equivalence classes for the placement of the first three
 * boxes.
 *
 * Author: Bertram Felgenhauer
 * History:
 * 2005-05-23: Initial version.
 * 2005-05-30: Added tree output for equivalence class verification.
 *
 * This is much faster and also better than the crude Haskell version
 * I used before.
 */

#include <algorithm>
#include <vector>
#include <map>
#include <string>
#include <iostream>
#include <iomanip>
#include <cstdio>
#include <cstring>

/* repository of the 36288 normalized configurations */
static std::map<std::string, size_t> rev_lookup;
static std::vector<std::string> lookup;

/* store an equivalence relation along with the equivalence
 * class sizes */
static std::vector<size_t> equiv;
static std::vector<size_t> eq_size;

/* Store a generating forest of that relation as a bidirectional
 * graph. Edges are annotated with the rule that was used to
 * derive the corresponding equivalence */
static std::multimap<size_t, std::pair<std::string, size_t> > graph;

/*
 * box utility class, provides basic access methods and
 * handles string presentation for storage.
 */
struct box123
{
    int val[3][9];
    box123();
    box123(std::string &);
    void normalize();
    void swap_col(size_t i, size_t j) {
        for (size_t k=0; k<3; k++)
            std::swap(val[k][i], val[k][j]);
    }
    void swap_row(size_t i, size_t j) {
        for (size_t k=0; k<9; k++)
            std::swap(val[i][k], val[j][k]);
    }
    void swap_box(size_t i, size_t j) {
        for (size_t k=0; k<3; k++)
            swap_col(i*3+k, j*3+k);
    }
    bool valid();
    operator std::string() const;
};

/*
 * normalize box1 and first row
 */
void box123::normalize()
{
    int trans[9];

    // rename box 1
    for (size_t i=0; i<3; i++)
        for (size_t j=0; j<3; j++)
            trans[val[i][j]] = 3*i+j;
    for (size_t i=0; i<3; i++)
        for (size_t j=0; j<9; j++)
            val[i][j] = trans[val[i][j]];

    // order columns in box 2
    if (val[0][3]>val[0][4])
        swap_col(3, 4);
    if (val[0][4]>val[0][5])
        swap_col(4, 5);
    if (val[0][3]>val[0][4])
        swap_col(3, 4);

    // order columns in box 3
    if (val[0][6]>val[0][7])
        swap_col(6, 7);
    if (val[0][7]>val[0][8])
        swap_col(7, 8);
    if (val[0][6]>val[0][7])
        swap_col(6, 7);

    // maybe swap boxes 2 and 3
    if (val[0][3] > val[0][6])
        swap_box(1, 2);
}

box123::box123()
{
    for (size_t i=0; i<3; i++) {
        for (size_t j=0; j<3; j++)
            val[i][j] = 3*i+j;
        for (size_t j=3; j<9; j++)
            val[i][j] = -1;
    }
}

box123::box123(std::string &s)
{
    for (size_t i=0; i<3; i++) {
        for (size_t j=0; j<3; j++)
            val[i][j] = 3*i+j;
        for (size_t j=3; j<9; j++)
            val[i][j] = s[i*7+j-3]-'1';
    }
}

box123::operator std::string() const
{
    std::string s = "      ,      ,      ";
    for (size_t i=0; i<3; i++)
        for (size_t j=3; j<9; j++)
            s[i*7+j-3] = val[i][j]+'1';
    return s;
}

/*
 * check validity of box
 */
bool box123::valid()
{
    for (size_t i=0; i<8; i++)
        for (size_t j=i+1; j<9; j++)
            if (val[0][i] != -1 && val[0][i] == val[0][j] ||
                val[1][i] != -1 && val[1][i] == val[1][j] ||
                val[2][i] != -1 && val[2][i] == val[2][j] ||
                val[i%3][i/3+0] != -1 && val[i%3][i/3+0] == val[j%3][j/3+0] ||
                val[i%3][i/3+3] != -1 && val[i%3][i/3+3] == val[j%3][j/3+3] ||
                val[i%3][i/3+6] != -1 && val[i%3][i/3+6] == val[j%3][j/3+6])
                return false;
    return true;
}

/*
 * generate the 36288 normalized configurations
 */
static void generate()
{
    /* possible first row completions */
    static const size_t rem[10][6] = {
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
    box123 b;

    size_t id = 0;
    for (size_t h=0; h<10; h++) {
        for (size_t x=3; x<9; x++)
            b.val[0][x] = rem[h][x-3];
        /* stackless backtracking implementation */
        size_t px = 3, py = 1;
        while (py>0) {
            if (px == 9) {
                /* went over right border -> skip to next row */
                px = 3;
                py++;
                if (py == 3) {
                    /* found a configuration - store it */
                    std::string s = b;
                    rev_lookup[s] = id;
                    lookup.push_back(s);
                    equiv.push_back(id);
                    eq_size.push_back(1);
                    id++;
                    /* back to previous position */
                    py--;
                    px = 8;
                }
            }
            if (b.val[py][px] == 8) {
                /* last value at current pos reached -> reset */
                b.val[py][px] = -1;
                /* and backtrack */
                px--;
                if (px==2) {
                    px = 8;
                    py--;
                }
            } else {
                /* try next value */
                b.val[py][px]++;
                if (b.valid())
                    /* still valid -> recurse */
                    px++;
            }
        }
    }
}

/*
 * functions to handle the equivalence relation
 *
 * the relation is stored as an inversed tree where
 * the root points to itself; equivalences are added
 * by changing one root to point to another one.
 *
 * there's some effort made to keep the tree flat.
 */
/*
 * find the root for given node; flatten tree a bit
 * if possible
 */
static size_t lookup_eq(size_t i)
{
    size_t oi = i;
    if (equiv[i] != i) {
        do {
            i = equiv[i];
        } while (equiv[i] != i);
        size_t ooi;
        do {
            ooi = equiv[oi];
            equiv[oi] = i;
            oi = ooi;
        } while (oi != i);
    }
    return i;
}

/*
 * add an equality between two nodes
 */
static void add_eq(size_t i, size_t j, const char *descr)
{
    size_t oi = i;
    size_t oj = j;
    i = lookup_eq(i);
    j = lookup_eq(j);
    if (i!=j) {
        // make the lexicographically smaller configuration the new root.
        if (i<j) {
            equiv[j] = i;
            eq_size[i] += eq_size[j];
        } else {
            equiv[i] = j;
            eq_size[j] += eq_size[i];
        }
        graph.insert(std::make_pair(oi, std::make_pair(std::string(descr),
                                                       oj)));
        graph.insert(std::make_pair(oj, std::make_pair(std::string(descr)+"'",
                                                       oi)));
    }
}

/*
 * like add_eq but one given node is a box configuration that
 * is normalized and looked up first.
 * Beware: the copying of the box123 object is intentional!
 * Don't use a reference here!
 */
static void add_eq(size_t i, box123 j, const char *descr)
{
#ifdef DEBUG
    if (!j.valid()) {
        std::cerr << "Error!" << std::endl;
        std::exit(1);
    }
#endif
#ifdef NO_RELABEL
    for (int y=0; y<3; y++)
        for (int x=0; x<3; x++)
            if (j.val[y][x] != 3*y+x)
                return;
#endif
    j.normalize();
    add_eq(i, rev_lookup[j], descr);
}

/*
 * print the size and a representative for each equivalence class
 */
static void list_eq()
{
    for (size_t i=0; i<equiv.size(); i++)
        if (equiv[i] == i) {
            std::cout << "./sudoku2"
                      << std::setw(6) << eq_size[i] << "  ["
                      << lookup[i] << "]" << std::endl;
        }
}

/*
 * generate some 'atomic' equivalences of the box with id i.
 */
static void gen_eq(size_t i)
{
    box123 b(lookup[i]);

    // 36288 configurations here
    if (1) {
        // swap first rows.
        box123 b2 = b;
        b2.swap_row(0, 1);
        add_eq(i, b2, "R(1,2)"); /* swap 0 1 */
        b2.swap_row(0, 1);
        b2.swap_row(0, 2);
        add_eq(i, b2, "R(1,3)"); /* swap 0 2 */
    }
    // 6240 configurations here
    if (1) {
        // swap first box' columns
        box123 b2 = b;
        b2.swap_col(0, 1);
        add_eq(i, b2, "C(1,2)"); /* swap 0 1 */
        b2.swap_col(0, 1);
        b2.swap_col(0, 2);
        add_eq(i, b2, "C(1,3)"); /* swap 0 2 */
        // swapping columns in the other boxes would be undone by normalize()
    }
    // 1089 configurations here
    if (1) {
        // swap boxes (idea due to AFJ)
        box123 b2 = b;
        b2.swap_box(0, 1);
        add_eq(i, b2, "B(1,2)"); /* swap 0 1 */
        b2.swap_box(0, 1);
        b2.swap_box(0, 2);
        add_eq(i, b2, "B(1,3)"); /* swap 0 2 */
    }
    // 416 configurations here
    if (1) {
        //                 a..b     b..a
        // 2x2 rectangles: .... and .... are equivalent. (idea due to AFJ)
        //                 b..a     a..b
        for (int x1=0; x1<8; x1++)
            for (int y1=0; y1<2; y1++)
                for (int x2=x1+1; x2<9; x2++)
                    for (int y2=y1+1; y2<3; y2++)
                        if (b.val[y1][x1] == b.val[y2][x2] &&
                            b.val[y1][x2] == b.val[y2][x1]) {
                            box123 b2 = b;
                            std::swap(b2.val[y1][x1], b2.val[y1][x2]);
                            std::swap(b2.val[y2][x1], b2.val[y2][x2]);
                            char buf[64];
                            std::sprintf(buf, "2x2(%d,%d/%d,%d)",
                                         x1+1, x2+1,
                                         y1+1, y2+1);
                            add_eq(i, b2, buf);
                        }
    }
    // 174 configurations here
    if (1) {
        // same for 2x3 rectangles
        for (int x1=0; x1<8; x1++)
            for (int x2=x1+1; x2<9; x2++)
                if (b.val[0][x1] == b.val[1][x2] &&
                    b.val[1][x1] == b.val[2][x2] &&
                    b.val[2][x1] == b.val[0][x2]) {
                    box123 b2 = b;
                    b2.swap_col(x1, x2);
                    char buf[64];
                    std::sprintf(buf, "2x3(%d,%d/1,2,3)",
                                 x1+1, x2+1);
                    add_eq(i, b2, buf);
                }
    }
    // 141 configurations here
    if (1) {
        // same for 3x2 rectangles
        for (int x1=0; x1<3; x1++)
            for (int x2=3; x2<6; x2++)
                for (int x3=6; x3<9; x3++)
                    for (int y1=0; y1<2; y1++)
                        for (int y2=y1+1; y2<3; y2++)
                            if (b.val[y1][x1] == b.val[y2][x2] &&
                                b.val[y1][x2] == b.val[y2][x3] &&
                                b.val[y1][x3] == b.val[y2][x1]) {
                                box123 b2 = b;
                                std::swap(b2.val[y1][x1], b2.val[y2][x1]);
                                std::swap(b2.val[y1][x2], b2.val[y2][x2]);
                                std::swap(b2.val[y1][x3], b2.val[y2][x3]);
                                char buf[64];
                                std::sprintf(buf, "3x2(%d,%d,%d/%d,%d)",
                                             x1+1, x2+1, x3+1,
                                             y1+1, y2+1);
                                add_eq(i, b2, buf);
                            }
    }
    // 86 configurations here
    if (1) {
        // same for 4x2 rectangles
        for (int x1=0; x1<6; x1++)
            for (int x2=x1+1; x2<7; x2++)
                for (int x3=x2+1; x3<8; x3++)
                    for (int x4=x3+1; x3<9; x3++)
                        for (int y1=0; y1<2; y1++)
                            for (int y2=y1+1; y2<3; y2++)
                                if (b.val[y1][x1] == b.val[y2][x3] &&
                                    b.val[y1][x3] == b.val[y2][x2] &&
                                    b.val[y1][x2] == b.val[y2][x4] &&
                                    b.val[y1][x4] == b.val[y2][x1] ||
                                    b.val[y1][x1] == b.val[y2][x3] &&
                                    b.val[y1][x3] == b.val[y2][x4] &&
                                    b.val[y1][x4] == b.val[y2][x3] &&
                                    b.val[y1][x3] == b.val[y2][x1]) {
                                    box123 b2 = b;
                                    std::swap(b2.val[y1][x1], b2.val[y2][x1]);
                                    std::swap(b2.val[y1][x2], b2.val[y2][x2]);
                                    std::swap(b2.val[y1][x3], b2.val[y2][x3]);
                                    std::swap(b2.val[y1][x4], b2.val[y2][x4]);
                                    char buf[64];
                                    std::sprintf(buf, "4x2(%d,%d,%d,%d/%d,%d)",
                                                 x1+1, x2+1, x3+1, x4+1,
                                                 y1+1, y2+1);
                                    add_eq(i, b2, buf);
                                }
    }
    // 71 configurations here
    if (0) {
        // try other nx2-rectangles - useless
        // As AFJ pointed out that's because swapping the rows of a nx2
        // rectangle is equivalent to swapping the complete rows and
        // then swapping the rows of the complementary (9-n)x2 rectangle
        for (int col=1; col<512; col++) {
            int m[3];
            for (int y=0; y<3; y++) {
                m[y] = 0;
                for (int x=0; x<9; x++)
                    if (col & (1<<x))
                        m[y] |= 1<<(b.val[y][x]);
            }
            for (int y1 = 0; y1<2; y1++)
                for (int y2=y1+1; y2<3; y2++)
                    if (m[y1] == m[y2]) {
                        box123 b2 = b;
                        for (int x=0; x<9; x++)
                            if (col & (1<<x))
                                std::swap(b2.val[y1][x], b2.val[y2][x]);
                        add_eq(i, b2, "???");
                    }
        }
    }
    // 71 configurations here
}

/*
 * print a tree rooted at 'root'; don't visit 'prev' again.
 */
void print_tree(size_t root, int indent, const std::string &reason, size_t prev)
{
    std::cout << std::setw(indent) << ""
              << "[" << lookup[root] << "] (" << reason << ")" << std::endl;

    for (std::multimap<size_t, std::pair<std::string, size_t> >::const_iterator
             it = graph.equal_range(root).first;
         it != graph.equal_range(root).second;
         it++)
        if ((*it).second.second != prev)
            print_tree((*it).second.second, indent+2, (*it).second.first, root);
}

int main(int argc, char **argv)
{
    int forest = 0;

    if (argc>1) {
        if (std::strcmp(argv[1], "-f") == 0)
            forest = 1;
        else {
            std::cout << "\
Usage:\n\
  " << argv[0] << " [-f]\n\
-f ... print a forest of generating equivalences of the equivalence classes\n\
no options ... print job list for actual calculation\n";
            return 0;
        }
    }

    generate();
    for (size_t i=0; i<lookup.size(); i++)
        gen_eq(i);
    if (forest) {
        std::cout << "\
#\n\
# This is the forest of the equivalences we used.\n\
#\n\
# The nodes give the 6 last entries of the first three rows of the Sudoku\n\
# configuration. The first box contains 123 in its first, 456 in its second,\n\
# and 789 in its third row.\n\
#\n\
# Each node is labeled with the rule that was used to derive its equivalence\n\
# with its parent.\n\
#\n\
# The rules are:\n\
#   R(i,j) - swap rows i and j\n\
#   C(i,j) - swap columns i and j in the first box\n\
#   B(i,j) - swap boxes i and j\n\
#   2x2(x1,x2/y1,y2) - swap rows of 2x2 subrectangle\n\
#   2x3(x1,x2/y1,y2,y3) - swap columns of 2x3 subrectangle\n\
#   3x2(x1,x2,x3/y1,y2), 4x2(x1,x2,x3,x4/y1,y2) - likewise for 3x2 and 4x2\n\
#\n\
# After applying the rule, the configuration has to be transformed into its\n\
# lexicographically reduced form by first relabeling such that the first box\n\
# is in canonical form and then reordering the columns of boxes 2 and 3 and\n\
# then swapping the boxes 2 and 3 if necessary.\n\
#\n\
# If a rule is followed by a ' character, the rule has to be applied to the\n\
# current node to get the parent node; otherwise, it has to be applied to\n\
# the parent node to get the current node.\n\
#\n";
        for (size_t i=0; i<equiv.size(); i++)
            if (equiv[i] == i)
                print_tree(i, 0, std::string("ROOT"), (size_t)-1);
    } else {
        std::cout << "# job list created by sudoku_equiv.cc" << std::endl;
        list_eq();
    }
    return 0;
}
