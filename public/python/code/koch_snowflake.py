# this requires an environment set up for turtles

import turtle

# create a turtle and make it go as fast as it can
t = turtle.Turtle()
t.speed(0)

def koch(t, length, depth):
  if depth == 0:
    t.forward(length)
    return
  koch(t, length/3, depth-1)
  t.left(60)
  koch(t, length/3, depth-1)
  t.right(120)
  koch(t, length/3, depth-1)
  t.left(60)
  koch(t, length/3, depth-1)


# change the 3rd parameter here to increase/decrease complexity
for i in range(3):
  koch(t, 100, 4)
  t.right(120)
