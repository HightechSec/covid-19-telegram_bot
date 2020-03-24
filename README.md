# COVID-19 Telegram Bot (Indonesian)
[![Docker Pulls](https://img.shields.io/docker/pulls/hightechsec/covid-19-telegram_bot.svg?style=flat)](https://hub.docker.com/r/hightechsec/covid-19-telegram_bot)
![License](https://img.shields.io/badge/License-GPL-blue.svg?style=flat)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/HightechSec/covid-19-telegram_bot)
![GitHub repo size](https://img.shields.io/github/repo-size/HightechSec/covid-19-telegram_bot)
![GitHub last commit](https://img.shields.io/github/last-commit/HightechSec/covid-19-telegram_bot)
![GitHub stars](https://img.shields.io/github/stars/HightechSec/covid-19-telegram_bot)
![GitHub pull requests](https://img.shields.io/github/issues-pr/HightechSec/covid-19-telegram_bot)
![GitHub forks](https://img.shields.io/github/forks/HightechSec/covid-19-telegram_bot)
![GitHub issues](https://img.shields.io/github/issues/HightechSec/covid-19-telegram_bot)
![GitHub watchers](https://img.shields.io/github/watchers/HightechSec/covid-19-telegram_bot)

Telegram bot about Corona Virus (COVID-19) Information in Indonesia

# Docker

To run this image you need [docker](http://docker.com) installed. Just run the command:
- Run this first `docker pull hightechsec/covid-19-telegram_bot` 
- Create .env file with TELEGRAM_BOT_TOKEN=BOT_TOKEN inside it, Change the BOT_TOKEN with your Bot Token
- then continue to run this `docker run --name covidbot --env-file /path/to/your/.env -it --rm hightechsec/covid-19-telegram_bot:latest`

## Build Manual Image

- Clone this repo (`https://github.com/HightechSec/covid-19-telegram_bot`)
- Change BOT_TOKEN in .env with your Bot Token
- Then run `docker build -t "covidbot" .` and wait untill it's done 
- If the build is clear, run this command `docker run --name covidbot -d --rm -it covidbot`

## Deploying Manually 

- Change BOT_TOKEN in .env with your Bot Token
- then run `npm install`
- and then `npm start`

# Greets
- Thanks to @mathdroid https://github.com/mathdroid/covid-19-api and @k1m0ch1 https://github.com/k1m0ch1/covid-19-api/ for the API.
