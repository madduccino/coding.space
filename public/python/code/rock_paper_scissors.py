player1_choice = input("Player 1 - Enter rock, paper, scissors: ")
input("Press enter and pass to Player 2.")
print("\n" * 50)

player2_choice = input("Player 2 - Enter rock, paper, scissors: ")


print(f"Player 1 chose {player1_choice} and Player 2 chose {player2_choice}")

if player1_choice == "rock":
  if player2_choice == "rock":
    print("It's a tie!")
  elif player2_choice == "paper":
    print("player 2 wins!")
  elif player2_choice == "scissors":
    print("player 1 wins!")
elif player1_choice == "paper":
  if player2_choice == "paper":
    print("It's a tie!")
  elif player2_choice == "rock":
    print("player 1 wins!")
  elif player2_choice == "scissors":
    print("player 2 wins!")
elif player1_choice == "scissors":
  if player2_choice == "scissors":
    print("It's a tie!")
  elif player2_choice == "paper":
    print("player 1 wins!")
  elif player2_choice == "rock":
    print("player 2 wins!")

# Below is an alternate version that's nice and efficient. 

# while True:
#   player1_choice = input("Player 1 - Enter rock, paper, scissors: ")
#   if player1_choice not in ["rock", "paper", "scissors"]:
#       print("Player 1 - you must enter rock, paper, or scissors")
#       continue

#   player2_choice = input("Player 2 - Enter rock, paper, scissors: ")
#   if player2_choice not in ["rock", "paper", "scissors"]:
#       print("Player 2 - you must enter rock, paper, or scissors")
#       continue

#   if player1_choice == player2_choice:
#       print("It's a tie!")
#   elif (player1_choice == "rock" and player2_choice == "scissors") or \
#        (player1_choice == "paper" and player2_choice == "rock") or \
#        (player1_choice == "scissors" and player2_choice == "paper"):
#       print("Player 1 wins!")
#   else:
#       print("Player 2 wins!")

#   play_again = input("Play again? (yes/no): ")
#   if play_again.lower() != "yes":
#       break  
