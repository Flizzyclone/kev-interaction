
const Discord = require("discord.js");
//const ChartJS = require("chart.js");
const { ChartJSNodeCanvas  } = require('chartjs-node-canvas');
const canvasRenderService = new ChartJSNodeCanvas({width: 1200, height: 1200});

exports.age = age;
exports.sexuality = sexuality;
exports.romantic = romantic;
exports.gender = gender;
exports.pronoun = pronoun;
exports.region = region;
exports.color = color;

async function getRoles(ids, GTV) {
    let roles = [];
    for(i=0; i < ids.length; i++) {
        roles.push(await GTV.roles.cache.get(ids[i]));
    }
    return roles;
}

async function getMemberCount(roles, dontCount) {
    if (dontCount == null) {
        dontCount = [];
    }
    let count = 0;
    for(i=0; i < roles.length; i++) {
        if (dontCount.indexOf(roles[i].id) == -1) {
            count += roles[i].members.array().length;
        }
    }
    return count;
}

async function getMembersPerRole(roles) {
    let countList = [];
    for(i=0; i < roles.length; i++) {
        countList.push(roles[i].members.array().length);
    }
    return countList;
}

async function getRoleNames(roles) {
    let namesList = [];
    for(i=0; i < roles.length; i++) {
        namesList.push(roles[i].name);
    }
    return namesList;
}

async function getPieColors(roles) {
    let colorList = [];
    for(i=0; i < roles.length; i++) {
        colorList.push(roles[i].hexColor);
    }
    return colorList;
}

async function makeDescription(roleNames, membersPerRole, members) {
    let description = "";
    for(i=0; i < roleNames.length; i++) {
        description += `\n${roleNames[i]} - ${membersPerRole[i]} - ${((membersPerRole[i]/members * 100).toFixed(2))}%`;
    }
    return description;
}

async function age(GTV) {
    const roleIDs = ['','','','','','',''];
    try {
        roles = await getRoles(roleIDs, GTV);
        members = await getMemberCount(roles);
        membersPerRole = await getMembersPerRole(roles);
        roleNames = ['Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen']; 
        piechart = await makePie(membersPerRole, ['#FF0000','#EA4335','#34A853','#93C47D','#46BCD6','#7BAAF7','#4A86E8'], roleNames);
    } catch(e) {
        console.log(e);
        return { success:false, error:('`' + e + '`')};
    }
    let message = {
        title: 'GTV Demographics - Age',
        description: await makeDescription(roleNames, membersPerRole, members),
        thumbnail:{url: 'attachment://chart.png'}
    };
    return { success: true, file: piechart, embed: message };
}

async function sexuality(GTV) {
    const roleIDs = ['','','','','','','','','','','','',''];
    let roles, members, membersPerRole, roleNames, piechart;
    try {
        roles = await getRoles(roleIDs, GTV);
        members = await getMemberCount(roles);
        membersPerRole = await getMembersPerRole(roles);
        roleNames = await getRoleNames(roles); 
        piechart = await makePie(membersPerRole, await getPieColors(roles), roleNames);
    } catch(e) {
        console.log(e);
        return { success:false, error:('`' + e + '`')};
    }
    let message = {
        title: 'GTV Demographics - Sexual Orientation',
        description: await makeDescription(roleNames, membersPerRole, members),
        thumbnail:{url: 'attachment://chart.png'}
    };
    return { success: true, file: piechart, embed: message };
}

async function romantic(GTV) {
    const roleIDs = ['','','','','','','','','','','','',''];
    let roles, members, membersPerRole, roleNames, piechart;
    try {
        roles = await getRoles(roleIDs, GTV);
        members = await getMemberCount(roles);
        membersPerRole = await getMembersPerRole(roles);
        roleNames = await getRoleNames(roles); 
        piechart = await makePie(membersPerRole, await getPieColors(roles), roleNames);
    } catch(e) {
        console.log(e);
        return { success:false, error:('`' + e + '`')};
    }
    let message = {
        title: 'GTV Demographics - Romantic Orientation',
        description: await makeDescription(roleNames, membersPerRole, members),
        thumbnail:{url: 'attachment://chart.png'}
    };
    return { success: true, file: piechart, embed: message };
}

async function gender(GTV) {
    const roleIDs = ['','','','','','','','','','','','','',''];
    let roles, members, membersPerRole, roleNames, piechart;
    try {
        roles = await getRoles(roleIDs, GTV);
        members = await getMemberCount(roles,['','','','']);
        membersPerRole = await getMembersPerRole(roles);
        roleNames = await getRoleNames(roles); 
        piechart = await makePie(membersPerRole, ['#93C47D','#7BAAF7','#FF0000','#EA4335','#34A853','#46BCD6','#FF0000','#EA4335','#34A853','#3F51B5','0069c0','#93C47D','#7BAAF7','#FF0000'], roleNames);
    } catch(e) {
        console.log(e);
        return { success:false, error:('`' + e + '`')};
    }
    let message = {
        title: 'GTV Demographics - Gender Identity',
        description: await makeDescription(roleNames, membersPerRole, members),
        thumbnail:{url: 'attachment://chart.png'}
    };
    return { success: true, file: piechart, embed: message };
}

async function pronoun(GTV) {
    const roleIDs = ['','','','','','',''];
    let roles, members, membersPerRole, roleNames, piechart;
    try {
        roles = await getRoles(roleIDs, GTV);
        members = await getMemberCount(roles,['']);
        membersPerRole = await getMembersPerRole(roles);
        roleNames = await getRoleNames(roles); 
        piechart = await makePie(membersPerRole, ['#93C47D','#7BAAF7','#FF0000','#EA4335','#34A853','#46BCD6'], roleNames);
    } catch(e) {
        console.log(e);
        return { success:false, error:('`' + e + '`')};
    }
    let message = {
        title: 'GTV Demographics - Preferred Pronouns',
        description: await makeDescription(roleNames, membersPerRole, members),
        thumbnail:{url: 'attachment://chart.png'}
    };
    return { success: true, file: piechart, embed: message };
}

async function region(GTV) {
    const roleIDs = ['','','','','','',''];
    let roles, members, membersPerRole, roleNames, piechart;
    try {
        roles = await getRoles(roleIDs, GTV);
        members = await getMemberCount(roles,['']);
        membersPerRole = await getMembersPerRole(roles);
        roleNames = await getRoleNames(roles); 
        piechart = await makePie(membersPerRole, ['#93C47D','#7BAAF7','#FF0000','#EA4335','#34A853','#46BCD6','#FF0000','#EA4335'], roleNames);
    } catch(e) {
        console.log(e);
        return { success:false, error:('`' + e + '`')};
    }
    let message = {
        title: 'GTV Demographics - Region',
        description: await makeDescription(roleNames, membersPerRole, members),
        thumbnail:{url: 'attachment://chart.png'}
    };
    return { success: true, file: piechart, embed: message };
}

async function color(GTV) {
    const roleIDs = ['','','','','','','','','','','','','','','','','','',''];
    let roles, members, membersPerRole, roleNames, piechart;
    try {
        roles = await getRoles(roleIDs, GTV);
        members = await getMemberCount(roles,['']);
        membersPerRole = await getMembersPerRole(roles);
        roleNames = await getRoleNames(roles); 
        piechart = await makePie(membersPerRole, await getPieColors(roles), roleNames);
    } catch(e) {
        console.log(e);
        return { success:false, error:('`' + e + '`')};
    }
    let message = {
        title: 'GTV Demographics - Color',
        description: await makeDescription(roleNames, membersPerRole, members),
        thumbnail:{url: 'attachment://chart.png'}
    };
    return { success: true, file: piechart, embed: message };
}

async function makePie(piedata, piecolors, pielabels) {
    let image;
    let configuration = {
        type: 'doughnut',
        data: {
            datasets: [{
                data: piedata,
                backgroundColor: piecolors, 
                borderWidth: 0,
            }],
            labels: pielabels
        },
        options: {
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: {
                            size: 30,
                        },
                        color:'#FFFFFF'
                    }
                }  
            }
        }
    };

    image = await canvasRenderService.renderToStream(configuration);
    return image;
}