import random

# these books can be downloaded from project gutenberg.
books = ['mobyDick', 'prideAndPrejudice', 'romeoAndJuliet', 'frankenstein']

text = ''

for path in books:
    file_path = path + ".txt"

    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            file_content = file.read()
        text += file_content
    except FileNotFoundError:
        print(f"Error: The file '{file_path}' was not found.")
    except Exception as e:
        print(f"An error occurred: {e}")

text = text.split()
        
model = {}
window_length = 5
for i in range(len(text)-window_length):
    context = " ".join(text[i:i+window_length])
    completion = text[i+window_length]
    if context not in model:
        model[context] = {}
    if completion not in model[context]:
        model[context][completion] = 0
    model[context][completion] += 1

#print(model) # this prints out A LOT

prompt = 'most young candidates for the pains'.split()

for i in range(500):
    context = " ".join(prompt[-window_length:])
    if context not in model:
        print("Prompt not found in training data")
        break
    #print("Context: '" + context + "', Inner Dictionary:", model[context])
    if len(model[context]) == 1:
        prompt.append(list(model[context].keys())[0])
    else: # there's more than one possible completion
        lst = []
        weights = []
        for k in model[context].keys():
            lst.append(k)
            weights.append(model[context][k])
        prompt.append(random.choices(lst, weights)[0])
    print("Saw '" + context + "', generated '" + prompt[-1] + "'")
print(" ".join(prompt))
