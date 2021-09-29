//Libraries
const Discord = require("discord.js");
const client = new Discord.Client({
    ws: { intents: ["DIRECT_MESSAGES","DIRECT_MESSAGE_REACTIONS","GUILDS","GUILD_MEMBERS","GUILD_MESSAGES","GUILD_MESSAGE_REACTIONS"] }
});

const config = require('./config.json');

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(config.intro.database.databaseName, config.intro.database.username, config.intro.database.password, {
	host: config.intro.database.host == "" ? "localhost" : config.intro.database.host,
	dialect: config.intro.database.dialect == "" ? "mysql" : config.intro.database.dialect,
	logging: false,
	storage: config.intro.database.storage == "" ? undefined : config.intro.database.storage
});

const memberDB = sequelize.define('memberDB', {
    user_id: {
      type: Sequelize.STRING,
      unique: true,
      primaryKey: true,
      allowNull: false
    },
    reddit_name: {
      type: Sequelize.STRING,
      unique: false
    },
    name: {
        type: Sequelize.STRING,
        unique: false
    },
    age: {
        type: Sequelize.STRING,
        unique: false
    },
    sexuality: {
        type: Sequelize.STRING,
        unique: false
    },
    romantic: {
        type: Sequelize.STRING,
        unique: false
    },
    gender: {
        type: Sequelize.STRING,
        unique: false
    },
    pronoun: {
        type: Sequelize.STRING,
        unique: false
    },
    region: {
        type: Sequelize.STRING,
        unique: false
    },
    interest: {
        type: Sequelize.STRING,
        unique: false,
    },
    color: {
        type: Sequelize.STRING,
        unique: false
    },
    alt: {
        type: Sequelize.BOOLEAN,
        unique: false
    },
},{
    freezeTableName: true
});

memberDB.sync();

client.on("ready", async () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (msg) => {
    var args = msg.content.split(" ");
    const GTV = client.guilds.cache.get(config.intro.guild_id);
    switch (args[0]) {
        case "!gtv":
            if (args[1] == 'svm' && msg.member.hasPermission('MANAGE_MESSAGES')) {
                let memid = args[2];
                memid = memid.replace('>','');
                memid = memid.replace('!','');
                memid = memid.replace('<@','');
                try {
                    let memtosend = await GTV.members.fetch(memid)
                    initiateVerif(memtosend);
                    msg.channel.send('Message Sent!');
                } catch(e) {
                    console.log(e);
                    msg.channel.send('Member not found!');
                }
            }
            if (args[1] == 'restart') {
                if (msg.channel.type == 'dm') {
                    let mem = await GTV.members.fetch(msg.author.id);
                    console.log(mem);
                    initiateVerif(mem) ;  
                }  
            }
    }
    switch (args[0]) {
        case "!restart":
            if(msg.channel.type == 'dm') {
                let mem = await GTV.members.fetch(msg.author.id);
                initiateVerif(mem)  ; 
                console.log(mem);
            }
    }
});

client.on("guildMemberAdd", async (member) => {
    if (member.guild.id == config.intro.guild_id) {
        initiateVerif(member); 
    }
});

async function updateUserValue(id, prop, val) {
    memberDB.update({ [prop]: val }, { where: { user_id: id } });
}

async function initiateVerif(member) {
    let outputChannel = client.channels.cache.get(config.intro.outputChannel);
    let directmess = await member.createDM();
    try {
        client.api.channels(directmess.id).messages.post({
            data: {
                embed: {
                    title:`Welcome to ${member.guild.name}!`,
                    description:'To ensure the safety of our community, we require that you go through an introduction process whereby you need to fill out some basic info about yourself and this bot will set you up with roles. After that, a moderator will review to make sure you are verified and will give you access to the Discord.',
                    color:15282739
                } 
            }
        });
    } catch (error) {
        console.log('cant send DM');
        console.log(error.message);
        if (error.message == 'Cannot send messages to this user') {
            let manualVerif = client.channels.cache.get(config.intro.manualVerif);
            manualVerif.send('Hey <@!' + member.id + "> due to your privacy settings, you are unable to proceed with bot verification. If you would prefer to use bot verification, please turn `Allow direct messages from server members` on in `Privacy & Safety` and then DM `!restart` to <@!>. Otherwise, follow the pinned message for manual verification.");
            outputChannel.send(`Couldn't send initial verification message to ${member.id} because of their privacy settings.`);
        } else {
            let manualVerif = client.channels.cache.get(config.intro.manualVerif);
            manualVerif.send(error.message);
            outputChannel.send(`Unknown error sending initial DM message to ${member.id}`);
        }
        return;
    }
    console.log(member.user.tag + ' joined, messages sent');
    outputChannel.send(`${member.user.tag} joined, messages sent`); //disabled for testing
    if ((await memberDB.count({where: {user_id: member.id }})) == 0) { //if person has not joined before
        console.log('user not found, adding a row');
        memberDB.create({ user_id: member.id });
        beginningStage(member);
    } else {
        let memEntry = await memberDB.findByPk(member.id);
        console.log(memEntry.dataValues.pronoun)
        if (memEntry.dataValues.name == null || memEntry.dataValues.reddit_name == null || memEntry.dataValues.age == null || memEntry.dataValues.pronoun == null || memEntry.dataValues.region == null || memEntry.dataValues.romantic == null || memEntry.dataValues.sexuality == null || memEntry.dataValues.alt == null) {
            beginningStage(member);
        } else {
            previouslyJoined(member);
        }
    }
};

async function previouslyJoined(member) {
    let memEntry = await memberDB.findByPk(member.id);
    let directmess = await member.createDM();
    const GTV = client.guilds.cache.get(config.intro.guild_id);
    client.api.channels(directmess.id).messages.post({
        data: {
            embed: {
                title:'Previous Info',
                description:`**Looks like you've joined before! Does all this information still look up to date?**\n\nName: ${memEntry.dataValues.name}\nReddit: ${memEntry.dataValues.reddit_name.replace("**None/Didn't want to verify, ask for verification through Discord**","None")}\nAge: ${(GTV.roles.cache.get(memEntry.dataValues.age)).name}\nSexuality: ${(GTV.roles.cache.get(memEntry.dataValues.sexuality)).name}\nRomantic Orientation: ${(GTV.roles.cache.get(memEntry.dataValues.romantic)).name}\nGender: ${(GTV.roles.cache.get(memEntry.dataValues.gender)).name}\nPronouns: ${await formatMultipleRoles(memEntry.dataValues.pronoun, GTV)}\nRegion: ${(GTV.roles.cache.get(memEntry.dataValues.region)).name}\nAlt Account: ${memEntry.dataValues.alt}`
            },
            components: [
                {
                    type:1,
                    components: [
                        {
                            type: 2,
                            label: "Looks Good",
                            style: 3,
                            custom_id: "intro_prevjoin_yes"
                        },
                        {
                            type: 2,
                            label: "No",
                            style: 4,
                            custom_id: "intro_prevjoin_no"
                        }
                    ]
                }
            ]
        }
    });
}

async function formatMultipleRoles(roleString) {
    const GTV = client.guilds.cache.get(config.intro.guild_id);
    if (roleString == null) {
        return '';
    } else {
        let str = "";
        let roleIDs = roleString.split(';');
        console.log(roleIDs);
        for (i=0; i < roleIDs.length; i++) {
            if(roleIDs[i] != '') {
                let role = await GTV.roles.fetch(roleIDs[i])
                if (role != null) {
                    str += `${role.name}, `;  
                }
            }
        }
        return str;
    }
}

async function previousYes(id) {
    finished(id);
    let memEntry = await memberDB.findByPk(id);
    const GTV = client.guilds.cache.get(config.intro.guild_id);
    let member = await GTV.members.fetch(id);
    member.setNickname((memEntry.dataValues.name), 'Automated introduction nicknaming');
    member.roles.add(GTV.roles.cache.get(memEntry.dataValues.age));
    member.roles.add(GTV.roles.cache.get(memEntry.dataValues.region));
    member.roles.add(GTV.roles.cache.get(memEntry.dataValues.sexuality));
    member.roles.add(GTV.roles.cache.get(memEntry.dataValues.romantic));
    member.roles.add(GTV.roles.cache.get(memEntry.dataValues.gender));
    if (memEntry.dataValues.alt == "True") {
        member.roles.add(GTV.roles.cache.get(config.intro.roleIDs.alt));
    }
    if (memEntry.dataValues.color != null) {
        member.roles.add(GTV.roles.cache.get(memEntry.dataValues.color));
    }
    if (memEntry.dataValues.pronoun != null) {
        let roleIDs = memEntry.dataValues.pronoun.split(';');
        for (i=0; i < roleIDs.length; i++) {
            if(roleIDs[i] != '') {
                member.roles.add(GTV.roles.cache.get(roleIDs[i]));
            }
        }
    }
    if (memEntry.dataValues.interest != null) {
        let roleIDs = memEntry.dataValues.interest.split(';');
        for (i=0; i < roleIDs.length; i++) {
            if(roleIDs[i] != '') {
                member.roles.add(GTV.roles.cache.get(roleIDs[i]));
            }
        }
    }
}

async function beginningStage(member) {
    let directmess = await member.createDM();
    client.api.channels(directmess.id).messages.post({
        data: {
            content:"To start, Do you have a Reddit account?",
            components: [{
                type:1,
                components: [{
                    type: 2,
                    label: "Yes",
                    style: 3,
                    custom_id: "intro_beginning_yes"
                },{
                    type: 2,
                    label: "No",
                    style: 4,
                    custom_id: "intro_beginning_no"
                }]
            }] 
        }
    });
}

async function notOnSub(id) {
    let user = await client.users.fetch(id);
    let directmess = await user.createDM();
    client.api.channels(directmess.id).messages.post({
        data: {
            content:`Please verify at ${config.intro.verificationLink}`,
            components: [{
                    type:1,
                    components: [{
                        type: 2,
                        label: "Done",
                        style: 3,
                        custom_id: "intro_notOnSub_yes"
                    },{
                        type: 2,
                        label: "Nevermind",
                        style: 4,
                        custom_id: "intro_notOnSub_no"
                    }]
                }]
        }
    });
}

async function wantSub(id) {
    let user = await client.users.fetch(id);
    let directmess = await user.createDM();
    client.api.channels(directmess.id).messages.post({
        data: {
            content:"Do you want to verify on the subreddit?",
            components: [{
                    type:1,
                    components: [{
                        type: 2,
                        label: "Yes",
                        style: 3,
                        custom_id: "intro_wantSub_yes"
                    },{
                        type: 2,
                        label: "No",
                        style: 4,
                        custom_id: "intro_wantSub_no"
                    }]
                }]
        }
    });
}

async function redditAccCheck(id) {
    let user = await client.users.fetch(id);
    let directmess = await user.createDM();
    client.api.channels(directmess.id).messages.post({
        data: {
            content:"Are you verified on the subreddit?",
            components: [{
                    type: 1,
                    components: [{
                            type: 2,
                            label: "Yes",
                            style: 3,
                            custom_id: "intro_redditAccCheck_yes"
                        },{
                            type: 2,
                            label: "No",
                            style: 4,
                            custom_id: "intro_redditAccCheck_no"
                        }]
                }]
        }
    });
}

async function redditUserInput(id) {
    let user = await client.users.fetch(id);
    let directmess = await user.createDM();
    await directmess.send(`Please type your reddit username. You do not have to be approved to complete introduction.`)      
    const filter = (msg) => msg.content
    directmess.awaitMessages(filter, { max: 1})
        .then(collected => {
            let msg = collected.first();
            msg = msg.content.toString();
            msg = msg.replace('u/','');
            msg = msg.replace('/u/','');
            memberDB.update({ reddit_name: msg }, { where: { user_id: id } });
            nameStage(id);
        });
}

async function nameStage(id) {
    let GTV = await client.guilds.fetch(config.intro.guild_id);
    let user = await client.users.fetch(id);
    let directmess = await user.createDM();
    let member = await GTV.members.fetch(id);
    await directmess.send('Please type your first name. This will be used to set your nickname in the server.');
    const filter = (msg) => msg.content;
    directmess.awaitMessages(filter, { max: 1})
        .then(collected => {
            let name = collected.first();
            name = name.toString();
            if (name.length > 31) {
                directmess.send(`Please shorten your nickname to under 32 characters.`);
                nameStage(id);
            } else {
                member.setNickname(name, 'Automated introduction nicknaming');
                stageAge(id);
                memberDB.update({ name: name }, { where: { user_id: id } });
            }
        });
}
async function stageAge(id) {
    let user = await client.users.fetch(id);
    let directmess = await user.createDM();
    client.api.channels(directmess.id).messages.post({
        data: {
            content:"How old are you?",
            components: [{
                    type: 1,
                    components: [{
                            type: 2,
                            label: "13",
                            style: 1,
                            custom_id: "intro_age_thirteen"
                        },{
                            type: 2,
                            label: "14",
                            style: 1,
                            custom_id: "intro_age_fourteen"
                        },{
                            type: 2,
                            label: "15",
                            style: 1,
                            custom_id: "intro_age_fifteen"
                        },{
                            type: 2,
                            label: "16",
                            style: 1,
                            custom_id: "intro_age_sixteen"
                        },{
                            type: 2,
                            label: "17",
                            style: 1,
                            custom_id: "intro_age_seventeen"
                        }]
                },{
                    type: 1,
                    components: [{
                            type: 2,
                            label: "18",
                            style: 1,
                            custom_id: "intro_age_eighteen"
                        },{
                            type: 2,
                            label: "19",
                            style: 1,
                            custom_id: "intro_age_nineteen"
                        }]
                }]
        }
    });
}

async function addRole(id, category, val) {
    if (val == "none") {
        memberDB.update({ [category]: "None" }, { where: { user_id: id } });
        return;
    }
    const GTV = client.guilds.cache.get(config.intro.guild_id);
    let member = await GTV.members.fetch(id);
    if (typeof config.intro.roleIDs[val] == 'object') {
        let role;
        for(let i=0; i < config.intro.roleIDs[val].length; i++) {
            role = GTV.roles.cache.get(config.intro.roleIDs[val][i]);
            member.roles.add(role);
        }
        memberDB.update({ [category]: role.id }, { where: { user_id: id } }); //roles besides the last one get left behind here, but thats ok.
        return;
    } else {
        let role = GTV.roles.cache.get(config.intro.roleIDs[val]);
        member.roles.add(role);
        memberDB.update({ [category]: role.id }, { where: { user_id: id } });
    }
}

async function sexualityStage(id) {
    let user = await client.users.fetch(id);
    let directmess = await user.createDM();
    client.api.channels(directmess.id).messages.post({
        data: {
            content:"What sexuality do you identify as?",
            components: [{
                    type: 1,
                    components: [{
                            type: 2,
                            label: "Homosexual",
                            style: 1,
                            custom_id: "intro_sexuality_homosexual"
                        },{
                            type: 2,
                            label: "Bisexual",
                            style: 1,
                            custom_id: "intro_sexuality_bisexual"
                        },{
                            type: 2,
                            label: "Pansexual",
                            style: 1,
                            custom_id: "intro_sexuality_pansexual"
                        },{
                            type: 2,
                            label: "Asexual",
                            style: 1,
                            custom_id: "intro_sexuality_asexual"
                        },{
                            type: 2,
                            label: "Demisexual",
                            style: 1,
                            custom_id: "intro_sexuality_demisexual"
                        }]
                },{
                    type: 1,
                    components: [{
                            type: 2,
                            label: "Queer",
                            style: 1,
                            custom_id: "intro_sexuality_queersexual"
                        },{
                            type: 2,
                            label: "Graysexual",
                            style: 1,
                            custom_id: "intro_sexuality_grayasexual"
                        },{
                            type: 2,
                            label: "Heterosexual",
                            style: 1,
                            custom_id: "intro_sexuality_heterosexual"
                        },{
                            type: 2,
                            label: "Androsexual",
                            style: 1,
                            custom_id: "intro_sexuality_androsexual"
                        },{
                            type: 2,
                            label: "Gynesexual",
                            style: 1,
                            custom_id: "intro_sexuality_gynesexual"
                        }]
                },{
                    type: 1,
                    components: [{
                            type: 2,
                            label: "Ceterosexual",
                            style: 1,
                            custom_id: "intro_sexuality_ceterosexual"
                        },{
                            type: 2,
                            label: "Questioning Sexuality",
                            style: 1,
                            custom_id: "intro_sexuality_sexquestion"
                        },{
                            type: 2,
                            label: "Other",
                            style: 1,
                            custom_id: "intro_sexuality_othersexuality"
                        },{
                            type: 2,
                            label: "Unlabeled",
                            style: 1,
                            custom_id: "intro_sexuality_unlabeledsexuality"
                        }]
                }]
        }
    });
}

async function romanticStage(id) {
    let user = await client.users.fetch(id);
    let directmess = await user.createDM();
    client.api.channels(directmess.id).messages.post({
        data: {
            content:"What romantic orientation do you identify as?",
            components: [{
                    type: 1,
                    components: [{
                            type: 2,
                            label: "Homoromantic",
                            style: 1,
                            custom_id: "intro_romantic_homoromantic"
                        },{
                            type: 2,
                            label: "Biromantic",
                            style: 1,
                            custom_id: "intro_romantic_biromantic"
                        },{
                            type: 2,
                            label: "Panromantic",
                            style: 1,
                            custom_id: "intro_romantic_panromantic"
                        },{
                            type: 2,
                            label: "Aromantic",
                            style: 1,
                            custom_id: "intro_romantic_aromantic"
                        },{
                            type: 2,
                            label: "Demiromantic",
                            style: 1,
                            custom_id: "intro_romantic_demiromantic"
                        }]
                },{
                    type: 1,
                    components: [{
                            type: 2,
                            label: "Queer",
                            style: 1,
                            custom_id: "intro_romantic_queerromantic"
                        },{
                            type: 2,
                            label: "Grayromantic",
                            style: 1,
                            custom_id: "intro_romantic_grayromantic"
                        },{
                            type: 2,
                            label: "Heteroromantic",
                            style: 1,
                            custom_id: "intro_romantic_heteroromantic"
                        },{
                            type: 2,
                            label: "Androromantic",
                            style: 1,
                            custom_id: "intro_romantic_androromantic"
                        },{
                            type: 2,
                            label: "Gyneromantic",
                            style: 1,
                            custom_id: "intro_romantic_gyneromantic"
                        }]
                },{
                    type: 1,
                    components: [{
                            type: 2,
                            label: "Ceteroromantic",
                            style: 1,
                            custom_id: "intro_romantic_ceteroromantic"
                        },{
                            type: 2,
                            label: "Questioning Romantic Orientation",
                            style: 1,
                            custom_id: "intro_romantic_romanticquestion"
                        },{
                            type: 2,
                            label: "Other",
                            style: 1,
                            custom_id: "intro_romantic_otherromantic"
                        },{
                            type: 2,
                            label: "Unlabeled",
                            style: 1,
                            custom_id: "intro_romantic_unlabeledromantic"
                        }]
                }]
        }
    });
}

async function genderStage(id) {
    let user = await client.users.fetch(id);
    let directmess = await user.createDM();
    client.api.channels(directmess.id).messages.post({
        data: {
            content:"Which gender do you identify as? Transgender Male/Female set both the Transgender role and the Male/Female role. If this is not preferable, please use the Male or Female options.",
            components: [{
                    type: 1,
                    components: [{
                            type: 2,
                            label: "Male",
                            style: 1,
                            custom_id: "intro_gender_male"
                        },{
                            type: 2,
                            label: "Female",
                            style: 1,
                            custom_id: "intro_gender_female"
                        },{
                            type: 2,
                            label: "Non-Binary",
                            style: 1,
                            custom_id: "intro_gender_nonbinary"
                        },{
                            type: 2,
                            label: "Transgender Male",
                            style: 1,
                            custom_id: "intro_gender_transmale"
                        },{
                            type: 2,
                            label: "Transgender Female",
                            style: 1,
                            custom_id: "intro_gender_transfemale"
                        }]
                },{
                    type: 1,
                    components: [{
                            type: 2,
                            label: "Demiboy",
                            style: 1,
                            custom_id: "intro_gender_demiboy"
                        },{
                            type: 2,
                            label: "Demigirl",
                            style: 1,
                            custom_id: "intro_gender_demigirl"
                        },{
                            type: 2,
                            label: "Demigender Non-Binary",
                            style: 1,
                            custom_id: "intro_gender_deminb"
                        },{
                            type: 2,
                            label: "Gender Queer",
                            style: 1,
                            custom_id: "intro_gender_genderqueer"
                        },{
                            type: 2,
                            label: "Gender Fluid",
                            style: 1,
                            custom_id: "intro_gender_genderfluid"
                        }]
                },{
                    type: 1,
                    components: [{
                            type: 2,
                            label: "Questioning Gender Identity",
                            style: 1,
                            custom_id: "intro_gender_genderquestion"
                        },{
                            type: 2,
                            label: "Other",
                            style: 1,
                            custom_id: "intro_gender_othergender"
                        },{
                            type: 2,
                            label: "Unlabeled",
                            style: 1,
                            custom_id: "intro_gender_unlabeledgender"
                        }]
                }]
        }
    });
}

async function addPronounRole(id, detail) {
    const GTV = client.guilds.cache.get(config.intro.guild_id);
    let roleID = config.intro.roleIDs[detail];
    let role = await GTV.roles.fetch(roleID);
    let member = await GTV.members.fetch(id);
    member.roles.add(role);
    let memEntry = await memberDB.findByPk(id);
    let memPronoun = memEntry.dataValues.pronoun;
    memPronoun += `${role.id};`;
    memberDB.update({ pronoun: memPronoun }, { where: { user_id: id } });
}

async function removePronounRole(id, detail) {
    const GTV = client.guilds.cache.get(config.intro.guild_id);
    let roleID = config.intro.roleIDs[detail];
    let role = await GTV.roles.fetch(roleID);
    let member = await GTV.members.fetch(id);
    member.roles.remove(role);
    let memEntry = await memberDB.findByPk(id);
    let memPronoun = memEntry.dataValues.pronoun;
    memPronoun = memPronoun.replace(`${role.id};`,"");
    memberDB.update({ pronoun: memPronoun }, { where: { user_id: id } });
}

async function pronounStage(id) {
    let user = await client.users.fetch(id);
    let directmess = await user.createDM();
    client.api.channels(directmess.id).messages.post({
        data: {
            content:"What are your preferred pronouns? Press the 'Done' button when you are done selecting pronoun roles.\n\nSelected the wrong pronouns? Just click again to deselect!",
            components: [{
                    type: 1,
                    components: [{
                            type: 2,
                            label: "He/Him (Preferred)",
                            style: 1,
                            custom_id: "intro_pronoun_hehim"
                        },{
                            type: 2,
                            label: "She/Her (Preferred)",
                            style: 1,
                            custom_id: "intro_pronoun_sheher"
                        },{
                            type: 2,
                            label: "They/Them (Preferred)",
                            style: 1,
                            custom_id: "intro_pronoun_theythem"
                        }]
                },{
                    type: 1,
                    components: [{
                            type: 2,
                            label: "Any Pronouns",
                            style: 1,
                            custom_id: "intro_pronoun_anypronoun"
                        },{
                            type: 2,
                            label: "Ask Pronouns",
                            style: 1,
                            custom_id: "intro_pronoun_askpronoun"
                        },{
                            type: 2,
                            label: "Other Pronouns (Preferred)",
                            style: 1,
                            custom_id: "intro_pronoun_otherpronoun"
                        },{
                            type: 2,
                            label: "No Pronouns (Preferred)",
                            style: 1,
                            custom_id: "intro_pronoun_nopronoun"
                        },{
                            type: 2,
                            label: "He/Him",
                            style: 1,
                            custom_id: "intro_pronoun_hehimnon"
                        }
                    ]
            },{
                type: 1,
                components: [{
                        type: 2,
                        label: "She/Her",
                        style: 1,
                        custom_id: "intro_pronoun_shehernon"
                    },{
                        type: 2,
                        label: "They/Them",
                        style: 1,
                        custom_id: "intro_pronoun_theythemnon"
                    },{
                        type: 2,
                        label: "Other Pronouns",
                        style: 1,
                        custom_id: "intro_pronoun_otherpronounnon"
                    },{
                        type: 2,
                        label: "No Pronouns",
                        style: 1,
                        custom_id: "intro_pronoun_nopronounnon"
                    },{
                        type: 2,
                        label: "Done",
                        style: 3,
                        custom_id: "intro_pronoundone_done"
                    }
                ]
            }]
        }
    });
}

async function regionStage(id) {
    let user = await client.users.fetch(id);
    let directmess = await user.createDM();
    client.api.channels(directmess.id).messages.post({
        data: {
            content:"Where do you live?",
            components: [{
                    type: 1,
                    components: [{
                            type: 2,
                            label: "Europe",
                            style: 1,
                            custom_id: "intro_region_europe"
                        },{
                            type: 2,
                            label: "North America",
                            style: 1,
                            custom_id: "intro_region_northam"
                        },{
                            type: 2,
                            label: "South America",
                            style: 1,
                            custom_id: "intro_region_southam"
                        },{
                            type: 2,
                            label: "Africa",
                            style: 1,
                            custom_id: "intro_region_africa"
                        }]
                },{
                    type: 1,
                    components: [{
                            type: 2,
                            label: "Middle East",
                            style: 1,
                            custom_id: "intro_region_mideast"
                        },{
                            type: 2,
                            label: "Asia",
                            style: 1,
                            custom_id: "intro_region_asia"
                        },{
                            type: 2,
                            label: "Oceania",
                            style: 1,
                            custom_id: "intro_region_oceania"
                        }
                    ]
            }]
        }
    });
}

async function interestsStage(id) {
    memberDB.update({ interest: "" }, { where: { user_id: id } })
    let user = await client.users.fetch(id);
    let directmess = await user.createDM();
    client.api.channels(directmess.id).messages.post({
        data: {
            content:"What are you interested in? Press the 'Done' button when you are done selecting interests.\n\nSelected the wrong interest? Just click again to deselect!",
        components: [{
            type: 1,
            components: [{
                    type: 2,
                    label: "Art",
                    emoji: {name: "🎨"},
                    style: 1,
                    custom_id: "intro_interest_art"
                },{
                    type: 2,
                    label: "Automobiles",
                    emoji: {name: "🚗"},
                    style: 1,
                    custom_id: "intro_interest_automobiles"
                },{
                    type: 2,
                    label: "Fashion",
                    emoji: {name: "👕"},
                    style: 1,
                    custom_id: "intro_interest_fashion"
                },{
                    type: 2,
                    label: "Food",
                    emoji: {name: "🍔"},
                    style: 1,
                    custom_id: "intro_interest_food"
                },{
                    type: 2,
                    label: "Gaming",
                    emoji: {name: "🎮"},
                    style: 1,
                    custom_id: "intro_interest_gaming"
                }]
        },{
            type: 1,
            components: [{
                    type: 2,
                    label: "History",
                    emoji: {name: "🗓️"},
                    style: 1,
                    custom_id: "intro_interest_history"
                },{
                    type: 2,
                    label: "Literature",
                    emoji: {name: "📖"},
                    style: 1,
                    custom_id: "intro_interest_literature"
                },{
                    type: 2,
                    label: "Movies/TV",
                    emoji: {name: "📺"},
                    style: 1,
                    custom_id: "intro_interest_moviestv"
                },{
                    type: 2,
                    label: "Music",
                    emoji: {name: "🎵"},
                    style: 1,
                    custom_id: "intro_interest_music"
                },{
                    type: 2,
                    label: "Nature",
                    emoji: {name: "🌲"},
                    style: 1,
                    custom_id: "intro_interest_nature"
                }
            ]
        },{
            type: 1,
            components: [{
                    type: 2,
                    label: "Photography",
                    emoji: {name: "📷"},
                    style: 1,
                    custom_id: "intro_interest_photography"
                },{
                    type: 2,
                    label: "Sports/Exercise",
                    emoji: {name: "🏃"},
                    style: 1,
                    custom_id: "intro_interest_sports"
                },{
                    type: 2,
                    label: "Technology",
                    emoji: {name: "💻"},
                    style: 1,
                    custom_id: "intro_interest_tech"
                },{
                    type: 2,
                    label: "Theology and Philosophy",
                    emoji: {name: "🧠"},
                    style: 1,
                    custom_id: "intro_interest_theoandphi"
                },{
                    type: 2,
                    label: "Done",
                    style: 3,
                    custom_id: "intro_interestdone_done"
                }
            ]
        }]
        }
    });
}

async function addInterestRole(id, detail) {
    const GTV = client.guilds.cache.get(config.intro.guild_id);
    let roleID = config.intro.roleIDs[detail];
    let role = GTV.roles.cache.get(roleID);
    let member = await GTV.members.fetch(id);
    member.roles.add(role);
    let memEntry = await memberDB.findByPk(id);
    let memInterest = memEntry.dataValues.interest;
    memInterest += `${role.id};`;
    memberDB.update({ interest: memInterest }, { where: { user_id: id } });
}

async function removeInterestRole(id, detail) {
    const GTV = client.guilds.cache.get(config.intro.guild_id);
    let roleID = config.intro.roleIDs[detail];
    let role = GTV.roles.cache.get(roleID);
    let member = await GTV.members.fetch(id);
    member.roles.remove(role);
    let memEntry = await memberDB.findByPk(id);
    let memInterest = memEntry.dataValues.interest;
    memInterest = memInterest.replace(`${role.id};`,"");
    memberDB.update({ interest: memInterest }, { where: { user_id: id } });
}

async function colorStage(id) {
    let user = await client.users.fetch(id);
    let directmess = await user.createDM();
    client.api.channels(directmess.id).messages.post({
        data: {
            content:"What color do you want your name to be?",
        components: [{
            type: 1,
            components: [{
                    type: 2,
                    label: "Deep Purple",
                    emoji: {id: config.intro.emojiIDs.deeppurple},
                    style: 1,
                    custom_id: "intro_color_deeppurple"
                },{
                    type: 2,
                    label: "Hot Pink",
                    emoji: {id: config.intro.emojiIDs.hotpink},
                    style: 1,
                    custom_id: "intro_color_hotpink"
                },{
                    type: 2,
                    label: "Lavender",
                    emoji: {id: config.intro.emojiIDs.lavender},
                    style: 1,
                    custom_id: "intro_color_lavender"
                },{
                    type: 2,
                    label: "Lavender Tea",
                    emoji: {id: config.intro.emojiIDs.lavendertea},
                    style: 1,
                    custom_id: "intro_color_lavendertea"
                },{
                    type: 2,
                    label: "Pretty in Pink",
                    emoji: {id: config.intro.emojiIDs.prettyinpink},
                    style: 1,
                    custom_id: "intro_color_prettyinpink"
                }]
        },{
            type: 1,
            components: [{
                    type: 2,
                    label: "Pastel Pink",
                    emoji: {id: config.intro.emojiIDs.pastelpink},
                    style: 1,
                    custom_id: "intro_color_pastelpink"
                },{
                    type: 2,
                    label: "Pastel Violet",
                    emoji: {id: config.intro.emojiIDs.pastelviolet},
                    style: 1,
                    custom_id: "intro_color_pastelviolet"
                },{
                    type: 2,
                    label: "Sky Blue",
                    emoji: {id: config.intro.emojiIDs.skyblue},
                    style: 1,
                    custom_id: "intro_color_skyblue"
                },{
                    type: 2,
                    label: "Angel",
                    emoji: {id: config.intro.emojiIDs.angel},
                    style: 1,
                    custom_id: "intro_color_angel"
                },{
                    type: 2,
                    label: "Ocean Blue",
                    emoji: {id: config.intro.emojiIDs.oceanblue},
                    style: 1,
                    custom_id: "intro_color_oceanblue"
                }
            ]
        },{
            type: 1,
            components: [{
                    type: 2,
                    label: "Tiffany Blue",
                    emoji: {id: config.intro.emojiIDs.tiffanyblue},
                    style: 1,
                    custom_id: "intro_color_tiffanyblue"
                },{
                    type: 2,
                    label: "Cyan",
                    emoji: {id: config.intro.emojiIDs.cyan},
                    style: 1,
                    custom_id: "intro_color_cyan"
                },{
                    type: 2,
                    label: "Forest Green",
                    emoji: {id: config.intro.emojiIDs.forestgreen},
                    style: 1,
                    custom_id: "intro_color_forestgreen"
                },{
                    type: 2,
                    label: "Light Green",
                    emoji: {id: config.intro.emojiIDs.lightgreen},
                    style: 1,
                    custom_id: "intro_color_lightgreen"
                },{
                    type: 2,
                    label: "Lemon",
                    emoji: {id: config.intro.emojiIDs.lemon},
                    style: 1,
                    custom_id: "intro_color_lemon"
                }
            ]
        },{
            type: 1,
            components: [{
                    type: 2,
                    label: "Honey",
                    emoji: {id: config.intro.emojiIDs.honey},
                    style: 1,
                    custom_id: "intro_color_honey"
                },{
                    type: 2,
                    label: "Flame Orange",
                    emoji: {id: config.intro.emojiIDs.flameorange},
                    style: 1,
                    custom_id: "intro_color_flameorange"
                },{
                    type: 2,
                    label: "Tangerine",
                    emoji: {id: config.intro.emojiIDs.tangerine},
                    style: 1,
                    custom_id: "intro_color_tangerine"
                },{
                    type: 2,
                    label: "Mahogany",
                    emoji: {id: config.intro.emojiIDs.mahogany},
                    style: 1,
                    custom_id: "intro_color_mahogany"
                },{
                    type: 2,
                    label: "Dark Red",
                    emoji: {id: config.intro.emojiIDs.darkred},
                    style: 1,
                    custom_id: "intro_color_darkred"
                }
            ]
        },{
            type: 1,
            components: [{
                    type: 2,
                    label: "None",
                    style: 1,
                    custom_id: "intro_color_none"
                }
            ]
        }
        ]}
    });
}

async function altStage(id) {
    let user = await client.users.fetch(id);
    let directmess = await user.createDM();
    client.api.channels(directmess.id).messages.post({
        data: {
            content:"Finally, is this your alt account?",
            components: [
                {
                    type:1,
                    components: [
                        {
                            type: 2,
                            label: "Yes",
                            style: 3,
                            custom_id: "intro_alt_yes"
                        },
                        {
                            type: 2,
                            label: "No",
                            style: 4,
                            custom_id: "intro_alt_no"
                        }
                    ]
                }
            ]
        }
    });
}

async function altAccount(id) {
    const GTV = client.guilds.cache.get(config.intro.guild_id);
    let member = await GTV.members.fetch(id);
    member.roles.add(config.intro.roleIDs.alt);
}

async function finished(id) {
    let GTV = await client.guilds.fetch(config.intro.guild_id);
    let user = await client.users.fetch(id);
    let directmess = await user.createDM();
    client.api.channels(directmess.id).messages.post({
        data: {
            embed: {
                title:"You're all set!",
                description:`Remember to read #read-me and #rules!\n\nA Moderator will look over your introduction soon, and if all looks good you will gain access to the server.\n\nIf you want to change your roles at any time, you can do so [Here](${config.intro.roleypolyLink}).`,
                color:3249999
            } 
        }
    })
    //get data
    let memEntry = await memberDB.findByPk(id);
    if (config.intro.blacklist.indexOf(id) != -1) {
        client.api.channels(config.intro.approvalChannel).messages.post({
            data: {
                embed: {
                    title:`New Member - ${memEntry.dataValues.name}/${user.tag}`,
                    description:`Discord Tag: ${user.tag}\nDiscord ID: ${id}\nFirst Name: ${memEntry.dataValues.name}\nReddit Username: ${memEntry.dataValues.reddit_name}\nAge: ${(GTV.roles.cache.get(memEntry.dataValues.age)).name}\nSexual Orientation: ${(GTV.roles.cache.get(memEntry.dataValues.sexuality)).name}\nRomantic Orientation: ${(GTV.roles.cache.get(memEntry.dataValues.romantic)).name}\nGender Identity: ${(GTV.roles.cache.get(memEntry.dataValues.gender)).name}\nPreferred Pronouns: ${await formatMultipleRoles(memEntry.dataValues.pronoun,GTV)}\nAlt Account: ${memEntry.dataValues.alt}`
                }, 
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                label: "Deny",
                                style: 4,
                                custom_id: "intro_approval_no"
                            }
                        ]
                    
                    }
                ]
            }
        });
    } else {
        client.api.channels(config.intro.approvalChannel).messages.post({
            data: {
                embed: {
                    title:`New Member - ${memEntry.dataValues.name}/${user.tag}`,
                    description:`Discord Tag: ${user.tag}\nDiscord ID: ${id}\nFirst Name: ${memEntry.dataValues.name}\nReddit Username: ${memEntry.dataValues.reddit_name}\nAge: ${(GTV.roles.cache.get(memEntry.dataValues.age)).name}\nSexual Orientation: ${(GTV.roles.cache.get(memEntry.dataValues.sexuality)).name}\nRomantic Orientation: ${(GTV.roles.cache.get(memEntry.dataValues.romantic)).name}\nGender Identity: ${(GTV.roles.cache.get(memEntry.dataValues.gender)).name}\nPreferred Pronouns: ${await formatMultipleRoles(memEntry.dataValues.pronoun,GTV)}\nAlt Account: ${memEntry.dataValues.alt}`
                }, 
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                label: "Approve",
                                style: 3,
                                custom_id: "intro_approval_yes"
                            },
                            {
                                type: 2,
                                label: "Deny",
                                style: 4,
                                custom_id: "intro_approval_no"
                            }
                        ]
                    
                    }
                ]
            }
        });
    }
}

async function userApproved(id) {
    let GTV = await client.guilds.fetch(config.intro.guild_id);
    let member = await GTV.members.fetch(id);
    let general = await client.channels.fetch(config.intro.general);
    if (member.roles.cache.has(config.intro.roleIDs.member) == false ) {
        role = await GTV.roles.fetch(config.intro.roleIDs.member);
        member.roles.add(role);
    }
    if (member.roles.cache.has(config.intro.roleIDs.newmember) == true ) {
        role = await GTV.roles.fetch(config.intro.roleIDs.newmember);
        member.roles.remove(role);
    }
    await general.send(`Everybody welcome ${member} to the server!`)
        .then(msg => msg.react('👋'));
}

async function sendVerificationMsg(id) {
    let GTV = await client.guilds.fetch(config.intro.guild_id);
    try {
        let memtosend = await GTV.members.fetch(id);
        initiateVerif(memtosend);
        return { success: true }; //yay
    } catch(e) {
        return { success: false, error: e };
    }
}

client.login(config.intro.discord_token);

module.exports = {
    updateUserValue, addRole, previousYes, redditAccCheck, wantSub, redditUserInput, notOnSub, nameStage, sexualityStage, romanticStage, genderStage, pronounStage, regionStage, interestsStage, colorStage, altStage, altAccount, addInterestRole, removeInterestRole, addPronounRole, removePronounRole, finished, userApproved, sendVerificationMsg
};