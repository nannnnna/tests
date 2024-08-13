import chai from 'chai';
import chaiHttp from 'chai-http';
import bcrypt from 'bcrypt';
import async from 'async';
import server from '../index.js';
import { users, addUser } from '../models/userModel.js';

const should = chai.should();

chai.use(chaiHttp);

describe('POST /register', () => {
    beforeEach(() => {
        users.length = 0;
    });

    it('it should register a new user', (done) => {
        chai.request(server)
            .post('/register')
            .set('Content-Type', 'application/json') // Убедимся, что заголовок установлен
            .send({ email: 'testuser@example.com', password: 'testpass' })
            .end((err, res) => {
                if (err) {
                    console.error(err);
                }
                res.should.have.status(200);
                res.redirects[0].should.include('/login');
                done();
            });
    });
    it('it should not register a user with the same email', (done) => {
        const hashedPassword = bcrypt.hashSync('testpass', 10);
        addUser('testuser@example.com', hashedPassword);

        chai.request(server)
            .post('/register')
            .set('Content-Type', 'application/json')
            .send({ email: 'testuser@example.com', password: 'testpass' })
            .end((err, res) => {
                if (err) {
                    console.error(err);
                }
                res.should.have.status(400);
                res.text.should.be.eql('User already exists');
                done();
            });
    });
    it('it should not register a user with an invalid email format', (done) => {
        chai.request(server)
            .post('/register')
            .set('Content-Type', 'application/json')
            .send({ email: 'invalid-email', password: 'testpass' })
            .end((err, res) => {
                if (err) {
                    console.error(err);
                }
                res.should.have.status(400);
                res.text.should.be.eql('Invalid email format');
                done();
            });
    });
    it('it should not register a user without email or password', (done) => {
        chai.request(server)
            .post('/register')
            .set('Content-Type', 'application/json')
            .send({ email: '', password: '' })
            .end((err, res) => {
                if (err) {
                    console.error(err);
                }
                res.should.have.status(400);
                res.text.should.be.eql('Email and password are required');
                done();
            });
    });
    it('it should handle 100 simultaneous registrations', function(done) {
        this.timeout(10000);

        const tasks = Array.from({ length: 100 }, (_, i) => {
            return (callback) => {
                const startTime = Date.now();
                chai.request(server)
                    .post('/register')
                    .set('Content-Type', 'application/json')
                    .send({ email: `user${i}@example.com`, password: 'testpass' })
                    .end((err, res) => {
                        const endTime = Date.now();
                        const responseTime = endTime - startTime;
                        if (err) {
                            console.error(err);
                        }
                        res.should.have.status(200);
                        callback(null, responseTime);
                    });
            };
        });

        async.parallel(tasks, (err, results) => {
            if (err) {
                return done(err);
            }
            const totalResponseTime = results.reduce((sum, time) => sum + time, 0);
            const averageResponseTime = totalResponseTime / results.length;
            console.log(results.length);
            console.log(`Average response time per request: ${averageResponseTime.toFixed(2)} ms`);
            results.length.should.equal(100);
            done();
        });
    });
});
describe('POST /login', () => {
    beforeEach(() => {
        users.length = 0;
        const hashedPassword = bcrypt.hashSync('testpass', 10);
        addUser('testuser@example.com', hashedPassword);
    });

    it('it should login a registered user', (done) => {
        chai.request(server)
            .post('/login')
            .set('Content-Type', 'application/json')
            .send({ email: 'testuser@example.com', password: 'testpass' })
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
            .send({ email: 'testuser@example.com', password: 'wrongpass' })
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
            .send({ email: 'nonexistent@example.com', password: 'testpass' })
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
