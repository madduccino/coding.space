import fileinput

grid = []

def prettyPrint(grid):
  for row in grid:
    for val in row:
      print(val, end=' ')
    print()

for line in fileinput.input('sudoku_solver_input.txt'):
  row = []
  for char in line:
    if char != '\n':
      row.append(int(char))
  grid.append(row)


def isValid(grid, row, col):
  return validRow(grid,row,col) and validCol(grid,row,col) and validBox(grid,row,col)

def validRow(grid,row,col):
  for i in range(9):
    if i == row:
      continue
    if grid[row][col] == grid[i][col]:
      return False
  return True

def validCol(grid,row,col):
  for i in range(9):
    if i == col:
      continue
    if grid[row][col] == grid[row][i]:
      return False
  return True

def validBox(grid,row,col):
  # row/col start must be 0/3/6 as the first index for the box
  rowStart = int(row/3)*3
  colStart = int(col/3)*3
  for rowInd in range(3):
    for colInd in range(3):
      if rowStart + rowInd == row and colStart+colInd == col:
        continue # don't compare an element to itself
      if grid[rowStart+rowInd][colStart+colInd] == grid[row][col]:
        return False # if there's a match, the grid is in an invalid state
  return True # if we chech the whole box with no conflicts, then it's valid

def findNextZero(grid,curRow,curCol):
  # remember what this value is (if it was 0 it would cause problems)
  hold = grid[curRow][curCol]
  holdRow = curRow
  holdCol = curCol
  grid[holdRow][holdCol] = 1
  while grid[curRow][curCol] != 0:
    curCol += 1
    if curCol > 8:
      curCol = 0
      curRow += 1
      if curRow > 8:
        return (9,0)
  # set the grid back to how we found it
  grid[holdRow][holdCol] = hold
  return (curRow, curCol)

# returns True if it's found a solution, False if it's in an impossible state
def solve(grid, curRow, curCol):
  if grid[curRow][curCol] != 0:
    # we should only be calling this function with the current position as a zero
    # otherwise it would change the given numbers, which we'd like to not do
    return False
  # find the next empty row/column pair in the grid
  pair = findNextZero(grid,curRow,curCol)
  for i in range(9): # try the numbers 1-9 in the current row/col pair
    grid[curRow][curCol] = i+1
    if isValid(grid,curRow,curCol): # if this position is valid...
      if pair[0] == 9: # ...and there is no next position
        return True # we've solved it, return true
      if solve(grid,pair[0],pair[1]): # ...try solving the rest of the grid
        return True # if the rest of the grid is happy, pass on the good news
  # if we haven't returned True already, we were given a grid without a valid solution
  grid[curRow][curCol] = 0 # undo our work (erase the current square)
  return False # say we couldn't find an answer

prettyPrint(grid)
print(solve(grid,0,2))
prettyPrint(grid)
