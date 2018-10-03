let rollList = require('../helpers/loadwaifu').rollList;
let sqlite3 = require('sqlite3').verbose();
let Discord = require('discord.js');

exports.run = async (message, bot) => {

    // console.log(allSeries);
    let user = message.author;
    user.serverid = message.guild.id;

    let marryDAO = {
        userid: user.id.toString(),
        serverid: user.serverid.toString()
    };

    let msg = '';

    //TODO: Move sql call into DBhelper
    let db = new sqlite3.Database('./waifu.db', err => {
        db.all(`SELECT waifuCode, claimedAmount FROM claimedList WHERE userid='${marryDAO.userid}' 
            AND serverid='${marryDAO.serverid}'`, (err, rows) => {

            if (rows === undefined) {
                message.channel.send(`<@${message.author.id}>\nYou do not have any waifus`);
                return;
            }
            rows.forEach((row) => {
                let splitWaifuCode = row.waifuCode.split('_');
                let waifuSeries = rollList.metaData[splitWaifuCode[0]];

                let shouldAddExtraTag = (waifuName) => {
                    if (rollList.duplicateWaifuList.hasOwnProperty(waifuName)) return true;
                    return false;
                };
                let waifuID = `${splitWaifuCode[1]}${shouldAddExtraTag(splitWaifuCode[1]) ? ` ${waifuSeries.extraTag.toLowerCase()}` : `` }`.trim();
                console.log(waifuID);
                let waifuInfo = rollList.allWaifu[waifuID];

                msg += `\n**[Lv.${row.claimedAmount}]** ${waifuInfo.name}`
            });

            let emb = new Discord.RichEmbed()
                .setTitle(`${user.username}'s waifus`)
                .setDescription(msg);

            message.channel.send(emb).then();
        });

    });

};

exports.conf = {
    name: "My Marry",
    fullcmd: "mymarry",
    alias: "mm",
    description: "Show all your claimed waifus",
    timer: 500
}