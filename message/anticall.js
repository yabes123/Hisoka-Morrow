"use strict";
let fs = require('fs')
let chalk = require('chalk')
let { getBuffer, tanggal } = require('../lib/myfunc')

module.exports = async function(hisoka, json) {
    if (!global.db.data.settings[hisoka.user.jid].anticall) return
	let creator = global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
    let { from } = json[2][0][1]
    let id = json[2][0][2][0][1]["call-id"]
    await hisoka.rejectIncomingCall(from, id)
    hohe = await hisoka.sendText(from, `「 *AUTO REJECT* 」\n\nMaaf Saat Ini Kami Tidak Dapat Menerima Panggilan Dari Siapapun, Silahkan Hubungi Nanti!`, '')
    heho = await hisoka.sendContactArray(from, creator, { quoted: hohe })
    hisoka.sendText(from, 'Nih Kontak Ownerku, Hubungi Kalo Ada Perlu Kalo gabut skip aja', heho)
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update ${file}`))
	delete require.cache[file]
	require(file)
})