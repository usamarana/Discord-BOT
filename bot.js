const Discord = require("discord.js");
const config = require("./config.json");
const bot = new Discord.Client({ disableEveryone: true });
const fs = require("fs");
const malapi = require("mal-api");
bot.commands = new Discord.Collection();
const malScraper = require("mal-scraper");
// const mute = require("./mutes.json");
// Requires all dependencies

// bot.msgs = require("./Commands/commands.json");
var servers = {};
const active = new Map();
var userData = JSON.parse(fs.readFileSync("Storage/userData.json", "utf8"));

/*Throws an error log if there is an issue somewhere in the commands*/
fs.readdir("./commands/", (err, files) => {
  if (err) console.log(err);

  let jsfile = files.filter(f => f.split(".").pop() === "js");
  if (jsfile.length <= 0) {
    console.log("No commands were found...");
    return;
  }
  /*Printing out a log indicating that all commands(classes) of the bot have connected*/
  jsfile.forEach((f, i) => {
    let props = require(`./commands/${f}`);
    console.log(`${f} loaded!`);
    bot.commands.set(props.help.name, props);
  });
});

bot.on("ready", async () => {

  /*Set bot's status to online/idle/dnd/invisible*/
  bot.user.setStatus("dnd");
  console.log(`${bot.user.username} idle`);

  /*To update the bot's status*/
  bot.user.setActivity("!help for more info", { type: "WATCHING" });

  /*This is to print out the list of all the discord servers which the bot is connected to in the terminal*/
  bot.guilds.forEach(guild => {
    console.log(guild.name);
    
    /*This prints out all of the available channels 'for each' server*/
    guild.channels.forEach(channel => {
      console.log(`  ${channel.name} ${channel.type} ${channel.id}`);
    });

    //client.user.setActivity(`Serving ${guild.memberCount} servers`);
    //General channel ID: 563422916310466601, 563461063765524480
  });
});

bot.on("message", async message => {
  if (message.author.bot) return;
  if (message.channel.type === "dm") return;

  let prefix = config.prefix;
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);

  let commandfile = bot.commands.get(cmd.slice(prefix.length));
  if (commandfile) commandfile.run(bot, message, args);
  let user = message.mentions.users.first() || message.author;
  // var chat = bot.channels.get("564216680440397845");
  // let chat = (message.channel.id = "564216680440397845");
  let channel = bot.channels.get("564216680440397845"); //Private channel ID where messages from all servers get stored

  let embed = new Discord.RichEmbed()
    .setColor("#4286f4")
    .addField("Full Username:", `${user.username}#${user.discriminator}`)
    .addField("Server Name:", `${message.guild.name}`)
    .addField("Channel Name:", `${message.channel.name}`)
    .addField("User Message:", `${message.content}`);

  channel.send({ embed });
  /*"Admin" user ID to be used for special commands only*/
  const usamaid = "195586705800167424";
  exports.usamaid = usamaid;

  // still in developmnet -----------------------------------

  if (!userData[user.id])
    userData[user.id] = {
      messageSent: 0,
      guildID: 0
    };

  if (message.guild.id == userData[user.id].guildID) {
    userData[user.id].guildID = message.guild.id;
    userData[user.id].messageSent++; // adds to messageSent, under the user
  }

  fs.writeFile("Storage/userData.json", JSON.stringify(userData), err => {
    if (err) console.log(err);
  });
});

bot.login(config.token);
