const app = require('./app');
const main = require('./config/db');
const redisClient = require('./config/redis');

const InitializeConnection = async () => {
    try {
        await Promise.all([main(), redisClient.connect()]);
        console.log("DB Connected");

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log("Server listening at port number: " + PORT);
        })
    }
    catch (err) {
        console.log("Error: " + err);
    }
}

InitializeConnection();
