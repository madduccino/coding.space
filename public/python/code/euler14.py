import functools

# this is doing memoization. Without it, this takes 1.25 minutes to run
# with it, it takes ~5 seconds
@functools.cache
def collatz_len(n):
  if n <= 1:
    return 1
  elif n % 2 == 0:
    return 1 + collatz_len(int(n/2))
  else:
    return 1 + collatz_len(n*3+1)

def collatz_len2(n):
  count = 1
  while n > 1:
    count += 1
    if n % 2 == 0:
      n = int(n/2)
    else:
      n = n*3+1
  return count

longest = 0
num = 0
for i in range(1,1000001):
  l = collatz_len2(i)
  if l > longest:
    longest = l
    num = i



print(num, 'took the longest with', longest, 'steps')
