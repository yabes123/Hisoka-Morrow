require('./config')
let util = require('util')
let fs = require('fs')
let chalk = require('chalk')
let { fetchJson, fetchText, getBuffer, tanggal, getGroupAdmins, clockString, runtime, formatp, jsonformat, getRandom, sleep } = require('./lib/myfunc')
let { TelegraPh, UploadFileUgu, webp2mp4File } = require('./lib/uploader')
let { WAConnection: _WAConnection, MessageOptions, GroupSettingChange, mentionedJid, newMessagesDB, MessageType, WAMessageProto } = require("@adiwajshing/baileys")
let speed = require('performance-now')
let os = require('os')
let { performance } = require('perf_hooks')
let { exec, spawn, execSync } = require("child_process")
let moment = require('moment-timezone')
let ffmpeg = require('fluent-ffmpeg')
let { hentaiimg, hentaivid } = require('./plugins/hentai')
let { pinterest } = require('./plugins/search')


module.exports = hisoka = async (hisoka, m, chatUpdate) => {
    try {
        let totalchat = await hisoka.chats.all()
        let groupMetadata = m.isGroup ? await hisoka.groupMetadata(m.chat).catch(e => {}) : ''
        let groupMembers = m.isGroup ? await groupMetadata.participants : ''
        let groupAdmins = m.isGroup ? await getGroupAdmins(groupMembers) : ''
        let isBotAdmins = m.isGroup ? groupMembers.find(a => a.jid == hisoka.user.jid).isAdmin : false
        let isAdmin = m.isGroup ? groupMembers.find(a => a.jid == m.sender).isAdmin : false
        let isMedia = /image|video|sticker|audio/.test(m.quoted ? m.quoted.mtype : m.mtype)
        let isVideo = (m.quoted ? m.quoted.mtype : m.mtype) == 'videoMessage'
        let isImage = (m.quoted ? m.quoted.mtype : m.mtype) == 'imageMessage'
        let isOwner = [hisoka.user.jid, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
        let isNumber = x => typeof x === 'number' && !isNaN(x)
        let budy = (typeof m.text == 'string' ? m.text : '')
        let quoted = m.quoted ? m.quoted : m
        let mime = (quoted.msg || quoted).mimetype || ''

        // Prefix
        if (hisoka.multipref) {
            var prefix = /^[°•π÷×¶∆£¢€¥®™✓|~zZ+×!#%^&./\\©^]/.test(budy) ? budy.match(/^[°•π÷×¶∆£¢€¥®™✓|~zZ+×!#,|`÷?;:%abcdefghijklmnopqrstuvwxyz%^&./\\©^]/gi)[0]: global.prefix
        } else {
            if (hisoka.noprefix) {
                prefix = ''
            } else {
                prefix = hisoka.prefa
            }
        }
        let body = m.mtype === 'conversation' && m.message.conversation.startsWith(prefix) ? m.message.conversation : m.mtype === 'imageMessage' && m.message.imageMessage.caption.startsWith(prefix) ? m.message.imageMessage.caption : m.mtype === 'videoMessage' && m.message.videoMessage.caption.startsWith(prefix) ? m.message.videoMessage.caption : m.mtype === 'extendedTextMessage' && m.message.extendedTextMessage.text.startsWith(prefix) ? m.message.extendedTextMessage.text : ""

        // Database
        try {
            let user = global.db.data.users[m.sender]
            if (typeof user !== 'object') global.db.data.users[m.sender] = {}
            if (user) {
                if (!('banned' in user)) user.banned = false
                if (!isNumber(user.warning)) user.warning = 0
            } else global.db.data.users[m.sender] = {
                banned: false,
                warning: 0,
            }

            let chat = global.db.data.chats[m.chat]
            if (typeof chat !== 'object') global.db.data.chats[m.chat] = {}
            if (chat) {
                if (!('welcome' in chat)) chat.welcome = true
				if (!('detect' in chat)) chat.detect = true
                if (!('antidel' in chat)) chat.antidel = false
                if (!('antionce' in chat)) chat.antionce = true
                if (!('mute' in chat)) chat.mute = false
                if (!('antispam' in chat)) chat.antispam = true
				if (!('setDemote' in chat)) chat.setDemote = ''
				if (!('setPromote' in chat)) chat.setPromote = ''
				if (!('setWelcome' in chat)) chat.setWelcome = ''
				if (!('setLeave' in chat)) chat.setLeave = ''
            } else global.db.data.chats[m.chat] = {
                welcome: true,
                detect: true,
                antidel: false,
                antionce: true,
                antispam: true,
                mute: false,
                setDemote: '',
                setPromote: '',
                setWelcome: '',
                setLeave: '',
            }

            let setting = global.db.data.settings[hisoka.user.jid]
            if (typeof setting !== 'object') global.db.data.settings[hisoka.user.jid] = {}
            if (setting) {
                if (!('anticall' in setting)) setting.anticall = true
                if (!isNumber(setting.status)) setting.status = 0
            } else global.db.data.settings[hisoka.user.jid] = {
                anticall: true,
                status: 0,
            }

        } catch (err) {
            console.log(err)
        }

        let args = body.trim().split(/ +/).slice(1)
        let command = body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase()
        let isCmd = body.startsWith(prefix)
        let text = q = args.join(' ')
        
        // Info Server
        let used = process.memoryUsage()
        let private = await hisoka.chats.array.filter(v => v.jid.endsWith('s.whatsapp.net'))
        let groups = await hisoka.chats.array.filter(v => v.jid.endsWith('g.us'))
        let groupsIn = await groups.filter(v => !v.read_only)
        let ram = `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)} MB`

        // Push To Console
        if (m.message) {
            console.log(chalk.black(chalk.bgWhite('[ PESAN ]')), chalk.black(chalk.bgGreen(tanggal(new Date))), chalk.black(chalk.bgBlue(budy || m.mtype)) + '\n' + chalk.magenta('=> Dari'), chalk.green(hisoka.getName(m.sender)), chalk.yellow(m.sender) + '\n' + chalk.blueBright('=> Di'), chalk.green(m.isGroup ? hisoka.getName(m.chat) : 'Private Chat', m.chat))
        }

        // Command With Media 
        if (isMedia && m.msg.fileSha256 && (m.msg.fileSha256.toString('base64') in global.db.data.sticker)) {
        let hash = global.db.data.sticker[m.msg.fileSha256.toString('base64')]
        let { text, mentionedJid } = hash
        hisoka.emit('chat-update', {
            ...chatUpdate,
            messages: newMessagesDB([
                hisoka.cMod(m.chat,
                    await hisoka.prepareMessage(m.chat, text, MessageType.extendedText, {
                        contextInfo: {
                            mentionedJid
                        },
                        ...(m.quoted ? { quoted: m.quoted.fakeObj } : {}),
                        messageId: m.id,
                    }),
                    text,
                    m.sender
                    )
                ])
            })
        }

        // Buttons Response
        if (m.mtype === 'buttonsResponseMessage' && m.type !== 1) {
        hisoka.emit('chat-update', {
            ...chatUpdate,
            messages: newMessagesDB([
                hisoka.cMod(m.chat,
                    await hisoka.prepareMessage(m.chat, m.msg.selectedButtonId ? m.msg.selectedButtonId : m.msg.selectedDisplayText, MessageType.extendedText, {
                        contextInfo: {
                            mentionedJid: m.msg.contextInfo && m.msg.contextInfo.mentionedJid ? m.msg.contextInfo.mentionedJid : []
                        },
                        ...(m.quoted ? { quoted: m.quoted.fakeObj } : {}),
                        messageId: m.id,
                    }),
                    m.msg.selectedButtonId ? m.msg.selectedButtonId : m.msg.selectedDisplayText,
                    m.sender
                    )
                ])
            })
        }

        // Anti viewOnceMessage
        if (quoted.mtype == 'viewOnceMessage') {
            if (!db.data.chats[m.chat].antionce) return
            teks = `
「 *Anti ViewOnce Message* 」

⭔ Nama : ${hisoka.getName(m.sender)} 
⭔ Nomer : @${m.sender.split("@")[0]}
⭔ Jam : ${moment.tz('Asia/Jakarta').format('HH:mm:ss')} WIB
⭔ Pada : ${tanggal(new Date())}`
			hisoka.sendTextWithMentions(m.chat, teks, m)
            hisoka.copyNForward(m.chat, await hisoka.loadMessage(m.chat, quoted.id), false, { readViewOnce: true })
        }

        // Anti Spam
        if (db.data.chats[m.chat].antispam) {
            if (m.isBaileys && m.fromMe) return
            this.spam = this.spam ? this.spam : {}
            if (!(m.sender in this.spam)) {
                let spamming = {
                    jid: m.sender,
                    spam: 0,
                    lastspam: 0
                }
                this.spam[spamming.jid] = spamming
            } else try {
                this.spam[m.sender].spam++
                if (new Date - this.spam[m.sender].lastspam > 4000) {
                    if (this.spam[m.sender].spam > 6) {
                        this.spam[m.sender].spam = 0
                        this.spam[m.sender].lastspam = new Date * 1
                        hisoka.sendText(from, `Jangan Spam @${this.spam[m.sender].jid.split("@")[0]}`, m, { contextInfo: { mentionedJid: [this.spam[m.sender].jid] } })
                    } else {
                        this.spam[m.sender].spam = 0
                        this.spam[m.sender].lastspam = new Date * 1
                    }
                }
            } catch (err) {
                console.log(err)
            }
        }

        // Auto Clear Ketika Ada Pesan Tidak Detec Di WhatsApp Web
        if (m.messageStubType === 68) {
            let log = {
                key: m.key,
                content: m.msg,
                sender: m.sender
            }
            await hisoka.modifyChat(m.chat, 'clear', {
                includeStarred: false
            }).catch(console.log)
        }

        // Afk

        // Auto Update Bio
        if (new Date() * 1 - db.data.settings[hisoka.user.jid].status > 1000) {
            uptime = runtime(process.uptime())
            await hisoka.setStatus(`Active For ${uptime} || ${hisoka.user.name}`).catch(_ => _)
            db.data.settings[hisoka.user.jid].status = new Date() * 1
        }

        // Detect User Banned
        if (db.data.users[m.sender].banned && isCmd) {
            await hisoka.sendText(m.chat, `Maaf @${m.sender.split("@")[0]} Anda Telah Dibanned, Chat Owner Untuk Un Banned`, m, { contextInfo: { mentionedJid: [m.sender] }})
            //heho = await hisoka.sendContactArray(from, owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net'), { quoted: ano })
            //hisoka.sendText(from, 'Nih Kontak Ownerku, Maaf Kalo Orangnya Kek Kntl', heho)
            return
        }

        // Mute Chat Bot
        if (db.data.chats[m.chat].mute) {
            if (!mek.key.fromMe && !isOwner && !isAdmin) return
            if (budy.toLowerCase().startsWith(prefix + 'unmute')) {
                db.data.chats[m.chat].mute = false
                m.reply('Bot Telah Di Unmute Di '+m.chat)
            } else if (budy.toLowerCase().startsWith(prefix + 'mute')) {
                db.data.chats[m.chat].mute = true
                m.reply('Bot Telah Dimute Di '+m.chat)
            }
        }

        // Case Command
        switch(command) {
            case 'pinterest': {
                m.reply(mess.wait)
                let result = await pinterest(text)
                let url = result[Math.floor(Math.random() * result.length)]
                hisoka.sendImage(m.chat, url, command + ' ' + text, m)
            }
            break
            case 'milf': case 'yaoi': case 'oneesan': case 'shota': case 'ass': case 'anal': case 'ass': case 'pussy': case 'paizuri': case 'tentacle': case 'boobs': case 'yaoi': {
                m.reply(mess.wait)
                let result = await hentaiimg(command)
                let url = result.hasil[Math.floor(Math.random() * result.hasil.length)]
                hisoka.sendImage(m.chat, url, command, m)
            }
            break
            case 'hentai': {
                m.reply(mess.wait)
                let result = await hentaivid()
                await hisoka.sendVideo(m.chat, result.hasil.video_1, `⭔ *Title :* ${result.hasil.title}\n⭔ *Views :* ${result.hasil.views_count}\n⭔ *Share :* ${result.hasil.share_count}\n⭔ *Category :* ${result.hasil.category}\n⭔ *Source :* ${result.hasil.link}`, m)
            }
            break
	    case 'sticker': case 's': case 'stickergif': {
                if (!quoted) throw `Balas Video/Image Dengan Caption ${prefix + command}`
                m.reply(mess.wait)
                if ((isMedia && quoted.mtype === 'imageMessage') && args.length == 0) {
                    let media = await quoted.download()
                    await hisoka.sendImageAsSticker(m.chat, media, m, { packname: text.split('|')[0] ? text.split('|')[0] : global.packname, author: text.split('|')[1] ? text.split('|')[1] : global.author })
                    fs.unlinkSync(media)
		} else if ((isMedia && quoted.mtype === 'videoMessage') && args.length == 0) {
                    let media = await quoted.download()
                    await hisoka.sendVideoAsSticker(m.chat, media, m, { packname: text.split('|')[0] ? text.split('|')[0] : global.packname, author: text.split('|')[1] ? text.split('|')[1] : global.author })
                    fs.unlinkSync(media)
		} else {
                    throw `Kirim Gambar/Video Dengan Caption ${prefix + command}\nDurasi Video 1-9 Detik`
                }
            }
            break
            case 'toimage': case 'toimg': {
                if (!quoted) throw 'Reply Media!'
                if (!/webp/.test(mime)) throw `balas stiker dengan caption *${prefix + command}*`
                m.reply(mess.wait)
                let encmedia = await JSON.parse(JSON.stringify(m).replace('quotedM','m')).message.extendedTextMessage.contextInfo
                let media = await hisoka.downloadAndSaveMediaMessage(encmedia)
                let ran = await getRandom('.png')
                exec(`ffmpeg -i ${media} ${ran}`, (err) => {
                    fs.unlinkSync(media)
                    if (err) throw err
                    let buffer = fs.readFileSync(ran)
                    hisoka.sendImage(m.chat, buffer, 'Sticker To Image', m)
                    fs.unlinkSync(ran)
                })
            }
            break
            case 'tovideo': case 'tomp4': {
                if (!quoted) throw 'Reply Media!'
                if (!/webp/.test(mime)) throw `balas stiker dengan caption *${prefix + command}*`
                m.reply(mess.wait)
                let encmedia = await JSON.parse(JSON.stringify(m).replace('quotedM','m')).message.extendedTextMessage.contextInfo
                let media = await hisoka.downloadAndSaveMediaMessage(encmedia)
                let webpToMp4 = await webp2mp4File(media)
                await hisoka.sendVideo(m.chat, webpToMp4.result, 'Sticker To Video', m)
                await fs.unlinkSync(media)
            }
            break
            case 'togif': {
                if (!quoted) throw 'Reply Media!'
                if (!/webp/.test(mime)) throw `balas stiker dengan caption *${prefix + command}*`
                m.reply(mess.wait)
                let encmedia = await JSON.parse(JSON.stringify(m).replace('quotedM','m')).message.extendedTextMessage.contextInfo
                let media = await hisoka.downloadAndSaveMediaMessage(encmedia)
                let webpToMp4 = await webp2mp4File(media)
                await hisoka.sendGif(m.chat, webpToMp4.result, 'Sticker To Gif', m)
                await fs.unlinkSync(media)
            }
            break
            case 'self': {
                if (!isOwner) throw mess.owner
                hisoka.public = false
                m.reply('Self Mode Activate')
            }
            break
            case 'public': {
                if (!isOwner) throw mess.owner
                hisoka.public = true
                m.reply('Public Mode Activate')
            }
            break
            case 'q': case 'quoted': {
                if (!quoted) throw 'Reply Pesannya'
                let sendq = await hisoka.serializeM(await m.getQuotedObj())
                if (!sendq.quoted) throw 'Pesan Yang Anda Reply Tidak Mengandung Reply'
                await sendq.quoted.copyNForward(m.chat, true)
            }
            break
            case 'owner': case 'developer': {
                let mowner = await hisoka.sendContactArray(m.chat, owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net'), { quoted: m })
                hisoka.sendText(m.chat, 'Tuh Kontak Ownerku, Maaf Kalo Orangnya Kek Kntl', mowner)
            }
            break
            case 'help': case 'menu': {
                let teks = `
┌──⭓ *Group Menu*
│
│⭔ ${prefix}add
│⭔ ${prefix}kick
│⭔ ${prefix}promote
│⭔ ${prefix}demote
│⭔ ${prefix}setsubject
│⭔ ${prefix}setdesc
│⭔ ${prefix}setprofile
│⭔ ${prefix}setwelcome
│⭔ ${prefix}setleave
│⭔ ${prefix}setpromote
│⭔ ${prefix}setdemote
│⭔ ${prefix}mute
│⭔ ${prefix}unmute
│⭔ ${prefix}warning
│⭔ ${prefix}delwarning
│⭔ ${prefix}cekwarning
│
└───────⭓

┌──⭓ *Converter Menu*
│
│⭔ ${prefix}toimage
│⭔ ${prefix}tovideo
│⭔ ${prefix}togif
│⭔ ${prefix}sticker
│
└───────⭓

┌──⭓ *Other Menu*
│
│⭔ ${prefix}ping
│⭔ ${prefix}owner
│⭔ ${prefix}self
│⭔ ${prefix}public
│⭔ ${prefix}q
│
└───────⭓

┌──⭓ *Search Menu*
│
│⭔ ${prefix}pinterest
│
└───────⭓

┌──⭓ *Nsfw Menu*
│
│⭔ ${prefix}hentai
│⭔ ${prefix}milf
│⭔ ${prefix}yaoi
│⭔ ${prefix}yuri
│⭔ ${prefix}oneesan
│⭔ ${prefix}shota
│⭔ ${prefix}ass
│⭔ ${prefix}tentacle
│⭔ ${prefix}anal
│⭔ ${prefix}ass
│⭔ ${prefix}boobs
│⭔ ${prefix}paizuri
│⭔ ${prefix}pussy
│
└───────⭓

┌──⭓ *Database Menu*
│
│⭔ ${prefix}setcmd
│⭔ ${prefix}delcmd
│⭔ ${prefix}listcmd
│⭔ ${prefix}lockcmd
│⭔ ${prefix}addmsg
│⭔ ${prefix}getmsg
│⭔ ${prefix}listmsg
│⭔ ${prefix}delmsg
│
└───────⭓
`
                hisoka.send2ButtonImg(m.chat, 'https://i.pinimg.com/736x/f0/f9/45/f0f9454b76640a6eee0f5dc1e6f30b94--my-husband.jpg', teks, 'Simple Bot By Dika Ardnt.', 'Speed Test', `${prefix}ping`, 'Owner This Bot', `${prefix}owner`, m, { contextInfo: { mentionedJid: hisoka.parseMention(teks), externalAdReply: { title: 'Hisoka Morrow', body: 'Kanji : ヒソカ゠モロウ\nRomaji : Hisoka Morrou\nGender : Male\nBirthday : 6 June\nAge : Unknown', mediaType: 'VIDEO', mediaType: 2, thumbnail: await getBuffer('https://i.pinimg.com/736x/f0/f9/45/f0f9454b76640a6eee0f5dc1e6f30b94--my-husband.jpg'), mediaUrl: 'https://youtu.be/mtuLEP4lNhE' }} })
            }
            break
            case 'ping': case 'speed': case 'botstat': case 'statusbot': {
                let timestamp = speed()
                let latensi = speed() - timestamp
                neww = performance.now()
                oldd = performance.now()
                respon = `Kecepatan Respon ${latensi.toFixed(4)} _Second_ \n ${oldd - neww} _miliseconds_\n\nRuntime : ${runtime(process.uptime())}
					
💬 Status Bot
- *${groups.length}* Group
- *${groupsIn.length}* Group Join
- *${groups.length - groupsIn.length}* Group Left
- *${totalchat.length - groups.length}* Personal Chats
- *${totalchat.length}* Total Chats

⚒️ Setting Bot
- *Anti Call :* ${db.data.settings[hisoka.user.jid].anticall ? 'Active' : 'Non-Active'}

📱 Info SmartPhone
- *Batterai :* ${hisoka.battery != undefined ? `${hisoka.battery.value}% ${hisoka.battery.live ? 'Charger' : 'Discharger'}` : 'Now Loading...'}
\`\`\` ${util.format(hisoka.user.phone)} \`\`\`

💻 Info Server
RAM: ${formatp(os.totalmem() - os.freemem())} / ${formatp(os.totalmem())}

_NodeJS Memory Usaage_
${Object.keys(used).map((key, _, arr) => `${key.padEnd(Math.max(...arr.map(v=>v.length)),' ')}: ${formatp(used[key])}`).join('\n')}

`.trim()
                hisoka.sendText(m.chat, respon, m)
            }
            break
            case 'setcmd': {
                global.db.data.sticker = global.db.data.sticker || {}
                if (!m.quoted) throw 'Reply Pesan!'
                if (!m.quoted.fileSha256) throw 'SHA256 Hash Missing'
                if (!text) throw `Untuk Command Apa?`
                let sticker = global.db.data.sticker
                let hash = m.quoted.fileSha256.toString('base64')
                if (sticker[hash] && sticker[hash].locked) throw 'You have no permission to change this sticker command'
                sticker[hash] = {
                    text,
                    mentionedJid: m.mentionedJid,
                    creator: m.sender,
                    at: + new Date,
                    locked: false,
                }
                m.reply(`Done!`)
            }
            break
            case 'delcmd': {
                let hash = m.quoted.fileSha256.toString('base64')
                if (!hash) throw `Tidak ada hash`
                let sticker = global.db.data.sticker
                if (sticker[hash] && sticker[hash].locked) throw 'You have no permission to delete this sticker command'
                delete sticker[hash]
                m.reply(`Done!`)
            }
            break
            case 'listcmd': {
                let teks = `
*List Hash*
Info: *bold* hash is Locked

${Object.entries(global.db.data.sticker).map(([key, value], index) => `${index + 1}. ${value.locked ? `*${key}*` : key} : ${value.text}`).join('\n')}
`.trim()
                hisoka.sendText(m.chat, teks, m, { contextInfo: { mentionedJid: Object.values(global.db.data.sticker).map(x => x.mentionedJid).reduce((a,b) => [...a, ...b], []) }})
            }
            break
            case 'lockcmd': {
                if (!m.quoted) throw 'Reply Pesan!'
                if (!m.quoted.fileSha256) throw 'SHA256 Hash Missing'
                let sticker = global.db.data.sticker
                let hash = m.quoted.fileSha256.toString('base64')
                if (!(hash in sticker)) throw 'Hash not found in database'
                sticker[hash].locked = !/^un/i.test(command)
                m.reply('Done!')
            }
            break
            case 'addmsg': {
                let M = WAMessageProto.WebMessageInfo
                if (!quoted) throw 'Reply Pesan'
                let msgs = global.db.data.database
                if (text.toLowerCase() in msgs) throw `'${text}' telah terdaftar di list pesan`
                msgs[text] = M.fromObject(await m.getQuotedObj()).toJSON()
                m.reply(`Berhasil menambahkan pesan di list pesan sebagai '${text}'
    
Akses dengan ${prefix}getmsg ${text}
atau langsung ketik teksnya`)
            }
            break
            case 'getmsg': {
                if (!text) throw `Gunakan *${prefix}listmsg* untuk melihat list nya`
                let msgs = global.db.data.database
                if (!(text.toLowerCase() in msgs)) throw `'${text}' tidak terdaftar di list pesan`
                let _m = hisoka.serializeM(JSON.parse(JSON.stringify(msgs[text.toLowerCase()]), (_, v) => {
                    if (
                        v !== null &&
                        typeof v === 'object' &&
                        'type' in v &&
                        v.type === 'Buffer' &&
                        'data' in v &&
                        Array.isArray(v.data)) {
                        return Buffer.from(v.data)
                    }
                    return v
                }))
                await _m.copyNForward(m.chat, true)
            }
            break
            case 'listmsg': {
                let msgs = global.db.data.database
                let split = Object.entries(msgs).map(([nama, isi]) => { return { nama, ...isi } })
                let teks = '「 LIST DATABASE 」\n\n'
                for (let i of split) {
                    teks += `⬡ *Name :* ${i.nama}\n⬡ *Type :* ${Object.keys(i.message)[0]}\n────────────────────────\n\n`
                }
                m.reply(teks)
            }
            break
            case 'delmsg': {
                if (!text) throw `Gunakan *${prefix}listmsg* untuk melihat list nya`
                let msgs = global.db.data.database
                if (!(text.toLowerCase() in msgs)) throw `'${text}' tidak terdaftar di list pesan`
                delete msgs[text]
                m.reply(`Berhasil menghapus pesan di list pesan dengan nama '${text}'`)
            }
            break
            case 'warn': case 'warning': {
                if (!m.isGroup) throw mess.group
                if (!isBotAdmins) throw mess.botAdmin
                if (!isAdmin) throw mess.admin
                let mentioned = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? hisoka.user.jid : m.sender
                if (!mentioned) throw 'Tag Usernya!'
                let warn = global.db.data.users[mentioned].warning
                if (warn < 2) {
                    warn += 1
                    hisoka.sendTextWithMentions(m.chat, `Warning @${mentioned.split("@")[0]} Ditambah 1`, m)
                } else if (warn == 2) {
                    warn = 0
                    hisoka.sendTextWithMentions(m.chat, `Warning Kamu @${mentioned.split("@")[0]} Telah Memenuhi Standar Kick`, m)
                    await sleep(4000)
                    await hisoka.groupRemove(m.chat, [mentioned])
                    await hisoka.sendTextWithMentions(m.chat, `@${mentioned.split("@")[0]} Telah Dikeluarkan Karena Melanggar Peraturan Admin`, m)
                }
            }
            break
            case 'cekwarn': case 'cekwarning': {
                let mentioned = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? hisoka.user.jid : m.sender
                let warn = global.db.data.users[mentioned].warning
                hisoka.sendTextWithMentions(m.chat, `@${mentioned.split("@")[0]} Kamu Memiliki Total Warning : ${warn}`, m)
            }
            break
            case 'delwarn': case 'delwarning': {
                if (!m.isGroup) throw mess.group
                if (!isBotAdmins) throw mess.botAdmin
                if (!isAdmin) throw mess.admin
                let mentioned = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? hisoka.user.jid : m.sender
                if (!mentioned) throw 'Tag Usernya!'
                let warn = global.db.data.users[mentioned].warning
                if (warn > 0) {
                    warn -= 1
                    hisoka.sendTextWithMentions(m.chat, `Warning @${mentioned.split("@")[0]} Dikurangi 1`, m)
                } else if (warn == 0) {
                    hisoka.sendTextWithMentions(m.chat, `@${mentioned.split("@")[0]} Kamu Tidak Memiliki Warn`, m)
                }
            }
            break
            case 'setwelcome': {
                if (!m.isGroup) throw mess.group
                if (!isBotAdmins) throw mess.botAdmin
                if (!isAdmin) throw mess.admin
                if (!text) throw `Teksnya Mana? Contoh ${prefix + command} ${mess.example1}`
                global.db.data.chats[m.chat].setWelcome = text
                m.reply('Succes Change Caption Welcome')
            }
            break
            case 'setleave': {
                if (!m.isGroup) throw mess.group
                if (!isBotAdmins) throw mess.botAdmin
                if (!isAdmin) throw mess.admin
                if (!text) throw `Teksnya Mana? Contoh ${prefix + command} ${mess.example1}`
                global.db.data.chats[m.chat].setLeave = text
                m.reply('Succes Change Caption Leave')
            }
            break
            case 'setpromote': {
                if (!m.isGroup) throw mess.group
                if (!isBotAdmins) throw mess.botAdmin
                if (!isAdmin) throw mess.admin
                if (!text) throw `Teksnya Mana? Contoh ${prefix + command} ${mess.example1}`
                global.db.data.chats[m.chat].setPromote = text
                m.reply('Succes Change Caption Promote')
            }
            break
            case 'setdemote': {
                if (!m.isGroup) throw mess.group
                if (!isBotAdmins) throw mess.botAdmin
                if (!isAdmin) throw mess.admin
                if (!text) throw `Teksnya Mana? Contoh ${prefix + command} ${mess.example1}`
                global.db.data.chats[m.chat].setDemote = text
                m.reply('Succes Change Caption Demote')
            }
            break
            case 'setname': case 'setgroupname': case 'setsubject': {
                if (!m.isGroup) throw mess.group
                if (!isBotAdmins) throw mess.botAdmin
                if (!isAdmin) throw mess.admin
                await hisoka.groupUpdateSubject(m.chat, text).then((res) => m.reply(jsonformat(res))).catch((err) => m.reply(jsonformat(err)))
            }
            break
            case 'setdesc': case 'setdescgroup': case 'setdescription': {
                if (!m.isGroup) throw mess.group
                if (!isBotAdmins) throw mess.botAdmin
                if (!isAdmin) throw mess.admin
                await hisoka.groupUpdateDescription(m.chat, text).then((res) => m.reply(jsonformat(res))).catch((err) => m.reply(jsonformat(err)))
            }
            break
            case 'setprofile': case 'setppgroup': case 'setpp': {
                if (!m.isGroup) throw mess.group
                if (!isBotAdmins) throw mess.botAdmin
                if (!isAdmin) throw mess.admin
                if (/image/.test(mime)) {
                    let img = quoted.download()
                    if (!img) throw 'Image Tidak Ditemukan'
                    await hisoka.updateProfilePicture(m.chat, img).then((res) => m.reply(jsonformat(res))).catch((err) => m.reply(jsonformat(err)))
                }else throw `kirim/balas gambar dengan caption *${prefix + command}*`
            }
            break
            case 'add': {
                if (!m.isGroup) throw mess.group
                if (!isBotAdmins) throw mess.botAdmin
                if (!isAdmin) throw mess.admin
                let users = (await Promise.all(
					q.split(',')
					.map(v => v.replace(/[^0-9]/g, ''))
					.filter(v => v.length > 4 && v.length < 20 && !participants.includes(v + '@s.whatsapp.net'))
					.map(async v => [
						v,
						await hisoka.isOnWhatsApp(v + '@s.whatsapp.net')
					])
				)).filter(v => v[1]).map(v => v[0] + '@c.us')
				let response = await hisoka.groupAdd(m.chat, users)
				if (response[users] == 408) return hisoka.sendText(m.chat, `_Gagal!_\n\nNomor tersebut telah keluar baru² ini\nHanya bisa masuk lewat link grup`, m)
				let pp = await hisoka.getProfilePicture(m.chat).catch(_ => false)
				let jpegThumbnail = await getBuffer(pp)
				for (let user of response.participants.filter(user => Object.values(user)[0].code == 403)) {
					let [[jid, {
					invite_code,
					invite_code_exp
					}]] = Object.entries(user)
					let teks = `Mengundang @${jid.split`@`[0]} menggunakan invite...`
					m.reply(teks, null, {
						contextInfo: {
							mentionedJid: hisoka.parseMention(teks)
						}
					})
					await hisoka.sendGroupV4Invite(m.chat, jid, invite_code, new Date(new Date + (3 * 86400000)), false, 'Invitation to join my WhatsApp group', jpegThumbnail)
				}
            }
            break
            case 'kick': {
                if (!m.isGroup) throw mess.group
                if (!isBotAdmins) throw mess.botAdmin
                if (!isAdmin) throw mess.admin
                let ownerGroup = m.chat.split`-`[0] + '@s.whatsapp.net'
                let users = m.mentionedJid.filter(u => !(u == ownerGroup || u.includes(hisoka.user.jid)))
                for (let user of users) if (user.endsWith('@s.whatsapp.net')) await hisoka.groupRemove(m.chat, [user])
            }
            break
            case 'promote': {
                if (!m.isGroup) throw mess.group
                if (!isBotAdmins) throw mess.botAdmin
                if (!isAdmin) throw mess.admin
                let members = participants.filter(member => !member.isAdmin).map(member => member.jid)
                let users = m.mentionedJid.filter(user => members.includes(user))
                for (let user of users) await hisoka.groupMakeAdmin(m.chat, [user]).catch(console.log)
            }
            break
            case 'demote': {
                if (!m.isGroup) throw mess.group
                if (!isBotAdmins) throw mess.botAdmin
                if (!isAdmin) throw mess.admin
                let members = participants.filter(member => member.isAdmin).map(member => member.jid)
                let users = m.mentionedJid.filter(user => members.includes(user))
                for (let user of users) await hisoka.groupDemoteAdmin(m.chat, [user]).catch(console.log)
            }
            break
            default:
                if (budy.startsWith('=>')) {
                    if (!isOwner) return
                        function Return(sul) {
                            sat = JSON.stringify(sul, null, 2)
                            bang = util.format(sat)
                            if (sat == undefined) {
                                bang = util.format(sul)
                            }
                            return m.reply(bang)
                        }
                        try {
                            m.reply(util.format(eval(`(async () => { return ${budy.slice(3)} })()`)))
                         } catch (e) {
                            m.reply(String(e))
                         }
                }
                if (budy.startsWith('$')) {
                    if (!isOwner) return
                    exec(budy.slice(2), (err, stdout) => {
                        if (err) return m.reply(err)
                        if (stdout) m.reply(stdout)
                    })
                }
        }

    } catch (err) {
        m.reply(util.format(err.message ? `Error : `+err.message : err))
		console.log(err)
    }
}


let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update ${file}`))
	delete require.cache[file]
	require(file)
})
