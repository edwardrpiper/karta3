# karta
To get this to run, need to do npm install to get all dependencies or use docker container (should get everything automatically).
Also, use the config.js.template file by pasting in your API key where it says put api key and rename the file to config.js
To run with docker, first create the image with: 
docker build <imagename> .
Then, run the image with
docker run -p 80:80 <imagename>
To view it, find the ip with docker-machine env and use that ip.
