import math

def circle(aop):
  radius = float(input('Enter the radius of your circle: '))
  if aop == 1:
    return circleArea(radius)
  if aop == 2:
    return circlePerimeter(radius)

def rectangle(aop):
  width = float(input('Enter the width of your rectangle: '))
  heigth = float(input('Enter the height of your rectangle: '))
  if aop == 1:
    return rectArea(width, height)
  if aop == 2:
    return rectPerimeter(width, height)

def triangle(aop):
  choice = int(input('''What type of triangle would you like to calculate?
1. Equilateral
2. Right
3. Any other triange
Enter the appropriate number: '''))
  if choice == 1:
    x = float(input('Enter the length of a side of your equilateral triangle: '))
    if aop == 1:
      return equiTriArea(x)
    if aop == 2:
      return equiTriPerimeter(x)
  elif choice == 2:
    width = float(input('Enter width of your right triangle: '))
    height = float(input('Enter heigth of your right triangle: '))
    if aop == 1:
      return rightTriArea(width, height)
    if aop == 2:
      return rightTriPerimeter(width, height)
  elif choice == 3:
    a = float(input('Enter first side of your triangle: '))
    b = float(input('Enter second side of your triangle: '))
    c = float(input('Enter third side of your triangle: '))
    if aop == 1:
      return arbTriArea(a,b,c)
    if aop == 2:
      return arbTriPerimeter(a,b,c)

def circleArea(radius):
  return math.pi * radius * radius

def circlePerimeter(radius):
  return math.pi * 2 * radius

def rectArea(width, height):
  return width * height

def rectPerimeter(width, height):
  return 2*width + 2*height

def equiTriArea(side):
  return math.sqrt(3)/4 * side * side

def equiTriPerimeter(side):
  return 3*side

def rightTriArea(width, height):
  return width * height / 2

def rightTriPerimeter(width, height):
  c = math.sqrt(width * width + height * height)
  return width + height + c

def arbTriPerimeter(a,b,c):
  return a+b+c

def arbTriArea(a,b,c):
  s = arbTriPerimeter(a,b,c)/2
  return math.sqrt(s*(s-a)*(s-b)*(s-c))


# main control loop
while True:
  shape = int(input('''What shape would you like to calculate?
  1. Circle
  2. Rectangle
  3. Triangle
  4. Exit
  Enter the appropriate number: '''))
  if shape == 4:
    break
    
  areaOrPerimeter = int(input('''Would you like to calculate Area or Perimeter?
  1. Area
  2. Perimeter
  Enter the appropriate number: '''))

  if shape == 1: 
    print(circle(areaOrPerimeter))
  elif shape == 2:
    print(rectangle(areaOrPerimeter))
  elif shape == 3:
    print(triangle(areaOrPerimeter))
  else:
    print("Invalid choice: you must enter a number between 1 and 4")
    
