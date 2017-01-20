const Discord = require('discord.js');
const cleverbot = require('cleverbot.io');
const http = require('http');
const https = require('https');
const client = new Discord.Client();
const ytdl = require('ytdl-core');
const url = require('url');
const fs = require('fs');

var askCleverBot
var APIsReady = false;

var keys = fs.readFile('../keys.json', 'utf8', (err, data) => {
  if (err) throw err;
  keys = JSON.parse(data);
  console.log('done');
  client.login(keys.discordToken);
  const chatbot = new cleverbot(keys.cleverbotUser, keys.cleverbotKey);
  chatbot.setNick('discordCharlieBot');
  chatbot.create(function (err, session) {});
  askCleverBot = function(query, msg) {
    chatbot.ask(query, function (err, response) {
      if (response != 'Error, the reference "" does not exist') {
        msg.reply(response);
      }else {
      }
    });
  }
  APIsReady = true;
  return keys;
});

var musicPlaying = false;
var musicQueue = [];
var globalConnection
var globalDispatcher

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
  client.user.setGame('!help');
});

client.on('disconnect', () => {
  console.log('disconnected!');
});

function httpReq(APIUrl, action){
  http.get(APIUrl, function(res){
    var body = '';
    res.on('data', function(chunk){
      body += chunk;
    });
    res.on('end', function(){
      action(JSON.parse(body));
    });
  }).on('error', function(e){
    console.log("Got an error: ", e);
  });
}

function httpsReq(APIUrl, action){
  https.get(APIUrl, function(res){
    var body = '';
    res.on('data', function(chunk){
      body += chunk;
    });
    res.on('end', function(){
      action(JSON.parse(body));
    });
  }).on('error', function(e){
    console.log("Got an error: ", e);
  });
}

function playMusic(info){
  var vid = info[0];
  var parsedUrl = info[1];
  var message = info[2];
  var ytUrl = "https://www.googleapis.com/youtube/v3/videos?id=" + parsedUrl.query.slice(2) + "&key=" + keys.youtubeKey + "&fields=items(snippet(title))&part=snippet"

  httpsReq(ytUrl, function(response){
    var title = response.items[0].snippet.title
    message.channel.send('**Now playing:** ' + title + " || *added by: " + message.author.username + '.*');
  });
  message.member.voiceChannel.join().then(connection => {
    globalConnection = connection;
    const stream = ytdl(vid, {filter : 'audioonly'});
    const dispatcher = connection.playStream(stream);
    globalDispatcher = dispatcher;
    dispatcher.on('end', reason => {
      console.log('song ended');
      if (musicQueue.length > 0) {
        playMusic(musicQueue.shift());
      }else {
        connection.disconnect();
        musicPlaying = false;
      }
    });
  });
}

client.on('message', message => {
  if (message.author.bot !== true) {
    if (message.toString().slice(0,1).trim() == '!') { //This means the message may be a command
      var msg = message.toString().slice(1).toLowerCase();
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
          message.channel.send('Invite me to your server! https://discordapp.com/oauth2/authorize?client_id=270625647464939521&scope=bot&permissions=3173377');
          commandIssued = true;
        }else if (msg === 'help') {
          message.channel.send('__Charlie Help__ \n*All commands must begin with a "!"* \n \n **!help** - Full list of commands. \n **!ping** - If Charlie is working, replies with \"pong!\" \n **!marco** - polo! \n **!avatar** [user] - Displays the mentioned user\'s avatar, or your own if no user is mentioned. \n **!owner** - Relays the owner of the server. \n **!invite** - Want to add Charlie to your own server? \n **!ud** [word/term] - Look up a word or term on Urban Dictionary. \n **!yt/youtube** [url] - Plays the youtube audio in the channel you are in. If something is already playing, your audio will be added to the queue. \n **!stop** - Stops playing audio and clears the queue. \n **!skip** - Skips the current audio and moves to the next item in the queue. \n \n *Any other message started with "!" will chat with Cleverbot!*');
          commandIssued = true;
        }else if (msg === 'stop' && globalConnection != undefined) {
          globalConnection.disconnect();
          message.channel.send('Stopped. Items that were still in queue: ' + musicQueue.length);
          commandIssued = true;
        }else if (msg === 'skip' && globalConnection != undefined && musicPlaying) {
          globalDispatcher.end();
          commandIssued = true;
        }
      }

      else if (args.length >= 2) {
        args.forEach(function(arg, index){ //loop for commands with atleast one argument
          if (commandIssued === false && APIsReady) {
            if (arg === 'avatar') {
              if (message.mentions.users.firstKey() != undefined && args[index + 1].slice(2, 20) === message.mentions.users.first().id) {
                message.channel.send(message.mentions.users.first().avatarURL);
                commandIssued = true;
              }
            }else if (arg === 'ud' && args[index + 1]) {
              var searchTerm = args.slice(1).join('+');
              var udUrl = 'http://api.urbandictionary.com/v0/define?term=' + searchTerm;
              commandIssued = true;

              function sendUdMsg(udResponse){
                if (udResponse.result_type != 'no_results') {
                  message.channel.send('__Urban Dictionary__\n**' + udResponse.list[0].word + ':**' + '```\n' + udResponse.list[0].definition + '\n```\n \n **example:**\n```' + udResponse.list[0].example + '\n```');
                }else {
                  message.channel.send('No results for word or term.');
                }
              }

              httpReq(udUrl, sendUdMsg);

            }else if (arg === 'yt' || arg === 'youtube' && args[index + 1] && message.member.voiceChannel != undefined) {
              var vid = message.content.split(' ')[1]
              var parsedUrl = url.parse(vid)
              //console.log(parsedUrl);
              if (parsedUrl.hostname === 'www.youtube.com' && parsedUrl.query != null) {
                if (musicPlaying == false) {
                  commandIssued = true;
                  musicPlaying = true;
                  message.delete()
                    .then(msg => console.log(`Deleted message from ${msg.author}`))
                    .catch(console.error);
                  playMusic([vid, parsedUrl, message]);
                }else {
                  musicQueue.push([vid, parsedUrl, message]);
                  var ytUrl = "https://www.googleapis.com/youtube/v3/videos?id=" + parsedUrl.query.slice(2) + "&key=" + keys.youtubeKey + "&fields=items(snippet(title))&part=snippet"

                  httpsReq(ytUrl, function(response){
                    var title = response.items[0].snippet.title
                    message.channel.send(title + ' has been added to queue position ' + musicQueue.length);
                  });
                  message.delete()
                    .then(msg => console.log(`Deleted message from ${msg.author}`))
                    .catch(console.error);
                  commandIssued = true;
                }
              }else {
                if (args[index + 1] == 'stop') {
                  globalConnection.disconnect();
                  message.channel.send('Stopped. Items that were still in queue: ' + musicQueue.length);
                  commandIssued = true;
                }else if (message.embeds[0] == undefined) {
                  message.reply('Invalid URL');
                  commandIssued = true;
                }
              }
            }
          }
        });
      }

      if (commandIssued === false) {
        askCleverBot(message.toString().slice(22), message);
      }
    }

    var msg = message.content.toLowerCase();

    if (msg.includes('shut up')) {
      message.reply('bad day?');
    }else if (msg.includes('lasaga')) {
      message.reply('i ate those food');
    }else if (msg.includes('fridge')) {
      message.reply('http://prnt.sc/dwk6q3');
    }else if (msg.includes('green')) {
      message.reply('green is not a creative color');
    }else if (msg.includes('ayy lmao')) {
      message.reply('http://i.imgur.com/m7NaGVx.gif');
    }
  }
});
