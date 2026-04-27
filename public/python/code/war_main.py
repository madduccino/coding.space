from war_deck import Deck

x = Deck()
print(x.toString())
y = Deck(True)

for i in range(26):
  y.addCard(x.getCard())

def clash(x,y,pot=None):
  if pot == None:
    print("New turn: Player 1 has", x.size(), "cards. Player 2 has", y.size(), "cards.")
    pot = Deck(True)
  else:
    print("War! Playing for", pot.allCardsToString())
  xCard = x.getCard()
  print("Player 1 plays:", xCard.toString())
  yCard = y.getCard()
  print("Player 2 plays:", yCard.toString())
  pot.addCard(xCard)
  pot.addCard(yCard)
  
  if xCard.toString() == 'Ace of Spades' or yCard.toString() == 'Ace of Spades':
    print ("Drew the Ace of Spades, both players shuffle")
    x.shuffle()
    y.shuffle()

  diff = xCard.compare(yCard)
  if diff > 0:
    print("Player 1 gets", pot.size(), "cards")
    x.addDeck(pot)
  elif diff < 0:
    print("Player 2 gets", pot.size(), "cards")
    y.addDeck(pot)
  elif diff == 0:
    if x.size() < 4:
      print("Tie, Player 1 doesn't have enough cards left for war")
      y.addCardToBottom(xCard)
      y.addCardToBottom(yCard)
      while x.size() > 0:
        y.addCardToBottom(x.getCard())
    elif y.size() < 4:
      print("Tie, Player 2 doesn't have enough cards left for war")
      x.addCardToBottom(xCard)
      x.addCardToBottom(yCard)
      while y.size() > 0:
        x.addCardToBottom(y.getCard())
    else:
      print("Tie, adding 3 cards to the pot from each player.")
      for i in range(3):
        pot.addCard(x.getCard())
        pot.addCard(y.getCard())
      clash(x,y,pot)

turns = 0

while x.size() > 0 and y.size() > 0:
  input("Next turn?")
  clash(x,y)
  turns += 1
  print(str(turns) + " turns so far")
  

print(x.size(), y.size())
