from war_card import Card
import random

class Deck:
  def __init__(self, empty=False):
    self.cards = []
    if not empty:
      for suit in ["Clubs", "Diamonds", "Hearts", "Spades"]:
        for rank in range(2,15):
          self.cards.append(Card(rank,suit))
      self.shuffle()

  def shuffle(self):
    random.shuffle(self.cards)

  def getCard(self):
    return self.cards.pop()

  def addCard(self,card):
    self.cards.append(card)

  def addCardToBottom(self,card):
    self.cards.insert(0,card)

  def size(self):
    return len(self.cards)

  def toString(self):
    return "Deck with " + str(self.size()) + " cards"

  def allCardsToString(self):
    retVal = '['
    for card in self.cards:
      retVal += card.toString() + ","
    return retVal[:-1] + "]"

  def addDeck(self,deck):
    while deck.size() > 0:
      self.addCardToBottom(deck.getCard())
