import pickle
import numpy as np
import matplotlib.pyplot as plt

# this processes the data generated with server-timing-test-generate.py
#   which should be stored in times.pkl. If that file doesn't exist,
#   please run the generate script first.

def estimate_coef(x, y):
  x = np.array(x)
  y = np.array(y)
  # number of observations/points
  n = np.size(x)

  # mean of x and y vector
  m_x = np.mean(x)
  m_y = np.mean(y)

  # calculating cross-deviation and deviation about x
  SS_xy = np.sum(y*x) - n*m_y*m_x
  SS_xx = np.sum(x*x) - n*m_x*m_x

  # calculating regression coefficients
  b_1 = SS_xy / SS_xx
  b_0 = m_y - b_1*m_x

  return (b_0, b_1)


# if times.pkl doesn't exist, that means we haven't generated times (and should do so)

with open('times.pkl', 'rb') as f:
  [amounts, times] = pickle.load(f)

#print(amounts)
#print(times)
prettyAmounts = []
prettyAmounts = list(map(lambda n: n/1000000, amounts))

#print(prettyAmounts)

plt.scatter(prettyAmounts,times)
plt.xlabel('Numbers generated (millions)')
plt.ylabel('Time (seconds)')

[intercept, slope] = estimate_coef(prettyAmounts, times)
print(intercept, slope)
plt.plot([prettyAmounts[0],prettyAmounts[-1]],[intercept + slope*prettyAmounts[0], intercept + slope*prettyAmounts[-1]], color='g')
plt.savefig('graph.png')
plt.show()
