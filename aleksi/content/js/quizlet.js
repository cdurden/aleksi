// modified from http://clarkdave.net/2012/10/2012-10-30-twitter-oauth-authorisation-in-a-popup/
function reset_ui ()
{
    $("#save_session_button").button();
    $("#quizlet_add_button").button();
    $("#quizlet_refresh_button").button();
    if (terms.length>0) {
        $("#quizlet_add_button").prop("disabled", false);
        $("#quizlet_add_button").button("enable");
//$('#quizlet_add_button').removeAttr("disabled");
    } else {
        $("#quizlet_add_button").prop("disabled", true);
        $("#quizlet_add_button").button("disable");
    }
    build_pins_table();

  var quizlet_connect_btn = $('#quizlet-connect-button');
  
  var quizlet_connect = new QuizletConnect(quizlet_connect_btn.attr('href'));
  
  quizlet_connect_btn.on('click', function(e) {
    e.preventDefault();
    quizlet_connect.exec();
  });

  var quizlet_disconnect_btn = $('#quizlet-disconnect-button');

  var quizlet_disconnect = new QuizletDisconnect(quizlet_disconnect_btn.attr('href'));

  quizlet_disconnect_btn.on('click', function(e) {
    e.preventDefault();
    quizlet_disconnect.exec();
  });

  quizlet_connect_btn.button();
  quizlet_disconnect_btn.button();
  $("#quizlet_connecting").hide();
}
function save_session(url){
    var quizlet_set_id = $("input[name=set_id]:checked").val();
    var session_title = $("input[name=session_title]").val();
    var session_id = $("input[name=session_id]").val();
    jQuery.ajax({
        url     : url,
//        url     : 'lookup_json',
        data    : JSON.stringify({'session_title': session_title , 'session_id': session_id, 'quizlet_set_id': quizlet_set_id}), 
        type    : 'POST',
        dataType: 'html',
        success : function(data){
            var aleksi_quizlet = $(data).find('#aleksi_quizlet');
            $( "#aleksi_quizlet" ).replaceWith(aleksi_quizlet);
            $( ".radio_input" ).checkboxradio();
            reset_ui();
        }    
    });
}
function update_quizlet_data(url){
    jQuery.ajax({
        url     : 'sanat/opi.html',
//        url     : 'lookup_json',
//        data    : {'word': word}, 
        type    : 'POST',
        dataType: 'html',
        success : function(data){
            var aleksi_quizlet = $(data).find('#aleksi_quizlet');
            $( "#aleksi_quizlet" ).replaceWith(aleksi_quizlet);
            $( ".radio_input" ).checkboxradio();
            reset_ui();
        }    
    });
}
function clear_quizlet_data(url){
    $( "#aleksi_quizlet" ).empty();
    reset_ui();
}

var QuizletConnect = (function() {

  // constructor accepts a url which should be your Quizlet OAuth url
  function QuizletConnect(url) {
    this.url = url;
  }

  QuizletConnect.prototype.exec = function() {
    var self = this,
      params = 'location=0,status=0,width=800,height=600';

    $("#quizlet_connecting").show();
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
    $.ajax({
      type: 'get',
      url: 'checkauth/quizlet',
      dataType: 'json',
      complete: function() {
        update_quizlet_data();
        //$("#quizlet_connecting").hide();
      },
      /*
      beforeSend: function() {
      },
      success: function(response) {
        if (response.authed) {
          // the user authed on Quizlet, so do something here
        } else {
          update_quizlet_data();
          // the user probably just closed the window
        }
      },
      */
    });
  };

  return QuizletConnect;
})();

var QuizletDisconnect = (function() {

  // constructor accepts a url which should be your Quizlet OAuth url
  function QuizletDisconnect(url) {
    this.url = url;
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

    $.ajax({
      type: 'get',
      url: this.url,
      dataType: 'json',
      beforeSend: function() {
        $("#quizlet_connecting").show();
      },
      complete: function() {
        update_quizlet_data();
        //$("#quizlet_connecting").hide();
      },
          /*
      success: function(response) {
        //this.disconnected = true;
      },
      */
    });
  };
  //QuizletDisconnect.prototype.finish = function() {
  //};

  return QuizletDisconnect;
})();


$(document).ready( function() {
    reset_ui();
});
