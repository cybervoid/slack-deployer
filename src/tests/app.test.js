const {handler} = require("../app");

(async () => {

    let event = {}
    event.body = process.env.body
    await handler(event)

    console.log('⚡️ Bolt app is running!');
})();