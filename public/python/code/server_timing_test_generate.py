import time
import random
import pickle

replications = 5
numPoints = 10

times = []
amounts = []

for i in range(numPoints):
  for j in range(replications):
    start = time.time()
    num2generate = (i+1) * 1000000
    amounts.append(num2generate)
    for k in range(num2generate):
      x = random.random()
    times.append(time.time()-start)
    print(amounts[-1], "in" ,times[-1], "seconds")

with open('times.pkl', 'wb') as f:
  pickle.dump([amounts,times], f)
