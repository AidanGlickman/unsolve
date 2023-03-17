#! /usr/bin/env python
#
# Verify equivalence class forest for Sudoku grid calculation.
#
# Requires Python 2.3.
#
# Author: Bertram Felgenhauer <bf3@inf.tu-dresden.de>
# History:
# 2005-05-30: Initial version.
#
# usage:
# compile sudoku_equiv.cc, and run
#   ./sudoku_equiv -f > tree
# then
#   < tree python sudoku_verify.py
#
# The program does not verify completeness or check for duplicate entries.
# You can use
#   < tree grep -v '^#' | wc -l
# (result must be 36288) and
#   < tree grep -v '^#' | sed 's/.*\(\[.*\]\).*/\1/' | sort | uniq | wc -l
# (result must be 36288 again) to verify this.
#
# definitions for comments:
# "configuration" - a labeling of the first three blocks
# "completion"    - a filling of the remainder of the grid, given a labeling of
#    the first three blocks.
#

import sys

# basic building blocks

#
# convert configuration into internal format - a list of 27 entries, giving
# the three rows in order.
#
#       01234567890123456789012
# in:  "[abcdef,ghijkl,mnopqr]"
# out: [1,2,3,a,b,c,d,e,f, 4,5,6,g,h,i,j,k,l, 7,8,9,m,n,o,p,q,r]
#


def convert(box):
    lines = "123"+box[1:7]+"456"+box[8:14]+"789"+box[15:21]
    return [int(c) for c in lines]

#
# Swap a [partial] row.
#
# This operation can not change the number of completions associated to box,
# because the restraints on the remainder of the grid remain the same.
#
# The operation is potentially unsafe though, in that the resulting
# box may break the constraints for the first three boxes.
#


def swap_row(box, r1, r2, idx_x=range(0, 9)):
    for x in idx_x:
        idx1 = r1*9+x
        idx2 = r2*9+x
        box[idx1], box[idx2] = box[idx2], box[idx1]

#
# Swap two columns.
#
# This is safe if both columns are within the same block, and does
# not change the number of associated completions.
#
# If two columns of different blocks are swapped, the resulting
# configuration will be invalid if the columns did not contain the
# same numbers. That is, if the result is a valid configuration,
# the number of associated completions does not change.
#
# Care must be taken that this unsafe operation is not applied twice
# before checking the box for validity again.
#


def swap_column(box, c1, c2):
    for y in range(0, 3):
        idx1 = y*9+c1
        idx2 = y*9+c2
        box[idx1], box[idx2] = box[idx2], box[idx1]

#
# Swap two boxes of the configuration. This is safe and does not change
# the number of associated completions.
#


def swap_box(box, b1, b2):
    swap_column(box, b1*3, b2*3)
    swap_column(box, b1*3+1, b2*3+1)
    swap_column(box, b1*3+2, b2*3+2)

#
# End of basic building blocks - all manipulations of grids are based on
# these, except for the relabeling in canonize() below.
#

#
# check validity of configuration - for every box and row check that
# the contained entries are all different.
#


def valid(box):
    for i in range(0, 9):
        for j in range(i+1, 9):
            # row 1
            if box[i] == box[j]:
                return False
            # row 2
            if box[i+9] == box[j+9]:
                return False
            # row 3
            if box[i+18] == box[j+18]:
                return False
            # box 1
            if box[i % 3 + (i/3)*9] == box[j % 3 + (j/3)*9]:
                return False
            # box 2
            if box[i % 3 + (i/3)*9+3] == box[j % 3 + (j/3)*9+3]:
                return False
            # box 3
            if box[i % 3 + (i/3)*9+6] == box[j % 3 + (j/3)*9+6]:
                return False
            # columns are subsumed by boxes
    return True

#
# lexicographically reduce a box
#
# Each operation here is safe and does not change the number of
# associated completions.
#


def canonize(box):
    # first, rename box1
    trans = range(0, 10)
    for i in range(0, 9):
        trans[box[(i/3)*9+i % 3]] = i+1
    for i in range(0, 27):
        box[i] = trans[box[i]]
    # then order box2 columns - bubble sort
    if box[3] > box[4]:
        swap_column(box, 3, 4)
    if box[4] > box[5]:
        swap_column(box, 4, 5)
    if box[3] > box[4]:
        swap_column(box, 3, 4)
    # then order box3 columns - bubble sort
    if box[6] > box[7]:
        swap_column(box, 6, 7)
    if box[7] > box[8]:
        swap_column(box, 7, 8)
    if box[6] > box[7]:
        swap_column(box, 6, 7)
    # then swap box2 and box3 if necessary
    if box[3] > box[6]:
        swap_box(box, 1, 2)

#
# main ... read a tree and process the rules
#


print "# verified job list created by sudoku_verify.py"

# stack contains the current chain from the root to the current node
stack = []

line = sys.stdin.readline()
while line:
    # skip comments
    if line[0] != '#':
        # the depth is the number of leading spaces divided by 2;
        # the first character that follows is a [.
        depth = line.index('[')/2
        if depth == 0:
            # a new root? print old root and the size of the associated
            # equivalence class.
            if stack:
                print "./sudoku2%6d  %s" % (size, stack[0])
            size = 0
        # extract configuration - the first 22 characters after the spaces
        layout = line[depth*2:depth*2+22]
        # cut down stack
        stack = stack[0:depth]
        # and 'plant' a new subtree
        stack.append(layout)
        # extract rule
        rule = line[(depth*2+24):-2]
        size += 1
        # now, verify the rule
        if rule == "ROOT":
            # ROOT rules are no-ops that can only be used in roots.
            if depth != 0:
                print "Error: ROOT rule used on a non-root node."
                sys.exit(1)
        else:
            # determine target and source configuration of rule
            target = stack[-1]
            source = stack[-2]
            # if rule ends in "'", apply it in reverse
            if rule[-1] == "'":
                target, source = source, target
            # work in internal format
            source = convert(source)
            target = convert(target)
            # check result
            if not valid(source) or not valid(target):
                print "Error: Invalid configuration", stack[-1], "or", stack[-2]
                sys.exit(1)
            # apply rule
            if rule[0] == "R":
                #  012345
                # "R(a,b)" -- swap 2 rows
                swap_row(source, int(rule[2])-1, int(rule[4])-1)
            elif rule[0] == "C":
                #  012345
                # "C(a,b)" -- swap 2 columns
                swap_column(source, int(rule[2])-1, int(rule[4])-1)
            elif rule[0] == "B":
                #  012345
                # "B(a,b)" -- swap 2 blocks
                swap_box(source, int(rule[2])-1, int(rule[4])-1)
            elif rule[0:3] == "2x2":
                #  012345678901
                # "2x2(a,b/c,d)" -- swap 2 partial rows
                swap_row(source, int(rule[8])-1, int(rule[10])-1,
                         [int(rule[4])-1, int(rule[6])-1])
            elif rule[0:3] == "3x2":
                #  01234567890123
                # "3x2(a,b,c/d,e)" - swap two partial rows
                swap_row(source, int(rule[10])-1, int(rule[12])-1,
                         [int(rule[4])-1, int(rule[6])-1, int(rule[8])-1])
            elif rule[0:3] == "4x2":
                #  0123456789012345
                # "4x2(a,b,c,d/e,f)" - swap two partial rows
                swap_row(source, int(rule[12])-1, int(rule[14])-1,
                         [int(rule[4])-1, int(rule[6])-1,
                          int(rule[8])-1, int(rule[10])-1])
            elif rule[0:3] == "2x3":
                #  01234567890123
                # "2x3(a,b/c,d,e)" - swap two columns
                if rule[8:13] != "1,2,3":
                    print "Error: Unexpected application of 2x3 rule", rule
                    sys.exit(1)
                swap_column(source, int(rule[4])-1, int(rule[6])-1)
            else:
                print "Error: Unknown rule", rule
                sys.exit(1)
            # check result
            if not valid(source):
                print "Error after applying", rule, ": invalid result"
                sys.exit(1)
            canonize(source)
            if not valid(source):
                # can not happen :)
                print "Error after applying", rule, "and canonizing: invalid result"
                sys.exit(1)
            # check if result matches target
            if source != target:
                print "Error after applying", stack[-1], rule, stack[-2], \
                    ": mismatch", source, target
                sys.exit(1)
    # process next line
    line = sys.stdin.readline()

# print last equivalence class
if stack:
    print "./sudoku2%6d  %s" % (size, stack[0])
