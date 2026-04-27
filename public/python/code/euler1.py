mySum = 0

# this needs to be called in the shell
# A sample call will look something like:
#  'python euler1.py'

for i in range(1000):
  if i%3 == 0 or i%5 == 0:
    mySum += i

print(mySum)
