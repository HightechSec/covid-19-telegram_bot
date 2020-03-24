'use strict'

const express = require('express')
const morgan = require('morgan')
const axios = require('axios')

const app = express()
const port = process.env.NODE_PORT || 3000

const EJS = require('ejs')

const Telegraf = require('telegraf')
const TelegrafExtra = require('telegraf/extra')

const TELEGRAM_BOT_TOKEN = "BOT Token"
const TELEGRAM_BOT_START_TEXT = `
*Bot Informasi Corona Virus (COVID-19) Indonesia*

Perintah                Deskripsi
=====                ======
/start                    This description
/indo                     Data Kasus COVID19 Indonesia
/provinsi                Data Kasus COVID19 Per Provinsi
/hotline                 Informasi Layanan Darurat COVID19
/info                      Data Info mengenai COVID19
/cegah                   Info Pencegahan COVID19

#DiamDirumahCuk
#SocialDistancing
#StaySafeIndonesia
`

const TELEGRAM_BOT_INFO_TEXT = `
*Masa periode inkubasi untuk COVID-19?*

- Periode inkubasi dari COVID-19 diperkirakan sepanjang 14 hari setelah paparan pertama

- Pada beberapa kasus dipastikan hanya 5 hari setelah paparan pertama
                                                                                             
- Pada infeksi dengan kluster sebuah keluarga, timbulnya demam dan sindrom pernapasan terjadi sekitar 3-6 hari setelah paparan pertama

*Berapa lama waktu untuk test COVID-19?*

- 1-3 Hari

`

const TELEGRAM_BOT_PRECAUTIONS_TEXT = `
*Seberapa sering kita harus mencuci tangan?*

Cuci tangan dengan sabun atau Hand sanitizer sebelum menyentuh muka. Hindari kontak dengan mata, hidung, dan mulut jika belum mencuci tangan.

*Jika seseorang punya gejala flu, tindakan apa yang harus dilakukan*

Lakukan karantina mandiri, dan hubungi 119, atau hubungi rumah sakit yang memiliki peralatan memadai terhadap COVID19.

*Apakah masker, apd, Alcohol-swab wajib?*

Tidak, Pakailah masker jika anda positif terkena gejala COVID-19 or atau mengunjungi seseorang yang mungkin terkena COVID-19. Masker hanya dapat digunakan sekali saja. Jika anda tidak sakit atau tidak mengunjungi seseorang yang sakit maka anda membuang-buang masker. Saat ini terdapat krisis pasokan masker, apd dan Alcohol-swab, jadi harap bijak dalam membeli serta memakai hal-hal yang disebutkan sebelumnya.

*Jadi apa yang harus dilakukan?*

Social Distancing dan Physical Distancing adalah hal yang wajib! Jangan jadi egois berlagak kebal, perdulikan orang-orang disekitar anda, ikuti anjuran pemerintah untuk tetap berdiam dirumah.
`

const telegramBot = new Telegraf(TELEGRAM_BOT_TOKEN)

function buildStatsMessage(data) {
  return EJS.compile(`
*Indonesia*
\`
Terkonfirmasi: <%= data.confirmed.value %>
Meninggal: <%= data.deaths.value %>
Sembuh: <%= data.recovered.value %>
Dalam Perawatan: <%= data.activeCare.value %>
\`


  `, {})({ data })
}

function buildProvince(data) {
  return EJS.compile(`

<% data.data.forEach(function (r) { %>
*<%= r.provinsi %>*\`
Terkonfirmasi: <%= r.kasusPosi %> 
Meninggal: <%= r.kasusMeni %> 
Sembuh: <%= r.kasusSemb %>\`
<% }) %>

  `, {})({ data })
}

function buildHotline(data) {
  return EJS.compile(`

<% data.forEach(function (r) { %>
*<%= r.kota %>*\`
Call Center: <%= r.callCenter %> 
Hotline: <%= r.hotline %>\`
<% }) %>

  `, {})({ data })
}

async function handleStats(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('https://kawalcovid19.harippe.id/api/summary')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildStatsMessage(response.data))
        resolve()
      }
      catch(ex) {
        reject(ex)
      }
    })
    .catch(function (err) {
      reject(err)
    })
  })
}

async function handleProvince(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('https://indonesia-covid-19.mathdro.id/api/provinsi')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildProvince(response.data))
        resolve()
      }
      catch(ex) {
        reject(ex)
      }
    })
    .catch(function (err) {
      reject(err)
    })
  })
}

async function handleHotline(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('https://covid19-api.yggdrasil.id/id/hotline')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildHotline(response.data))
        resolve()
      }
      catch(ex) {
        reject(ex)
      }
    })
    .catch(function (err) {
      reject(err)
    })
  })
}

function handleInfo(ctx) {
  ctx.reply(TELEGRAM_BOT_INFO_TEXT, TelegrafExtra.markdown())
}

function handleSafety(ctx) {
  ctx.reply(TELEGRAM_BOT_PRECAUTIONS_TEXT, TelegrafExtra.markdown())
}

function handleStart(ctx) {
  ctx.reply(TELEGRAM_BOT_START_TEXT, TelegrafExtra.markdown())
}

function handleAnythingElse(ctx) {
  ctx.reply(`I don't recognize the command. Send /start to interact with me`, TelegrafExtra.markdown())
}

telegramBot.start((ctx) => handleStart(ctx))
telegramBot.help((ctx) => handleStart(ctx))
telegramBot.command('indo', async (ctx) => await handleStats(ctx))
telegramBot.command('provinsi', async (ctx) => await handleProvince(ctx))
telegramBot.command('info', (ctx) => handleInfo(ctx))
telegramBot.command('hotline', (ctx) => handleHotline(ctx))
telegramBot.command('cegah', (ctx) => handleSafety(ctx))
telegramBot.hears('hi', (ctx) => ctx.reply('Halo, Saya BOT Informasi COVID-19. Tekan /start untuk memulai interaksi'))
telegramBot.on('text', (ctx) => handleAnythingElse(ctx))

// Run as webhook
app.use(morgan('combined'))
app.use(telegramBot.webhookCallback('/'))

app.listen(port, () => console.log(`API Service listening on port ${port}!`))

// Run as client
telegramBot.launch()
