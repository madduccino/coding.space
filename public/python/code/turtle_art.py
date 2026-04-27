# this requires an environment set up for turtles

import turtle
import random

# Fullscreen the canvas

screen = turtle.Screen()

screen.setup(1.0, 1.0)

# Begin!

t = turtle.Turtle()

# Square
# for i in range(4):
#   t.forward(100)
#   t.left(90)

t.fillcolor('yellow')
t.begin_fill()

# Triangle
for i in range(3):
  t.forward(100)
  t.left(120)

t.end_fill()

# screen.bgcolor("black")

# WIDTH = screen.window_width()
# HEIGHT = screen.window_height()

# LEFT = int(-WIDTH/2)
# RIGHT = int(WIDTH/2)
# TOP = int(HEIGHT/2)
# BOTTOM = int(-HEIGHT/2)

# Make a spiral
# def makeSpiral(length, n):
#   for i in range(length):
#     for c in ('red','green','blue','orange'):
#       t.color(c)
#       t.forward(i+n)
#       t.right(30)

# makeSpiral(10,10)

# t.pensize(5)
# t.speed(10)

# Lots of spirals
# for i in range(10):
#   t.penup()
#   t.goto(random.randint(LEFT,RIGHT),random.randint(BOTTOM,TOP))
#   t.pendown()
#   makeSpiral(10,10)

# Cool Pattern

# colors = ["red", "orange", "yellow", "green", "blue", "purple"]
# t.speed(10)
# screen.bgcolor("black")
# t.pensize(2)

# initial_size = 30

# for i in range(200):
#     t.color(colors[i % 6])
#     t.forward(initial_size + i)
#     t.left(59)

screen.mainloop()
