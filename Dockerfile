FROM nikolaik/python-nodejs:latest

RUN apt update -y
RUN apt upgrade -y
RUN apt-get install -y --no-install-recommends \
neofetch \
ffmpeg \
wget \
sudo \
tesseract-ocr \
chromium \
imagemagick
RUN pip install pillow

RUN npm install -g npm@8.1.3

WORKDIR /home/Hisoka-Bot/app
COPY package.json .

RUN npm install

COPY . .

CMD ["node","index.js"]
