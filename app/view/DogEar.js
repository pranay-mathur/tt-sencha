Ext.define('ttapp.view.DogEar', {
    extend: 'Ext.Toolbar',
    xtype: 'dogear',
    config: {
            ui: 'neutral',
            docked: 'top',
            style: 'opacity:0.2;',
            scrollable: null,
            defaults: {
                ui: 'plain'
            },
            items: [
                {
                    xtype: 'button',
                    iconCls: 'speedometer',
                    docked: 'left'
                },
                {
                    xtype: 'button',
                    iconCls: 'mail',
                    docked: 'right'
                }
            ]
    }
});
