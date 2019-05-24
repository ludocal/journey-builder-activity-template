define(['postmonger'], function(Postmonger) {
    'use strict';
    //var appConfiguration = module.config().appConfiguration;
    var connection = new Postmonger.Session();
    var payload = {};
    var appSelection = [
        {
          id: "5CDD1B576095D88F6FE92DA49189D2",
          name: "BATCH IOS"
        },
        {
            id: "5CDD1B576095D88F6FE92DA49189D2",
            name: "BATCH ANDROID"
        }];
    var formatSelection = ""; //selection d'un nouveau template ou existant
    var config = [];
    var lastStepEnabled = false;
    var steps = [ // initialize to the same value as what's set in config.json for consistency
        { "label": "App", "key": "step1" },
        { "label": "template vs new", "key": "step2" },
        { "label": "Template selection", "key": "step3" },
        { "label": "New push", "key": "step4" }
    ];
    var currentStep = steps[0].key;

    $(window).ready(onRender);

    connection.on('initActivity', initialize);
    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);

    connection.on('clickedNext', onClickedNext);
    connection.on('clickedBack', onClickedBack);
    connection.on('gotoStep', onGotoStep);
    connection.on('requestedTriggerEventDefinition', onRequestedTriggerEventDefinition);

    function onRender() {
        readConfig();
        // JB will respond the first time 'ready' is called with 'initActivity'
        connection.trigger('ready');

        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
        connection.trigger('requestTriggerEventDefinition');

        // Disable the next button if a value isn't selected
        $("#step1 input[type=checkbox]").change(function(input) {
            console.log('change : '+ input.currentTarget.value);
            if ($("#step1 input[type=checkbox]:checked").length === 0){
               connection.trigger('updateButton', { button: 'next', enabled: false }); 
            }else{
                connection.trigger('updateButton', { button: 'next', enabled: true }); 
            }
            
        });
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
        loadAppTemplate();
    }

    function readConfig()
    {
       //this.config = JSON.parse(process.env.config);
       console.log('read config');
    }

    function initialize (data) {
        if (data) {
            payload = data;
        }

        var message;
        var formatSelection;
        var appSelection;

        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};

        $.each(inArguments, function(index, inArgument) {
            $.each(inArgument, function(key, val) {
                if (key === 'message') {
                    message = val;
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

        if (formatSelection && formatSelection === "new")
        {
            $('.slds-visual-picker>input[name="new"]').attr('checked', 'checked');
        }
        if (formatSelection && formatSelection === "template")
        {
            $('.slds-visual-picker>input[name="template"]').attr('checked', 'checked');
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
       /* If there is no message selected, disable the next button
        if (!message) {
            showStep(null, 1);
            connection.trigger('updateButton', { button: 'next', enabled: true });
            If there is a message, skip to the summary step
        } else {
            $('#select1').find('option[value='+ message +']').attr('selected', 'selected');
            $('#message').html(message);
            showStep(null, 3);
        }*/
    }

    function onGetTokens (tokens) {
        // Response: tokens = { token: <legacy token>, fuel2token: <fuel api token> }
         console.log(tokens);
    }

    function onGetEndpoints (endpoints) {
        // Response: endpoints = { restHost: <url> } i.e. "rest.s1.qa1.exacttarget.com"
         console.log(endpoints);
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
       
        connection.trigger('nextStep');
    }
    function loadAppTemplate()
    {
        
        

        $.each(appSelection, function(index, appItem) {
            var temp = $.trim($('#containerTemplateItem').html());
            var tempOption = $.trim($('#optionContainerTemplateItem').html());
            $.ajax({
                type: 'GET',            
                contentType: 'application/json',
                url: 'https://api.batch.com/1.1/' + appItem.id + '/campaigns/list?limit=20&live=false',
                headers: {"X-Authorization": "dcee600f7a7be131481e28ddb40ae1b0"},						
                success: function(data) {
                    console.log('success');
                    console.log(JSON.stringify(data));
                    var options = '';

                    $.each(data, function(index, optionItem) {
                        var x = tempOption.replace(/{{optionId}}/ig, optionItem.campaign_token);
                        x = x.replace(/{{optionName}}/ig, optionItem.name);
                        options = options + x;
                    });                    
                    var tempReplace = temp.replace(/{{optionContainerTemplate}}/ig, options);
                    tempReplace = tempReplace.replace(/{{index}}/ig, index);
                    tempReplace = tempReplace.replace(/{{appName}}/ig, appItem.name);
                    $('#containerTemplate').append(tempReplace);
                }
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
            console.log($(this).children()[0].title);
            $(this).hasClass('slds-is-selected');
        });
        
    }

    function onClickedBack () {
        connection.trigger('prevStep');
    }

    function onGotoStep (step) {
        showStep(step);
        connection.trigger('ready');
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
                break;
            case 'step3':
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
                break;
            case 'step5':
                $('#step5').show();
                break;
        }
    }

    function save() {
        var name = $('#select1').find('option:selected').html();
        var value = getMessage();       
        try {
            formatSelection = $('.slds-visual-picker>input:checked')[0].name;
        } catch (error) {
            
        }
        appSelection = [];
        $('.slds-checkbox_toggle>input:checked').each(function(i){
            appSelection.push({
                id: this.id,
                templateId: undefined
            });
        });
        // 'payload' is initialized on 'initActivity' above.
        // Journey Builder sends an initial payload with defaults
        // set by this activity's config.json file.  Any property
        // may be overridden as desired.
        payload.name = name;

        payload['arguments'].execute.inArguments = [
            {
                 "message": value,
                 "formatSelection": formatSelection,
                 "appSelection": appSelection
            }
        ];

        payload['metaData'].isConfigured = true;

        connection.trigger('updateActivity', payload);
    }

    function getMessage() {
        return 'Send Push';
    }

});