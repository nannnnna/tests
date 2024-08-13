import bcrypt from 'bcrypt';
import { addUser, findUser } from '../models/userModel.js';

export const showRegisterPage = (req, res) => {
    res.render('register');
};

export const registerUser = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    const userExists = findUser(username);
    if (userExists) {
        return res.status(400).send('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    addUser(username, hashedPassword);
    res.redirect('/login');
};

export const showLoginPage = (req, res) => {
    res.render('login');
};

export const loginUser = async (req, res) => {
    const { username, password } = req.body;
    const user = findUser(username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).send('Invalid credentials');
    }

    res.redirect('/home');
};

export const showHomePage = (req, res) => {
    res.render('home');
};
