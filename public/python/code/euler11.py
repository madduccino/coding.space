import fileinput

grid = []
for line in fileinput.input('euler11Input.txt'):
  row = []
  for val in line.split():
    row.append(int(val))
  grid.append(row)

maxProd = 0
# for each possible grid square
for i in range(len(grid)):
  for j in range(len(grid)):
    # check row
    if j < len(grid)-4:
      curProd = grid[i][j] * grid[i][j+1] * grid[i][j+2] * grid[i][j+3]
      if curProd > maxProd:
        maxProd = curProd
        print(curProd, i,j, 'row')
    # check col
    if i < len(grid)-4:
      curProd = grid[i][j] * grid[i+1][j] * grid[i+2][j] * grid[i+3][j]
      if curProd > maxProd:
        maxProd = curProd
        print(curProd, i,j, 'col')
    # if i is too big, we can't check diagonals
    if i < len(grid) - 4 and j < len(grid)-4:
      # check TL->BR diag
      curProd = grid[i][j] * grid[i+1][j+1] * grid[i+2][j+2] * grid[i+3][j+3]
      if curProd > maxProd:
        maxProd = curProd
        print(curProd, i,j, 'TL->BR')
      # check BL->TR diag
      curProd = grid[i+3][j] * grid[i+2][j+1] * grid[i+1][j+2] * grid[i][j+3]
      if curProd > maxProd:
        maxProd = curProd
        print(curProd, i,j, 'TL->BR')
print(maxProd)
