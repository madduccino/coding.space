import fileinput

for line in fileinput.input("euler22Input.txt"):
  quotedNames = line.split(",")
  names = []
  for qn in quotedNames:
    names.append(qn[1:-1]) # remove the quotes from the front and back of each name

names.sort()
# print(names[:5], names[-5:]) # verify that sorting behaved
def nameScore(name):
  mySum = 0
  for letter in name:
    mySum += ord(letter) - 64 # 64 makes it so 'A' -> 1

  return mySum

result = 0
for i in range(len(names)):
  result += (i+1) * nameScore(names[i])

print(result)
