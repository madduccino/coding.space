# this uses string.format, mostly due to being implemented in Trinket at some point
# F-strings are the more modern/readable approach, which would take this line:
#   print("{0}\t{1:0.2f}".format(item, prices[item]))
# and rephrase it as:
#   print(f"{item}\t{prices[item]:0.2f}")

prices = {
  "Apple": 0.75,
  "Bread": 4.50,
  "Carrot": 0.5,
  "Donut": 1.25,
  "Eggs": 3.99,
  "Flour": 6,
  "Grape": 0.05,
  "Honey": 8
}

cart = {}

def computeTotal(p, c):
  total = 0
  for item in c:
    total += p[item] * c[item]
  return total
  
def printCart(p, c):
  for item in c:
    print("{0}   {1}\t{2:.2f}".format(c[item], item, prices[item]*cart[item]))

while True:
  print("Here's what we have in stock:")
  for item in prices:
    print("{0}\t{1:0.2f}".format(item, prices[item]))
  choice = input("What would you like to buy? (Or type 'checkout' to finish)").capitalize()
  if choice in prices:
    if choice not in cart:
      cart[choice] = 0
    cart[choice] += 1
  elif choice == 'Checkout':
    break  
  else:
    print("Invalid choice, make sure you spelled your item correctly!")
  printCart(prices, cart)
  print("Total:\t\t{0:.2f}".format(computeTotal(prices,cart)))
  
print("You are checking out with:")
printCart(prices, cart)
print("Your total is: ", "{0:.2f}".format(computeTotal(prices, cart)))
