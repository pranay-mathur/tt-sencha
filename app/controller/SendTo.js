Ext.define('ttapp.controller.SendTo', {
    extend: 'Ext.app.Controller',
    xtype: 'sendto',
    config: {
        refs: {
            sendTinkButtonClick: '#sendTink',
            searchContactsField: '#searchContactsField'
        },
        control: {
            'searchContactsField': {
                // todo not working yet
                keyup: 'onSearchKeyUp',
                clearicontap: 'onSearchClearIconTap'
            },
            'sendto list': {
                itemtap: 'composeTink'
            }
        }
    },
    onSearchClearIconTap: function() {
        //call the clearFilter method on the store instance
        Ext.getStore('Contacts').getStore().clearFilter();
    },
    onSearchKeyUp : function(field){
        var value = field.getValue(),
            store = Ext.getStore('Contacts');

        //first clear any current filters on thes tore
        store.clearFilter();

        //check if a value is set first, as if it isnt we dont have to do anything
        if (value) {
            //the user could have entered spaces, so we must split them so we can loop through them all
            var searches = value.split(' '),
                regexps = [],
                i;

            //loop them all
            for (i = 0; i < searches.length; i++) {
                //if it is nothing, continue
                if (!searches[i]) continue;

                //if found, create a new regular expression which is case insenstive
                regexps.push(new RegExp(searches[i], 'i'));
            }

            //now filter the store by passing a method
            //the passed method will be called for each record in the store
            store.filter(function(record) {
                var matched = [];

                //loop through each of the regular expressions
                for (i = 0; i < regexps.length; i++) {
                    var search = regexps[i],
                        didMatch = record.get('first_name').match(search) || record.get('last_name').match(search);

                    //if it matched the first or last name, push it into the matches array
                    matched.push(didMatch);
                }

                //if nothing was found, return false (dont so in the store)
                if (regexps.length > 1 && matched.indexOf(false) != -1) {
                    return false;
                } else {
                    //else true true (show in the store)
                    return matched[0];
                }
            });

        }
    },
    composeTink : function(list, idx, target, record, evt){
        from_user = Ext.getStore('profilestore').getPhoneNumber();
        this.sendTink(from_user, record.data.phone_number, (new Date()).valueOf(), 
            this.trinket_id, "hello", this.seconds_sent);
        ttapp.util.FeedProxy.process();
        this.showFeed();
    },
    sendTink: function(from_user, to_user, send_timestamp, trinket_id, text, seconds_sent){
          Ext.Ajax.request({
                            url: 'http://localhost:8888/message-queue/',
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json'},
                            disableCaching: false,
                            jsonData: {
                                "from_user" : from_user,
                                "to_user" : to_user, 
                                "send_timestamp": send_timestamp, 
                                "trinket_id": trinket_id, 
                                "text" : text,
                                "seconds_sent": seconds_sent
                            },

                            success: function(response) {
                                console.log(response.responseText);
                            }
                        });
    },
    showFeed: function(){
        var cs = Ext.getCmp('choose-recepients');
        cs.hide();
        Ext.Viewport.setActiveItem('feed');
    },
    showSendTo: function(seconds_sent, trinket_id){
        this.seconds_sent = seconds_sent;
        this.trinket_id = trinket_id;

        Ext.Viewport.add({
            xtype: 'sendto',
            id: 'choose-recepients',
            modal: true,
            hideOnMaskTap: true,
            showAnimation: {
                type: 'popIn',
                duration: 250,
                easing: 'ease-out'
            },
            hideAnimation: {
                type: 'popOut',
                duration: 250,
                easing: 'ease-out'
            },
            centered: true,
            width: Ext.filterPlatform('ie10') ? '100%' : (Ext.os.deviceType == 'Phone') ? 260 : 400,
            height: Ext.filterPlatform('ie10') ? '30%' : Ext.os.deviceType == 'Phone' ? 220 : 400
        });
    }
});
