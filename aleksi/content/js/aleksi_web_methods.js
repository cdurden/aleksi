// AJAX-calling functions
function analyse(word, e){
    //var lang = $jquery_aleksi("select[name=lang]").val();
    var lang = get_setting('lang');
    //alert(url);
    //set interface elements to report initiation of analysis
    $jquery_aleksi( "#aleksi_word" ).text(word);
    if (!isMobile){
      if ($jquery_aleksi(".ui-widget-overlay")) //the dialog has popped up in modal view
      {
          //fix the overlay so it scrolls down with the page
          $jquery_aleksi(".ui-widget-overlay").css({
              position: 'fixed',
              top: '0'
          });
      
          //get the current popup position of the dialog box
          pos = $jquery_aleksi(".ui-dialog").position();
      
          //adjust the dialog box so that it scrolls as you scroll the page
          $jquery_aleksi(".ui-dialog").css({
              position: 'fixed',
              top: pos.y
          });
      }
    }
    $jquery_aleksi("#analysis_failed").hide();
    $jquery_aleksi("#analysis_results").hide();
    $jquery_aleksi("#requesting_analysis").show();
    if (isMobile){
      var winWidth = $jquery_aleksi(window).width();
      var posX = (winWidth/2) + $jquery_aleksi(window).scrollLeft();
      var posY = e.clientY;
      $jquery_aleksi( "#aleksi_dialog" ).dialog("option",
               {
                position: {
                  my: "center top", 
                  at: "left+"+posX.toString()+" top+"+posY.toString(),
                  of: window }
                          });
    }
    $jquery_aleksi( "#aleksi_dialog" ).dialog( "open" );
    $jquery_aleksi( ".controlgroup-vertical" ).controlgroup({
      "direction": "vertical"
    });
    if (mode == 'plugin') {
        chrome.runtime.sendMessage(
            {   action: 'analyse',
                word: word,
                //url: url,
                lang: lang}, function (response) { 
                                if (response['textStatus']=='success') {
                                    analysisSuccessCallback(response['response']);
                                }
                                if (response['textStatus']=='error') {
                                    analysisErrorCallback(response['errorText']);
                                }
                            });
    } else {
        var url = get_setting('analyse_url').replace("{word}",word)
        jQuery.ajax({
            url     : url,
    	    data : {'lang': lang},
            type    : 'POST',
            dataType: 'json',
            //dataType: 'text',
            //contentType: 'application/json',
            //complete : analysisCompleteCallback
            success : analysisSuccessCallback,
            error: analysisErrorCallback
        });
    }
}
function set_website(new_website_id){
    if (session.website.id!=new_website_id) {
        jQuery.ajax({
            url     : get_setting('set_website_url'),
            data    : JSON.stringify({'new_website_id': new_website_id}), 
            type    : 'POST',
            dataType: 'html',
            success : function(response){
                location.reload();
            }    
        });
    }
}
function set_quizlet_set(new_quizlet_set_id){
    if (session.quizlet_set_id!=new_quizlet_set_id) {
        jQuery.ajax({
            url     : get_setting('set_quizlet_set_url'),
            data    : JSON.stringify({'new_quizlet_set_id': new_quizlet_set_id}), 
            type    : 'POST',
            dataType: 'html',
            success : function(response){
                //get_session();
                update_quizlet_set_title();
            }    
        });
    }
}
function save_pin (pin)
{
    $jquery_aleksi.ajax({
      'url': get_setting('save_pin_url'),
      'type': 'POST',
      'dataType': 'json', 
      'data': JSON.stringify({'pin': pin}),
      'success': function(pins)
      {
        set_pins(pins);
        update_pins_table(pins);
        update_create_quizlet_set_state();
      }
    });
}
function unpin (pin_id)
{
    if (mode == 'app') {
        $jquery_aleksi.ajax({
          'url': get_setting('unpin_url'),
          'type': 'POST',
          'dataType': 'json', 
          'data': JSON.stringify({'pin_id': pin_id}),
          'success': function(pins)
          {
            set_pins(pins);
            update_pins_table(pins);
            update_create_quizlet_set_state();
          }
        });
    } else {
      rm_pin(pin_id);
      update_pins_table(pins);
      update_create_quizlet_set_state();
    }
}
/*
function pin (fi, en)
{
    var new_pins = [{fi: fi, en: en}];
    if (mode == 'app') {
      $jquery_aleksi.ajax({
        'url': get_setting('pin_url'),
        'type': 'POST',
        'dataType': 'json', 
        'data': JSON.stringify({'pins': new_pins}),
        'success': function(pins)
        {
          set_pins(pins);
          update_pins_table(pins);
          update_create_quizlet_set_state();
        }
      });
    } else {
      add_pins(new_pins);
      generate_pin_ids();
      update_pins_table(pins);
      update_create_quizlet_set_state();
    }
}
*/
function pin (_pin)
{
    if (mode == 'app') {
      $jquery_aleksi.ajax({
        'url': get_setting('pin_url'),
        'type': 'POST',
        'dataType': 'json', 
        'data': JSON.stringify({'pins': [_pin]}),
        'success': function(pins)
        {
          set_pins(pins);
          update_pins_table(pins);
          update_create_quizlet_set_state();
        }
      });
    } else {
      add_pins([_pin]);
      generate_pin_ids();
      update_pins_table(pins);
      update_create_quizlet_set_state();
    }
}
function get_pins ()
{
    $jquery_aleksi.ajax({
      'url': get_setting('get_pins_url'),
      'type': 'POST',
      'dataType': 'json', 
      'success': function(pins)
      {
        set_pins(pins);
        update_pins_table(pins);
        //update_create_quizlet_set_state();
      },
      'error': function(data)
      {
        $jquery_aleksi("#aleksi_pinned_status").text("An error occured while transferring fi data to Quizlet!");
      }
    });
}
function get_session() {
    if (mode == 'plugin') {
        return;
    }
    jQuery.ajax({
        url     : get_setting('get_session_url'),
        type    : 'GET',
        success : function(session){
          set_session(session);
          //get_quizlet_sets();
          //build_quizlet_set_selector();
          build_website_selector();
	  $jquery_aleksi("#lang_selector option[value='"+session.lang+"']").prop('selected', true);
          if (session.shared_session) {
            $jquery_aleksi("#share_session_button").hide();
            var load_shared_session_url = get_setting('load_shared_session_url').replace("__shared_session_hash",session.shared_session.hash);
            $jquery_aleksi("#shared_session_link").attr("href", load_shared_session_url);
          } else {
            $jquery_aleksi("#shared_session").hide();
          }
        }    
    });
}
function update_current_website(){
    var website_url = session.website.url;
    show_overlay();
    jQuery.ajax({
        url     : get_setting('update_website_url'),
        data    : JSON.stringify({'website_url': website_url, 'use_cache': false}), 
        type    : 'POST',
        dataType: 'html',
        success : function(response){
            location.reload();
        }    
    });
}
function update_website(){
    var website_url = $jquery_aleksi("input[name=website_url]").val();
    show_overlay();
    jQuery.ajax({
        url     : get_setting('update_website_url'),
        data    : JSON.stringify({'website_url': website_url, 'use_cache': true}), 
        type    : 'POST',
        dataType: 'html',
        success : function(response){
            location.reload();
        }    
    });
}
function share_session(){
    var session_id = $jquery_aleksi("input[name=session_id]").val();
    show_overlay();
    jQuery.ajax({
        url     : get_setting('share_session_url'),
        data    : JSON.stringify({'session_id': session_id}), 
        type    : 'POST',
        dataType: 'json',
        success : function(shared_session){
          var load_shared_session_url = get_setting('load_shared_session_url').replace("__shared_session_hash",shared_session.hash);
          $jquery_aleksi("#shared_session_link").attr("href", load_shared_session_url);
          $jquery_aleksi("#share_session_button").hide();
          $jquery_aleksi("#shared_session").show();
          hide_overlay();
        },
    });
}
function save_session(){
    var quizlet_set_id = $jquery_aleksi("select[name=quizlet_set_id]").val();
    var session_title = $jquery_aleksi("input[name=session_title]").val();
    var link_behavior = $jquery_aleksi("input[name=link_behavior]:checked").val();
    var website_setter_value = $jquery_aleksi("input[name=website_setter]:checked").val();
    var lang = $jquery_aleksi("select[name=lang]").val();
    var website_url = $jquery_aleksi("input[name=website_url]").val();
    var new_website_id = $jquery_aleksi("input[name=new_website_id]").val() || session.website.id;
    show_overlay();
    jQuery.ajax({
        url     : get_setting('save_session_url'),
        data    : JSON.stringify({'session_title': session_title , 'quizlet_set_id': quizlet_set_id, 'link_behavior': link_behavior, 'lang': lang, 'website_setter_value': website_setter_value, 'website_url': website_url, 'new_website_id': new_website_id, 'use_cache': false}), 
        type    : 'POST',
        dataType: 'html',
        success : function(response){
            location.reload();
        },
        error   : function(response) {
            alert("error on save_session");
        }   
    });
}
function create_quizlet_set(){
    var new_quizlet_set_title = $jquery_aleksi("input[name=new_quizlet_set_title]").val();
    jQuery.ajax({
        url     : get_setting('create_quizlet_set_url'),
        data    : JSON.stringify({'new_quizlet_set_title': new_quizlet_set_title, 'pins': pins}), 
        type    : 'POST',
        dataType: 'json',
        success : function(_quizlet_sets){
            $jquery_aleksi("input[name=new_quizlet_set_title]").val('');
            //get_session();
            set_quizlet_sets(_quizlet_sets);
            build_quizlet_set_selector();
            update_quizlet_set_title();
        }    
    });
}
function sync_to_quizlet(){
    var prune_quizlet_on_sync = $jquery_aleksi("input[name=prune_quizlet_on_sync]").prop("checked");
    var prune_pins_on_sync = $jquery_aleksi("input[name=prune_pins_on_sync]").prop("checked");
    $jquery_aleksi.ajax({
      'url': get_setting('sync_to_quizlet_url'),
      'type': 'POST',
      'tryCount': 0,
      'retryLimit': 3,
      'dataType': 'json', 
      'data'    : JSON.stringify({'prune_pins_on_sync': prune_pins_on_sync, 'prune_quizlet_on_sync': prune_quizlet_on_sync}), 
      'success': function(pins)
      {
        set_pins(pins);
        update_pins_table(pins);
        update_create_quizlet_set_state();
      },
      'error': function(xhr, textStatus, errorThrown) {
        if (xhr.status == 401) {
        // handle error
          var ajax_retry_callback = (function (params) {
              return function () { $jquery_aleksi.ajax(params) }
          })(this);
          var quizlet_connect = new QuizletConnect(get_setting('quizlet_auth_url'), ajax_retry_callback);
          if (this.tryCount <= this.retryLimit) {
            this.tryCount++;
            quizlet_connect.exec();
          } 
        }
      }
    });
}
function get_quizlet_sets(){
    $jquery_aleksi.ajax({
      'url': get_setting('get_quizlet_sets_url'),
      'type': 'POST',
      'dataType': 'json', 
      'success': function(_quizlet_sets)
      {
        //set_quizlet_sets(_quizlet_sets);
        //build_quizlet_set_selector();
        update_quizlet_set_title();
        $jquery_aleksi("#quizlet").show();
        $jquery_aleksi("#quizlet-connect-button").hide();
      },
    });
}
var QuizletConnect = (function() {

  // constructor accepts a url which should be your Quizlet OAuth url
  function QuizletConnect(url, callback) {
    this.url = url;
    this.callback = callback
  }

  QuizletConnect.prototype.exec = function() {
    var self = this,
      params = 'location=0,status=0,width=800,height=600';

    $jquery_aleksi("#quizlet_connecting").show();
    var quizlet_window = window.open(this.url, 'quizletWindow', params);

    var interval = window.setInterval((function() {
      if (quizlet_window.closed) {
        window.clearInterval(interval);
        self.finish();
      }
    }), 1000);

    // the server will use this cookie to determine if the Quizlet redirection
    // url should window.close() or not
    document.cookie = 'quizlet_oauth_popup=1; path=/';
  }

  QuizletConnect.prototype.finish = function() {
    var self = this;
    $jquery_aleksi.ajax({
      type: 'get',
      url: get_setting('check_quizlet_auth_url'),
      dataType: 'json',
      complete: function() {
        $jquery_aleksi("#quizlet_connecting").hide();
      },
      /*
      beforeSend: function() {
      },
      */
      success: function(response) {
        if (response) {
          self.callback();
        }
      },
    });
  };

  return QuizletConnect;
})();

var QuizletDisconnect = (function() {

  // constructor accepts a url which should be your Quizlet OAuth url
  function QuizletDisconnect(url, callback) {
    this.url = url;
    this.callback = callback
  }

  QuizletDisconnect.prototype.exec = function() {
      /*
    this.disconnected = false;
    this.interval = this.setInterval((function() {
      if (self.disconnected) {
        self.clearInterval(self.interval);
        self.finish()
      }
    }), 1000);
    */

    $jquery_aleksi.ajax({
      type: 'get',
      url: this.url,
      dataType: 'json',
      beforeSend: function() {
        $jquery_aleksi("#quizlet_connecting").show();
      },
      complete: function() {
        this.callback();
      },
    });
  };

  return QuizletDisconnect;
})();
