require('./config')
let { WAConnection: _WAConnection, MessageType } = require("@adiwajshing/baileys")
let qrcode = require("qrcode-terminal")
let simple = require('./lib/myfunc')
let { promisify } = require('util')
let yargs = require('yargs/yargs')
let Readline = require('readline')
let cp = require('child_process')
let path = require('path')
let fs = require('fs')
let fetch = require('node-fetch')
let chalk = require('chalk')

let rl = Readline.createInterface(process.stdin, process.stdout)
let WAConnection = simple.WAConnection(_WAConnection)

global.api = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '')
global.timestamp = {
    start: new Date
}

// Logger
const PORT = process.env.PORT || 3000
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())

global.db = new (require('./lib/database'))(`${opts._[0] ? opts._[0] + '_' : ''}database.json`, null, 2)

let authFile = `${opts._[0] || `${sessionName}`}.json`
let hisoka = new WAConnection()

async function start() {
    if (fs.existsSync(authFile)) hisoka.loadAuthInfo(authFile)
    if (opts['trace']) hisoka.logger.level = 'trace'
    if (opts['debug']) hisoka.logger.level = 'debug'
    if (opts['big-qr'] || opts['server']) hisoka.on('qr', qr => qrcode.generate(qr, { small: false }))
    let dbJson = JSON.stringify(global.db.data)
    if (!opts['test']) setInterval(() => {
        hisoka.logger.info('Reading Database...')
        if (JSON.stringify(global.db.data) == dbJson) hisoka.logger.info('Database Update Now')
        else {
            global.db.save()
            hisoka.logger.info('Done Update Database')
            let dbJson = JSON.stringify(global.db.data)
        }
    }, 60 * 1000)
    if (opts['server']) require('./server')(hisoka, PORT)

    var { currentVersion } = await simple.fetchJson(`https://web.whatsapp.com/check-update?version=1&platform=web`)
    hisoka.version = currentVersion.split('.').map(a => parseInt(a)) || global.connVersion
    if (opts['test']) {
        hisoka.user = {
          jid: '2219191@s.whatsapp.net',
          name: 'test',
          phone: {}
        }
        hisoka.prepareMessageMedia = (buffer, mediaType, options = {}) => {
          return {
            [mediaType]: {
              url: '',
              mediaKey: '',
              mimetype: options.mimetype || '',
              fileEncSha256: '',
              fileSha256: '',
              fileLength: buffer.length,
              seconds: options.duration,
              fileName: options.filename || 'file',
              gifPlayback: options.mimetype == 'image/gif' || undefined,
              caption: options.caption,
              ptt: options.ptt
            }
          }
        }
      
        hisoka.sendMessage = async (chatId, content, type, opts = {}) => {
          let message = await hisoka.prepareMessageContent(content, type, opts)
          let waMessage = await hisoka.prepareMessageFromContent(chatId, message, opts)
          if (type == 'conversation') waMessage.key.id = require('crypto').randomBytes(16).toString('hex').toUpperCase()
          hisoka.emit('chat-update', {
            jid: hisoka.user.jid,
            hasNewMessage: true,
            count: 1,
            messages: {
              all() {
                return [waMessage]
              }
            }
          })
        }
        rl.on('line', line => hisoka.sendMessage('123@s.whatsapp.net', line.trim(), 'conversation'))
      } else {
        rl.on('line', line => {
          global.db.save()
          process.send(line.trim())
        })
    }

    hisoka.connect().then(async () => {
        global.db.data = {
            users: {},
            chats: {},
            database: {},
            sticker: {},
            settings: {},
            ...(global.db.data || {})
        }
        const authInfo = hisoka.base64EncodedAuthInfo()
        fs.writeFileSync(authFile, JSON.stringify(authInfo, null, '\t'))
        global.timestamp.connect = new Date
    })
    process.on('uncaughtException', console.error)

    
    let isInt = true
//////////
    hisoka.public = true
    hisoka.multipref = true
    hisoka.nopref = false
    hisoka.prefa = prefa
    hisoka.setWelcome = '```Selamat Datang Di Group @subject```\n─────────────────\n```Nama : @user```\n```Bio : @bio```\n```Pada : @tanggal```\n```Jangan Lupa Baca Rules Group```\n─────────────────\n```@desc```'
    hisoka.setLeave = '```Sayonara``` 👋\n─────────────────\n```Nama : @user```\n```Bio : @bio```\n```Pada : @tanggal```\n\nTelah Meninggalkan Group\n*@subject*\n'
    hisoka.setDemote = '「 *Demote Deteᴄted* 」\n\n```Nomor : @user```\n```Bio : @bio```\n```Group : @subject```\n\nTelah Di Unadmin'
    hisoka.setPromote = '「 *Promote Deteᴄted* 」\n\n```Nomor : @user```\n```Bio : @bio```\n```Group : @subject```\n\nTelah Menjadi Admin'
/////////

    hisoka.on('message-delete', async (m) => {
        require('./message/antidelete')(hisoka, m)
    })

    hisoka.on('group-participants-update', async (anu) => {
        require('./message/welkom')(hisoka, anu)
    })

    hisoka.on('group-update', async (chat) => {
        require('./message/detect')(hisoka, chat)
    })

    hisoka.on('CB:action,,call', async json => {
        require('./message/anticall')(hisoka, json)
    })

    hisoka.on('chat-update', async chatUpdate => {
        try {
            if (!chatUpdate.hasNewMessage) return
            if (!chatUpdate.messages && !chatUpdate.count) return
            
            let mek = chatUpdate.messages.all()[0]
            if (!mek.message) return
            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
            simple.smsg(hisoka, mek)
            if (mek.key && mek.key.remoteJid == 'status@broadcast') return
            if (!hisoka.public && !mek.key.fromMe) return
		    if (mek.key.id.startsWith('3EB0') && mek.key.id.length === 12) return
            require('./hisoka')(hisoka, mek, chatUpdate)
        } catch (err) {
            console.log(err)
        }
    })

    if (isInt) {
        hisoka.on('error', hisoka.logger.error)
        hisoka.on('close', () => {
          setTimeout(async () => {
            try {
              if (hisoka.state === 'close') {
                if (fs.existsSync(authFile)) await hisoka.loadAuthInfo(authFile)
                await hisoka.connect()
                fs.writeFileSync(authFile, JSON.stringify(hisoka.base64EncodedAuthInfo(), null, '\t'))
                global.timestamp.connect = new Date
              }
            } catch (e) {
              hisoka.logger.error(e)
            }
          }, 5000)
        })
    }
}


let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update ${file}`))
	delete require.cache[file]
	require(file)
})

start()