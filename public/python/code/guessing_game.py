import random
print("Welcome to my guessing game! \nYou will have 5 tries to guess\n a number between 0 and 9.")

right_answer = random.randint(0,9)
guess_count = 0
guess_limit = 5
while guess_count < guess_limit:
  current_guess = int(input("Guess a number: "))
  guess_count += 1
  if current_guess == right_answer:
    break
  else:
    print("Try again.")

if current_guess == right_answer:
  print("Congratulations! You won the game!")
else: 
  print("Sorry, you lost.")
