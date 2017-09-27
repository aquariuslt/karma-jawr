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
    var expectExtVersion = '3.3.1';
    expect(Ext.version).to.eq(expectExtVersion);
  });

  it('expect home ui is rendered', function() {
    expect(Ext.getCmp('app.home')).not.to.eq(undefined);
  });
});
