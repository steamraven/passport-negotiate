var negotiate = require('..');
var chai = require('chai')

var expect = chai.expect;

describe('passport-negotiate', function (){
  it('should export Strategy constructor', function () {
    expect(negotiate.Strategy).to.be.a('function');
  });
  it('should export Strategy constructor as a module', function () {
    expect(negotiate).to.be.a('function');
    expect(negotiate).to.be.equal(negotiate.Strategy);
  })
  
});