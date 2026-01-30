const mongoose = require('mongoose');

async function main() {
    const dbString = process.env.DB_CONNECT_STRING;
    if (!dbString) {
        throw new Error("FATAL ERROR: DB_CONNECT_STRING is undefined. Please check your .env file or Render Environment Variables.");
    }
    await mongoose.connect(dbString);
}

module.exports = main;


