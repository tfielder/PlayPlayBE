const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../../server');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('../../knexfile')[environment];
const database = require('knex')(configuration);

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
  before((done) => {
    database.migrate.latest()
      .then(() => done())
      .catch(error => {
        throw error;
      });
  });

  beforeEach((done) => {
    database.seed.run()
      .then(() => done())
      .catch(error => {
        throw error;
      });
  });

  describe('GET /api/v1/favorites', () => {
    it('returns all of the songs', done => {
      chai.request(server)
        .get('/api/v1/favorites')
        .end((error, response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.a('array');
          response.body.length.should.equal(4);
          response.body[0].should.have.property('name');
          response.body[0].name.should.equal('I Want to Break Free');
          response.body[0].should.have.property('artist_name');
          response.body[0].artist_name.should.equal('Queen');
          response.body[0].should.have.property('genre');
          response.body[0].genre.should.equal('Rock');
          response.body[0].should.have.property('song_rating');
          response.body[0].song_rating.should.equal(99);
          done();
        });
    });
  });

  describe('POST /api/v1/songs', () => {
    it('creates a new song', done => {
      chai.request(server)
      .post('/api/v1/songs')
      .send({
        name: 'Titanium',
        artist_name: 'David Guetta feat. Sia',
        genre: 'Electronic',
        song_rating: 99
      })
      .end((err, response) => {
        response.should.have.status(201);
        response.body.should.be.a('object');
        // response.body.should.have.property('name');
        done();
      });
    });
  });


});