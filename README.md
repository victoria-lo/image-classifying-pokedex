> New Year New Hack 3rd Place winner. [See on DevPost.](https://devpost.com/software/image-classifying-pokedex)

## Inspiration
In the Pokémon TV show, there is a device called the Pokédex which can detect any Pokémon it points to and returns that Pokémon's information via speech. We decided to bring this into reality to fulfill our childhood fantasy!

## What it does
Our Pokédex is an image classifying app that returns the Pokémon data that it detects based on user supplied image and reads out the Pokémon's description aloud, just like a real Pokédex.

## How it works
### Home Page: Upload an Image
<img src= "https://challengepost-s3-challengepost.netdna-ssl.com/photos/production/software_photos/001/323/386/datas/original.PNG" />

### Click Run Pokedex Analysis
<img src="https://challengepost-s3-challengepost.netdna-ssl.com/photos/production/software_photos/001/323/388/datas/original.PNG" />

### Pokedex will output 
<img src="https://challengepost-s3-challengepost.netdna-ssl.com/photos/production/software_photos/001/323/387/datas/original.PNG" />

## How we built it
Our Pokédex app uses a custom image classification model trained using Google Cloud AutoML Vision API. We collected over 10000 images for all original 151 species of Pokémon. We stored them all in Google Cloud Storage. Then we trained it on the Google Cloud AutoML Vision Dashboard. After a few hours of training, our model is ready to be exported for use.

To voice out the Pokémon's description, we used the Cloud Text-to-Speech API.

Once the model outputs the prediction based on the supplied image, the Pokedex fetches the data from the PokéAPI. The data is then organized using simple HTML, TailwindCSS and ChartJS for readability.

## Challenges we ran into
Gather and importing the over 10,000 Pokémon images was definitely a challenge for this hackathon due to the time limitations. Furthermore, integrating Google Cloud's Text-to-Speech API was a struggle due to requiring authentication and refreshing it through access tokens.

## Accomplishments that we are proud of
That we are able to make a working Kanto (Original 151 Pokémon) Pokédex in time and achieved a pretty good accuracy of 92%.

## What we learned
We learned about the different products Google Cloud has to offer. It was an amazing experience being able to use AutoML Vision, Storage, and Text-to-Speech (TTS) and integrating them all into one cohesive project.

## What's next for Image Classifying Pokédex
Our next step is to gather more images for each Pokémon for training and higher accuracy. We also plan to include more species of Pokémon in the model as there are currently over 900 species of Pokémon that the Pokédex app should be able to detect. Additionally, we plan to address the issue of detecting multiple Pokémon in a single image and being able to classify non-Pokémon objects instead of returning the most likely Pokémon.

Finally, we also plan to make a mobile version of the Pokédex with real time object detection via camera so that any phone can become a real Pokédex.
