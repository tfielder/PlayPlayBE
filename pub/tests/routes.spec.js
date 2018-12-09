const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../../server');

chai.use(chaiHttp);

describe('Client Routes', () => {
  it('should return the homepage with text', done => {
    chai.request(server)
    .get('/')
    .end((err, response) => {
      response.should.have.status(200);
      response.should.be.html;
      response.res.text.should.equal('Welcome!');
      done();
    });
  });
});

describe('API Routes', () => {

});