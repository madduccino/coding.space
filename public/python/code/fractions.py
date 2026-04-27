class Fraction:
  # constructor - create a new instance of this class
  # You can make this code run by using the class name as a function, i.e.
  #   Fraction(1,10)
  # creates an instance of Fraction with a numerator of 1 and denominator of 10
  def __init__(self, numerator, denominator):
    self.num = numerator
    self.denom = denominator

  # returns the numerator (an integer)
  def getNum(self):
    return self.num

  # returns the denominator (an integer)
  def getDenom(self):
    return self.denom

  # returns a string representation of this Fraction
  def toString(self):
    return str(self.num) + "/" + str(self.denom)

  # returns a decimal representation of this Fraction
  def toDecimal(self):
    return self.num/self.denom

  # returns the product of this Fraction and the parameter frac
  #   both the return value and frac must be Fractions
  #   the new Fraction may not be simplified
  def multiply(self, frac):
    newNum = self.getNum() * frac.getNum()
    newDenom = self.getDenom() * frac.getDenom()
    return Fraction(newNum, newDenom)

  # returns the reciprocal of this Fraction (the return value will be a Fraction)
  #   the reciprocal is when the numerator and denominator swap places
  def reciprocal(self):
    return Fraction(self.getDenom(), self.getNum())

  # divide returns the product of this Fraction and the reciprocal of frac
  #   both the return value and frac must be Fractions
  def divide(self, frac):
    return self.multiply(frac.reciprocal())

  # add returns the result of adding this Fraction and frac
  #   both the return value and frac must be Fractions
  #   the new Fraction may not be simplified
  def add(self, frac):
    newNum = self.getNum() * frac.getDenom() + frac.getNum() * self.getDenom()
    newDenom = self.getDenom() * frac.getDenom()
    return Fraction(newNum, newDenom)

  # negate returns a Fraction that is the negative of itself
  def negate(self):
    return Fraction(-self.getNum(),self.getDenom())

  # subtract returns the result of subtracting this Fraction and frac
  #   both the return value and frac must be Fractions
  #   the new Fraction may not be simplified
  def subtract(self, frac):
    return self.add(frac.negate())
  
  # reduce returns a simplified version of this Fraction
  #   i.e. the new numerator and denominator have no common factors
  # the resulting Fraction should have the same value as the input Fraction
  #   i.e. self.toDecimal() == self.reduce().toDecimal()
  def reduce(self):
    # count down from the lower of the numbers to 1
    for i in range(min(self.getNum(),self.getDenom()),0,-1):
      # if both are divisible, this is the greatest common factor (GCF)
      if self.getNum() % i == 0 and self.getDenom() % i == 0:
        # make a new Fraction dividing by the GCF
        return Fraction(int(self.getNum()/i), int(self.getDenom()/i))

x = Fraction(2,3)
y = Fraction(1,5)
print("The variable x has the value of", x)
print()
print("x.toString():", x.toString(), "(should be 2/3)")
print()
print("x.toDecimal():", x.toDecimal(), "(should be 0.6666...)")
print()
print("2/3 * 1/5 =", x.multiply(y).toString(), "(should be 2/15)")
print()
print("The reciprocal of 2/3 is", x.reciprocal().toString(), "(should be 3/2)")
print()
print("Dividing 2/3 by 1/5 is", x.divide(y).toString(), "(should be 10/3)")
print()
print("2/3 + 1/5 =", x.add(y).toString(), "(should be 13/15)")
print()
print("The negation of 1/5 is", y.negate().toString(), "(should be -1/5)")
print()
print("2/3 - 1/5 =", x.subtract(y).toString(), "(should be 7/15)")
print()
print("25/100 in simplest form is", Fraction(25,100).reduce().toString(), "(should be 1/4)")
print()
print("1/4 + 1/4 =", Fraction(1,4).add(Fraction(1,4)).toString(), "(should be 8/16)")
print()
print("The simplest form of 1/4 + 1/4 is", Fraction(1,4).add(Fraction(1,4)).reduce().toString(), "(should be 1/2)")
