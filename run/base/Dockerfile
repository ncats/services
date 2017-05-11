FROM node:6

# Update aptitude with new repo
RUN apt-get -y update && apt-get -y upgrade && apt-get install -y git

# Add global node packages
RUN npm i -g pm2 lsc

