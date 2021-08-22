const { json } = require('body-parser');
const { request, response } = require('express');
const express = require('express');
const axios = require('axios');
const router = express.Router();
const { InteractionType, InteractionResponseType, verifyKeyMiddleware } = require('discord-interactions');
const botFunc = require('./botfunctions');
const messageTools = require('./messagetools');
const intro = require('./intro');
const FormData = require('form-data');

const PUB_KEY = '';

router.post('/', verifyKeyMiddleware(PUB_KEY), async (req, res) => {
  if (req.body.type == 1) {
    res.send(JSON.stringify({"type": 1}));
  } else if (req.body.type == 2) {
    let interaction = req.body;
    if (interaction.data.name == 'uncomfy') {
      let success;
      if (interaction.data.options != null) {
        success = await botFunc.sendUncomfy(interaction.channel_id,interaction.data.options[0].value);
      } else {
        success = await botFunc.sendUncomfy(interaction.channel_id, null);
      }
      if (success == true) {
        res.set('Content-Type', 'application/json')
        res.send(JSON.stringify({
          "type": 4,
          "data": {
            "content": "Uncomfy Notification Sent!",
            "flags": 64
          }
        }));
      } else {
        res.set('Content-Type', 'application/json')
        res.send(JSON.stringify({
          "type": 4,
          "data": {
            "content": "There was a problem running this command.",
            "flags": 64
          }
        }));
      }
    } else if (interaction.data.name == 'demographics') {
      res.set('Content-Type', 'application/json');
      res.send(JSON.stringify({
        "type":5
      }));
      let response = await botFunc.demographics(interaction.data.options[0].value);
      if (response.success == false ) { //if (response.success == false ) {
        await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, JSON.stringify({
          content:response.error
        }), {
          headers: {
            'Content-Type': 'application/json',
          }
        });
        return;
      }
      const formData = new FormData;
      formData.append('payload_json', JSON.stringify({
        embeds: [
          response.embed
        ]
      }));
      formData.append('file', response.file, 'chart.png')
      if (!response == false) {
        await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, formData, {
          headers: formData.getHeaders()
        });
      } else {
        await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, JSON.stringify({
          content:"There was a problem running this command."
        }), {
          headers: {
            'Content-Type': 'application/json',
          }
        });
      }
    }
  } else if (req.body.type == 3) {
    const interaction = req.body;
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify({"type":6}));
    if (interaction.data.custom_id.substr(0,5) == "intro") { //disabled for production, should be intro
      let stage = (interaction.data.custom_id.match(/(?<=\_)(.*?)(?=\_)/))[0];
      let detail = (interaction.data.custom_id.match(/[^_]+$/))[0];
      if (stage == "prevjoin") {
        if (detail == "yes") {
          intro.previousYes(interaction.user.id);
          let messageEdit = await messageTools.disableComponents(interaction);
          messageEdit.embeds[0].color = 3249999;
          await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, JSON.stringify(messageEdit), {headers: {'Content-Type': 'application/json'}});
        } else if (detail == "no") {
          intro.redditAccCheck(interaction.user.id);
          let messageEdit = await messageTools.disableComponents(interaction);
          messageEdit.embeds[0].color = 3249999;
          await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, JSON.stringify(messageEdit), {headers: {'Content-Type': 'application/json'}});
        }
      } else if (stage == "beginning") {
        if (detail == "yes") {
          intro.redditAccCheck(interaction.user.id);
          let messageEdit = await messageTools.disableComponents(interaction);
          await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, JSON.stringify(messageEdit), {headers: {'Content-Type': 'application/json'}});
        } else if (detail == "no") {
          intro.nameStage(interaction.user.id);
          intro.updateUserValue(interaction.user.id,"redditname","**None/Didn't want to verify, ask for verification through Discord**");
          let messageEdit = await messageTools.disableComponents(interaction);
          await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, JSON.stringify(messageEdit), {headers: {'Content-Type': 'application/json'}});
        }
      } else if (stage == "redditAccCheck") {
        if (detail == "yes") {
          intro.redditUserInput(interaction.user.id);
          let messageEdit = await messageTools.disableComponents(interaction);
          await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, JSON.stringify(messageEdit), {headers: {'Content-Type': 'application/json'}});
        } else if (detail == "no") {
          intro.wantSub(interaction.user.id);
          let messageEdit = await messageTools.disableComponents(interaction);
          await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, JSON.stringify(messageEdit), {headers: {'Content-Type': 'application/json'}});
        }
      } else if (stage == "wantSub") {
        if (detail == "yes") {
          intro.notOnSub(interaction.user.id);
          let messageEdit = await messageTools.disableComponents(interaction);
          await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, JSON.stringify(messageEdit), {headers: {'Content-Type': 'application/json'}});
        } else if (detail == "no") {
          intro.nameStage(interaction.user.id);
          intro.updateUserValue(interaction.user.id,"redditname","**None/Didn't want to verify, ask for verification through Discord**");
          let messageEdit = await messageTools.disableComponents(interaction);
          await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, JSON.stringify(messageEdit), {headers: {'Content-Type': 'application/json'}});
        }
      } else if (stage == "notOnSub") {
        if (detail == "yes") {
          intro.redditUserInput(interaction.user.id)
          let messageEdit = await messageTools.disableComponents(interaction);
          await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, JSON.stringify(messageEdit), {headers: {'Content-Type': 'application/json'}});
        } else if (detail == "no") {
          intro.nameStage(interaction.user.id);
          intro.updateUserValue(interaction.user.id,"redditname","**None/Didn't want to verify, ask for verification through Discord**");
          let messageEdit = await messageTools.disableComponents(interaction);
          await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, JSON.stringify(messageEdit), {headers: {'Content-Type': 'application/json'}});
        }
      } else if (stage == "age") {
        intro.sexualityStage(interaction.user.id);
        intro.addRole(interaction.user.id,"age",detail);
        let messageEdit = await messageTools.disableComponents(interaction);
        await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, JSON.stringify(messageEdit), {headers: {'Content-Type': 'application/json'}});
      } else if (stage == "sexuality") {
        intro.romanticStage(interaction.user.id);
        intro.addRole(interaction.user.id,"sexuality",detail);
        let messageEdit = await messageTools.disableComponents(interaction);
        await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, JSON.stringify(messageEdit), {headers: {'Content-Type': 'application/json'}});
      } else if (stage == "romantic") {
        intro.genderStage(interaction.user.id);
        intro.addRole(interaction.user.id,"romantic",detail);
        let messageEdit = await messageTools.disableComponents(interaction);
        await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, JSON.stringify(messageEdit), {headers: {'Content-Type': 'application/json'}});
      } else if (stage == "gender") {
        intro.pronounStage(interaction.user.id);
        intro.addRole(interaction.user.id,"gender",detail);
        let messageEdit = await messageTools.disableComponents(interaction);
        await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, JSON.stringify(messageEdit), {headers: {'Content-Type': 'application/json'}});
      } else if (stage == "pronoun") {
        intro.regionStage(interaction.user.id);
        intro.addRole(interaction.user.id,"pronoun",detail);
        let messageEdit = await messageTools.disableComponents(interaction);
        await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, JSON.stringify(messageEdit), {headers: {'Content-Type': 'application/json'}});
      } else if (stage == "region") {
        intro.interestsStage(interaction.user.id);
        intro.addRole(interaction.user.id,"region",detail);
        let messageEdit = await messageTools.disableComponents(interaction);
        await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, JSON.stringify(messageEdit), {headers: {'Content-Type': 'application/json'}});
      } else if (stage == "interestdone") {
        intro.colorStage(interaction.user.id);
        let messageEdit = await messageTools.disableComponentsInterests(interaction);
        await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, JSON.stringify(messageEdit), {headers: {'Content-Type': 'application/json'}});
      } else if (stage == "interest") {
        intro.addInterestRole(interaction.user.id, detail);
        let messageEdit = await messageTools.interestComponents(interaction, stage);
        await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, JSON.stringify(messageEdit), {headers: {'Content-Type': 'application/json'}});
      } else if (stage == "interestremove") {
        intro.removeInterestRole(interaction.user.id, detail);
        let messageEdit = await messageTools.interestComponents(interaction, stage);
        await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, JSON.stringify(messageEdit), {headers: {'Content-Type': 'application/json'}});
      } else if (stage == "color") {
        intro.altStage(interaction.user.id);
        intro.addRole(interaction.user.id,"color",detail);
        let messageEdit = await messageTools.disableComponents(interaction);
        await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, JSON.stringify(messageEdit), {headers: {'Content-Type': 'application/json'}});
      } else if (stage == "alt") {
        if (detail == "yes") {
          intro.updateUserValue(interaction.user.id,"alt",'True');
          intro.altAccount(interaction.user.id);
        } else {
          intro.updateUserValue(interaction.user.id,"alt",'False');
        }
        let messageEdit = await messageTools.disableComponents(interaction);
        await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, JSON.stringify(messageEdit), {headers: {'Content-Type': 'application/json'}});
        intro.finished(interaction.user.id);
      } else if (stage == "approval") {
        let messageEdit = await messageTools.disableComponents(interaction);
        if (detail == "yes") {
          console.log(interaction.message.embeds[0].description.match(/(?<=Discord ID: )(.*)(?=\n)/));
          intro.userApproved(interaction.message.embeds[0].description.match(/(?<=Discord ID: )(.*)(?=\n)/)[0]);
          messageEdit.embeds[0].color = 3249999;
          messageEdit.embeds[0].title = messageEdit.embeds[0].title + " - Approved";
        } else {
          messageEdit.embeds[0].color = 15282739;
          messageEdit.embeds[0].title = messageEdit.embeds[0].title + " - Denied";
        }
        await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, JSON.stringify(messageEdit), {headers: {'Content-Type': 'application/json'}});
      }
    } else if (interaction.data.custom_id == "anon_vent_accept") {
      await botFunc.sendVent(interaction.message);
      let messageEdit = await messageTools.disableComponents(interaction);
      messageEdit.embeds[0].color = 3249999;
      messageEdit.embeds[0].title = messageEdit.embeds[0].title + " - Approved";
      await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, JSON.stringify(messageEdit), {headers: {'Content-Type': 'application/json'}});
    } else if (interaction.data.custom_id == "anon_vent_deny") {
      let messageEdit = await messageTools.disableComponents(interaction);
      messageEdit.embeds[0].color = 15282739;
      messageEdit.embeds[0].title = messageEdit.embeds[0].title + " - Denied";
      await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, JSON.stringify(messageEdit), {headers: {'Content-Type': 'application/json'}});
    } else if (interaction.data.custom_id == "anon_question_accept") {
      await botFunc.sendQuestion(interaction.message);
      let messageEdit = await messageTools.disableComponents(interaction);
      messageEdit.embeds[0].color = 3249999;
      messageEdit.embeds[0].title = messageEdit.embeds[0].title + " - Approved";
      await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, JSON.stringify(messageEdit), {headers: {'Content-Type': 'application/json'}});
    } else if (interaction.data.custom_id == "anon_question_deny") {
      let messageEdit = await messageTools.disableComponents(interaction);
      messageEdit.embeds[0].color = 15282739;
      messageEdit.embeds[0].title = messageEdit.embeds[0].title + " - Denied";
      await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, JSON.stringify(messageEdit), {headers: {'Content-Type': 'application/json'}});
    } else if (interaction.data.custom_id == "anon_suggestion_accept") {
      await botFunc.sendSuggestion(interaction.message);
      let messageEdit = await messageTools.disableComponents(interaction);
      messageEdit.embeds[0].color = 3249999;
      messageEdit.embeds[0].title = messageEdit.embeds[0].title + " - Approved";
      await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, JSON.stringify(messageEdit), {headers: {'Content-Type': 'application/json'}});
    } else if (interaction.data.custom_id == "anon_suggestion_deny") {
      let messageEdit = await messageTools.disableComponents(interaction);
      messageEdit.embeds[0].color = 15282739;
      messageEdit.embeds[0].title = messageEdit.embeds[0].title + " - Denied";
      await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, JSON.stringify(messageEdit), {headers: {'Content-Type': 'application/json'}});
    }
  }
})

module.exports = router;