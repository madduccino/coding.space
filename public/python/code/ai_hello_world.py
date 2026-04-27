import google.generativeai as genai

genai.configure(api_key="INSERT_API_KEY_HERE")
model = genai.GenerativeModel("gemini-2.5-flash")

prompt = "Please repeat back 'Hello World'"

response = model.generate_content(prompt)

print(response)
print(response.text)
