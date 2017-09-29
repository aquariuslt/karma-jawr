/** Created by CUIJA on 2017-09-22.*/
Ext.namespace('agile.example.app');

agile.example.app.HomeUi = Ext.extend(Ext.Viewport, {
  layout: 'fit',
  id: 'app.home',
  initComponent: function() {
    var $this = this;
    $this.items = [
      {
        xtype: 'panel',
        layout: 'vbox',
        autoWidth: true,
        items: [
          {
            xtype: 'panel',
            layout: 'form',
            height: 100,
            width: '100%',
            hideBorders: true,
            items: [
              {
                xtype: 'label',
                text: locale.home.subtitle('Agile'),
                style: {
                  'font-family': '"Tahoma"',
                  'font-size': '30px'
                }
              }
            ]
          },
          {
            xtype: 'panel',
            title: 'Agile Page Content',
            layout: 'form',
            width: '100%'
          }
        ]
      }
    ];
    agile.example.app.HomeUi.superclass.initComponent.call(this);
  }
});





