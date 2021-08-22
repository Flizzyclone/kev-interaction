const { Invite } = require('discord.js');
const fetch = require('node-fetch');

let url = "https://discord.com/api/v8/applications//commands"

json = {
    "name": "uncomfy",
    "description": "Sends a message through the bot in this channel to notify people the conversation is uncomfy.",
    "options": [
        {
            "name": "explanation",
            "description": "Optionally add a reason why this conversation is making you uncomfy.",
            "type": 3,
            "required": false
        }
    ]
}

let demjson = {
    "name": "demographics",
    "description": "Get information about the demographics of GTV. Data includes alt accounts.",
    "options": [
        {
            "name": "category",
            "description": "Which category of role to get demographics for.",
            "type": 3,
            "required": true,
            "choices": [
                {
                    "name": "Age",
                    "value": "age"
                },
                {
                    "name": "Color",
                    "value": "color"
                },
                {
                    "name": "Gender Identity",
                    "value": "gender"
                },
                {
                    "name": "Preferred Pronouns",
                    "value": "pronoun"
                },
                {
                    "name": "Region",
                    "value": "region"
                },
                {
                    "name": "Romantic Orientation",
                    "value": "romantic"
                },
                {
                    "name": "Sexual Orientation",
                    "value": "sexuality"
                },
            ]
        }
    ]
}

headers = {
    "Authorization": "Bot ",
    'Content-Type': 'application/json'
}

async function init() {
    await fetch(`https://discord.com/api/v8/applications//guilds//commands`,
        {
          method: 'POST',
          headers: headers,
        body: JSON.stringify(json)
    }).then(response => response.json())
    .then(data => console.log(data));
    
    //await fetch(`https://discord.com/api/v8/applications//guilds//commands/828725774915600395`,
    //    {
    //      method: 'DELETE',
    //      headers: headers,
    //    //body: JSON.stringify(demjson)
    //}).then(response => response.json())
    //.then(data => console.log(data));
}

init()