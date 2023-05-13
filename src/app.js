const {loadBoltLocal, loadBoltLambda} = require("./bolt_connector");

(async () => {
    // Start your app
    const bolt = loadBoltLocal(true)
    await bolt.start(3000);

    console.log('⚡️ Bolt app is running!');
})();

exports.handler = async (event, context) => {
    try {
        return await loadBoltLambda(event, context)

    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
};
