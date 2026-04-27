import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

names = ["Reese's Peanut Butter Cups", "Snickers", "M&Ms", "Skittles", "Candy Corn", "Circus Peanuts"]
nums = [84.2, 76.6, 66.6, 63.1, 38.0, 23.4]
allData = {'candy': names, 'winpercentage': nums}

df = pd.DataFrame(allData)
print(df)

print(df.describe())

bestCandyIndex = df['winpercentage'].idxmax()
print("Best Candy:", df.get('candy')[bestCandyIndex])

worstCandyIndex = df['winpercentage'].idxmin()
print("Worst Candy:", df.get('candy')[worstCandyIndex])



ax = df.plot.bar(x='candy', y='winpercentage')
plt.savefig("CandyChart.png")
