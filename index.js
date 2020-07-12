const {App} = require('@slack/bolt');

// Initializes your app with your bot token and signing secret
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});

app.command('/deploy', async ({command, ack, say}) => {
    // Acknowledge command request
    await ack();

    let reply = 'Command option not recognized, if you need help, you can use "/deploy help"';
    if (command.text === 'help' || command.text === '?') {
        reply = 'Welcome to deployer! \n This tool allows to deploy from slack to github utilizing github actions \n ' +
            'To perform a deploy, please follow this structure \n' +
            '/deploy branch_name environment \n' +
            'ie: /deploy feature/my-feat staging'
    }

    //read deployment commands
    const cmdReg = new RegExp('(.*) (.*)')
    const commandContext = cmdReg.exec(command.text);
    if (commandContext) {
        reply = `Deploying branch: ${commandContext[1]} on ${commandContext[2]} \n Attempting to initiate Github Action Workflow ...`;

        console.log(commandContext);
    }

    await say(reply);
});

(async () => {
    // Start your app
    await app.start(process.env.PORT || 3000);

    console.log('⚡️ Bolt app is running!');
})();