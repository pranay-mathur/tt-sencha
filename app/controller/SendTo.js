Ext.define('ttapp.controller.SendTo', {
    extend: 'Ext.app.Controller',
    requires: ['ttapp.config.Config'],
    config: {
        refs: {
            searchContactsField: 'searchfield[cls~=searchContactsField]',
            btnSendTink: 'button[cls~=clsSendTink]',
        },
        control: {
            'searchContactsField': {
                keyup: 'onSearchKeyUp',
                clearicontap: 'onSearchClearIconTap'
            },
            'btnSendTink': {
                tap: 'composeTink'              
            },
            'sendto list': {
                itemtap: 'saveTappedContact'              
            },
            'sendto list toolbar button': {
                tap: 'returnToTink'
            },
            'sendto': {
                show: 'onShowSendTo'
            }
        }
    },
    onShowSendTo: function(){
        this.setPreviewItems();
    },
    setPreviewItems: function(){
        var prevTrinket = Ext.ComponentQuery.query('#previewTrinket')[0];
        var secSent = Ext.ComponentQuery.query('#previewSeconds')[0];
        
        secSent.setHtml(this.seconds_sent);

        var activeTrinketThumbnailPath = Ext.getStore('trinketstore').getThumbnailPath(this.trinket_name);
        prevTrinket.setSrc(activeTrinketThumbnailPath);
    },
    saveTappedContact: function(list, idx, target, record, evt){
        this.phoneNumber = record.data.phone_number;
    },
    clearAll: function(){
        var sf = Ext.ComponentQuery.query('searchfield[cls~=searchContactsField]')[0];
        sf.reset();
        this.onSearchClearIconTap();
    },
    onSearchClearIconTap: function() {
        //call the clearFilter method on the store instance
        Ext.getStore('phonecontacts').clearFilter();
    },
    returnToTink: function(){
        this.closeMe();
        this.showTink();
    },
    onSearchKeyUp : function(field){
        var value = field.getValue(),
            store = Ext.getStore('phonecontacts');

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
    closeMe: function(){
        var cs = Ext.ComponentQuery.query('#choose-recepients')[0];
        cs.destroy();
    },
    inviteViaSms: function(){
        //console.log(this.phoneNumber);
        if (Ext.os.deviceType == 'Phone'){
            var sConf = {
                number: this.phoneNumber,
                message: "I have sent you a tink. Download tinktime app to view it.",
                intent: "INTENT",
                success: function(){ 
                    Ext.Viewport.setActiveItem('split','slide');
                },
                error: function(){ 
                    Ext.Msg.alert('Cancelled', 'Sms not sent!', Ext.emptyFn); 
                }
            }
            sms.send(sConf.number, sConf.message, sConf.intent, sConf.success, sConf.error);
        }
    },
    composeTink : function(list, idx, target, record, evt){        
        var from_user = Ext.getStore('profilestore').getPhoneNumber();
        var prevTextMsg = Ext.ComponentQuery.query('#previewTextMsg')[0];

        //is a receipient chosen
        if( this.phoneNumber){
            //is receipient on tinktime
            if (Ext.getStore('phonecontacts').isOnTinkTime(this.phoneNumber)){

                this.sendTink(from_user, this.phoneNumber, (new Date()).valueOf(), 
                    this.trinket_name, prevTextMsg.getValue(), this.seconds_sent);

                // ajax load the feed
                ttapp.util.FeedProxy.process();
                //reset before leaving
                this.clearAll();
                this.closeMe();
                this.showSplit();
                
            }
            else{
                
                //ask for user confirmation to send sms
                Ext.Msg.confirm(
                    "Send invite?",
                    "Your friend is not using tinktime. Send him an invite to view this tink!",
                    function(buttonId) {
                        if (buttonId === 'yes') {
                            this.inviteViaSms();
                        }
                    },
                    this
                );

            }
        }
        else{
            Ext.Msg.alert('Receiver?', 'Please choose a receipient.', Ext.emptyFn);
        }
    },
    sendTink: function(from_user, to_user, send_timestamp, trinket_name, text, seconds_sent){
          Ext.Ajax.request({
                            url:  ttapp.config.Config.getBaseURL() + '/message-queue/',
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json'},
                            disableCaching: false,
                            jsonData: {
                                "from_user" : from_user,
                                "to_user" : to_user, 
                                "send_timestamp": send_timestamp, 
                                "trinket_name": trinket_name, 
                                "text" : text,
                                "seconds_sent": seconds_sent
                            },

                            success: function(response) {
                                console.log(response.responseText);
                            }
                        });
    },
    showSplit: function(){
        Ext.Viewport.setActiveItem('split','slide');
        //Ext.ComponentQuery.query('#options')[0].setActiveItem(2, 'slide');
    },
    showTink: function(){
        Ext.Viewport.setActiveItem('tink','slide');
        //Ext.ComponentQuery.query('#options')[0].setActiveItem(1, 'slide');
    },
    showSendTo: function(tinkView, seconds_sent, trinket_name){
        this.seconds_sent = seconds_sent;
        this.trinket_name = trinket_name;

        Ext.Viewport.setActiveItem('sendto','slide');
    }
});
