class Card:
  validSuits = ["Clubs", "Diamonds", "Hearts", "Spades"]
  
  @staticmethod
  def rank2str(rank):
    if rank < 11:
      return str(rank)
    elif rank == 11:
      return "Jack"
    elif rank == 12:
      return "Queen"
    elif rank == 13:
      return "King"
    elif rank == 14:
      return "Ace"

  # rank is an integer from 2-14, where 11-13 are JQK and 14 is Ace
  # suit must be in the above validSuits
  def __init__(self, rank, suit):
    if suit not in Card.validSuits:
      print("Invalid suit (", suit, "), changing to clubs")
      suit = "Clubs" 
    self.suit = suit
    if rank < 2 or rank > 14:
      print("Invalid rank (", rank, "), changing to 2")
      rank = 2
    self.rank = rank

  def getSuit(self):
    return self.suit

  def getRank(self):
    return self.rank

  def toString(self):
    return Card.rank2str(self.rank) + " of " + self.suit

  def compare(self, card):
    return self.getRank() - card.getRank()
