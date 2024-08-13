import bcrypt from 'bcrypt';
import { addUser, findUser } from '../models/userModel.js';

const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

export const showRegisterPage = (req, res) => {
    res.render('register');
};

export const registerUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }

    if (!validateEmail(email)) {
        return res.status(400).send('Invalid email format');
    }

    const userExists = findUser(email);
    if (userExists) {
        return res.status(400).send('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    addUser(email, hashedPassword);
    res.redirect('/login');
};

export const showLoginPage = (req, res) => {
    res.render('login');
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = findUser(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).send('Invalid credentials');
    }

    res.redirect('/home');
};

export const showHomePage = (req, res) => {
    res.render('home');
};
