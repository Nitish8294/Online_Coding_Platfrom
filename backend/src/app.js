const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const authRouter = require("./routes/userAuth");
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit");
const aiRouter = require("./routes/aiChatting");
const videoRouter = require("./routes/videoCreator");

const app = express();

app.use(cors({
         origin: process.env.FRONTEND_URL || 'http://localhost:5173',
         credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Health Check Endpoint
app.get('/health', (req, res) => {
         res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/user', authRouter);
app.use('/problem', problemRouter);
app.use('/submission', submitRouter);
app.use('/ai', aiRouter);
app.use("/video", videoRouter);

module.exports = app;
