/** Created by CUIJA on 2017-09-27.*/
require('@/jsBundles/extJs.js/');
require('@/jsBundles/home.js/');
require('@/jsBundles/i18n.js/');

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

  it('check locale message is loaded normally', function() {
    var homeTitle = locale.home.title();
    expect(homeTitle).to.eq('HomePage Sample Title');
  });

  it('check local message with arguments loaded normally', function() {
    var homeSubTitle = locale.home.subtitle('Agile');
    expect(homeSubTitle).to.eq('Agile Page SubTitle');
  });
});
