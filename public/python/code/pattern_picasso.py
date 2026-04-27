# Square
x = int(input("Square size? "))
for i in range(x):
  for j in range(x):
    print('*', end='')
  print()

# Triangle
t = int(input("Triangle size? "))
for i in range(t):
  for j in range(i+1):
    print('*', end='')
  print()

def pyramidLine(lineNum, totalSize):
  for j in range(totalSize-lineNum-1):
    print(" ", end="")
  for j in range(lineNum*2 + 1):
    print("*", end="")
  print()
    
# Pyramid
p = int(input("Pyramid Height? "))
for i in range(p):
  pyramidLine(i, p)

# Diamond

d = int(input("Diamond Height? "))
for i in range(d):
  pyramidLine(i,d)
for i in range(d-2,-1,-1):
  pyramidLine(i,d)
