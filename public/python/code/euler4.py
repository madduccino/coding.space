# this needs to be called in the shell
# A sample call will look something like:
#  'python euler4.py'

def isPal(num):
  myStr = str(num)
  for i in range(len(myStr)):
    if myStr[i] != myStr[-i-1]:
      return False
  return True
  # return myStr == myStr[::-1] is a shorter way to do this

big = 0

for a in range(100,1000):
  for b in range(a, 1000):
    if a*b > big and isPal(a*b):
      big = a*b

print(big)
