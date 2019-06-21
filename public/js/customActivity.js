define(['postmonger', 'callout'], function(Postmonger, callout) {
    'use strict';
    //var appConfiguration = module.config().appConfiguration;
    var connection = new Postmonger.Session();
    var payload = {};
    var appSelection = [];
    var appSelected = [];

    var formatSelection = ""; //selection d'un nouveau template ou existant
    var messageConfiguration;
    var config = [];
    var lastStepEnabled = false;
    var steps = [ // initialize to the same value as what's set in config.json for consistency
        { "label": "App", "key": "step1" },
        { "label": "template vs new", "key": "step2" },
        { "label": "Template selection", "key": "step3" },
        { "label": "New push", "key": "step4" }
    ];
    var token = "";
    var endpoint= "";
    var currentStep = steps[0].key;

    $(window).ready(onRender);
    
    connection.on('initActivity', initialize);
    connection.on('requestedEndpoints', onGetEndpoints);
    connection.on('requestedTokens', onGetTokens);
    

    connection.on('clickedNext', onClickedNext);
    connection.on('clickedBack', onClickedBack);
    connection.on('gotoStep', onGotoStep);
    connection.on('requestedTriggerEventDefinition', onRequestedTriggerEventDefinition);

    function onRender() {
        // JB will respond the first time 'ready' is called with 'initActivity'
        //connection.trigger('ready');

        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
        connection.trigger('requestTriggerEventDefinition');

        
        $("#step2 input[type=radio]").change(function(input) {
            console.log('change : '+ input.currentTarget.value);
            formatSelection = input.currentTarget.value;
            connection.trigger('updateButton', { button: 'next', enabled: true });            
        });
        

        

        // Toggle step 4 active/inactive
        // If inactive, wizard hides it and skips over it during navigation
        $('#toggleLastStep').click(function() {
            lastStepEnabled = !lastStepEnabled; // toggle status
            steps[3].active = !steps[3].active; // toggle active

            connection.trigger('updateSteps', steps);
        });
        // loadAppTemplate();
    }

     function initialize (data) {
        if (data) {
            payload = data;
        }

        var message;
        var title;
        var body;
        var deepLink;
        var imageUrl;
        //var formatSelection;
        //var appSelection;

        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};

        $.each(inArguments, function(index, inArgument) {
            $.each(inArgument, function(key, val) {
                console.log('Key :' + key + ' val : ' + val);
                if (key === 'title') {
                    title = val;
                }
                if (key === 'body') {
                    body = val;
                }
                if (key === 'deepLink') {
                    deepLink = val;
                }
                if (key === 'imageUrl') {
                    imageUrl = val;
                }
                if (key === 'formatSelection') {
                    formatSelection = val;
                }
                if (key === 'appSelection') {
                    appSelection = val;
                }
            });
        });
        console.log(formatSelection);
        console.log(appSelection);

        if (formatSelection)
        {
            $('#step2').find('input[type=radio]').filter('[value=' + formatSelection + ']').prop('checked', true);
        }
        if (appSelection)
        {
            appSelection.forEach(function(element){
                var stringSelector = '.slds-checkbox_toggle>input[id="' + element.id + '"]';
                console.log(stringSelector);
                try {
                    $(stringSelector).prop("checked","true");
                } catch (error) {
                    
                }
            });
            connection.trigger('updateButton', { button: 'next', enabled: true });
        }else{
            connection.trigger('updateButton', { button: 'next', enabled: false });
        }
        $('#messageTitle').val(title);
        $('#messageBody').val(body);
        $('#messageDeepLink').val(deepLink);
        $('#messageImage').val(imageUrl);
    }

    function onGetTokens (tokens) {
        // Response: tokens = { token: <legacy token>, fuel2token: <fuel api token> }
        token = tokens.fuel2token;
        console.log('Token : ' + token);
        console.log('Token : ' + endpoint);
        callout.getAppAvailable(endpoint, token).then(
            (r) => {
                appSelection = r;
                loadAppSelection(r);
            }
        );
        console.log(tokens);
    }

    function onGetEndpoints (endpoints) {
        // Response: endpoints = { restHost: <url> } i.e. "rest.s1.qa1.exacttarget.com"
        endpoint = endpoints.fuelapiRestHost;
         console.log(endpoints);
         console.log(endpoint);
    }
    function onRequestedTriggerEventDefinition(requestDefinition){
        console.log(requestDefinition);
    }
    function onClickedNext () {
        if (currentStep.key === 'step2' && formatSelection === 'new')
        {        
            steps[2].active = false;
            connection.trigger('updateSteps', steps);
           
        }
        if (currentStep.key === 'step2' && formatSelection === 'template'){
            loadAppTemplate();
        }
        if (currentStep.key === 'step4')
        {        
            save();            
        }
        connection.trigger('nextStep');
    }
    function loadAppSelection(applicationList){
        var containerItem = $.trim($('#templateAppSelectionItem').html());
        $.each(applicationList, function(index, appItem) {
            var x = containerItem.replace(/{{id}}/ig, appItem.id);
                x = x.replace(/{{name}}/ig, appItem.name);
                $('#appSelectionContainer').append(x);
        });
        // Disable the next button if a value isn't selected
        $("#step1 input[type=checkbox]").change(function(input) {
            console.log('change : '+ input.currentTarget.value);
            if ($("#step1 input[type=checkbox]:checked").length === 0){
               connection.trigger('updateButton', { button: 'next', enabled: false }); 
            }else{
                connection.trigger('updateButton', { button: 'next', enabled: true }); 
            }
            
        });
        connection.trigger('ready');
    }
    function loadAppTemplate()
    {
        console.log('Start load App Template');
       // $('#containerTemplate').empty();
        appSelected = getAppSelected();
        $.each(appSelected, function(index, appItem) {
            var temp = $.trim($('#containerTemplateItem').html());
            var tempOption = $.trim($('#optionContainerTemplateItem').html());
            callout.getTemplateAvailable(endpoint, token, appItem.id).then(function(data){
                console.log('success');
                    console.log(JSON.stringify(data));
                    var options = '';

                    $.each(data, function(index, optionItem) {
                        var x = tempOption.replace(/{{optionId}}/ig, optionItem.campaign_token);
                        x = x.replace(/{{optionName}}/ig, optionItem.name);
                        options = options + x;
                    });                    
                    var tempReplace = temp.replace(/{{optionContainerTemplate}}/ig, options);
                    tempReplace = tempReplace.replace(/{{index}}/ig, appItem.id);
                    tempReplace = tempReplace.replace(/{{appName}}/ig, appItem.name);
                    $('#containerTemplate').append(tempReplace);
                    connection.trigger('ready');
                });
                
        });
        $("#step3 .slds-dropdown-trigger_click").click(function(input) {
            console.log('click ');
           
            if ($(this).hasClass('slds-is-open'))
            {
                 $(this).removeClass('slds-is-open');
            }else{
                $(this).addClass('slds-is-open');
            }
        });
        $("#step3 .slds-listbox__option").click(function(input) {
            console.log('click option');
           
            $("#step3 .slds-combobox__input").attr('value', $(this).children('.slds-media__body').children()[0].title);
            $("#step3 .slds-combobox__input").attr('data-id', $(this).children('.slds-media__body').children()[0].id);
            console.log($(this).children()[0].id);
            console.log($(this).children()[0].title);
            $(this).hasClass('slds-is-selected');
        });
        
    }

    function getAppSelected(){
        var returnArray = [];
        $("#step1").find("input[type=checkbox]:checked").each(function(i) {
            var item = {};
            item.id = this.id;
            var app = appSelection.find(searchApp => searchApp.id === item.id);
            if (app)
            {
                item.name = app.name;
            }
            returnArray.push(item);
        });
        appSelected = returnArray;
        return returnArray;
    }

    function updateAppSelected(){
        appSelected.forEach(element => {
            var input = $('#step3').find('.slds-combobox').find('.slds-input[id=' + element.id + ']');
            if (input){
                element.templateId = input.data-id;
            }            
        });        
    }

    function onClickedBack () {
        connection.trigger('prevStep');
    }

    function onGotoStep (step) {
        showStep(step);
        //connection.trigger('ready');
    }

    function showStep(step, stepIndex) {
        if (stepIndex && !step) {
            step = steps[stepIndex-1];
        }

        currentStep = step;

        $('.step').hide();

        switch(currentStep.key) {
            case 'step1':
                $('#step1').show();
                connection.trigger('updateButton', {
                    button: 'next',
                    enabled: Boolean(getMessage())
                });
                connection.trigger('updateButton', {
                    button: 'back',
                    visible: false
                });                
                break;
            case 'step2':
                $('#step2').show();
                connection.trigger('updateButton', {
                    button: 'back',
                    visible: true
                });
                connection.trigger('updateButton', {
                    button: 'next',
                    text: 'next',
                    visible: true
                });
                connection.trigger('ready');
                break;                
            case 'step3':
                //loadAppTemplate();
                $('#step3').show();
                connection.trigger('updateButton', {
                    button: 'back',
                    visible: true
                });
                connection.trigger('updateButton', {
                    button: 'next',
                    text: 'next',
                    visible: false
                });
                break;
            case 'step4':
                $('#step4').show();
                connection.trigger('updateButton', {
                     button: 'back',
                     visible: true
                });
                if (lastStepEnabled) {
                    connection.trigger('updateButton', {
                        button: 'next',
                        text: 'next',
                        visible: true
                    });
                } else {
                    connection.trigger('updateButton', {
                        button: 'next',
                        text: 'done',
                        visible: true
                    });
                }
                connection.trigger('ready');
                break;
            case 'step5':
                $('#step5').show();
                connection.trigger('ready');
                break;
        }
    }

    function save() {
        if (formatSelection === "template"){
            updateAppSelected();
        }      
        var title = $('#messageTitle').val();
        var body = $('#messageBody').val();
        var deepLink = $('#messageDeepLink').val();
        var imageUrl = $('#messageImage').val();
        

        payload['arguments'].execute.inArguments = [
            {
                "formatSelection": formatSelection,
                "appSelection": appSelected,
                "title": title,
                "body": body,
                "deepLink": deepLink,
                "imageUrl": imageUrl,
                "contactIdentifier": "{{Contact.Key}}"
            }
        ];

        payload['metaData'].isConfigured = true;

        connection.trigger('updateActivity', payload);
    }

    function getMessage() {
        return 'Send Push';
    }

});