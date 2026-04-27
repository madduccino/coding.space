print("Welcome to my awesome calculator!")

while True:
  try:
    num1 = float(input("Enter a number: "))
    break
  except ValueError:
    print("Did you enter a number? Please try again.")

while True:    
  try:
    num2 = float(input("Enter another number: "))
    break
  except ValueError:
    print("Did you enter a number? Please try again.")

calcType = input("Would you like to add, subtract, multiply, or divide? ")

if calcType == "add":
  print(num1+num2)
elif calcType == "subtract":
  print(num1-num2)
elif calcType == "multiply":
  print(num1*num2)
elif calcType == "divide":
  print(num1/num2)
else:
  print("Invalid input.")
