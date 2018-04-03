var tag_types =[ { 'key': 'CLASS', 'label': 'Class' },
                 { 'key': 'SIJAMUOTO', 'label': 'Case' },
                 { 'key': 'NUMBER', 'label': 'Number' },
                 { 'key': 'MOOD', 'label': 'Mood' },
                 { 'key': 'PERSON', 'label': 'Person' },
                 { 'key': 'TENSE', 'label': 'Tense' },
                 { 'key': 'NEGATIVE', 'label': '' },
                 { 'key': 'BASEFORM', 'label': 'Base word' },
                 { 'key': 'WORDBASES', 'label': 'Morphemes' },];

var isMobile = false; //initiate as false
// device detection
 if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
     || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) isMobile = true;

function configure_dialog() {
    $('#aleksi').tabs();
    $('a[href="#aleksi_main"]').on('click', function(e) {
      e.stopPropagation();
    });
    if (isMobile) {

      $( "#aleksi_dialog" ).dialog({
        bgiframe: true,
        autoOpen: false,
        /*
        open: function() {
            jQuery('.ui-widget-overlay').bind('click', function() {
                jQuery('#aleksi_dialog').dialog('close');
            })
        },
        */
        buttons: [{
            id: 'closer',
            text: 'Close',
            click: function () {
              $(this).dialog("close");
            }
          }],
        });
    } else {
      $( "#aleksi_dialog" ).dialog({
        autoOpen: false,
        position: { my: "right top", at: "right top", of: window },
        maxHeight: $(window).height()*.95,
        draggable: true,
        buttons: [{
            id: 'closer',
            text: 'Close',
            click: function () {
              $(this).dialog("close");
            }
          }],
            /*
        buttons: {
          Close: function () {
            $(this).dialog("close");
          },
        },
        */
        });
    }
    $('#ui-tab-dialog-close').append($('a.ui-dialog-titlebar-close'));
    //$('.ui-dialog').addClass('ui-tabs')
    $('.ui-dialog').addClass('ui-tabs')
                   .prepend($('#aleksi_tabs'))
                   .draggable('option','handle','#aleksi_tabs'); 
    $(".ui-dialog").find(".ui-dialog-titlebar").remove();
    $('#aleksi_tabs').addClass('ui-dialog-titlebar');
   // $( "#closer" ).click(function() {
   // });
    $( "#closer" ).on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      $("#aleksi_dialog").dialog( "close" );
    });
    reset_ui();

}
$( function() {
    configure_dialog();
    if (!isMobile){
      $(document).scroll(function(e){
  
          if ($(".ui-widget-overlay")) //the dialog has popped up in modal view
          {
              //fix the overlay so it scrolls down with the page
              $(".ui-widget-overlay").css({
                  position: 'fixed',
                  top: '0'
              });
  
              //get the current popup position of the dialog box
              pos = $(".ui-dialog").position();
  
              //adjust the dialog box so that it scrolls as you scroll the page
              $(".ui-dialog").css({
                  position: 'fixed',
                  top: pos.y
              });
          }
          
      });
      //}).parent().find('.ui-dialog-titlebar-close').prependTo('#aleksi_tabs').closest('.ui-dialog').children('.ui-dialog-titlebar').remove();
    } else {
        /*
      $( "#aleksi_dialog" ).dialog({
        bgiframe: true,
        autoOpen: false,
        open: function() {
            jQuery('.ui-widget-overlay').bind('click', function() {
                jQuery('#aleksi_dialog').dialog('close');
            })
        }
      });
      $("#aleksi").click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        $('#aleksi_dialog').dialog('close');
      });
      */
    }
} );
function analyze_word(word){
    var url = window.analyze_url.replace("__word",word)
    $( "#aleksi_word" ).text(word);
    jQuery.ajax({
        url     : url,
//        url     : 'lookup_json',
//        data    : {'word': word}, 
        type    : 'POST',
        dataType: 'html',
        beforeSend: function(msg){
            //$( "#aleksi" ).tabs();
            //$( "#aleksi_dialog" ).dialog('option', 'title', word);
            if (!isMobile){
              if ($(".ui-widget-overlay")) //the dialog has popped up in modal view
              {
                  //fix the overlay so it scrolls down with the page
                  $(".ui-widget-overlay").css({
                      position: 'fixed',
                      top: '0'
                  });
      
                  //get the current popup position of the dialog box
                  pos = $(".ui-dialog").position();
      
                  //adjust the dialog box so that it scrolls as you scroll the page
                  $(".ui-dialog").css({
                      position: 'fixed',
                      top: pos.y
                  });
              }
            }
            $("#analysis_results").hide();
            $("#requesting_analysis").show();
            $( "#aleksi_dialog" ).dialog( "open" );
            //$( "#aleksi_main" ).text( "Requesting analysis..." );
            $('a[href="#aleksi_main"]').click();
            //$( "#aleksi_tabs" ).tabs();
            //$( "#aleksi_tabs" ).tabs("refresh");
            //var current_index = $("#aleksi_tabs").tabs("option","active");
            //$("#aleksi_tabs").tabs('load',current_index);
            $( ".radio_input" ).checkboxradio();
            $( ".controlgroup" ).controlgroup({
              "direction": "vertical"
            });
            build_table();
        },
        success : function(response){
            var analysis_results = $.parseJSON(response);
            $("#requesting_analysis").hide();
            $("#aleksi_translations_table tbody").remove();
            $("#analysis_results").show();
            analysis_results.morpheme_translations.forEach( function(translation) {
                for (var i=0; i<translation.en.length; i++) {
                    var row = $(document.createElement("tr"));
                    var pin_cell = $(document.createElement("td"));
                    var icon_span = $(document.createElement("span"));
                    var pin_link = $(document.createElement("a"));
                    var en_cell = $(document.createElement("td"));
                    var fi_cell = $(document.createElement("td"));
                    fi_cell.attr("class", "label");
                    if (i==0) {
                        fi_cell.append(translation.fi);
                    }
                    en_cell.append(translation.en[i]);
                    pin_link.attr("href", "javascript:pin('"+translation.fi+"', '"+translation.en[i]+"');");
                    icon_span.attr("class", "ui-icon ui-icon-pin-s");
                    icon_span.attr("style", "display:inline-block; direction:rtl;");
                    icon_span.attr("style", "display:inline-block; direction:rtl;");
                    pin_link.append(icon_span);
                    pin_cell.append(pin_link);
                    row.append(fi_cell);
                    row.append(en_cell);
                    row.append(pin_cell);
                    $("#aleksi_translations_table").append(row);
                }
            });
            analysis_results.morph_tags.forEach( function(tag) {
                tag_types.forEach( function(tag_type) {
                    if (tag_type['key'] in tag) {
                        var row = $(document.createElement("tr"));
                        var key_cell = $(document.createElement("td"));
                        var val_cell = $(document.createElement("td"));
                        key_cell.attr("class", "label");
                        if (tag_type['key']=='NEGATIVE') {
                            val_cell.append('negative');
                        } else {
                            val_cell.append(tag[tag_type['key']]);
                        }
                        key_cell.append(tag_type['label']);
                        row.append(key_cell);
                        row.append(val_cell);
                        $("#aleksi_morph_tags_table").append(row);
                    }
                });
            });
            //build_table();
            $('a[href="#aleksi_main"]').click();
        },
            /*
        successHTML : function(data){
            var aleksi_word = $(data).find('#aleksi_word').text();
            var aleksi_main = $(data).find('#aleksi_main');
            $( "#aleksi_main" ).replaceWith(aleksi_main);
            $( "#aleksi_word" ).text(aleksi_word);
            $( ".radio_input" ).checkboxradio();
            build_table();
            $('a[href="#aleksi_main"]').click();
        },
        */
        error: function(XMLHttpRequest, textStatus, errorThrown) { 
            $( "#aleksi_main" ).text( "No results were found." );
        }    
    });
}
