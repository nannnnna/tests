import express from 'express';
import bodyParser from 'body-parser';
import { engine } from 'express-handlebars';
import knex from 'knex';
import knexConfig from './knexfile.js';
import { showRegisterPage, registerUser, showLoginPage, loginUser, showHomePage } from './controllers/authController.js';

const db = knex(knexConfig.development);
const app = express();
const port = 3000;

app.engine('handlebars', engine({
    layoutsDir: './views/layouts',
    defaultLayout: 'main',
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect('/register');
});

app.get('/register', showRegisterPage);
app.post('/register', registerUser);

app.get('/login', showLoginPage);
app.post('/login', loginUser);

app.get('/home', showHomePage);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

export default app;
