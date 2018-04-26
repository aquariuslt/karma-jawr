/** Created by CUIJA on 2017-09-22.*/
Ext.namespace('karma.jawr.sample.app');

karma.jawr.sample.app.Home = Ext.extend(karma.jawr.sample.app.HomeUi, {
  initComponent: function() {
    var $this = this;
    karma.jawr.sample.app.Home.superclass.initComponent.call($this);

    $this.initEventHandlers();
  },

  // test unused method
  initEventHandlers: function() {
  }

});

Ext.ComponentMgr.registerType('karma.jawr.sample.app.Home', karma.jawr.sample.app.Home);



