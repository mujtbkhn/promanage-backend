const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
const { Todo } = require('../models/todo');
const AllowedEmail = require('../models/Allowed');

const registeredUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email or password missing"
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword
        });


        const token = jwt.sign({ userId: newUser._id, name: newUser.name, email: newUser.email }, process.env.SECRET_KEY);

        res.json({
            message: "User created successfully",
            token
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = {};
            Object.keys(error.errors).forEach((key) => {
                errors[key] = error.errors[key].message;
            });
            return res.status(400).json({ errors });
        }
        next(error);
    }
};

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "email or password is empty"
            });
        }
        const userDetails = await User.findOne({ email });
        if (!userDetails) {
            return res.status(400).json({
                message: "invalid email"
            });
        }
        const passwordMatch = await bcrypt.compare(
            password,
            userDetails.password
        );
        if (!passwordMatch) {
            return res.status(400).json({
                message: "password is incorrect"
            });
        }


        const token = jwt.sign({ userId: userDetails._id, name: userDetails.name, email: userDetails.email }, process.env.SECRET_KEY);
        res.json({
            message: "user logged in successfully",
            token: token
        });
    } catch (error) {
        next(error);
    }
}

const reset = async (req, res, next) => {
    try {
        const { newName, currentPassword, newPassword } = req.body;

        const user = await User.findOne({ email: req.user.email });
        console.log(req.user.email)
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (newName) {
            user.name = newName;
        }

        if (newPassword) {
            const passwordMatch = await bcrypt.compare(currentPassword, user.password);
            if (!passwordMatch) {
                return res.status(400).json({ message: "Current password is incorrect" });
            }
            const isSamePassword = await bcrypt.compare(newPassword, user.password);
            if (isSamePassword) {
                return res.status(400).json({ message: "New password must be different from the old password" });
            }
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedNewPassword;
        }

        await user.save();
        res.json({ message: "User details updated successfully" });
    } catch (error) {
        next(error);
    }
}


const addUserByEmail = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Ensure the user is authenticated and userId is available in req.user
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Check if the email already exists for the current user
        const existingEmail = await AllowedEmail.findOne({ email, userId: req.user.userId });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists in allowed list' });
        }

        // Create a new AllowedEmail document
        const newAllowedEmail = new AllowedEmail({ email, userId: req.user.userId });
        await newAllowedEmail.save();

        res.status(201).json({ message: 'Email added successfully to allowed list', email: newAllowedEmail });
    } catch (error) {
        next(error);
    }
};

const getUserByEmail = async (req, res, next) => {
    try {
        // Ensure the user is authenticated and userId is available in req.user
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Fetch all allowed emails for the current user
        const allowedEmails = await AllowedEmail.find({ userId: req.user.userId });

        res.json({ allowedEmails });
    } catch (error) {
        next(error);
    }
}



module.exports = { registeredUser, loginUser, reset, addUserByEmail, getUserByEmail }
