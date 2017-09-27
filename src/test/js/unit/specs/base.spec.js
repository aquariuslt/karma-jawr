/** Created by CUIJA on 2017-09-27.*/
require('@/jsBundles/extJs.js');
require('@/jsBundles/home.js');

describe('ext', function() {

  before(function() {
    Ext.onReady(function() {
      Ext.QuickTips.init();
      new agile.example.app.Home({
        renderTo: Ext.getBody()
      });
    });
  });

  it('check extjs is loaded', function() {

  });
});
