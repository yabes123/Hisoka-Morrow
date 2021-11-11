# Hisoka-Morrow

<p align="center">
	<img src="https://telegra.ph/file/ae5237e860bbe4ac2f0a8.jpg" width="35%" style="margin-left: auto;margin-right: auto;display: block;">
</p>
<h1 align="center">Hisoka-Morrow</h1>


[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/DikaArdnt/Hisoka-Morrow)


## UNTUK PENGGUNA WINDOWS/VPS/RDP

* Unduh & Instal Git [`Klik Disini`](https://git-scm.com/downloads)
* Unduh & Instal NodeJS [`Klik Disini`](https://nodejs.org/en/download)
* Unduh & Instal FFmpeg [`Klik Disini`](https://ffmpeg.org/download.html) (**Jangan Lupa Tambahkan FFmpeg ke variabel lingkungan PATH**)


```bash
git clone https://github.com/DikaArdnt/Hisoka-Morrow
cd Hisoka-Morrow
npm i
npm update
node .
```

## FOR TERMUX/UBUNTU/SSH USER

```bash
apt update && apt upgrade
apt install git -y
apt install nodejs -y
apt install ffmpeg -y
apt install imagemagick -y
git clone https://github.com/DikaArdnt/Hisoka-Morrow
cd Hisoka-Morrow
npm install
```

## INSTALL ON TERMUX WITH UBUNTU

[ INSTALLING UBUNTU ]

```bash
apt update && apt full-upgrade
apt install wget curl git proot-distro
proot-distro install ubuntu
echo "proot-distro login ubuntu" > $PREFIX/bin/ubuntu
ubuntu
```
---------

[ INSTALLING NODEJS & Hisoka-Morrow ]

```bash
ubuntu
curl -fsSL https://deb.nodesource.com/setup_current.x | sudo -E bash -
apt install -y nodejs gcc g++ make
git clone https://github.com/DikaArdnt/Hisoka-Morrow
cd wabot-aq
npm install
npm update
```
[ INSTALLING REQUIRED PACKAGES ]

```bash
ubuntu
apt update && apt full-upgrade
apt install wget curl git ffmpeg imagemagick build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev dbus-x11 ffmpeg2theora ffmpegfs ffmpegthumbnailer ffmpegthumbnailer-dbg ffmpegthumbs libavcodec-dev libavcodec-extra libavcodec-extra58 libavdevice-dev libavdevice58 libavfilter-dev libavfilter-extra libavfilter-extra7 libavformat-dev libavformat58 libavifile-0.7-bin libavifile-0.7-common libavifile-0.7c2 libavresample-dev libavresample4 libavutil-dev libavutil56 libpostproc-dev libpostproc55 graphicsmagick graphicsmagick-dbg graphicsmagick-imagemagick-compat graphicsmagick-libmagick-dev-compat groff imagemagick-6.q16hdri imagemagick-common libchart-gnuplot-perl libgraphics-magick-perl libgraphicsmagick++-q16-12 libgraphicsmagick++1-dev
```

## UNTUK PENGGUNA HEROKU

### Instal Buildpack
* heroku/nodejs
* https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git

# Thanks To
* [`@adiwajshing/baileys`](https://github.com/adiwajshing/Baileys)
* [`Nurutomo/wabot-aq`](https://github.com/Nurutomo/wabot-aq)
* [`MhankBarBar`](https://github.com/MhankBarBar/weabot)
* [`Dika Ardnt.`](https://github.com/DikaArdnt/Hisoka-Morrow)

Note: this is a script that copy pastes from someone else's script, so don't bully me om
