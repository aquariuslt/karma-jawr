/** Created by CUIJA on 2017-09-22.*/
Ext.namespace('agile.example.app');

agile.example.app.Home = Ext.extend(agile.example.app.HomeUi, {
  initComponent: function() {
    var $this = this;
    agile.example.app.Home.superclass.initComponent.call($this);

    $this.initEventHandlers();
  },

  // test unused method
  initEventHandlers: function() {
  }

});

Ext.ComponentMgr.registerType('agile.example.app.Home', agile.example.app.Home);



