import datetime

# set the date to Jan 1st, 1901
cur = datetime.datetime(1901,1,1)
# go forward day by day until it's Sunday
while cur.strftime("%a") != 'Sun':
  cur = cur + datetime.timedelta(days=1)

total = 0

# go forward 7 days at a time (i.e. Sunday to Sunday)
while cur.year < 2001:
  cur = cur + datetime.timedelta(days=7)
  # if it's the first of the month, add to our total answer
  if cur.day == 1:
    total += 1

print(total)
