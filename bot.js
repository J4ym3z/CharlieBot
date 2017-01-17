const Discord = require('discord.js');
const cleverbot = require('cleverbot.io');

const chatbot = new cleverbot("ATbnnWU2C4okaHVT", "GyGHH3l6gnL0jwlyiNf8rx1IncVMcdSO");
const client = new Discord.Client();

client.login('MjcwNjI1NjQ3NDY0OTM5NTIx.C16tsQ.Bz9vx9AkpV4G6iYvLK6FQfdENdI');

chatbot.setNick("discordCharlieBot")
chatbot.create(function (err, session) {

});

function askCleverBot(query, msg) {
  chatbot.ask(query, function (err, response) {
    //console.log(response);
    if (response != 'Error, the reference "" does not exist') {
      msg.reply(response);
    }else {
      //console.log('cleverbot.io returned an error');
    }
  });
}

function timeNow() {
  var d = new Date(),
      h = (d.getHours()<10?'0':'') + d.getHours(),
      m = (d.getMinutes()<10?'0':'') + d.getMinutes();
      var suffix = 'am';
      if (h > 12){
        suffix = 'pm'
        h = h - 12
      }
  return h + ':' + m + suffix;
}

client.on('ready', () => {
  console.log('I am ready!');
});

client.on('message', message => {
  if (message.author.bot !== true) {

    if (message.toString().slice(0,22).trim() == '<@270625647464939521>') { //This means the message may be a command

      var msg = message.toString().slice(22).toLowerCase();

      if (msg === 'ping') {
        message.channel.send('ping');
      }else if (msg === 'you died.') {
        message.channel.send('idk man');
      }else if (msg === 'owner') {
        message.channel.send('The owner of this server is \"' + message.channel.guild.owner.displayName + '\" the almighty');
      }else if (msg === 'time') {
        message.channel.send('It is currently ' + timeNow() + ' EST');
      }else if (msg === 'avatar') {
        var avatar = message.author.avatarURL;
        if (avatar != null) {
          message.channel.send(avatar);
        }
      }else {
        askCleverBot(message.toString().slice(22), message);
      }
    }

    var msg = message.content.toLowerCase();

    if (msg.includes('lie') || msg.includes('liar')){
      message.reply('its true it\'s from jacksfilms');
    }else if (msg.includes('shut up')) {
      message.reply('bad day?');
    }else if (msg.includes('lasaga')) {
      message.reply('i ate those food');
    }else if (msg.includes('fridge')) {
      message.reply('http://prnt.sc/dwk6q3');
    }else if (msg === 'fuck off') {
      message.reply('https://i.imgur.com/XkGB8qV.gif');
    }else if (msg.includes('green')) {
      message.reply('green is not a creative color');
    }

  }

  else {
    //console.log(message.toString().slice(0,22));
  }

});
