class TicTacToe:
  def __init__(self):
    self.grid = [[' ', ' ', ' '],
                 [' ', ' ', ' '],
                 [' ', ' ', ' ']]
    self.curTurn = 'X'

  # returns a string specifying the current player's turn
  def getTurn(self):
    pass # replace this with your code
    
  # returns True if the specified square is empty, False otherwise
  def isEmpty(self,row,col):
    pass # replace this with your code

  # adjusts the contents of the grid based on row, col, and self.curTurn.
  # If the move is valid, changes self.curTurn to indicate the new player's turn
  # this method does not have a return value
  def makeMove(self,row,col):
    pass # replace this with your code

  # returns a string indicating the status of the game. The possible return values are:
  #   'X' - X is the winner
  #   'O' - O is the winner
  #   'Tie' - no more moves are possible (and there is no winner)
  #   'Ongoing' - otherwise
  def status(self):
    pass # replace this with your code

  # returns a string representation of the grid
  def toString(self):
    retVal = ''
    blankRow = '+-+-+-+'
    retVal += blankRow + "\n"
    for row in range(3):
      rowVal = '|'
      for col in range(3):
        rowVal += self.grid[row][col] + '|'
      retVal += rowVal + "\n" + blankRow + "\n"
    return retVal

myGame = TicTacToe()
print(myGame.toString())

