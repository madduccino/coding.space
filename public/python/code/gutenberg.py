import fileinput
import re

words = {}

# this should point at a valid book. It can be found at:
# https://www.gutenberg.org/cache/epub/11/pg11.txt
# and on most terminals can be downloaded by:
#  curl URL > destination.txt
for line in fileinput.input("aliceInWonderland.txt"):
  chunks = line.split()
  for word in chunks:
    word = word.lower()
    word = re.sub('^[^a-z]+','',word)
    word = re.sub('[^a-z]+$','',word)
    if word == '':
      continue

    if word in words:
      words[word] += 1
    else:
      words[word] = 1

# https://stackoverflow.com/questions/613183/how-do-i-sort-a-dictionary-by-value
for word in sorted(words, key=words.get, reverse=True):
  if words[word] > 5:
    print(word, words[word])
