from PIL import Image, ImageDraw
import random
import time

# parameters to change
iterations = 50
k = 5

i = 0

tic = time.time()

# change the image name to your image
img = Image.open("abstractImage.jpeg")

# these 3 lines resize the image and convert it into RGB format,
#   which is likely not necessary and can often be skipped
(w, h) = img.size
img = img.resize((w//4, h//4), Image.BILINEAR)
rgb_image = img.convert('RGB')

pixels = list(rgb_image.getdata())

# return a measure of distance between two colors
#   This doesn't take the sqrt since that won't change which colors are closest,
#   which is all we need this function for, and sqrt is relatively computationally intensive
def distance(c1, c2):
    return (c1[0]-c2[0])*(c1[0]-c2[0]) + (c1[1]-c2[1])*(c1[1]-c2[1]) + (c1[2]-c2[2])*(c1[2]-c2[2])

# return an average color from a list of colors.
#   Note that each component is floored to make it an integer
def avg(lst):
    r = g = b = 0
    for v in lst:
        r += v[0]
        g += v[1]
        b += v[2]
    return (r//len(lst), g//len(lst), b//len(lst))

# takes px, an RGB tuple, and guesses, a list of RGB tuples
#   returns the index of the element in guesses that is closest to px
def closestInd(px, guesses):
    best = distance(px, guesses[0])
    bestI = 0
    for i in range(1, len(guesses)):
        d = distance(px, guesses[i])
        if d < best:
            best = d
            bestI = i
    return bestI

# takes two lists of RGB tuples, and checks if they have the same contents
def isEq(g1, g2):
    for i in range(len(g1)):
        if g1[i][0] != g2[i][0] or g1[i][1] != g2[i][1] or g1[i][2] != g2[i][2]:
            return False
    return True

# make initial guesses
guesses = random.sample(pixels, k)

print("Initial colors:")
print(guesses)

# keep track of all the guesses we've made (and how they change over iterations)
allGuesses = [guesses]

while i < iterations:
    # make k groups and place each pixel in the image in the group that it is closest to
    groups = []
    for j in range(k):
        groups.append([])
    for px in pixels:
        groups[closestInd(px, guesses)].append(px)

    # from each group, average all the colors assigned to it to make a new guess
    newGuesses = []
    for j in range(k):
        print("Group", j, "has", len(groups[j]), "pixels assigned to it")
        newGuesses.append(avg(groups[j]))

    # if this process didn't change our guesses, we're done
    if isEq(newGuesses, guesses):
        break

    i += 1

    print("Iteration", i, "Current Colors:")
    print(newGuesses)
    print("Took", (time.time()-tic)*1000//10/100, "seconds")

    # keep track of our current guess
    allGuesses.append(newGuesses)
    guesses = newGuesses
    

print("Done after", i, guesses)

# this creates a fancy image showing how the colors change over iterations -
#   not part of the tutorial, makes main photo for the tutorial
w = 40
h = 10

progress = Image.new('RGB', (k*w, i*h), "white")
for y in range(i):
    for x in range(k):
        ImageDraw.Draw(progress).rectangle([(x*w, y*h), (x*w+w, y*h+h)], fill=allGuesses[y][x])

progress.save("progress.png")
