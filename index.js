'use strict'

const express = require('express')
const morgan = require('morgan')
const axios = require('axios')

const app = express()
const port = process.env.NODE_PORT || 3000

const EJS = require('ejs')

const Telegraf = require('telegraf')
const TelegrafExtra = require('telegraf/extra')
require('dotenv').config()

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_BOT_START_TEXT = `
*Bot Informasi Corona Virus (COVID-19) Indonesia*

\`Perintah\`             \`Deskripsi\`
======================

/start                    \`This description\`
/indo                     \`Data Kasus COVID19 Indonesia\`
/provinsi               \`Data Kasus COVID19 Per Provinsi\`
/hotline                 \`Informasi Layanan Darurat COVID19\`
/info                      \`Data Info mengenai COVID19\`
/cegah                  \`Info Pencegahan COVID19\`

#DiamDirumahCuk
#SocialDistancing
#WorkFromHome
#LearnFromHome
#StaySafeIndonesia
`

const TELEGRAM_BOT_PROVINCES = `
*List Provinsi*

\`Perintah\`       \`Deskripsi\`
======================
/aceh            \`Data Kasus COVID19 Aceh\`
/bali              \`Data Kasus COVID19 Bali\`
/banten         \`Data Kasus COVID19 Banten\`
/bengkulu      \`Data Kasus COVID19 Bengkulu\`
/gorontalo      \`Data Kasus COVID19 Gorontalo\`
/jakarta          \`Data Kasus COVID19 Jakarta\`
/jambi            \`Data Kasus COVID19 Jambi\`
/jabar             \`Data Kasus COVID19 Jawa Barat\`
/jateng           \`Data Kasus COVID19 Jawa Tengah\`
/jatim             \`Data Kasus COVID19 Jawa Timur\`
/kalbar            \`Data Kasus COVID19 Kalimantan Barat\`
/kalsel             \`Data Kasus COVID19 Kalimantan Selatan\`
/kalteng          \`Data Kasus COVID19 Kalimantan Tengah\`
/kaltim            \`Data Kasus COVID19 Kalimantan Timur\`
/kaltara            \`Data Kasus COVID19 Kalimantan Tenggara\`
/kepbang         \`Data Kasus COVID19 Kepulauan Bangka\`
/kepri              \`Data Kasus COVID19 Kepulauan Riau\`
/lampung          \`Data Kasus COVID19 Lampung\`
/maluku           \`Data Kasus COVID19 Maluku\`
/maluta            \`Data Kasus COVID19 Maluku Utara\`
/ntb                 \`Data Kasus COVID19 Nusa Tenggara Barat\`
/ntt                  \`Data Kasus COVID19 Nusa Tenggara Timur\`
/papua             \`Data Kasus COVID19 Papua\`
/papbar            \`Data Kasus COVID19 Papua Barat\`
/riau                 \`Data Kasus COVID19 Riau\`
/sulbar              \`Data Kasus COVID19 Sulawesi Barat\`
/sulsel               \`Data Kasus COVID19 Sulawesi Selatan\`
/sulteng             \`Data Kasus COVID19 Sulawesi Tengah\`
/sultra                \`Data Kasus COVID19 Sulawesi Tenggara\`
/sulut                 \`Data Kasus COVID19 Sulawesi Utara\`
/sumbar              \`Data Kasus COVID19 Sumatera Barat\`
/sumsel               \`Data Kasus COVID19 Sumatera Selatan\`
/sumut                \`Data Kasus COVID19 Sumatera Utara\`
/yogya                \`Data Kasus COVID19 Yogyakarta\`


#DiamDirumahCuk
#SocialDistancing
#WorkFromHome
#LearnFromHome
#StaySafeIndonesia
`

const TELEGRAM_BOT_INFO_TEXT = `
*Masa periode inkubasi untuk COVID-19?*
\`
- Periode inkubasi dari COVID-19 diperkirakan sepanjang 14 hari setelah paparan pertama

- Pada beberapa kasus dipastikan hanya 5 hari setelah paparan pertama

- Pada infeksi dengan kluster sebuah keluarga, timbulnya demam dan sindrom pernapasan terjadi sekitar 3-6 hari setelah paparan pertama\`

*Berapa lama waktu untuk test COVID-19?*

\`
- 1-3 Hari
\`

`

const TELEGRAM_BOT_PRECAUTIONS_TEXT = `
*Seberapa sering kita harus mencuci tangan?*
\`
Cuci tangan dengan sabun atau Hand sanitizer sebelum menyentuh muka. Hindari kontak dengan mata, hidung, dan mulut jika belum mencuci tangan.\`

*Jika seseorang punya gejala flu, tindakan apa yang harus dilakukan*
\`
Lakukan karantina mandiri, dan hubungi 119, atau hubungi rumah sakit yang memiliki peralatan memadai terhadap COVID19.\`

*Apakah masker, apd, Alcohol-swab wajib?*
\`
Tidak, Pakailah masker jika anda positif terkena gejala COVID-19 or atau mengunjungi seseorang yang mungkin terkena COVID-19. Masker hanya dapat digunakan sekali saja. Jika anda tidak sakit atau tidak mengunjungi seseorang yang sakit maka anda membuang-buang masker. Saat ini terdapat krisis pasokan masker, apd dan Alcohol-swab, jadi harap bijak dalam membeli serta memakai hal-hal yang disebutkan sebelumnya.\`

*Jadi apa yang harus dilakukan?*
\`
Social Distancing dan Physical Distancing adalah hal yang wajib! Jangan jadi egois berlagak kebal, perdulikan orang-orang disekitar anda, ikuti anjuran pemerintah untuk tetap berdiam dirumah.\`
`

const telegramBot = new Telegraf(TELEGRAM_BOT_TOKEN)

function buildIndo(data) {
  return EJS.compile(`
*Indonesia*\`
Terkonfirmasi: <%= data.confirmed.value %>\` *(+<%= data.confirmed.diff %>)*\`
Meninggal: <%= data.deaths.value %>\` *(+<%= data.deaths.diff %>)*\`
Sembuh: <%= data.recovered.value %>\` *(+<%= data.recovered.diff %>)*\`
Dalam Perawatan: <%= data.active_care.value %>\` *(+<%= data.active_care.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildAceh(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildBali(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildBanten(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildBengkulu(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildGorontalo(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildJakarta(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildJambi(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildJabar(data) {
  return EJS.compile(`
*Jawa Barat*\`
Terkonfirmasi: <%= data.total_positif_saat_ini.value %>\` *(+<%= data.total_positif_saat_ini.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*\`
Total ODP: <%= data.total_odp.value %>\` *(+<%= data.total_odp.diff %>)*\`
Total PDP <%= data.total_pdp.value %>\` *(+<%= data.total_pdp.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildJateng(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildJatim(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildKalbar(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildKalsel(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildKalteng(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildKaltim(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildKaltara(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildKepbang(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildKepri(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildLampung(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildMaluku(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildMaluta(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildNtb(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildNtt(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildPapua(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildPapbar(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildRiau(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildSulbar(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildSulsel(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildSulteng(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildSultra(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildSulut(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildSumbar(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildSumsel(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildSumut(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
  `, {})({ data })
}

function buildYogya(data) {
  return EJS.compile(`
*<%= data.metadata.province %>*\`
Terkonfirmasi: <%= data.total_positif.value %>\` *(+<%= data.total_positif.diff %>)*\`
Meninggal: <%= data.total_meninggal.value %>\` *(+<%= data.total_meninggal.diff %>)*\`
Sembuh: <%= data.total_sembuh.value %>\` *(+<%= data.total_sembuh.diff %>)*
\`
Sumber data\` https://covid19-api.yggdrasil.id/
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

\`Sumber data\` https://indonesia-covid-19.mathdro.id/
  `, {})({ data })
}

function buildHotline(data) {
  return EJS.compile(`

<% data.forEach(function (r) { %>
*<%= r.kota %>*\`
Call Center: <%= r.callCenter %> 
Hotline: <%= r.hotline %>\`
<% }) %>

\`Sumber data\` https://covid19-api.yggdrasil.id/ 
  `, {})({ data })
}

async function handleIndo(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildIndo(response.data))
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

async function handleAceh(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/aceh')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildAceh(response.data))
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

async function handleBali(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/bali')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildBali(response.data))
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

async function handleBanten(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/banten')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildBanten(response.data))
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

async function handleBengkulu(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/bengkulu')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildBengkulu(response.data))
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

async function handleGorontalo(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/gorontalo')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildGorontalo(response.data))
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

async function handleJakarta(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/jakarta')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildJakarta(response.data))
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

async function handleJambi(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/jambi')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildJambi(response.data))
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

async function handleJabar(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/jabar')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildJabar(response.data))
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

async function handleJateng(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/jateng')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildJateng(response.data))
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

async function handleJatim(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/jatim')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildJatim(response.data))
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

async function handleKalbar(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/kalbar')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildKalbar(response.data))
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

async function handleKalsel(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/kalsel')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildKalsel(response.data))
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

async function handleKalteng(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/kalteng')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildKalteng(response.data))
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

async function handleKaltim(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/kaltim')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildKaltim(response.data))
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

async function handleKaltara(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/kaltara')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildKaltara(response.data))
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

async function handleKepbang(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/kep-bangka')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildKepbang(response.data))
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

async function handleKepri(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/kepri')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildKepri(response.data))
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

async function handleLampung(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/lampung')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildLampung(response.data))
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

async function handleMaluku(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/maluku')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildMaluku(response.data))
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

async function handleMaluta(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/maluku-utara')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildMaluta(response.data))
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

async function handleNtb(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/ntb')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildNtb(response.data))
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

async function handleNtt(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/ntt')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildNtt(response.data))
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

async function handlePapua(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/papua')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildPapua(response.data))
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

async function handlePapbar(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/papua-barat')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildPapbar(response.data))
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

async function handleRiau(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/riau')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildRiau(response.data))
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

async function handleSulbar(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/sulbar')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildSulbar(response.data))
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

async function handleSulsel(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/sulsel')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildSulsel(response.data))
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

async function handleSulteng(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/sulteng')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildSulteng(response.data))
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

async function handleSultra(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/sultra')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildSultra(response.data))
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

async function handleSulut(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/sulut')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildSulut(response.data))
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

async function handleSumbar(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/sumbar')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildSumbar(response.data))
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

async function handleSumsel(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/sumsel')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildSumsel(response.data))
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

async function handleSumut(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/sumut')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildSumut(response.data))
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

async function handleYogya(ctx) {
  return new Promise(function (resolve, reject) {
    axios.get('http://23.96.48.47:5000/id/yogya')
    .then(function (response) {
      try {
        ctx.replyWithMarkdown(buildYogya(response.data))
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
    axios.get('https://covid19-api.yggdrasil.id/hotline')
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

function handleCegah(ctx) {
  ctx.reply(TELEGRAM_BOT_PRECAUTIONS_TEXT, TelegrafExtra.markdown())
}

function handleStart(ctx) {
  ctx.reply(TELEGRAM_BOT_START_TEXT, TelegrafExtra.markdown())
}

function handleList(ctx) {
  ctx.reply(TELEGRAM_BOT_PROVINCES, TelegrafExtra.markdown())
}

function handleAnythingElse(ctx) {
  ctx.reply(`Perintah tidak dikenal. Tekan /start untuk memulai interaksi`, TelegrafExtra.markdown())
}
telegramBot.start((ctx) => handleStart(ctx))
telegramBot.help((ctx) => handleStart(ctx))
telegramBot.command('indo', async (ctx) => await handleIndo(ctx))
telegramBot.command('aceh', async (ctx) => await handleAceh(ctx))
telegramBot.command('bali', async (ctx) => await handleBali(ctx))
telegramBot.command('banten', async (ctx) => await handleBanten(ctx))
telegramBot.command('bengkulu', async (ctx) => await handleBengkulu(ctx))
telegramBot.command('gorontalo', async (ctx) => await handleGorontalo(ctx))
telegramBot.command('jakarta', async (ctx) => await handleJakarta(ctx))
telegramBot.command('jambi', async (ctx) => await handleJambi(ctx))
telegramBot.command('jabar', async (ctx) => await handleJabar(ctx))
telegramBot.command('jateng', async (ctx) => await handleJateng(ctx))
telegramBot.command('jatim', async (ctx) => await handleJatim(ctx))
telegramBot.command('kalbar', async (ctx) => await handleKalbar(ctx))
telegramBot.command('kalsel', async (ctx) => await handleKalsel(ctx))
telegramBot.command('kalteng', async (ctx) => await handleKalteng(ctx))
telegramBot.command('kaltim', async (ctx) => await handleKaltim(ctx))
telegramBot.command('kaltara', async (ctx) => await handleKaltara(ctx))
telegramBot.command('kepbang', async (ctx) => await handleKepbang(ctx))
telegramBot.command('kepri', async (ctx) => await handleKepri(ctx))
telegramBot.command('lampung', async (ctx) => await handleLampung(ctx))
telegramBot.command('maluku', async (ctx) => await handleMaluku(ctx))
telegramBot.command('maluta', async (ctx) => await handleMaluta(ctx))
telegramBot.command('ntb', async (ctx) => await handleNtb(ctx))
telegramBot.command('ntt', async (ctx) => await handleNtt(ctx))
telegramBot.command('papua', async (ctx) => await handlePapua(ctx))
telegramBot.command('papbar', async (ctx) => await handlePapbar(ctx))
telegramBot.command('riau', async (ctx) => await handleRiau(ctx))
telegramBot.command('sulbar', async (ctx) => await handleSulbar(ctx))
telegramBot.command('sulsel', async (ctx) => await handleSulsel(ctx))
telegramBot.command('sulteng', async (ctx) => await handleSulteng(ctx))
telegramBot.command('sultra', async (ctx) => await handleSultra(ctx))
telegramBot.command('sulut', async (ctx) => await handleSulut(ctx))
telegramBot.command('sumbar', async (ctx) => await handleSumbar(ctx))
telegramBot.command('sumsel', async (ctx) => await handleSumsel(ctx))
telegramBot.command('sumut', async (ctx) => await handleSumut(ctx))
telegramBot.command('yogya', async (ctx) => await handleYogya(ctx))
telegramBot.command('provinsi', (ctx) => handleList(ctx))
telegramBot.command('info', (ctx) => handleInfo(ctx))
telegramBot.command('hotline', (ctx) => handleHotline(ctx))
telegramBot.command('cegah', (ctx) => handleCegah(ctx))
telegramBot.hears('hi', (ctx) => ctx.reply('Halo, Saya BOT Informasi COVID-19. Tekan /start untuk memulai interaksi'))
telegramBot.on('text', (ctx) => handleAnythingElse(ctx))

// Run as webhook
app.use(morgan('combined'))
app.use(telegramBot.webhookCallback('/'))

app.listen(port, () => console.log(`API Service listening on port ${port}!`))

// Run as client
telegramBot.launch()
