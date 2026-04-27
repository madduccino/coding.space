def add_task(tasks):
  task = input("Add a task: ")
  tasks.append(task)
  completed.append(False)


def remove_task(tasks):
  display_tasks(tasks)
  number = int(input("Enter the number of the task you'd like to remove: "))
  try:
    if number <= 0 or number > len(tasks):
      raise ValueError
    del tasks[number - 1]
    del completed[number - 1]
  except (ValueError, IndexError):
    print("Invalid task number. Try again.")

def complete_task(tasks):
  display_tasks_completed(tasks)
  number = int(input("Enter the number of the task you'd like to complete: "))
  try:
    if number <= 0 or number > len(tasks):
      raise ValueError
    if completed[number-1] == True:
      print("Already completed! Try again")
    else:
      completed[number-1] = True
  except (ValueError, IndexError):
    print("Invalid task number. Try again.")

def display_tasks(tasks):
  if tasks:
    print("Your to do list:")
    for i in range(len(tasks)):
      print(str(i+1) + ". " + tasks[i])
  else:
    print("Your to do list is empty.")


def display_tasks_completed(tasks):
  if tasks:
    print("Your to do list:")
    for i in range(len(tasks)):
      if completed[i]:
        print(str(i+1) + ". [X] " + tasks[i])
      else:
        print(str(i+1) + ". [ ] " + tasks[i])
  else:
    print("Your to do list is empty.")


print("Welcome to the To-Do List App")

print("""
Options
1. Add a task
2. Remove a task
3. Complete a task
4. Display tasks
5. Exit
""")

tasks = []
completed = []
while True:
  user_input = input("Choose an option: ")
  if user_input == '1':
    add_task(tasks)
  elif user_input == '2':
    remove_task(tasks)
  elif user_input == '4':
    display_tasks_completed(tasks)
  elif user_input == '3':
    complete_task(tasks)
  elif user_input == '5':
    print("Goodbye")
    break
  else:
    print("You must choose an option between 1-5")
