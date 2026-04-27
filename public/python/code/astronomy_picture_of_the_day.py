import requests
from PIL import Image
from io import BytesIO
import matplotlib.pyplot as plt

print("Requesting 2025 Astronomy Picture of the Day data...")
x = requests.get('https://api.nasa.gov/planetary/apod?api_key=Z1k5Sw4LzKKf88znpd44bSftOzg2WUhnHv0iOp5S&start_date=2025-01-01&end_date=2025-12-31')

if x.status_code != 200:
    print("Error in API call:", x.status_code)
    exit()
print("Recieved")

for v in x.json():
    if v['media_type'] != 'image':
        continue

    print("Requesting Image for", v['date'])
    y = requests.get(v['url'])
    if y.status_code != 200:
        print("Error from requesting Image. Status code:", y.status_code, "URL Requested:", v['url'])
        exit()

    i = Image.open(BytesIO(y.content))
    i.save(v['date'] + '.jpg')

    print("Downloaded and saved", v['date'])
    print(v['explanation'])
    break

imageExplanationLengths = []
otherExplanationLengths = []
for v in x.json():
    if v['media_type'] != 'image':
        otherExplanationLengths.append(len(v['explanation']))
    else:
        imageExplanationLengths.append(len(v['explanation']))

#print(imageExplanationLengths)
#print(otherExplanationLengths)

print("Creating Image Explanation Lengths Histogram")
plt.hist(imageExplanationLengths)
plt.xlabel('Length of Explanation (characters)')
plt.ylabel('Frequency')
plt.title('Image Explanation Lengths')
plt.savefig('imageExplanationLengths.png')
