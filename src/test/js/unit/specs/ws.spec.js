
var sinon = require('sinon');

describe('ws', function() {

  before(function() {
    var $this = this;
    var fakeResponseText = 'hello';
    $this.server = sinon.fakeServer.create();
    $this.server.respondWith('GET', new RegExp('/api/v1/test'), fakeResponseText);
  });

  after(function() {
    var $this = this;
    $this.server.restore();
  });

  it('# ext ajax simple mockup', function(done) {
    // define application-level ajax request function ==> suppose not to be here, just an example
    function testAjaxRequest(callback) {
      Ext.Ajax.request({
        method: 'GET',
        url: '/api/v1/test',
        success: function(response) {
          callback(response.responseText);
        },
        failure: function(response) {
          callback(response.responseText);
        }
      });
    }

    // define callback action function ==> suppose to be here, just an example, but you can inject it using spy to using expect in callback function
    function ajaxCallback(res) {
      expect(res).to.eq('hello');
      done();
    }

    var $this = this;
    testAjaxRequest(ajaxCallback);
    $this.server.respond();

  });
});
