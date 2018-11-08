var negotiate = require('..')
var Strategy = negotiate.Strategy;
var noUserError = require("../lib/passport-negotiate/errors/nousererror")
var chai = require('chai')
, passport = require('chai-passport-strategy');
var kerberos = require('kerberos');

chai.use(passport);


var expect = chai.expect;

const username = process.env.KERBEROS_USERNAME || 'administrator';
const realm = process.env.KERBEROS_REALM || 'example.com';
const hostname = process.env.KERBEROS_HOSTNAME || 'hostname.example.com';
const service = process.env.KERBEROS_SERVICE || 'HTTP';
const userPrincipal = username + '@' + realm.toUpperCase();


describe('Strategy', function() {
  describe('constructed', function() {
    var strategy = new Strategy({}, function (){})
    it('should be named negotiate', function () {
        expect(strategy.name).to.equal('negotiate');
    });
  });
  describe('constructed with undefined options', function() {
    it('should throw', function() {
      expect(function() {
        var strategy = new Strategy(undefined, function(){});
      }).to.throw(Error);
    });
  });

  describe('authorization request', function() {
    var strategy = new Strategy({
      }, function(){});
    var header;

    before(function(done) {
      chai.passport.use(strategy)
      .fail(function(h) {
        header =h;
        done();
      })
      .req(function(req) {
        set_headers(req, {});
      })
      .authenticate();
    });
      
    it('Should fail with "Negotiate"', function () {
      expect(header).to.equal("Negotiate")
    }); 
  });

  describe('authentication request with token', function() {
    var user
      , req
    var strategy = new Strategy({}, function(principal, done){
      done(null, principal);
    });

    before(function(done) {
      kerberos.initializeClient(service, {}, function(err, client) {
        expect(err).to.not.exist;
        client.step('', function(err, token) {
          expect(err).to.not.exist;
          chai.passport.use(strategy)
            .success(function(u){
              user = u;
              done();
            })
            .req(function(r) {
              req = r;
              r.session = {};
              set_headers(r, {authorization:'Negotiate '+ token});
            })
            .authenticate();
        })
      })
    })
    it('should supply user', function () {
      expect(user).to.equal(userPrincipal)
    });
    it('should set authenticatedPrincipal', function () {
      expect(req.authenticatedPrincipal).to.equal(userPrincipal);
    })
    it('should set authenticatedPrincipal in session', function () {
      expect(req.session.authenticatedPrincipal).to.equal(userPrincipal);
    })

  });
  describe('authentication request with token, but no user', function() {
    var fail_err
      , req;

    var strategy = new Strategy({}, function(principal, done){
      done(null, null);
    });

    before(function(done) {
      kerberos.initializeClient(service, {}, function(err, client) {
        expect(err).to.not.exist;
        client.step('', function(err, token) {
          expect(err).to.not.exist;
          chai.passport.use(strategy)
            .fail(function(e) {
              fail_err = e;
              done();
            })
            .req(function(r) {
              req = r;
              set_headers(r, {authorization:'Negotiate '+ token});
              r.session = {}
            })
            .authenticate({});
        })
      })
    });
    it('should fail with noUserError', function () {
      expect(fail_err).to.be.an.instanceOf(noUserError)
      expect(fail_err.principal).to.equal(userPrincipal);
    });
    it('should set authenticatedPrincipal', function () {
      expect(req.authenticatedPrincipal).to.equal(userPrincipal);
    })
    it('should set authenticatedPrincipal in session', function () {
      expect(req.session.authenticatedPrincipal).to.equal(userPrincipal);
    })
  });
  describe('authentication request with token and noUserRedirect', function() {
    var redir_url
      , req;

    const url = 'http://example.com/profile';

    var strategy = new Strategy({}, function(principal, done){
      done(null, null);
    });

    before(function(done) {
      kerberos.initializeClient(service, {}, function(err, client) {
        expect(err).to.not.exist;
        client.step('', function(err, token) {
          expect(err).to.not.exist;
          chai.passport.use(strategy)
            .redirect(function(u) {
              redir_url = u;
              done();
            })
            .req(function(r) {
              req = r;
              set_headers(r, {authorization:'Negotiate '+ token});
            })
            .authenticate({noUserRedirect:url});
        })
      })
    });
    it('should redirect', function () {
      expect(redir_url).to.equal(url);
    });
    it('should set authenticatedPrincipal', function () {
      expect(req.authenticatedPrincipal).to.equal(userPrincipal);
    })
  });

  describe('authentication request with invalid token', function() {
    var err;

    var strategy = new Strategy({}, function(principal, done){
      done(null, principal);
    });

    before(function(done) {
      chai.passport.use(strategy)
        .error(function(e) {
          err = e;
          done();
        })
        .req(function(r) {
          set_headers(r, {authorization:'Negotiate XXX'});
        })
        .authenticate();
    });
    it("should error with a string", function() {
      expect(err).to.be.an.a('string')
    })

  });
});

function set_headers(req, headers) {
  req.get = function (name) {
    return headers[name];
  }
}