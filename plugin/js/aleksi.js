var menu_anchor = "left top";
var menu_placement = "left bottom";

//var settings = { 'disable_links': true };
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
var pins = [];
var quizlet_sets = [];
var quizlet_set = {};
var session = {};

// device detection
 if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
     || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) isMobile = true;

function isURL(str) {
      var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
            '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
      return pattern.test(str);
}


/*
const interleave = ([ x, ...xs ], ys = []) =>
      x === undefined
    ? ys                             // base: no x
    : [ x, ...interleave (ys, xs) ]  // inductive: some x
*/
function show_dialog(e) {
    $jquery_aleksi("#analysis_failed").hide();
    $jquery_aleksi("#analysis_results").hide();
    $jquery_aleksi("#requesting_analysis").show();
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
    } else {
      var winWidth = $jquery_aleksi(window).width();
      var posX = (winWidth/2) + $jquery_aleksi(window).scrollLeft();
      var posY = e.clientY;
      $jquery_aleksi( "#aleksi_dialog" ).dialog("option", {
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
}

function update_settings() {
    $jquery_aleksi("#disable_links_checkbox").prop("checked",get_setting('disable_links'));
}
function get_setting(setting) {
    if (typeof settings != 'undefined' && typeof settings[setting] != 'undefined') {
        return(settings[setting]);
    }
}

function imgSrcToDataURL(src, callback, outputFormat) {
    var x = new XMLHttpRequest();
    x.responseType = 'blob';
    console.log(src);
    if (!isURL(src)) {
        return;
    }
    x.open('get', src);
    x.onload = function() {
        var fileReader = new FileReader();
        fileReader.onloadend = function() {
            // fileReader.result is a data-URL (string)
            callback(fileReader.result);
            //window.open(fileReader.result);
        };
        // x.response is a Blob object
        fileReader.readAsDataURL(x.response);
    };
    x.onerror = function (e) {
          console.error(x.statusText);
    };
    x.send();
}

function setContextImgData(dataURI) {
    var imgData;
    if (typeof dataURI != 'undefined') {
        if (dataURI.split(',')[0].indexOf('base64') >= 0) {
            imgData = dataURI.split(',')[1];
        } else {
            imgData = unescape(dataURI.split(',')[1]);
        }
    }
    window.aleksi.contextImgData = imgData;
}

function linkHandler(e) {
      if (mode == 'app') {
          if ( $jquery_aleksi.contains($jquery_aleksi('.ui-dialog[aria-describedby="aleksi_dialog"]')[0],e.target) || $jquery_aleksi.contains(document.getElementById("navbar"),e.target) || $jquery_aleksi.contains(document.getElementById("session_dialog"),e.target) ) {
              return(true);
          }
      } else {
          if ( $jquery_aleksi.contains($jquery_aleksi('.ui-dialog[aria-describedby="aleksi_dialog"]')[0],e.target) ) {
              return(true);
          }
      }
      if ($jquery_aleksi("#disable_links_checkbox").prop("checked")) {
        e.preventDefault();
      }
      var link_behavior = $jquery_aleksi("input[name=link_behavior]:checked").val();
      if (link_behavior=="disable") {
        e.preventDefault();
      }
      if (link_behavior=="update_session_website") {
        e.preventDefault();
        $jquery_aleksi("input[name=website_url]").val($jquery_aleksi(this).attr('href'));
        update_website();
      }
      if (link_behavior=="follow_external") {
      }
}

function createContextImgCanvas() {
    oCanvas = $jquery_aleksi(document.createElement("canvas")).hide();
    oCanvas.attr("id","contextImgCanvas");
    $jquery_aleksi('body').append(oCanvas);
}

function drawImgToContextImgCanvas(imgElmt) {
    oCanvas = $jquery_aleksi('#contextImgCanvas');
    oCtx = oCanvas.get(0).getContext('2d');
    nWidth = imgElmt.offsetWidth;
    nHeight = imgElmt.offsetHeight;
    oCanvas.width = nWidth;
    oCanvas.height = nHeight;
    imgElmt.setAttribute('crossOrigin', 'anonymous');
    oCtx.drawImage(imgElmt, 0, 0);
}

function getImgData(canvas, outputFormat) {
    dataURI = canvas.toDataURL(outputFormat);
    if (typeof dataURI != 'undefined') {
        if (dataURI.split(',')[0].indexOf('base64') >= 0) {
            imgData = dataURI.split(',')[1];
        } else {
            imgData = unescape(dataURI.split(',')[1]);
        }
    }
    return(imgData);
}

function clickHandler(e) {
    var word = getFullWord(e);
    console.log("handling word "+word);
    word = word.replace(/[^a-zA-Z\u00C0-\u02AF]*([-a-zA-Z\u00C0-\u02AF]+)[^a-zA-Z\u00C0-\u02AF]*$/g, "$1");
    if (word != "") {
      window.aleksi.word = word;
      analyse(word, e);
    }
}

function ocrHandler(message) {
    var text = $jquery_aleksi(".ocrext-ocr-message").val();
    var word = text.split(" ")[0];
    word = word.replace(/[^a-zA-Z\u00C0-\u02AF]*([-a-zA-Z\u00C0-\u02AF]+)[^a-zA-Z\u00C0-\u02AF]*$/g, "$1");
    window.aleksi.word = word;
    if (word != "") {
      analyse(word, message.event);
    }
    var imgSrc = message.imgSrc;
    window.aleksi.contextImgData = undefined;
    if (typeof imgSrc != 'undefined') {
        imgSrcToDataURL(imgSrc, setContextImgData);
    }
    window.aleksi.context = undefined;
}

function bindHandlers() {
    $jquery_aleksi(document).bind("click.doc",clickHandler);
    $jquery_aleksi("a").on("click",linkHandler);
    $jquery_aleksi(document).on("ocr",ocrHandler);
}

function unbindHandlers() {
    $jquery_aleksi("a").unbind("click.link");
    $jquery_aleksi(document).unbind("click.doc");
    $jquery_aleksi(document).off("ocr");
}

// Get the full word the cursor is over regardless of span breaks
function getFullWord(event) {
   var i, begin, end, range, textNode, offset;
  
  // Internet Explorer
  if (document.body.createTextRange) {
     try {
       range = document.body.createTextRange();
       range.moveToPoint(event.clientX, event.clientY);
       range.select();
       range = getTextRangeBoundaryPosition(range, true);
    
       textNode = range.node;
       offset = range.offset;
     } catch(e) {
       return ""; // Sigh, IE
     }
  }
  
  // Firefox, Safari
  // REF: https://developer.mozilla.org/en-US/docs/Web/API/Document/caretPositionFromPoint
  else if (document.caretPositionFromPoint) {
    range = document.caretPositionFromPoint(event.clientX, event.clientY);
    textNode = range.offsetNode;
    offset = range.offset;

    // Chrome
    // REF: https://developer.mozilla.org/en-US/docs/Web/API/document/caretRangeFromPoint
  } else if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(event.clientX, event.clientY);
    textNode = range.startContainer;
    offset = range.startOffset;
  }

  // Only act on text nodes
  var data = textNode.textContent;
  var suppress = false;
  $jquery_aleksi(".suppress-aleksi").each(function() { 
    if (this === event.target || $jquery_aleksi.contains(this,event.target)) {
      suppress = true; 
      return false;
    }
  });
  if (mode == 'app') {
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE || suppress || $jquery_aleksi.contains(document.getElementById("aleksi_dialog").parentNode, textNode) || $jquery_aleksi.contains(document.getElementById("navbar").parentNode, textNode) || $jquery_aleksi("#session_dialog").dialog('isOpen')) {
      return "";
    }
  } else {
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE || suppress || $jquery_aleksi.contains(document.getElementById("aleksi_dialog").parentNode, textNode)) {
      return "";
    }
  }

  var data = textNode.textContent;

  // Sometimes the offset can be at the 'length' of the data.
  // It might be a bug with this 'experimental' feature
  // Compensate for this below
  if (offset >= data.length) {
    offset = data.length - 1;
  }

  // Ignore the cursor on spaces - these aren't words
  if (isW(data[offset])) {
    return "";
  }

  // Scan behind the current character until whitespace is found, or beginning
  i = begin = end = offset;
  while (i > 0 && !isW(data[i - 1])) {
    i--;
  }
  begin = i;

  // Scan ahead of the current character until whitespace is found, or end
  i = offset;
  while (i < data.length - 1 && !isW(data[i + 1])) {
    i++;
  }
  if (data.substring(i) == ".") {
      end = i-1;
  } else {
      end = i;
  }

  // This is our temporary word
  var word = data.substring(begin, end + 1);

  // Demo only
  showBridge(null, null, null);

  // If at a node boundary, cross over and see what 
  // the next word is and check if this should be added to our temp word
  if (end === data.length - 1 || begin === 0) {

    var nextNode = getNextNode(textNode);
    var prevNode = getPrevNode(textNode);

    // Get the next node text
    if (end == data.length - 1 && nextNode) {
      var nextText = nextNode.textContent;

      // Demo only
      showBridge(word, nextText, null);

      // Add the letters from the next text block until a whitespace, or end
      i = 0;
      while (i < nextText.length && !isW(nextText[i])) {
        word += nextText[i++];
      }

    } else if (begin === 0 && prevNode) {
      // Get the previous node text
      var prevText = prevNode.textContent;

      // Demo only
      showBridge(word, null, prevText);

      // Add the letters from the next text block until a whitespace, or end
      i = prevText.length - 1;
      while (i >= 0 && !isW(prevText[i])) {
        word = prevText[i--] + word;
      }
    }
  }
  var elmt = $jquery_aleksi(textNode);
  var prevAll, nextAll, siblings;
  var img = [];
  do {
    prevAll = elmt.prevAll();
    nextAll = elmt.nextAll();
    siblings = $jquery_aleksi(prevAll.toArray().concat(nextAll.toArray()));
    //siblings = $jquery_aleksi(interleave(prevAll.toArray(),nextAll.toArray()));
    siblings.each(function() {
        img = $jquery_aleksi(this).find("img").first();
        if (img.length > 0) {
            return false;
        }
    });
    elmt = elmt.parent();
  } 
  //img = elmt.parents().find("img").first();
  while (img.length == 0 && !elmt.is('html'));
  window.aleksi.contextImgData = undefined;
  var imgSrc = img.first().attr("src");
  if (typeof imgSrc != 'undefined') {
    imgSrcToDataURL(imgSrc, setContextImgData);
  }
  context = textNode.parentNode.textContent;
  window.aleksi.context = context.replace(word,"<b>"+word+"</b>");
  return word;
}

var hasScrollbar = function() {
  // The Modern solution
  if (typeof window.innerWidth === 'number')
    return window.innerWidth > document.documentElement.clientWidth

  // rootElem for quirksmode
  var rootElem = document.documentElement || document.body

  // Check overflow style property on body for fauxscrollbars
  var overflowStyle

  if (typeof rootElem.currentStyle !== 'undefined')
    overflowStyle = rootElem.currentStyle.overflow

  overflowStyle = overflowStyle || window.getComputedStyle(rootElem, '').overflow

    // Also need to check the Y axis overflow
  var overflowYStyle

  if (typeof rootElem.currentStyle !== 'undefined')
    overflowYStyle = rootElem.currentStyle.overflowY

  overflowYStyle = overflowYStyle || window.getComputedStyle(rootElem, '').overflowY

  var contentOverflows = rootElem.scrollHeight > rootElem.clientHeight
  var overflowShown    = /^(visible|auto)$/.test(overflowStyle) || /^(visible|auto)$/.test(overflowYStyle)
  var alwaysShowScroll = overflowStyle === 'scroll' || overflowYStyle === 'scroll'

  return (contentOverflows && overflowShown) || (alwaysShowScroll)
}
// When the user scrolls down 20px from the top of the document, slide down the navbar

function has_no_scrollbar(){
    var winheight = $jquery_aleksi(window).height()
    var docheight = $jquery_aleksi(document).height()
    return(winheight >= docheight)
}

function set_menu_placement() {
    if (!hasScrollbar()) {
        document.getElementById("navbar").style.bottom = "0";
        document.getElementById("navbar").style.removeProperty('top');
        if (isMobile) {
          menu_anchor = "bottom";
          menu_placement = "top";
        } else {
          menu_anchor = "left bottom";
          menu_placement = "left top";
        }
    } else {
        document.getElementById("navbar").style.removeProperty('bottom');
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            document.getElementById("navbar").style.top = "0";
        } else {
            document.getElementById("navbar").style.top = "-50px";
        }
        if (isMobile) {
          menu_anchor = "top";
          menu_placement = "bottom";
        } else {
          menu_anchor = "left top";
          menu_placement = "left bottom";
        }
    }
}

function configure_dialog() {
    $jquery_aleksi('a[href="#aleksi_main"]').on('click', function(e) {
      e.preventDefault();
      $jquery_aleksi( "#aleksi" ).tabs('option', 'active', 0 );
      e.stopImmediatePropagation();
    });
    $jquery_aleksi('a[href="#aleksi_pins"]').on('click', function(e) {
      e.preventDefault();
      $jquery_aleksi( "#aleksi" ).tabs('option', 'active', 1 );
      e.stopImmediatePropagation();
    });
    $jquery_aleksi('#aleksi').tabs();
    $jquery_aleksi('#aleksi_tabs').tabs();
    // Prevent hashtag change on tab link click
    $jquery_aleksi('.ui-tab-active a').on('click', function(e){
        e.preventDefault();
        e.stopPropagation();
    });

    function config_dialog_clickoutside_handler(e) {
            if (e.target.id!="open_config_dialog_button") {
                $jquery_aleksi("#config_dialog").dialog('close');
            }
    }
    function session_dialog_clickoutside_handler(e) {
            if (!$jquery_aleksi.contains(document.getElementById("open_session_dialog_button"),e.target) && e.target.id!="open_session_dialog_button") {
                $jquery_aleksi("#session_dialog").dialog('close');
            }
    }
    function quizlet_dialog_clickoutside_handler(e) {
            if (e.target.id!="open_quizlet_dialog_button") {
                $jquery_aleksi("#quizlet_dialog").dialog('close');
            }
    }
    if (isMobile) {
      menu_anchor = "top";
      menu_placement = "bottom";
      $jquery_aleksi( "#aleksi_dialog" ).dialog({
        bgiframe: true,
        dialogClass: 'aleksi',
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
              $jquery_aleksi(this).dialog("close");
            }
          }],
        });
      $jquery_aleksi('#ui-tab-dialog-close').append($jquery_aleksi('#closer'));
      $jquery_aleksi('.ui-dialog[aria-describedby="aleksi_dialog"]').find(".ui-dialog-buttonpane").remove();
      $jquery_aleksi("#session_dialog").dialog({
          bgiframe: true,
          dialogClass: 'notitle',
          maxHeight: $jquery_aleksi(window).height()*.9,
          autoOpen: false,
          minHeight: 10,
          maxWidth: $jquery_aleksi(window).width()*.95,
/*          position: {
            my: menu_anchor,
            at: menu_placement,
            of: $jquery_aleksi( "#open_session_dialog_button" ),
            collision: "none"
          },
          */
          open: function() {
            $jquery_aleksi( "#session_dialog" ).bind('clickoutside', session_dialog_clickoutside_handler);
          },
      });
    } else {
      $jquery_aleksi( "#aleksi_dialog" ).dialog({
        autoOpen: false,
        dialogClass: 'aleksi',
        position: { my: "right top", at: "right top", of: window },
        maxHeight: $jquery_aleksi(window).height()*.95,
        draggable: true,
        create: function(e, ui) {
          var pane = $jquery_aleksi(this).dialog("widget").find(".ui-dialog-buttonpane");
          var options_pane = $jquery_aleksi("<div id='aleksi_dialog_options_pane'></div>").prependTo(pane);
          $jquery_aleksi("<div><label class='checkbox_label' ><input id='disable_links_checkbox' type='checkbox'/> Disable hyperlinks <i class='icon icon-question-sign' title='Prevent your browser tab from following hyperlinks when you click on them. This will allow Aleksi to analyse the link text instead of following the link.'></i></label></div>").prependTo(options_pane);
          $jquery_aleksi("<div><label class='checkbox_label' ><input id='capture_ocr_checkbox' type='checkbox'/> OCR Capture <i class='icon icon-question-sign' title='Enable screen capture and optical character recognition. If enabled, a crosshair cursor will appear above the document, allowing the user to select a region to analyse by clicking and dragging. '></i></label></div>").prependTo(options_pane);
        },
        buttons: [{
            id: 'closer',
            text: 'Close',
            click: function () {
              $jquery_aleksi(this).dialog("close");
            }
          }],
            /*
        buttons: {
          Close: function () {
            $jquery_aleksi(this).dialog("close");
          },
        },
        */
      });
      $jquery_aleksi("#capture_ocr_checkbox").click(function (e) {
          if ($jquery_aleksi(this).prop('checked')) {
            window.postMessage({ type: "FROM_PAGE", text: "ocrEnableCapture"}, "*");
          } else {
            window.postMessage({ type: "FROM_PAGE", text: "ocrDisableCapture"}, "*");
          }
          e.preventDefault();
          e.stopPropagation();
      });
      $jquery_aleksi("#session_dialog").dialog({
          dialogClass: 'notitle',
          resizable: false,
          autoOpen: false,
          minHeight: 10,
          maxHeight: $jquery_aleksi(window).height()*.9,
          open: function() {
            $jquery_aleksi( "#session_dialog" ).bind('clickoutside', session_dialog_clickoutside_handler);
          },
      });
    }
    $jquery_aleksi( "#aleksi_dialog" ).dialog("moveToTop");
    //$jquery_aleksi( "#aleksi_dialog" ).css({zIndex: 2147483646});
    $jquery_aleksi('.ui-dialog[aria-describedby="aleksi_dialog"]').addClass('yui3-cssreset');
    $jquery_aleksi('.ui-dialog[aria-describedby="aleksi_dialog"]').addClass('ui-tabs')
                   .prepend($jquery_aleksi('#aleksi_tabs'))
                   .draggable('option','handle','#aleksi_tabs'); 
    $jquery_aleksi('.ui-dialog[aria-describedby="aleksi_dialog"]').find(".ui-dialog-titlebar").remove();
    $jquery_aleksi('#aleksi_tabs').addClass('ui-dialog-titlebar');

    $jquery_aleksi( "#closer" ).on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      $jquery_aleksi("#aleksi_dialog").dialog( "close" );
    });
    reset_ui();
}

function initialize_aleksi() {
    //alert("initializing aleksi");
    window.aleksi = {};
    createContextImgCanvas();
    canvas = $jquery_aleksi(document.createElement("canvas")).hide();
    canvas.attr("id","aleksi-canvas");
    $jquery_aleksi('body').append(canvas);
    configure_dialog();
    //get_quizlet_sets();
    get_session();
    reset_ui();
    get_pins(function(pins) {
        update_pins_interfaces(pins);
        activate_anki_connect_add_pins_button(pins);
    });
    set_anki_connect_get_decks_link();
    $jquery_aleksi( document ).tooltip();
    if (mode == 'app') {
      window.onscroll = function() {set_menu_placement()};
      window.addEventListener("resize", set_menu_placement);
    }
    $jquery_aleksi("#config_dialog").dialog({
        dialogClass: 'fixed-dialog',
        dialogClass: 'notitle',
        resizable: false,
        autoOpen: false,
        minHeight: 10,
        position: {
          my: menu_anchor,
          at: menu_placement,
          of: $jquery_aleksi( "#open_config_dialog_button" ),
        },
        open: function() {
          $jquery_aleksi( "#config_dialog" ).bind('clickoutside', config_dialog_clickoutside_handler);
        },
    });
    /*
    $jquery_aleksi("#quizlet_dialog").dialog({
        dialogClass: 'notitle',
        resizable: false,
        autoOpen: false,
        minHeight: 10,
        position: {
          my: menu_anchor,
          at: menu_placement,
          of: $jquery_aleksi( "#open_quizlet_dialog_button" ),
        },
        open: function() {
          $jquery_aleksi( "#quizlet_dialog" ).bind('clickoutside', quizlet_dialog_clickoutside_handler);
        },
    });
    */
    $jquery_aleksi("#open_config_dialog_button").on('click', function(ev) {
        $jquery_aleksi("#session_dialog").dialog('close');
        if ($jquery_aleksi("#config_dialog").dialog('isOpen')) {
          $jquery_aleksi("#config_dialog").dialog('close');
        } else {
          $jquery_aleksi("#config_dialog").dialog('open');
          $jquery_aleksi("#config_dialog").dialog("option", "position", 
              {
                my: menu_anchor,
                at: menu_placement,
                of: $jquery_aleksi( "#open_config_dialog_button" ),
              });
        }
    });
    $jquery_aleksi("#open_session_dialog_button").on('click', function(ev) {
        $jquery_aleksi("#config_dialog").dialog('close');
        if ($jquery_aleksi("#session_dialog").dialog('isOpen')) {
          $jquery_aleksi("#session_dialog").dialog('close');
        } else {
          $jquery_aleksi("#session_dialog").dialog('open');
          if(isMobile) {
        /*      $jquery_aleksi("#session_dialog").css({
                  position: 'fixed',
                  top: '100px'
              });
              */
          } else {
            $jquery_aleksi("#session_dialog").dialog("option", "position", 
                {
                  my: menu_anchor,
                  at: menu_placement,
                  of: $jquery_aleksi( "#open_session_dialog_button" ),
                  collision: 'none',
                });
          }
        }
    });
    /*
    $jquery_aleksi("#open_quizlet_dialog_button").on('click', function(ev) {
        $jquery_aleksi("#config_dialog").dialog('close');
        if ($jquery_aleksi("#quizlet_dialog").dialog('isOpen')) {
          $jquery_aleksi("#quizlet_dialog").dialog('close');
        } else {
          $jquery_aleksi("#quizlet_dialog").dialog('open');
          $jquery_aleksi("#quizlet_dialog").dialog("option", "position", 
              {
                my: menu_anchor,
                at: menu_placement,
                of: $jquery_aleksi( "#open_quizlet_dialog_button" ),
              });
        }
    });
    */
    $jquery_aleksi('.ui-dialog[aria-describedby="config_dialog"]').find(".ui-dialog-titlebar").remove();
    $jquery_aleksi('.ui-dialog[aria-describedby="config_dialog"]').addClass('fixed-dialog');
    $jquery_aleksi('.ui-dialog[aria-describedby="session_dialog"]').find(".ui-dialog-titlebar").remove();
    $jquery_aleksi('.ui-dialog[aria-describedby="session_dialog"]').addClass('fixed-dialog');
    //$jquery_aleksi("#aleksi_analysis_progress_indicator").html('<img src="'+get_setting('loading_spinner_url')+'"/>').hide();
    $jquery_aleksi("#aleksi_analysis_progress_indicator").hide();
    //$jquery_aleksi('.ui-dialog[aria-describedby="quizlet_dialog"]').find(".ui-dialog-titlebar").remove();
    //$jquery_aleksi('.ui-dialog[aria-describedby="quizlet_dialog"]').addClass('fixed-dialog');
    $jquery_aleksi( "a" ).on('dblclick', function(e) {
      var href = $jquery_aleksi(this).attr('href');
      $jquery_aleksi("input[name=website_url]").val(href);
      if(typeof href !== typeof undefined && href !== false) {
        update_website();
      }
    });
    //$jquery_aleksi( "a" ).on('click', linkHandler );
    if (isMobile){
      $jquery_aleksi("body").css("cursor","pointer");
    } else {
      $jquery_aleksi(document).scroll(function(e){
  
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
          
      });
    }
  // Get the HTML in #hoverText - just a wrapper for convenience
  //var $hoverText = $jquery_aleksi("#hoverText");


  // Return the word the cursor is over
  if (mode == 'app') {
    $jquery_aleksi(document).bind("click.doc",clickHandler);
    $jquery_aleksi("a").bind("click.link",linkHandler);
  }
  //$jquery_aleksi(document).click(clickHandler);
  window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source != window)
      return;
  
    if (event.data.type && (event.data.type == "FROM_PAGE")) {
        console.log("received ocr event");
        if (event.data.text == 'ocrEvent') {
            ocrHandler(event.data);
        } else if (event.data.text == 'ocrEnabled') {
            $jquery_aleksi("#capture_ocr_checkbox").prop("checked",true);
        } else if (event.data.text == 'ocrDisabled') {
            $jquery_aleksi("#capture_ocr_checkbox").prop("checked",false);
        } else if (event.data.text == 'captureComplete') {
            if ('imgSrc' in event.data) {
                var imgSrc = event.data.imgSrc;
                window.aleksi.contextImgData = undefined;
                if (typeof imgSrc != 'undefined') {
                    imgSrcToDataURL(imgSrc, setContextImgData);
                }
            } else {
                window.aleksi.contextImgData = getOCRImgData();
            }
        }
    }
  }, false);
  update_settings();
  window.postMessage({ type: "FROM_PAGE", text: "ocrRequestStatus"}, "*");
}
function escape_double_quotes(str) {
    return(str.replace(/\\([\s\S])|(")/g, "\\$1$2"))
}

// Helper functions

// Whitespace checker
function isW(s) {
  return /[ \f\n\r\t\v\u00A0\u2028\u2029]/.test(s);
}

// Barrier nodes are BR, DIV, P, PRE, TD, TR, ... 
function isBarrierNode(node) {
  return node ? /^(BR|DIV|P|PRE|TD|TR|TABLE)$/i.test(node.nodeName) : true;
}

// Try to find the next adjacent node
function getNextNode(node) {
  var n = null;
  // Does this node have a sibling?
  if (node.nextSibling) {
    n = node.nextSibling;

    // Doe this node's container have a sibling?
  } else if (node.parentNode && node.parentNode.nextSibling) {
    n = node.parentNode.nextSibling;
  }
  return isBarrierNode(n) ? null : n;
}

// Try to find the prev adjacent node
function getPrevNode(node) {
  var n = null;

  // Does this node have a sibling?
  if (node.previousSibling) {
    n = node.previousSibling;

    // Doe this node's container have a sibling?
  } else if (node.parentNode && node.parentNode.previousSibling) {
    n = node.parentNode.previousSibling;
  }
  return isBarrierNode(n) ? null : n;
}

// REF: http://stackoverflow.com/questions/3127369/how-to-get-selected-textnode-in-contenteditable-div-in-ie
function getChildIndex(node) {
  var i = 0;
  while( (node = node.previousSibling) ) {
    i++;
  }
  return i;
}

// All this code just to make this work with IE, OTL
// REF: http://stackoverflow.com/questions/3127369/how-to-get-selected-textnode-in-contenteditable-div-in-ie
function getTextRangeBoundaryPosition(textRange, isStart) {
  var workingRange = textRange.duplicate();
  workingRange.collapse(isStart);
  var containerElement = workingRange.parentElement();
  var workingNode = document.createElement("span");
  var comparison, workingComparisonType = isStart ?
    "StartToStart" : "StartToEnd";

  var boundaryPosition, boundaryNode;

  // Move the working range through the container's children, starting at
  // the end and working backwards, until the working range reaches or goes
  // past the boundary we're interested in
  do {
    containerElement.insertBefore(workingNode, workingNode.previousSibling);
    workingRange.moveToElementText(workingNode);
  } while ( (comparison = workingRange.compareEndPoints(
    workingComparisonType, textRange)) > 0 && workingNode.previousSibling);

  // We've now reached or gone past the boundary of the text range we're
  // interested in so have identified the node we want
  boundaryNode = workingNode.nextSibling;
  if (comparison == -1 && boundaryNode) {
    // This must be a data node (text, comment, cdata) since we've overshot.
    // The working range is collapsed at the start of the node containing
    // the text range's boundary, so we move the end of the working range
    // to the boundary point and measure the length of its text to get
    // the boundary's offset within the node
    workingRange.setEndPoint(isStart ? "EndToStart" : "EndToEnd", textRange);

    boundaryPosition = {
      node: boundaryNode,
      offset: workingRange.text.length
    };
  } else {
    // We've hit the boundary exactly, so this must be an element
    boundaryPosition = {
      node: containerElement,
      offset: getChildIndex(workingNode)
    };
  }

  // Clean up
  workingNode.parentNode.removeChild(workingNode);

  return boundaryPosition;
}

// DEMO-ONLY code - this shows how the word is recombined across boundaries
function showBridge(word, nextText, prevText) {
  if (nextText) {
    $jquery_aleksi("#bridge").html("<span class=\"word\">" + word + "</span>  |  " + nextText.substring(0, 20) + "...").show();
  } else if (prevText) {
    $jquery_aleksi("#bridge").html("..." + prevText.substring(prevText.length - 20, prevText.length) + "  |  <span class=\"word\">" + word + "</span>").show();
  } else {
    $jquery_aleksi("#bridge").hide();
  }
}

function update_pins_table(pins)
{
    $jquery_aleksi("#aleksi_pins_table tbody").remove();
    for (var i = pins.length-1; i >= 0; i--) {
      var row = $jquery_aleksi(document.createElement("tr"));
      var fi_cell = $jquery_aleksi(document.createElement("td"));
      fi_cell.attr("class", "aleksi_table_heading");
      var en_cell = $jquery_aleksi(document.createElement("td"));
      var links_cell = $jquery_aleksi(document.createElement("td"));
      var links_div = $jquery_aleksi(document.createElement("div"));
      links_div.attr("class", "links");
      var unpin_link = $jquery_aleksi(document.createElement("a"));
      var site_link = $jquery_aleksi(document.createElement("a"));
      var edit_link = $jquery_aleksi(document.createElement("a"));
      var pin = pins[i];
      if (mode == 'app') {
        if (pin.website) {
          site_link.attr("href", "javascript:set_website("+pin.website.id+");");
        } else {
          site_link.attr("href", "javascript:void(0);");
        }
        site_link.append('<i class="icon icon-step-backward"></i>');
        links_div.append(site_link);
      }
      var source_link = $jquery_aleksi(document.createElement("a"));
      //source_link.attr("href", get_source_link(pin));
      source_link.attr("href", pin.source_url);
      source_link.append('<i class="icon icon-external-link"></i>');
      links_div.append(source_link);
      var icon_span = $jquery_aleksi(document.createElement("span"));
      //unpin_link.attr("href", "javascript:unpin("+pin.id.toString()+");");
      set_unpin_link(unpin_link, pin.id);
      unpin_link.append('<i class="icon icon-trash"></i>');
      unpin_link.append(icon_span);
      edit_link.append('<i class="icon icon-pencil"></i>');
      edit_link.attr("href", "javascript:void(0);");
      links_div.append(edit_link);
      links_div.append(unpin_link);
      links_cell.append(links_div);
      var fi = $jquery_aleksi(document.createElement("div"));
      var en = $jquery_aleksi(document.createElement("div"));
      fi.text(pin.lemma);
      en.text(pin.text);
      fi.attr('contenteditable','true');
      en.attr('contenteditable','true');
      function edit_link_click_closure(en) {
        return function() {
          en.trigger('focus');
        }
      }
      edit_link.click(edit_link_click_closure(en));
      function edit_pin_fi_closure(i) {
        return function(e) {
          var key = e.keyCode || e.charCode;  // ie||others
          if(key == 13) {  // if enter key is pressed
            $jquery_aleksi(this).blur(); // lose focus
            return(edit_pin_fi(i,$jquery_aleksi(this).text()));
          }
        }
      }
      function edit_pin_en_closure(i) {
        return function(e) {
          var key = e.keyCode || e.charCode;  // ie||others
          if(key == 13) {  // if enter key is pressed
            $jquery_aleksi(this).blur(); // lose focus
            return(edit_pin_en(i,$jquery_aleksi(this).text()));
          }
        }
      }
      fi.on("keydown", edit_pin_fi_closure(i));
      en.on("keydown", edit_pin_en_closure(i));
      fi.attr('fi_index',i);
      en.attr('en_index',i);
      fi_cell.append(fi);
      en_cell.append(en);
      row.append(fi_cell);
      row.append(en_cell);
      row.append(links_cell);
      $jquery_aleksi("#aleksi_pins_table").append(row);
    }
}

function build_website_selector () {
    var website_selector = $jquery_aleksi(document.createElement("div"));
    website_selector.attr("id","website_selector");
    $jquery_aleksi("#website_selector").replaceWith(website_selector);
    var select = $jquery_aleksi(document.createElement("select"));
    $jquery_aleksi(select).on('selectmenuchange', function() {
        var new_website_id = $jquery_aleksi("select[name=new_website_id]").val() || session.website.id;
        set_website(new_website_id); 
    });
    select.attr("id", "website_selectmenu");
    select.attr("name", "new_website_id");
    var label = $jquery_aleksi(document.createElement("label"));
    label.attr("id", "website_selectmenu_label");
    label.attr("for", "website_selectmenu");
    label.append("Active website:");
    for (var i = 0; i < session.websites.length; i++) {
        var option = $jquery_aleksi(document.createElement("option"));
        var input_id = "website_radio_"+session.websites[i].id;
        option.attr("id", input_id);
        option.attr("value", session.websites[i].id);
        option.append(session.websites[i].title+" ("+session.websites[i].datetime+")");
        if (session.website.id==session.websites[i].id) {
          option.attr("selected", "true");
        }
        var urlhash = CryptoJS.MD5(session.websites[i].url);
        var optgroup = $jquery_aleksi("#"+urlhash);
        if (!optgroup.length) {
            optgroup = $jquery_aleksi(document.createElement("optgroup"));
            optgroup.attr("label", session.websites[i].url);
            optgroup.attr("id", urlhash);
            select.append(optgroup);
        }
        optgroup.append(option);
    }

    website_selector.append(select);
    $jquery_aleksi(select).selectmenu().selectmenu("option","width",false).selectmenu( "menuWidget" ).addClass( "overflow" );
}

function update_anki_connect_deck_selector(anki_connect_decks)
{
    var anki_connect_deck_selector = $jquery_aleksi(document.createElement("div"));
    anki_connect_deck_selector.attr("id","anki_connect_deck_selector");
    $jquery_aleksi("#anki_connect_deck_selector").replaceWith(anki_connect_deck_selector);
    var use_dropdown_list = true;
    if (use_dropdown_list) {
        var select = $jquery_aleksi(document.createElement("select"));
        $jquery_aleksi(select).on('selectmenuchange', function() {
            //var new_anki_connect_deck_id = $jquery_aleksi("select[name=anki_connect_deck_id]").val() || session.anki_connect_deck_id;
            var new_anki_connect_deck_name = $jquery_aleksi("select[name=anki_connect_deck_name]").val();
            //set_anki_connect_deck(new_anki_connect_deck_id); 
            get_pins(function(pins) {
                update_pins_table(pins);
                activate_anki_connect_add_pins_button(pins);
            });
        });
        select.attr("id", "anki_connect_deck_selectmenu");
        select.attr("name", "anki_connect_deck_name");
        var option = $jquery_aleksi(document.createElement("option"));
        var input_id = "anki_connect_deck_radio_0";
        option.attr("id", input_id);
        option.attr("value", 0);
        option.append(" -- select an Anki deck -- ");
        select.append(option);
        for (var i = 0; i < anki_connect_decks.length; i++) {
            var option = $jquery_aleksi(document.createElement("option"));
            //var input_id = "anki_connect_deck_radio_"+anki_connect_decks[i].id;
            var input_id = "anki_connect_deck_radio_"+i;
            option.attr("id", input_id);
            //option.attr("value", anki_connect_decks[i].id);
            option.attr("value", anki_connect_decks[i]);
            option.append(anki_connect_decks[i]);
            //if (session.anki_connect_deck_id==anki_connect_decks[i].id) {
            //  option.attr("selected", "true");
            //}
            select.append(option);
        }
        anki_connect_deck_selector.append(select);
        $jquery_aleksi(select).selectmenu().selectmenu("option","width",false).selectmenu( "menuWidget" ).addClass( "overflow" );
    } else {
      var table = $jquery_aleksi(document.createElement("table"));
      for (var i = 0; i < anki_connect_decks.length; i++) {
        var row = $jquery_aleksi(document.createElement("tr"));
        var input_cell = $jquery_aleksi(document.createElement("td"));
        input_cell.attr("style", "'vertical-align:top'");
        var label_cell = $jquery_aleksi(document.createElement("td"));
        var input = $jquery_aleksi(document.createElement("input"));
        input.attr("type", "radio");
        //input.attr("name", "anki_connect_deck_id");
        input.attr("name", "anki_connect_deck_name");
        //var input_id = "anki_connect_deck_radio_"+anki_connect_decks[i].id;
        var input_id = "anki_connect_deck_radio_"+i;
        input.attr("id", input_id);
        //input.attr("value", anki_connect_decks[i].id);
        input.attr("value", anki_connect_decks[i]);
        var label = $jquery_aleksi(document.createElement("label"));
        //if (session.anki_connect_deck_id==anki_connect_decks[i].id) {
        //  input.attr("checked", "true");
        //  $jquery_aleksi("#associated_anki_connect_deck").append(anki_connect_decks[i].title);
        //}
        label.attr("class", "radio_input_label");
        label.attr("for", input_id);
        //label.append(anki_connect_decks[i].title);
        label.append(anki_connect_decks[i]);
        label_cell.append(label)
        input_cell.append(input)
        row.append(input_cell);
        row.append(label_cell);
        table.append(row)
      }
      anki_connect_deck_selector.append(table)
    }
    if (anki_connect_decks.length > 0) {
      $jquery_aleksi("#anki_connect").show();
    }
    $jquery_aleksi("#anki_connect_get_decks_button").text("Refresh Anki deck list");
}

function activate_anki_connect_add_pins_button(pins) {
    var anki_connect_deck_id = $jquery_aleksi("select[name=anki_connect_deck_name]").val();
    if (anki_connect_deck_id != '0' & pins.length > 0) {
      var anki_connect_add_pins_button = '<a id="anki_connect_add_pins_button">Add pins to Anki</a>';
      $jquery_aleksi("#aleksi_anki_connect_add_pins").html(anki_connect_add_pins_button);
      $jquery_aleksi("#anki_connect_add_pins_button").button();
    } else {
      $jquery_aleksi("#aleksi_anki_connect_add_pins").html('');
    }
    set_anki_connect_add_pins_link();
}

function update_quizlet_set_selector () {
    var quizlet_set_selector = $jquery_aleksi(document.createElement("div"));
    quizlet_set_selector.attr("id","quizlet_set_selector");
    $jquery_aleksi("#quizlet_set_selector").replaceWith(quizlet_set_selector);
    var use_dropdown_list = true;
    if (use_dropdown_list) {
        var select = $jquery_aleksi(document.createElement("select"));
        $jquery_aleksi(select).on('selectmenuchange', function() {
            var new_quizlet_set_id = $jquery_aleksi("select[name=quizlet_set_id]").val() || session.quizlet_set_id;
            set_quizlet_set(new_quizlet_set_id); 
        });
        select.attr("id", "quizlet_set_selectmenu");
        select.attr("name", "quizlet_set_id");
        var option = $jquery_aleksi(document.createElement("option"));
        var input_id = "quizlet_set_radio_0";
        option.attr("id", input_id);
        option.attr("value", 0);
        option.append(" -- select a Quizlet set -- ");
        select.append(option);
        for (var i = 0; i < quizlet_sets.length; i++) {
            var option = $jquery_aleksi(document.createElement("option"));
            var input_id = "quizlet_set_radio_"+quizlet_sets[i].id;
            option.attr("id", input_id);
            option.attr("value", quizlet_sets[i].id);
            option.append(quizlet_sets[i].title);
            if (session.quizlet_set_id==quizlet_sets[i].id) {
              option.attr("selected", "true");
            }
            select.append(option);
        }
        quizlet_set_selector.append(select);
        $jquery_aleksi(select).selectmenu().selectmenu("option","width",false).selectmenu( "menuWidget" ).addClass( "overflow" );
    } else {
      var table = $jquery_aleksi(document.createElement("table"));
      for (var i = 0; i < quizlet_sets.length; i++) {
        var row = $jquery_aleksi(document.createElement("tr"));
        var input_cell = $jquery_aleksi(document.createElement("td"));
        input_cell.attr("style", "'vertical-align:top'");
        var label_cell = $jquery_aleksi(document.createElement("td"));
        var input = $jquery_aleksi(document.createElement("input"));
        input.attr("type", "radio");
        input.attr("name", "quizlet_set_id");
        var input_id = "quizlet_set_radio_"+quizlet_sets[i].id;
        input.attr("id", input_id);
        input.attr("value", quizlet_sets[i].id);
        var label = $jquery_aleksi(document.createElement("label"));
        if (session.quizlet_set_id==quizlet_sets[i].id) {
          input.attr("checked", "true");
          $jquery_aleksi("#associated_quizlet_set").append(quizlet_sets[i].title);
        }
        label.attr("class", "radio_input_label");
        label.attr("for", input_id);
        label.append(quizlet_sets[i].title);
        label_cell.append(label)
        input_cell.append(input)
        row.append(input_cell);
        row.append(label_cell);
        table.append(row)
      }
      quizlet_set_selector.append(table)
    }
}

function update_quizlet_set_title() {
    if (typeof this.quizlet_set.title !== "undefined") {
      var quizlet_sync_form = '        <form>'+
  '              <a id="sync_to_quizlet_button" href="javascript:sync_to_quizlet()">Sync with Quizlet</a>'+
  '              <div id="associated_quizlet_set_div"><label for="associated_quizlet_set">Associated Quizlet Set:</label> <span style="display: block;" id="associated_quizlet_set">'+
  this.quizlet_set.title+
  '</span></div>'+
  '        </form>';
      $jquery_aleksi("#aleksi_quizlet_sync").html(quizlet_sync_form);
      $jquery_aleksi("#sync_to_quizlet_button").button();
    } else {
      $jquery_aleksi("#aleksi_quizlet_sync").html('');
    }
}

function edit_pin_en (i, en) {
    pins[i]['en'] = en;
    update_pin(pins[i]);
    reset_ui();
}

function edit_pin_fi (i, fi) {
    pins[i]['fi'] = fi;
    update_pin(pins[i]);
    reset_ui();
}

function set_session(session) {
    this.session = session;
}

function generate_pin_ids() {
    min_id = 0;
    for (i=0; i<this.pins.length; i++) {
        try {
            if(!Number.isInteger(this.pins[i].id)) throw "not an integer";
        } catch(err) {
            this.pins[i].id=min_id;
        } finally {
            current_id = this.pins[i].id;
            if(current_id < min_id) throw "not increasing";
            min_id = Math.max(min_id,current_id+1)
        }
    }
}
/*
function add_pins(pins) {
        pins.forEach( function(pin) {
            this.pins.push(pin);
        });
}
function rm_pin(pin_id) {
    for (i=0; i<this.pins.length; i++) {
        if(this.pins[i].id == pin_id) this.pins.splice(i,1)
    }
}
function set_pins(pins) {
        clear_pins();
        add_pins(pins);
}
*/
function set_quizlet_sets(_quizlet_sets) {
        clear_quizlet_sets();
        var that = this;
        _quizlet_sets.forEach( function(_quizlet_set) {
          that.quizlet_sets.push(_quizlet_set);
          if (session.quizlet_set_id==_quizlet_set.id) {
            that.quizlet_set = _quizlet_set
          }
        });
}
/*
function clear_pins ()
{
    pins = [];
}
*/

function show_overlay(){
    $jquery_aleksi("#aleksi_overlay").show();
}
function hide_overlay(){
    $jquery_aleksi("#aleksi_overlay").hide();
}
// modified from http://clarkdave.net/2012/10/2012-10-30-twitter-oauth-authorisation-in-a-popup/

function update_pins_interfaces(pins) {
    update_pins_table(pins)
    if (pins.length>=2) {
        $jquery_aleksi("#create_quizlet_set_button").prop("disabled", false);
        $jquery_aleksi("#create_quizlet_set_button").button("enable");
    } else {
        $jquery_aleksi("#create_quizlet_set_button").prop("disabled", true);
        $jquery_aleksi("#create_quizlet_set_button").button("disable");
    }
}

function reset_ui ()
{
  $jquery_aleksi("#share_session_button").button();
  $jquery_aleksi("#save_session_button").button();
  $jquery_aleksi("#sync_to_quizlet_button").button();
  $jquery_aleksi("#create_quizlet_set_button").button();
  $jquery_aleksi("#get_quizlet_sets_button").button();
  //update_create_quizlet_set_state();

    /*
  var quizlet_connect_btn = $jquery_aleksi('#quizlet-connect-button');
  
  var quizlet_connect = new QuizletConnect(get_setting('quizlet_auth_url'), get_quizlet_sets);
  
  quizlet_connect_btn.on('click', function(e) {
    e.preventDefault();
    quizlet_connect.exec();
  });

  var quizlet_disconnect_btn = $jquery_aleksi('#quizlet-disconnect-button');

  var quizlet_disconnect = new QuizletDisconnect(quizlet_disconnect_btn.attr('href'), function() {});

  quizlet_disconnect_btn.on('click', function(e) {
    e.preventDefault();
    quizlet_disconnect.exec();
  });

  quizlet_connect_btn.button();
  quizlet_disconnect_btn.button();
  $jquery_aleksi("#quizlet_connecting").hide();
  */
}


function set_anki_connect_get_decks_link() { 
    $jquery_aleksi("#anki_connect_get_decks_button").on("click",function() { anki_connect_get_decks(update_anki_connect_deck_selector) });
    anki_connect_get_decks_button_container = $jquery_aleksi("#anki_connect_get_decks_button_container");
    $jquery_aleksi("<label class='button_label' > <i class='icon icon-question-sign' title='Connect to Anki for memorization of pinned words. To use this feature, you must have Anki installed and open on your computer, and the AnkiConnect add-on must also be installed and enabled.'></i></label>").appendTo(anki_connect_get_decks_button_container);
}
/*
function anki_connect_store_pin_media(pin_id, on_success) {
    //media_data = $jquery_aleksi("#aleksi_pin_data").data(pin_id.toString());
    if ('contextImgData' in window.aleksi.pin_data[pin_id.toString()]) {
        var contextImgData = window.aleksi.pin_data[pin_id.toString()]['contextImgData'];
    //media_data = {'ocrImgData': window.aleksi.pin_data[pin_id.toString()]['ocrImgData'],
    //              'contextImgData': window.aleksi.pin_data[pin_id.toString()]['contextImgData']};
    //if (typeof media_data['contextImgData'] != 'undefined') {
        anki_connect_store_media_data(contextImgData, on_success);
        return;
    }
    if ('ocrImgData' in window.aleksi.pin_data[pin_id.toString()]) {
        var ocrImgData = window.aleksi.pin_data[pin_id.toString()]['ocrImgData'];
        anki_connect_store_media_data(ocrImgData, on_success);
        return;
    }
    on_success();
}
*/
function set_anki_connect_add_pins_link() { 
    $jquery_aleksi("#anki_connect_add_pins_button").on("click",function() {
        var anki_connect_deck_name = $jquery_aleksi("select[name=anki_connect_deck_name]").val();
        if (anki_connect_deck_name != "0") { //FIXME: allow a deck with name 0
        //if ($jquery_aleksi("#anki_connect_deck_0").prop("selected")==false) {
            get_pins(function (pins) {
                for (i=0; i<pins.length; i++) {
                    (function(i) {
                        anki_connect_add_pin(pins[i], anki_connect_deck_name, function() {
                            unpin(pins[i].id, update_pins_interfaces);
                        });
                    })(i);
                }
            });
        }
    });
}
function getOCRImgData() {
    var $canOrig = $jquery_aleksi('#ocrext-canOrig');
    var ocrImgData;
    if ($canOrig.length > 0) {
        ocrImgData = getImgData($canOrig.get(0));
    }
    return(ocrImgData)
}

function mouse_event_over_element(evt, elem) {
  var o= elem.offset();
  var w= elem.width();
  var h= elem.height();
  val = evt.pageX >= o.left && evt.pageX <= o.left + w && evt.pageY >= o.top && evt.pageY <= o.top + h;
  return val;
}

function set_capture_link(capture_link) { 
    capture_link.on("click",function(e) { 
        //$jquery_aleksi('#aleksi_capture_mask').show();
        window.postMessage({ type: "FROM_PAGE", text: "capture"}, "*");
        e.stopImmediatePropagation();
        e.preventDefault();
    });
}

function set_pin_link(pin_link, _pin) { 
    pin_link.on("click",function(e) { 
        _pin.word = window.aleksi.word;
        _pin.context = window.aleksi.context;
        _pin.contextImgData = window.aleksi.contextImgData;
        //_pin.ocrImgData = getOCRImgData();
        pin(_pin, function(pins, new_pin_id) { update_pins_interfaces(pins); });
        e.stopImmediatePropagation();
        e.preventDefault();
    });
}

function set_unpin_link(unpin_link, pin_id) { 
    unpin_link.on("click",function() { unpin(pin_id, update_pins_interfaces); });
}

function update_translations_table(result) {
    progress_indicator = $jquery_aleksi("#aleksi_analysis_progress_indicator");
    progress_indicator.hide();
    $jquery_aleksi("#requesting_analysis").hide();
    $jquery_aleksi("#aleksi_translations_table tbody").remove();
    $jquery_aleksi("#aleksi_morph_tag_tables table").remove();
    $jquery_aleksi("#analysis_results").show();
    if (typeof result === 'undefined' || result.lemmas.length == 0) {
        var row = $jquery_aleksi(document.createElement("tr"));
        var cell = $jquery_aleksi(document.createElement("td"));
        cell.append("No results found.");
        row.append(cell);
        $jquery_aleksi("#aleksi_translations_table").append(row);
    }
    if (typeof result === 'undefined') {
        return;
    }
    result.lemmas.forEach( function(lemma) {
        if (lemma.translations.length == 0) {
            lemma.translations = [{'text': '<b>not found</b>', 'source_url': 'javascript:void(0);'}];
        }
        for (var i=0; i<lemma.translations.length; i++) {
            var pin = lemma.translations[i];
            var row = $jquery_aleksi(document.createElement("tr"));
            var pin_cell = $jquery_aleksi(document.createElement("td"));
            var pin_icon_span = $jquery_aleksi(document.createElement("span"));
            var pin_div = $jquery_aleksi(document.createElement("div"));
            var pin_link = $jquery_aleksi(document.createElement("a"));
            var capture_link = $jquery_aleksi(document.createElement("a"));
            var en_cell = $jquery_aleksi(document.createElement("td"));
            var fi_cell = $jquery_aleksi(document.createElement("td"));
            fi_cell.attr("class", "aleksi_table_heading");
            if (i==0) {
                fi_cell.append(lemma.lemma);
            }
            en_cell.append(lemma.translations[i].text);
            pin_link.append('<i class="icon-pushpin"></i>');
            capture_link.append('<i class="icon-picture"></i>');
            //pin_link.attr("href", 'javascript:pin("'+escape_double_quotes(lemma.lemma)+'", "'+escape_double_quotes(lemma.translations[i].en)+'");');
            pin['lemma'] = lemma.lemma;
            //set_pin_link(pin_link, lemma, i);
            set_pin_link(pin_link, pin);
            set_capture_link(capture_link);
            pin_div.attr("class","links");
            pin_link.append(pin_icon_span);
            var source_link = $jquery_aleksi(document.createElement("a"));
            //source_link.attr("href", get_source_link(lemma.translations[i]));
            source_link.attr("href", lemma.translations[i].source_url);
            source_link.append('<i class="icon icon-external-link"></i>');
            pin_div.append(capture_link);
            pin_div.append(source_link);
            pin_div.append(pin_link);
            pin_cell.append(pin_div);
            row.append(fi_cell);
            row.append(en_cell);
            row.append(pin_cell);
            $jquery_aleksi("#aleksi_translations_table").append(row);
        }
    });
    result.tags.forEach( function(tagdict) {
        var tag_table = $jquery_aleksi(document.createElement("table"));
        tag_table.attr("class","aleksi_morph_tag_table");
        tag_types.forEach( function(tag_type) {
            var key = tag_type['key'];
            if (key in tagdict) {
                var row = $jquery_aleksi(document.createElement("tr"));
                var key_cell = $jquery_aleksi(document.createElement("td"));
                var val_cell = $jquery_aleksi(document.createElement("td"));
                key_cell.attr("class", "aleksi_table_heading");
                if (key=='NEGATIVE') {
                    if (tagdict[key]=='true') {
                        val_cell.append('negative');
                    } else {
                        if (tagdict[key]=='both') {
                              val_cell.append('positive or negative')
                        }
                    }
                } else {
                    val_cell.append(tagdict[key]);
                }
                key_cell.append(tag_type['label']);
                row.append(key_cell);
                row.append(val_cell);
                $jquery_aleksi(tag_table).append(row);
            }
        });
        $jquery_aleksi("#aleksi_morph_tag_tables").append(tag_table);
    });
}
function report_analysis_failed(jqxhr, textStatus, errorText) { 
    progress_indicator = $jquery_aleksi("#aleksi_analysis_progress_indicator");
    progress_indicator.hide();
    $jquery_aleksi("#analysis_results").hide();
    $jquery_aleksi("#requesting_analysis").hide();
    if (textStatus == 'error') {
        if (jqxhr.status == 404) {
            $jquery_aleksi("#analysis_error").text('Server returned response "'+errorText+'." Please verify that a valid Aleksi word lookup URL is set in your Aleksi options.');
        } else {
            $jquery_aleksi("#analysis_error").text('Server returned response "'+errorText+'"');
        }
    } else if (textStatus == 'timeout') {
        $jquery_aleksi("#analysis_error").text("Request to server timed out.");
    } else if (textStatus == 'abort') {
        $jquery_aleksi("#analysis_error").text("Analysis aborted. If you receive this message in error, please report it to aleksi.salolampi@gmail.com.");
    } else if (textStatus == 'parsererror') {
        $jquery_aleksi("#analysis_error").text("Response from server could not be parsed. This should not happen. Please report this error to aleksi.salolampi@gmail.com.");
    } else {
        $jquery_aleksi("#analysis_error").text("No response received from Aleksi server. Please verify that the word lookup URL in Aleksi options is set to a valid Aleksi server.");
    }
    $jquery_aleksi("#analysis_failed").show();
}    


$jquery_aleksi(document).ready(function() {
  if (mode == 'app') {
    set_menu_placement();
  }
  var page_overlay = $jquery_aleksi('<div id="aleksi_overlay"><img src="'+get_setting('loading_spinner_url')+'"/> <p id="aleksi_overlay_msg">Processing</p></div>');
  page_overlay.appendTo(document.body);
  $jquery_aleksi("#aleksi_overlay").hide();
  //$jquery_aleksi('<img src="'+get_setting('loading_spinner_url')+'"/>').appendTo(progress_indicator);
  //progress_indicator.html('');
  //progress_indicator.hide();

  var capture_mask = $jquery_aleksi('<div id="aleksi_capture_mask" class="overlay suppress-aleksi"></div>');
  capture_mask.appendTo(document.body);
/*
  capture_mask.on('mousedown', function(e1) {
    ISPOSITIONED = ['absolute', 'relative', 'fixed'].indexOf($('body').css('position')) >= 0;
        $SELECTOR = $('<div class="ocrext-selector"></div>');
        $SELECTOR.appendTo($body);
        if (ISPOSITIONED) {
            startX = e.pageX - $body.scrollLeft();
            startY = e.pageY - $body.scrollTop();
            $SELECTOR.css({
                'position': 'fixed'
            });
        } else {
            startX = e.pageX;
            startY = e.pageY;
            $SELECTOR.css({
                'position': 'absolute'
            });
        }
        startCx = e.clientX;
        startCy = e.clientY;

        $SELECTOR.css({
            left: 0,
            top: 0,
            width: 0,
            height: 0,
            zIndex: MAX_ZINDEX - 1
        });


    capture_mask.on('mouseup', function handler(e2) {
      if (Math.abs(e1.clientX - e2.clientX) < 5 || Math.abs(e1.clientY - e2.clientY) < 5) {
        // click
        $jquery_aleksi('img').each(function() {
          if (mouse_event_over_element(e, $jquery_aleksi(this))) {
            var imgSrc = $jquery_aleksi(this).attr("src");
            imgSrcToDataURL(imgSrc, setContextImgData);
            return false;
          }
        });
      } else {
        // drag
        chrome.runtime.sendMessage({
            evt: 'capture-screen'
        }, function (response) {
            var img = new Image();
            img.onload = function () {
                var can = $jquery_aleksi('#aleksi-canvas');
                var sx = Math.min(e1.clientX, e2.clientX),
                    sy = Math.min(e1.clientY, e2.clientY),
                    width = Math.abs(e2.clientX - e1.clientX),
                    height = Math.abs(e2.clientY - e1.clientY);
                can.attr({
                    width: width,
                    height: height
                });
                var ctx = can.get(0).getContext('2d');
                //ctx.drawImage(img, 0, 0, width, height, 0, 0, width, height);
                ctx.drawImage(img, sx, sy, width, height, 0, 0, width, height);
                //ctx.drawImage(img, 300, 100, width, height, 0, 0, width, height);
                //ctx.drawImage(img, 0, 0);
                dataURL = can.get(0).toDataURL();
                setContextImgData(dataURL);
            };
           img.src = response.dataURL;
        });
      }
      $jquery_aleksi(this).hide();
      capture_mask.off('mouseup mousemove', handler);
    });
  });
*/
/*
  capture_mask.on('click', function(e) {
    $jquery_aleksi('img').each(function() {
      if (mouse_event_over_element(e, $jquery_aleksi(this))) {
        var imgSrc = $jquery_aleksi(this).attr("src");
        imgSrcToDataURL(imgSrc, setContextImgData);
        return false;
      }
    });
    $jquery_aleksi(this).hide();
  });
*/
  capture_mask.hide();
  $jquery_aleksi("#quizlet").hide();
  $jquery_aleksi(".controlgroup").controlgroup({
    "direction": "horizontal"
  });
  $jquery_aleksi("#set_website_url").addClass("ui-state-disabled");
  $jquery_aleksi('input[type=radio][name="website_setter"]').change(function () {
    if (this.value == 'set_url') {
      $jquery_aleksi("#set_website_url").removeClass("ui-state-disabled");
      $jquery_aleksi("#website_selector").addClass("ui-state-disabled");
    }
    if (this.value == 'select_active') {
      $jquery_aleksi("#set_website_url").addClass("ui-state-disabled");
      $jquery_aleksi("#website_selector").removeClass("ui-state-disabled");
    }
  });
  if (mode == 'app') {
    initialize_aleksi();
  }
});
