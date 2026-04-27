fib = [1,2]

# this needs to be called in the shell
# A sample call will look something like:
#  'python euler2.py'

while fib[-1] < 4000000:
  fib.append(fib[-1]+fib[-2])

mySum = 0
for num in fib:
  if num % 2 == 0:
    mySum += num

print(mySum)
