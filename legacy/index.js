require('dotenv').config();
const {App, ExpressReceiver} = require('@slack/bolt');
const github = require('../src/github');

// Initializes your app with your bot token and signing secret
const receiver = new ExpressReceiver({signingSecret: process.env.SLACK_SIGNING_SECRET});

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    receiver
});

app.command('/deploy', async ({command, ack, say}) => {
    // Acknowledge command request
    await ack();

    let reply = 'Command option not recognized, if you need help, you can use "/deploy help" \n';
    const help = 'Welcome to `deployer`! \n This tool allows to deploy from slack to github utilizing github actions \n ' +
        'To perform a deploy, please follow this structure \n' +
        '```/deploy branch_name environment``` \n' +
        'ie: ```/deploy feature/my-feat staging```';

    if (command.text === 'help' || command.text === '?') {
        reply = help;
    } else {
        //read deployment commands
        const cmdReg = new RegExp('(.*) (.*)')
        const commandContext = cmdReg.exec(command.text);
        if (commandContext) {
            reply = `Attempting to initiate Github Action deployment workflow on \`${process.env.GA_ORGANIZATION}/${process.env.GA_PROJECT}\` with the following parameters \`${commandContext[1]}\` and \`${commandContext[2]}\` \n`;
            const res = await github.runDeployment(commandContext);
            if (res.success) {
                const url = `https://github.com/${process.env.GA_ORGANIZATION}/${process.env.GA_PROJECT}/actions`
                reply += `${res.message} \n To follow progress head to ${url}`;
            } else {
                reply += `Could not complete deployment. More info: ${res.message}`
            }
        } else {
            //command not recognized
            reply += help;
        }
    }

    await say(reply);
});

// Other web requests are methods on receiver.router
receiver.router.get('/healthz', (req, res) => {
    // You're working with an express req and res now.
    res.send('service is up');
});

(async () => {
    // Start your app
    await app.start(process.env.PORT || 3000);

    console.log('⚡️ Bolt app is running!');
})();