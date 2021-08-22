const Discord = require('discord.js')
const client = new Discord.Client

const fs = require('fs'); 

const suggestions = require('../gtv/suggestions');

const demographicsFunctions = require('./demographics');

async function uncomfy(reportChannelID, explanation) {
  try {
    let reportChannel = await client.channels.cache.get(reportChannelID);
    if (explanation == null) {
      reportChannel.send('Hi this is making someone uncomfy!');
    } else {
      let explanationRemoved = explanation.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
      explanationRemoved = Discord.Util.removeMentions(explanationRemoved);
      reportChannel.send(`Hi this is making someone uncomfy! (${explanationRemoved})`);
    }
    return true;
  } catch(e) {
    console.log(e);
    return false;
  }
}

async function demographics(group) {
  let guild;
  try {
    guild = await client.guilds.fetch('');
    console.log(guild);
  } catch(e) {
    console.log(e);
    return false;
  }
  let response = await demographicsFunctions[group](guild);
  return response;
}

async function anonConcernPost(details) {
  let desc = details['What is your concern?'][0];
  if (desc.length > 1200) {
    let contentTrim = desc.substring(0, Math.min(desc.length, 1200));
    contentTrim = contentTrim + '...';
    desc = contentTrim;
  }
  let embed = {
    title:`New Concern - ${details.Timestamp[0]}`,
    description:desc
  };
  client.api.channels('').messages.post({
    data: {
      embed: embed,
    }
  });
}

async function anonVentPost(details) {
  let embed = {};
  if (details['What would you like to title this Anonymous Vent/Confession?'][0] == "") {
      embed = {
          title:`New ${details['Is this a vent or a confession?'][0]} - ${details.Timestamp[0]}`,
          fields:[
              {
                  name:"Vent",
                  value:details['What would you like to say?'][0]
              }
          ]  
      };
  } else {
      embed = {
          title:`New ${details['Is this a vent or a confession?'][0]} - ${details.Timestamp[0]}`,
          fields:[
              {
                  name:"Title",
                  value:details['What would you like to title this Anonymous Vent/Confession?'][0]
              },
              {
                  name:"Vent",
                  value:details['What would you like to say?'][0]
              }
          ]  
      };
  }
  client.api.channels('').messages.post({
    data: {
        embed: embed,
        components: [{
          type: 1,
          components: [{
                  type: 2,
                  label: "Approve",
                  style: 3,
                  custom_id: "anon_vent_accept"
              },{
                  type: 2,
                  label: "Deny",
                  style: 4,
                  custom_id: "anon_vent_deny"
              }]
              
        }]
    }
  });
}

async function anonVent(message) {
  await client.api.channels('').messages.post({
    data: {
      embed: {
        title:`Anonymous${(message.embeds[0].title.replace(/\-(.*)/,'')).replace(/New/,'')}`,
        fields:message.embeds[0].fields
      }
    }
  });
  return true;
}

//async function anonQuestion(message) {
//  await client.api.channels('655798058189324299').messages.post({
//    data: {
//      embed: {
//        title:`Anonymous${(message.embeds[0].title.replace(/\-(.*)/,'')).replace(/New/,'')}`,
//        description:message.embeds[0].description
//      }
//    }
//  });
//  return true;
//}

async function anonSuggestionPost(details) {
  let embed = {
    title:`New Suggestion - ${details.Timestamp[0]}`
  };
  let suggestion = details['What is your suggestion?'][0];
  if (suggestion.length > 1200) {
      let contentTrim = suggestion.substring(0, Math.min(suggestion.length, 1200));
      contentTrim = contentTrim + '...'
      embed.description = contentTrim
  } else {
      embed.description = suggestion
  }
  client.api.channels('').messages.post({
      data: {
          embed: embed,
          components: [
              {
                  type: 1,
                  components: [
                      {
                          type: 2,
                          label: "Approve",
                          style: 3,
                          custom_id: "anon_suggestion_accept"
                      },
                      {
                          type: 2,
                          label: "Deny",
                          style: 4,
                          custom_id: "anon_suggestion_deny"
                      }
                  ]
              
              }
          ]
      }
  });
}

async function anonSuggestion(message) {
  let botstuff = client.channels.cache.get('');
  let outputchannel = client.channels.cache.get('');
  let settings = JSON.parse(fs.readFileSync('../gtv/data/suggestiondata.json'));
  let channel = client.channels.cache.get(settings.suggestionschannel);
  let suggestReq = await suggestions.anonymousSuggestion(message.embeds[0].description, channel);
  if (suggestReq.success = true) {
      suggestReq.message.react('');
      suggestReq.message.react('');
      suggestReq.message.react('');
      return;
  } else {
      botstuff.send(suggestReq.error);
      outputchannel.send('An error occured, please suggest manually.');
  }
}

async function verifPost(details) {
  let msg = new Discord.MessageEmbed
  msg.title = ('New Verification - ' + details.Timestamp[0])
  if (details["Reddit Username"][0] != '') {
      msg.addField("Reddit Username", details["Reddit Username"][0]);
  }
  if (details["Discord Username"][0] != '') {
      msg.addField("Discord Username", details["Discord Username"][0]);
  }
  msg.addField("Verification Photo", details["Please submit a selfie of yourself holding up a piece of paper to your face with your Reddit or Discord username on it. The paper should be creased or crumpled."][0]);
  if (details["(Optional) If you look to be close to, or over 20, you may wish to also attach a photo of an official document/ID that shows your date of birth. If you do not submit this and we are uncertain that you are aged under 20, we may contact you to follow up."][0] != '') {
      msg.addField("ID Photo", details["(Optional) If you look to be close to, or over 20, you may wish to also attach a photo of an official document/ID that shows your date of birth. If you do not submit this and we are uncertain that you are aged under 20, we may contact you to follow up."][0]);
  }
  if (details["(Optional) Anything you would like to add?"][0] != '') {
      msg.addField("Other Comments", details["(Optional) Anything you would like to add?"][0]);
  }
  let outputchannel = await client.channels.fetch('');
  outputchannel.send(msg);
}

client.login("");

exports.postConcern = anonConcernPost;
exports.postVent = anonVentPost;
exports.sendVent = anonVent;
//exports.sendQuestion = anonQuestion;
exports.postSuggestion = anonSuggestionPost;
exports.sendSuggestion = anonSuggestion;
exports.postVerif = verifPost;
exports.sendUncomfy = uncomfy;
exports.demographics = demographics;
//exports.changeUncomfyChannel = changeUncomfyChannel;