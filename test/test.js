import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../index.js';
import { users } from '../models/userModel.js';

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
                console.log("Response status:", res.status);
                console.log("Response text:", res.text);
                res.should.have.status(200);
                res.redirects[0].should.include('/login');
                done();
            });
    });
});
