"use strict";
let fs = require('fs')
let chalk = require('chalk')
let { getBuffer, tanggal } = require('../lib/myfunc')
let knights = require('knights-canvas')
let fetch = require('node-fetch')

module.exports = async function welkom(hisoka, anu) {
	let chat = global.db.data.chats[anu.jid] || {}
    console.log(anu)
    try {
        if (!chat.welcome) return
		let mdata = await hisoka.groupMetadata(anu.jid)
		let nume = anu.participants
        for (let num of nume) {
            let getName = await hisoka.getName(num)
            let getBio = await hisoka.getStatus(num.split("@")[0])

            // Get Profile User
            let ppuser
            try {
                ppuser = await hisoka.getProfilePicture(num.split("@")[0]+'@c.us')
            } catch {
                ppuser = 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg'
            }

            // Get Profile Group
            let ppgroup
            try {
                ppgroup = await hisoka.getProfilePicture(anu.jid)
            } catch {
                ppgroup ='https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg'
            }

            if (anu.action == 'add') {
                let welcome = await new knights.Welcome2()
                .setAvatar(ppuser)
                .setUsername(getName)
                .setBg(ppgroup)
                .setGroupname(mdata.subject)
                .setMember(mdata.participants.length)
                .toAttachment()
                let buffer = await welcome.toBuffer()
                let teks = (chat.setWelcome || hisoka.setWelcome || '```Selamat Datang Di Group @subject```\n─────────────────\n```Nama : @user```\n```Bio : @bio```\n```Pada : @tanggal```\n```Jangan Lupa Baca Rules Group```\n─────────────────\n```@desc```').replace(/@subject/g, mdata.subject).replace(/@user/g, `@${num.split('@')[0]}`).replace(/@bio/g, `${getBio.status}`).replace(/@tanggal/g, `${tanggal(new Date())}`).replace(/@desc/g, `${mdata.desc}`)
                hisoka.sendImage(mdata.id, buffer, teks, '', { contextInfo: { "mentionedJid": [num] } })
            } else if (anu.action == 'remove') {
                let leave = await new knights.Goodbye2()
                .setAvatar(ppuser)
				.setUsername(getName)
				.setBg(ppgroup)
				.setMember(mdata.participants.length)
				.toAttachment();
                let buffer = await leave.toBuffer()
                let teks = (chat.setLeave || '```Sayonara``` 👋\n─────────────────\n```Nama : @user```\n```Bio : @bio```\n```Pada : @tanggal```\n\nTelah Meninggalkan Group @subject').replace(/@user/g, `@${num.split('@')[0]}`).replace(/@bio/g, `${getBio.status}`).replace(/@tanggal/g, `${tanggal(new Date())}`).replace(/@subject/g, `${mdata.subject}`).replace(/@desc/g, `${mdata.desc}`)
				hisoka.sendImage(mdata.id, buffer, teks, '', { contextInfo: { "mentionedJid": [num] } })
            } else if (anu.action == 'promote') {
                let teks = (chat.setPromote || hisoka.setPromote || '「 *Promote Deteᴄted* 」\n\n```Nomor : @user```\n```Bio : @bio```\n```Group : @subject```\n\nTelah Menjadi Admin').replace(/@subject/g, mdata.subject).replace(/@user/g, `@${num.split('@')[0]}`).replace(/@bio/g, `${getBio.status}`).replace(/@tanggal/g, `${tanggal(new Date())}`).replace(/@desc/g, `${mdata.desc}`)
				let buffer = await getBuffer(ppuser)
                hisoka.sendImage(mdata.id, buffer, teks, '', { thumbnail: buffer, contextInfo: { "mentionedJid": [num] } })
            } else if (anu.action == 'demote') {
                let teks = (chat.setDemote || hisoka.setDemote || '「 *Demote Deteᴄted* 」\n\n```Nomor : @user```\n```Bio : @bio```\n```Group : @subject```\n\nTelah Di Unadmin').replace(/@subject/g, mdata.subject).replace(/@user/g, `@${num.split('@')[0]}`).replace(/@bio/g, `${getBio.status}`).replace(/@tanggal/g, `${tanggal(new Date())}`).replace(/@desc/g, `${mdata.desc}`)
				let buffer = await getBuffer(ppuser)
                hisoka.sendImage(mdata.id, buffer, teks, '', { thumbnail: buffer, contextInfo: { "mentionedJid": [num] } })
            }
        }
    } catch (err) {
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