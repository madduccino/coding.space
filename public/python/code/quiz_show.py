# Version 1

# score = 0

# answer = input("What is the largest mammal in the world? ")
# if answer == "blue whale":
#   print("Congratulations, that's correct!")
#   score +=1
# else:
#   print("Sorry, that's incorrect.")
# answer = input("How many continents are there on earth? ")
# if answer == "7":
#   print("Congratulations, that's correct!")
#   score +=1
# else:
#   print("Sorry, that's incorrect.")
# answer = input("Who painted the Mona Lisa? ")
# if answer == "leonardo da vinci":
#   print("Congratulations, that's correct!")
#   score +=1
# else:
#   print("Sorry, that's incorrect.")
# answer = input("What gas do plants breathe in that humans\n and animals breathe out? ")  
# if answer == "carbon dioxide":
#   print("Congratulations, that's correct!")
#   score +=1
# else:
#   print("Sorry, that's incorrect.")

# print("Thanks for taking the quiz! Your score is " + str(score) + ".")



def askQuestion(q,a):
  answer = input(q + "? ")
  if answer.lower() == a.lower():
    print("Congratulations, that's correct!")
    return 1
  else:
    print("Sorry, that's incorrect.")
    return 0

def main():
  score = 0
  
  score += askQuestion("What is the largest mammal in the world","blue whale")
  score += askQuestion("How many continents are there on earth","7")
  score += askQuestion("Who painted the Mona Lisa","leonardo da vinci")
  score += askQuestion("What gas do plants breathe in that humans\n and animals breathe out","carbon dioxide")  

  print("Thanks for taking the quiz! Your score is " + str(score) + ".")

main()
