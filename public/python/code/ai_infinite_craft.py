import google.generativeai as genai

genai.configure(api_key="INSERT_API_KEY_HERE")
model = genai.GenerativeModel("gemini-2.5-flash")

elements = ['fire', 'water', 'earth', 'air']

def printLst(lst):
    for i, v in enumerate(lst):
        print(i+1, v.capitalize())

memoization = {}
def combine(elements, ind1, ind2):
    if ind1 > ind2:
        (ind1, ind2) = (ind2, ind1)
    k = str(ind1) + "," + str(ind2)
    if k in memoization:
        return memoization[k]
    prompt = "What would you get if you combined " + elements[ind1] + " and " + \
        elements[ind2] + "? Please limit your response to a single word"
    response = model.generate_content(prompt)
    memoization[k] = response.text.lower()
    return memoization[k]

r = model.generate_content("What would you get if you combined air and fire? Please limit your response to one word").text
print("What would you get if you combined air and fire? Please limit your response to one word")
print(r)

print("Welcome to our infinite craft. Your starting ingredients are:")
printLst(elements)
while True:
    val = input("Please chose an option:\n\n1: Combine Ingredients\n2: List Ingredients\n3: Exit\n")
    if val == '1':
        elInd1 = -1
        while elInd1 < 0 or elInd1 >= len(elements):
            elInd1 = int(input("Please chose first ingredient: "))-1
        print("First ingredient to combine is:", elements[elInd1].capitalize())
        elInd2 = -1
        while elInd2 < 0 or elInd2 >= len(elements):
            elInd2 = int(input("Please chose second ingredient: "))-1
        print("Second ingredient to combine is:", elements[elInd2].capitalize())

        response = combine(elements, elInd1, elInd2)

        print("Combining " + elements[elInd1].capitalize() + " and " + elements[elInd2].capitalize() + \
              " makes:\n\n" + response.capitalize(), end='')
        if response.lower() not in elements:
            elements.append(response.lower())
            print(" (at position " + str(len(elements)) + ")\n")
        else:
            print("\n")
                            

    elif val == '2':
        printLst(elements)
    elif val == '3':
        print("Goodbye")
        break
    else:
        print("Unrecognized option!")

