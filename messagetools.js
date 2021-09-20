
async function disableComponents(interaction) {
    let newMsg = interaction.message;
    for(let i=0; i < newMsg.components.length; i++) {
        for(let j=0; j < newMsg.components[i].components.length; j++) {
            if (newMsg.components[i].components[j].custom_id != interaction.data.custom_id) {
                newMsg.components[i].components[j].style = 2;  
            }
            newMsg.components[i].components[j].disabled = true;
        }
    }
    return newMsg;
}

async function disableComponentsInterests(interaction) {
    let newMsg = interaction.message;
    for(let i=0; i < newMsg.components.length; i++) {
        for(let j=0; j < newMsg.components[i].components.length; j++) {
            if (newMsg.components[i].components[j].style != 3) {
                newMsg.components[i].components[j].style = 2;  
            }
            newMsg.components[i].components[j].disabled = true;
        }
    }
    return newMsg;
}

async function multiComponents(interaction, stage) {
    let newMsg = interaction.message;
    if (stage == "interest") {
        for(let i=0; i < newMsg.components.length; i++) {
            for(let j=0; j < newMsg.components[i].components.length; j++) {
                if (newMsg.components[i].components[j].custom_id == interaction.data.custom_id) {
                    newMsg.components[i].components[j].style = 3;
                    newMsg.components[i].components[j].custom_id = newMsg.components[i].components[j].custom_id.replace('interest','interestremove');
                }
            }
        }
    } else if (stage == "interestremove") {
        for(let i=0; i < newMsg.components.length; i++) {
            for(let j=0; j < newMsg.components[i].components.length; j++) {
                if (newMsg.components[i].components[j].custom_id == interaction.data.custom_id) {
                    newMsg.components[i].components[j].style = 1;
                    newMsg.components[i].components[j].custom_id = newMsg.components[i].components[j].custom_id.replace('interestremove','interest');
                }
            }
        }
    } else if (stage == "pronoun") {
        for(let i=0; i < newMsg.components.length; i++) {
            for(let j=0; j < newMsg.components[i].components.length; j++) {
                if (newMsg.components[i].components[j].custom_id == interaction.data.custom_id) {
                    newMsg.components[i].components[j].style = 3;
                    newMsg.components[i].components[j].custom_id = newMsg.components[i].components[j].custom_id.replace('pronoun','pronounremove');
                }
            }
        }
    } else if (stage == "pronounremove") {
        for(let i=0; i < newMsg.components.length; i++) {
            for(let j=0; j < newMsg.components[i].components.length; j++) {
                if (newMsg.components[i].components[j].custom_id == interaction.data.custom_id) {
                    newMsg.components[i].components[j].style = 1;
                    newMsg.components[i].components[j].custom_id = newMsg.components[i].components[j].custom_id.replace('pronounremove','pronoun');
                }
            }
        }
    }
    return newMsg;
}

module.exports = {
    disableComponents, disableComponentsInterests, multiComponents
};