const redisClient = require("../config/redis");
const User = require("../models/user")
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Submission = require("../models/submission")


const register = async (req, res) => {

    try {
        // validate the data;
        validate(req.body);
        const { firstName, emailId, password } = req.body;

        const existingUser = await User.findOne({ emailId });
        if (existingUser) {
            return res.status(409).json({ message: "User with this email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            firstName,
            emailId,
            password: hashedPassword,
            role: 'user'
        });
        const token = jwt.sign({ _id: user._id, emailId: user.emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: '1h' });
        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role,
        }

        res.cookie('token', token, {
            maxAge: 60 * 60 * 1000, // 1 hour
            httpOnly: true, // Prevent XSS attacks from accessing the cookie
            secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
            sameSite: 'strict' // Mitigate CSRF attacks
        });
        res.status(201).json({
            user: reply,
            message: "User registered successfully"
        })
    }
    catch (err) {
        console.error(err); // Log error for debugging
        res.status(500).json({ message: "An internal server error occurred." });
    }
}


const login = async (req, res) => {

    try {
        const { emailId, password } = req.body;

        if (!emailId || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const user = await User.findOne({ emailId });

        if (!user) {
            // Avoid user enumeration attacks by not revealing if the user exists.
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role,
        }

        const token = jwt.sign({ _id: user._id, emailId: emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: '1h' });
        res.cookie('token', token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        res.status(200).json({
            user: reply,
            message: "Logged in successfully"
        })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "An internal server error occurred." });
    }
}


// logOut feature

const logout = async (req, res) => {

    try {
        const { token } = req.cookies;
        if (token) {
            const payload = jwt.decode(token);
            if (payload && payload.exp) {
                // Add token to a blocklist in Redis until it expires
                await redisClient.set(`token:${token}`, 'Blocked', {
                    EXAT: payload.exp
                });
            }
        }

        res.cookie("token", '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(0)
        });
        res.status(200).json({ message: "Logged Out Successfully" });

    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "An internal server error occurred." });
    }
}


const adminRegister = async (req, res) => {
    try {
        // validate the data;
        validate(req.body);
        const { firstName, emailId, password, role } = req.body;

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            firstName,
            emailId,
            password: hashedPassword,
            role: role || 'user' // Default to 'user' if not provided
        });

        // Admins creating users should not log in as them.
        res.status(201).json({
            message: "User created successfully",
            user: { _id: user._id, emailId: user.emailId, role: user.role }
        });
    }
    catch (err) {
        console.error(err);
        // Check for duplicate email error from MongoDB (code 11000)
        if (err.code === 11000) {
            return res.status(409).json({ message: "User with this email already exists." });
        }
        res.status(500).json({ message: "An internal server error occurred." });
    }
}

const deleteProfile = async (req, res) => {

    try {
        const userId = req.result._id;

        // userSchema delete
        await User.findByIdAndDelete(userId);

        // Also delete related user data to maintain data integrity
        await Submission.deleteMany({ userId });

        res.status(200).send("Deleted Successfully");

    }
    catch (err) {

        res.status(500).send("Internal Server Error");
    }
}


const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("-password"); // Exclude passwords
        res.status(200).json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const googleLogin = async (req, res) => {
    try {
        const { emailId, firstName, lastName } = req.body;

        // Check if user exists
        let user = await User.findOne({ emailId: emailId });

        if (!user) {
            // Create new user with random password
            const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(password, 10);

            user = new User({
                firstName,
                lastName,
                emailId,
                password: hashedPassword,
                role: 'user'
            });
            await user.save();
        }

        // Generate Token
        const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY, { expiresIn: "10d" });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true, // Assuming HTTPS or production
            sameSite: 'none' // Important for cross-site if needed
        });

        res.status(200).json({
            message: "Login Successful",
            user: {
                _id: user._id,
                emailId: user.emailId,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        });

    } catch (err) {
        console.error("Google Login Error:", err);
        res.status(500).send("ERROR: " + err.message);
    }
}

module.exports = {
    register,
    login,
    logout,
    adminRegister,
    deleteProfile,
    getAllUsers,
    googleLogin
};