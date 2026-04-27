class TicTacToe:
  def __init__(self):
    self.grid = [[' ', ' ', ' '],
                 [' ', ' ', ' '],
                 [' ', ' ', ' ']]
    self.curTurn = 'X'

  # returns a string specifying the current player's turn
  def getTurn(self):
    return self.curTurn
    
  # returns True if the specified square is empty, False otherwise
  def isEmpty(self,row,col):
    return self.grid[row][col] == ' '

  # adjusts the contents of the grid based on row, col, and self.curTurn.
  # If the move is valid, changes self.curTurn to indicate the new player's turn
  # this method does not have a return value
  def makeMove(self,row,col):
    if not self.isEmpty(row,col):
      print(row, ',', col, 'is already occupied')
      return
    self.grid[row][col] = self.curTurn
    if self.curTurn == 'X':
      self.curTurn = 'O'
    elif self.curTurn == 'O':
      self.curTurn = 'X'

  # returns a string indicating the status of the game. The possible return values are:
  #   'X' - X is the winner
  #   'O' - O is the winner
  #   'Tie' - no more moves are possible (and there is no winner)
  #   'Ongoing' - otherwise
  def status(self):
    for i in range(3):
      # check columns
      if self.grid[0][i] == self.grid[1][i] and \
         self.grid[1][i] == self.grid[2][i] and \
         self.grid[0][i] != ' ':
        return self.grid[0][i]
      # check rows
      if self.grid[i][0] == self.grid[i][1] and \
         self.grid[i][1] == self.grid[i][2] and \
         self.grid[i][0] != ' ':
        return self.grid[i][0]
    # check TL->BR diagonal
    if self.grid[0][0] == self.grid[1][1] and \
       self.grid[1][1] == self.grid[2][2] and \
       self.grid[0][0] != ' ':
      return self.grid[0][0]
    # check TR->BL diagonal
    if self.grid[0][2] == self.grid[1][1] and \
       self.grid[1][1] == self.grid[2][0] and \
       self.grid[0][2] != ' ':
      return self.grid[0][2]
    # if we haven't returned yet, there's no winner
    # it's a tie unless we find an unused square
    retVal = 'Tie'
    for row in range(3):
      for col in range(3):
        if self.isEmpty(row,col):
          retVal = 'Ongoing'
    return retVal

  # returns a string representation of the grid
  def toString(self):
    retVal = '  1 2 3\n'
    blankRow = ' +-+-+-+'
    retVal += blankRow + "\n"
    for row in range(3):
      rowVal = str(row+1) + '|'
      for col in range(3):
        rowVal += self.grid[row][col] + '|'
      retVal += rowVal + "\n" + blankRow + "\n"
    return retVal

myGame = TicTacToe()
print(myGame.toString())
while myGame.status() == 'Ongoing':
  valid = False
  while not valid:
    row = int(input(myGame.getTurn() + "'s turn, enter a row (1-3): "))
    while row > 3 or row < 1:
      row = int(input("The row must be a number between 1 and 3, please try again: "))
    col = int(input("Enter a column (1-3): "))
    while col > 3 or col < 1:
      col = int(input("The column must be a number between 1 and 3, please try again: "))
    valid = myGame.isEmpty(row-1,col-1)
    if not valid:
      print("Your selection (" + str(row) + "," + str(col) + ") is already occupied, please enter an empty square")
  myGame.makeMove(row-1,col-1)
  print(myGame.toString())

if myGame.status() == 'Tie':
  print("It's a tie!")
else:
  print(myGame.status(), "wins!!!")
