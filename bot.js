const Discord = require('discord.js');
const cleverbot = require('cleverbot.io');
const http = require('http');

const chatbot = new cleverbot('ATbnnWU2C4okaHVT', 'GyGHH3l6gnL0jwlyiNf8rx1IncVMcdSO');
const client = new Discord.Client();

client.login('MjcwNjI1NjQ3NDY0OTM5NTIx.C16tsQ.Bz9vx9AkpV4G6iYvLK6FQfdENdI');

chatbot.setNick('discordCharlieBot');
chatbot.create(function (err, session) {});

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

function timeNow(date) {
  var d = date,
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
      var args = msg.split(' ');

      var commandIssued = false;

      if (args.length === 1) { //single word command
        if (msg === 'ping') {
          message.channel.send('pong!');
          commandIssued = true;
        }else if (msg === 'marco') {
          message.channel.send('polo!');
          commandIssued = true;
        }else if (msg === 'owner') {
          message.channel.send('The owner of this server is \"' + message.channel.guild.owner.displayName + '\" the almighty');
          commandIssued = true;
        }else if (msg === 'time') {
          message.channel.send(message.author.username + '\'s time is currently ' + timeNow(message.createdAt));
          commandIssued = true;
        }else if (msg === 'avatar') {
          var avatar = message.author.avatarURL;
          if (avatar != null) {
            message.channel.send(avatar);
            commandIssued = true;
          }
        }else if (msg === 'invite') {
          message.channel.send('Invite me to your server! https://discordapp.com/oauth2/authorize?client_id=270625647464939521&scope=bot&permissions=8');
          commandIssued = true;
        }else if (msg === 'help') {
          message.channel.send('__Charlie Help__ \n*All commands must begin with a mention of @Charlie* \n \n **help** - Full list of commands. \n **ping** - If Charlie is working, replies with \"pong!\" \n **marco** - polo! \n **time** - Shows your computer\'s time. \n **avatar** [user] - Displays the mentioned user\'s avatar, or your own if no user is mentioned. \n **owner** - Relays the owner of the server. \n **invite** - Want to add Charlie to your own server? \n **ud** [word/term] - Look up a word or term on Urban Dictionary. \n \n *If you start a message by mentioning Charlie but no command is recognized, Charlie will reply as Cleverbot would!*');
          commandIssued = true;
        }
      }

      else if (args.length >= 2) {
        args.forEach(function(arg, index){ //loop for commands with atleast one argument
          if (commandIssued === false) {
            if (arg === 'avatar') {
              if (args[index + 1].slice(2, 20) === message.mentions.users.first().id) {
                message.channel.send(message.mentions.users.first().avatarURL);
                commandIssued = true;
              }
            }else if (arg === 'ud' && args[index + 1]) {

              var searchTerm = args.slice(1).join('+');

              var udUrl = 'http://api.urbandictionary.com/v0/define?term=' + searchTerm;

              commandIssued = true;
              //console.log('commandIssued is now true');

              http.get(udUrl, function(res){
                var body = '';
                res.on('data', function(chunk){
                    body += chunk;
                });
                res.on('end', function(){
                    var udResponse = JSON.parse(body);
                    if (udResponse.result_type != 'no_results') {
                      message.channel.send('__Urban Dictionary__\n**' + udResponse.list[0].word + ':**' + '```\n' + udResponse.list[0].definition + '\n```\n \n **example:**\n```' + udResponse.list[0].example + '\n```');
                    }else {
                      message.channel.send('No results for word or term.');
                    }
                });
              }).on('error', function(e){console.log("Got an error: ", e);});
            }
          }
        });
      }

      if (commandIssued === false) {
        //console.log('detecting commandIssued as false');
        askCleverBot(message.toString().slice(22), message);
      }

    }

    var msg = message.content.toLowerCase();

    if (msg.includes('lie') || msg.includes('liar')){
      //message.reply('its true it\'s from jacksfilms');
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
    }else if (msg.includes('ayy lmao')) {
      message.reply('http://i.imgur.com/m7NaGVx.gif');
    }

  }

  else {
    //console.log(message.toString().slice(0,22));
  }

});
