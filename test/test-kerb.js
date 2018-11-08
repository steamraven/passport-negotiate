var kerberos = require('kerberos');
var should = require('chai').should()

kerberos.initializeClient('HTTP', {}, (err, client) => {
  should.not.exist(err);
  kerberos.initializeServer('HTTP', (err, server) => {
    should.not.exist(err);
    client.step('', (err, clientResponse) => {
          should.not.exist(err);
          server.step(clientResponse, (err, serverResponse) => {
              should.not.exist(err);
              client.step(serverResponse, err => {
                var username = server.username;
                console.log("Username:", username, server.targetName);
                should.equal(client.contextComplete, true);
                should.equal(server.contextComplete, true);
                return
              })
          })
      })
  })



});