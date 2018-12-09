const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../../server');

chai.use(chaiHttp);

describe('Client Routes', () => {
  it('returns the homepage with text', done => {
    chai.request(server)
    .get('/')
    .end((err, response) => {
      response.should.have.status(200);
      response.should.be.html;
      response.res.text.should.equal('Welcome!');
      done();
    });
  });

  it('returns a 404 for a route that does not exist', done => {
    chai.request(server)
    .get('/sadly')
    .end((err, response) => {
      response.should.have.status(404);
      done();
    });
  });


});

describe('API Routes', () => {

});