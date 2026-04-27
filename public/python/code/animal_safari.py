import random 

# List of animals
animals = ["Lion", "Elephant", "Giraffe", "Zebra", "Monkey", "Rhino", "Leopard", "Buffalo"]

# List to store spotted animals
spotted_animals = []

print("Welcome to the Animal Safari Game!\nSpot different animals on your safari adventure!")

while True:

  print("\n1. Spot a random animal\n2. See my spotted animals\n3. End Safari")
  choice = input("What would you like to do? (Enter 1-3) ")

  if choice == "1":
    # Spot a random animal
    animal = random.choice(animals)
    print(f"\nYou've spotted a {animal}!")
    spotted_animals.append(animal)    
  elif choice == "2":
    # Show all spotted animals
    if spotted_animals:
      print("\nAnimals you've spotted so far:")
      for animal in spotted_animals:
          print(animal)
    else: 
      print("\nYou haven't spotted any animals yet.")      
  elif choice =="3":
    # End the game
    print("Safari ended. Thanks for playing!")
    break
