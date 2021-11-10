"use strict";
let fs = require('fs')
let chalk = require('chalk')
let { getBuffer, tanggal } = require('../lib/myfunc')


module.exports = async function detect(hisoka, chat) {
    let setting = global.db.data.chats[chat.jid]
    if (!setting.detect) return
    console.log(chat)
    var group = await hisoka.groupMetadata(chat.jid)
    var participants = group.participants || []
    if (!chat.desc == '') {
        var tag = chat.descOwner.split('@')[0] + '@s.whatsapp.net'
        var teks = `「 Group Description Change 」\n\nDeskripsi Group telah diubah oleh\n⭔ Admin : @${chat.descOwner.split('@')[0]}${a}\n⭔ Pada : ${tanggal(new Date())}${a}\n⭔ Deskripsi Baru :\n ${chat.desc}`
        hisoka.sendText(group.id, teks, '', { contextInfo: { mentionedJid: hisoka.parseMention(teks) }})
    } else if (chat.announce == 'false') {
        var opengc = `「 Group Opened 」\n\nGroup Telah Dibuka Oleh Admin${a}\n_Sekarang Semua Member Bisa Mengirim Pesan_`
	    hisoka.sendText(group.id, opengc, '', { contextInfo: { mentionedJid: hisoka.parseMention(opengc) }})
    } else if(chat.announce == 'true') {
        var closegc = `「 Group Closed 」\n\nGroup Telah Ditutup Oleh Admin${a}\n_Sekarang Semua Member Tidak Dapat Mengirim Pesan_`
        hisoka.sendText(group.id, closegc, '', { contextInfo: { mentionedJid: participants.map(v => v.jid) }})
     } else if(chat.restrict == 'false'){
        teks = `「 Group Setting Change 」\n\nEdit Group info telah dibuka untuk member${a}\nSekarang semua member dapat mengedit info Group Ini`
        hisoka.sendText(group.id, teks, '', { contextInfo: { mentionedJid: participants.map(v => v.jid) }})
    } else if(chat.restrict == 'true'){
        teks = `「 Group Setting Change 」\n\nEdit Group info telah ditutup untuk member${a}\nSekarang hanya admin group yang dapat mengedit info Group Ini`
        hisoka.sendText(group.id, teks, '', { contextInfo: { mentionedJid: participants.map(v => v.jid) }})
    } else if(chat.subject == ''){
        teks = `「 Group Subject Change 」\n\nSubject Group telah diubah oleh\n⭔ Admin : @${chat.subjectOwner.split('@')[0]}${a}\n❒ Pada : ${tanggal(new Date())}${a}\n❒ Deskripsi Baru :\n ${chat.subject}`
        hisoka.sendText(group.id, teks, '', { contextInfo: { mentionedJid: hisoka.parseMention(teks) }})
    }
}


let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update ${file}`))
	delete require.cache[file]
	require(file)
})