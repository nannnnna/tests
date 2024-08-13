import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../index.js';
import { users, addUser } from '../models/userModel.js';
import bcrypt from 'bcrypt';

const should = chai.should();

chai.use(chaiHttp);

describe('POST /register', () => {
    beforeEach(() => {
        // Очистка данных пользователей перед каждым тестом
        users.length = 0;
    });

    it('it should register a new user', (done) => {
        chai.request(server)
            .post('/register')
            .set('Content-Type', 'application/json') // Убедимся, что заголовок установлен
            .send({ username: 'testuser', password: 'testpass' })
            .end((err, res) => {
                if (err) {
                    console.error(err);
                }
                // console.log("Response status:", res.status);
                // console.log("Response text:", res.text);
                res.should.have.status(200);
                res.redirects[0].should.include('/login');
                done();
            });
    });
    it('it should not register a user with the same username', (done) => {
        const hashedPassword = bcrypt.hashSync('testpass', 10);
        addUser('testuser', hashedPassword);

        chai.request(server)
            .post('/register')
            .set('Content-Type', 'application/json')
            .send({ username: 'testuser', password: 'testpass' })
            .end((err, res) => {
                if (err) {
                    console.error(err);
                }
                // console.log("Response status:", res.status);
                // console.log("Response text:", res.text);
                res.should.have.status(400);
                res.text.should.be.eql('User already exists');
                done();
            });
    });
});
describe('POST /login', () => {
    beforeEach(() => {
        // Очистка данных пользователей перед каждым тестом
        users.length = 0;
        const hashedPassword = bcrypt.hashSync('testpass', 10);
        addUser('testuser', hashedPassword);
    });

    it('it should login a registered user', (done) => {
        chai.request(server)
            .post('/login')
            .set('Content-Type', 'application/json')
            .send({ username: 'testuser', password: 'testpass' })
            .end((err, res) => {
                if (err) {
                    console.error(err);
                }
                res.should.have.status(200);
                res.redirects[0].should.include('/home');
                done();
            });
    });

    it('it should not login with invalid credentials', (done) => {
        chai.request(server)
            .post('/login')
            .set('Content-Type', 'application/json')
            .send({ username: 'testuser', password: 'wrongpass' })
            .end((err, res) => {
                if (err) {
                    console.error(err);
                }
                res.should.have.status(401);
                res.text.should.be.eql('Invalid credentials');
                done();
            });
    });

    it('it should not login a non-existent user', (done) => {
        chai.request(server)
            .post('/login')
            .set('Content-Type', 'application/json')
            .send({ username: 'nonexistent', password: 'testpass' })
            .end((err, res) => {
                if (err) {
                    console.error(err);
                }
                res.should.have.status(401);
                res.text.should.be.eql('Invalid credentials');
                done();
            });
    });
});
