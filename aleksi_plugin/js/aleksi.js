var settings = { 'analyze_url':'http://localhost/aleksi/analyze_word/__word.html' ,
  'share_session_url':'' ,
  'quizlet_auth_url':'' ,
  'check_quizlet_auth_url':'' ,
  'load_shared_session_url':'' ,
  'get_pins_url':'' ,
  'unpin_url':'' ,
  'pin_url':'' ,
  'get_quizlet_sets_url':'' ,
  'get_session_url':'' ,
  'loading_spinner_url':'' ,
  'save_session_url':'' ,
  'save_pin_url':'' ,
  'create_quizlet_set_url':'' ,
  'sync_to_quizlet_url':'' ,
  'set_website_url':'' ,
  'set_quizlet_set_url':'' ,
  'update_website_url': '',
  'lang': 'fi'
};
function linkHandler(e) {
      alert($jquery_aleksi.contains($jquery_aleksi('.ui-dialog[aria-describedby="aleksi_dialog"]')[0],e.target));
      if ( $jquery_aleksi.contains($jquery_aleksi('.ui-dialog[aria-describedby="aleksi_dialog"]')[0],e.target) || $jquery_aleksi.contains(document.getElementById("navbar"),e.target) || $jquery_aleksi.contains(document.getElementById("session_dialog"),e.target) ) {
          return(true);
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
function clickHandler(e) {
    var word = getFullWord(e);
    //alert(word);
    word = word.replace(/[^a-zA-Z\u00C0-\u02AF]*([-a-zA-Z\u00C0-\u02AF]+)[^a-zA-Z\u00C0-\u02AF]*$/g, "$1");
    if (word != "") {
      analyze(word, e);
    }
}
function bindHandlers() {
    $jquery_aleksi(document).bind("click.doc",clickHandler);
    //$jquery_aleksi("a").bind("click.link",linkHandler);
}
function unbindHandlers() {
    $jquery_aleksi("a").unbind("click.link");
    $jquery_aleksi(document).unbind("click.doc");
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
  /*
  alert(data);
  alert($jquery_aleksi.contains(document.getElementById("aleksi_dialog").parentNode, textNode));
  alert($jquery_aleksi.contains(document.getElementById("navbar").parentNode, textNode));
  alert($jquery_aleksi("#session_dialog").dialog('isOpen'));
  */
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE || $jquery_aleksi.contains(document.getElementById("aleksi_dialog").parentNode, textNode) || $jquery_aleksi.contains(document.getElementById("navbar").parentNode, textNode) || $jquery_aleksi("#session_dialog").dialog('isOpen')) {
    return "";
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
  end = i;

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


var menu_anchor = "left top";
var menu_placement = "left bottom";
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
window.addEventListener("resize", set_menu_placement);
 
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

function configure_dialog() {
    $jquery_aleksi('#aleksi').tabs();
    $jquery_aleksi('#aleksi_tabs').tabs();
    $jquery_aleksi('a[href="#aleksi_main"]').on('click', function(e) {
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
    alert("initializing aleksi");
    configure_dialog();
    window.onscroll = function() {set_menu_placement()};

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
    $jquery_aleksi('.ui-dialog[aria-describedby="config_dialog"]').find(".ui-dialog-titlebar").remove();
    $jquery_aleksi('.ui-dialog[aria-describedby="config_dialog"]').addClass('fixed-dialog');
    $jquery_aleksi('.ui-dialog[aria-describedby="session_dialog"]').find(".ui-dialog-titlebar").remove();
    $jquery_aleksi('.ui-dialog[aria-describedby="session_dialog"]').addClass('fixed-dialog');
    $jquery_aleksi('.ui-dialog[aria-describedby="quizlet_dialog"]').find(".ui-dialog-titlebar").remove();
    $jquery_aleksi('.ui-dialog[aria-describedby="quizlet_dialog"]').addClass('fixed-dialog');
    $jquery_aleksi( "a" ).on('dblclick', function(e) {
      var href = $jquery_aleksi(this).attr('href');
      $jquery_aleksi("input[name=website_url]").val(href);
      if(typeof href !== typeof undefined && href !== false) {
        update_website();
      }
    });
    //$jquery_aleksi( "a" ).on('click', linkHandler );
    if (!isMobile){
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
  var $hoverText = $jquery_aleksi("#hoverText");


  // Return the word the cursor is over
  if (mode == 'app') {
    $jquery_aleksi(document).bind("click.doc",clickHandler);
    $jquery_aleksi("a").bind("click.link",linkHandler);
  }
  //$jquery_aleksi(document).click(clickHandler);
}
$jquery_aleksi( function() {
  if (mode == 'app') {
    initialize_aleksi();
  }
} );
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

function build_pins_table ()
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
      if (pin.website) {
        site_link.attr("href", "javascript:set_website("+pin.website.id+");");
      } else {
        site_link.attr("href", "javascript:void(0);");
      }
      var icon_span = $jquery_aleksi(document.createElement("span"));
      unpin_link.attr("href", "javascript:unpin("+pin.id.toString()+");");
      unpin_link.append('<i class="icon icon-trash"></i>');
      site_link.append('<i class="icon icon-external-link"></i>');
      unpin_link.append(icon_span);
      edit_link.append('<i class="icon icon-pencil"></i>');
      edit_link.attr("href", "javascript:void(0);");
      links_div.append(site_link);
      links_div.append(edit_link);
      links_div.append(unpin_link);
      links_cell.append(links_div);
      var fi = $jquery_aleksi(document.createElement("div"));
      var en = $jquery_aleksi(document.createElement("div"));
      fi.text(pin.fi);
      en.text(pin.en);
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
function build_website_selector ()
{
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
function build_quizlet_set_selector ()
{
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
function edit_pin_en (i, en)
{
    pins[i]['en'] = en;
    save_pin(pins[i]);
    reset_ui();
}
function edit_pin_fi (i, fi)
{
    pins[i]['fi'] = fi;
    save_pin(pins[i]);
    reset_ui();
}
function set_session(session) {
    this.session = session;
}
function set_pins(pins) {
        clear_pins();
        pins.forEach( function(pin) {
            this.pins.push(pin);
        });
}
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
function clear_pins ()
{
    pins = [];
}
$jquery_aleksi(document).ready(function() {
  set_menu_placement();
  get_pins();
  $jquery_aleksi("#quizlet").hide();
  get_quizlet_sets();
  get_session();
  reset_ui();
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
  var page_overlay = $jquery_aleksi('<div id="aleksi_overlay"><img src="'+settings['loading_spinner_url']+'"/> <p id="aleksi_overlay_msg">Processing</p></div>');
  page_overlay.appendTo(document.body);
  $jquery_aleksi("#aleksi_overlay").hide();
});

function showOverlay(){
    $jquery_aleksi("#aleksi_overlay").show();
}
function hideOverlay(){
    $jquery_aleksi("#aleksi_overlay").hide();
}
// modified from http://clarkdave.net/2012/10/2012-10-30-twitter-oauth-authorisation-in-a-popup/

function update_create_quizlet_set_state () {
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
    update_create_quizlet_set_state();

  var quizlet_connect_btn = $jquery_aleksi('#quizlet-connect-button');
  
  var quizlet_connect = new QuizletConnect(settings['quizlet_auth_url'], get_quizlet_sets);
  
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
}

function clear_quizlet_sets(url){
    quizlet_sets = [];
}


$jquery_aleksi(document).ready( function() {
    reset_ui();
});
  $jquery_aleksi( function() {
  } );
function analysisSuccessCallback(response) {
    $jquery_aleksi("#requesting_analysis").hide();
    $jquery_aleksi("#aleksi_translations_table tbody").remove();
    $jquery_aleksi("#aleksi_morph_tag_tables table").remove();
    $jquery_aleksi("#analysis_results").show();
    response.lemmas.forEach( function(translation) {
        for (var i=0; i<translation.en.length; i++) {
            var row = $jquery_aleksi(document.createElement("tr"));
            var pin_cell = $jquery_aleksi(document.createElement("td"));
            var pin_icon_span = $jquery_aleksi(document.createElement("span"));
            var pin_div = $jquery_aleksi(document.createElement("div"));
            var pin_link = $jquery_aleksi(document.createElement("a"));
            var en_cell = $jquery_aleksi(document.createElement("td"));
            var fi_cell = $jquery_aleksi(document.createElement("td"));
            fi_cell.attr("class", "aleksi_table_heading");
            if (i==0) {
                fi_cell.append(translation.lemma);
            }
            en_cell.append(translation.en[i]);
            pin_link.append('<i class="icon-pushpin"></i>');
            pin_link.attr("href", 'javascript:pin("'+escape_double_quotes(translation.lemma)+'", "'+escape_double_quotes(translation.en[i])+'");');
            pin_div.attr("class","links");
            pin_link.append(pin_icon_span);
            pin_div.append(pin_link);
            pin_cell.append(pin_div);
            row.append(fi_cell);
            row.append(en_cell);
            row.append(pin_cell);
            $jquery_aleksi("#aleksi_translations_table").append(row);
        }
    });
    response.tags.forEach( function(tagdict) {
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
                    val_cell.append('negative');
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
function analysisErrorCallback(response) { 
    $jquery_aleksi("#analysis_results").hide();
    $jquery_aleksi("#requesting_analysis").hide();
    $jquery_aleksi("#analysis_failed").show();
}    
function analysisCompleteCallback(response) { 
    if (response['textStatus']=='success') {
        analysisSuccessCallback(response['xhr'].responseJSON);
    }
    if (response['textStatus']=='error') {
        analysisErrorCallback(response['xhr'].responseJSON);
    }
}
// AJAX-calling functions
function analyze(word, e){
    //var lang = $jquery_aleksi("select[name=lang]").val();
    var lang = settings['lang'];
    var url = settings['analyze_url'].replace("__word",word)
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
            {   action: 'analyze_word',
                url: url,
                lang: lang},
            analysisCompleteCallback );
    } else {
        jQuery.ajax({
            url     : url,
    	    data : {'lang': lang},
            type    : 'POST',
            dataType: 'json',
            //dataType: 'text',
            //contentType: 'application/json',
            complete : analysisCompleteCallback
            //success : analysisSuccessCallback,
            //error: analysisErrorCallback
        });
    }
}
function set_website(new_website_id){
    if (session.website.id!=new_website_id) {
        jQuery.ajax({
            url     : settings['set_website_url'],
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
            url     : settings['set_quizlet_set_url'],
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
      'url': settings['save_pin_url'],
      'type': 'POST',
      'dataType': 'json', 
      'data': JSON.stringify({'pin': pin}),
      'success': function(pins)
      {
        set_pins(pins);
        build_pins_table();
        update_create_quizlet_set_state();
      }
    });
}
function unpin (pin_id)
{
    $jquery_aleksi.ajax({
      'url': settings['unpin_url'],
      'type': 'POST',
      'dataType': 'json', 
      'data': JSON.stringify({'pin_id': pin_id}),
      'success': function(pins)
      {
        set_pins(pins);
        build_pins_table();
        update_create_quizlet_set_state();
      }
    });
}
function pin (fi, en)
{
    var pins = [{fi: fi, en: en}];
    $jquery_aleksi.ajax({
      'url': settings['pin_url'],
      'type': 'POST',
      'dataType': 'json', 
      'data': JSON.stringify({'pins': pins}),
      'success': function(pins)
      {
        set_pins(pins);
        build_pins_table();
        update_create_quizlet_set_state();
      }
    });
}
function get_pins ()
{
    $jquery_aleksi.ajax({
      'url': settings['get_pins_url'],
      'type': 'POST',
      'dataType': 'json', 
      'success': function(pins)
      {
        set_pins(pins);
        build_pins_table();
        update_create_quizlet_set_state();
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
        url     : settings['get_session_url'],
        type    : 'GET',
        success : function(session){
          set_session(session);
          get_quizlet_sets();
          build_quizlet_set_selector();
          build_website_selector();
	  $jquery_aleksi("#lang_selector option[value='"+session.lang+"']").prop('selected', true);
          if (session.shared_session) {
            $jquery_aleksi("#share_session_button").hide();
            var load_shared_session_url = window.settings['load_shared_session_url'].replace("__shared_session_hash",session.shared_session.hash);
            $jquery_aleksi("#shared_session_link").attr("href", load_shared_session_url);
          } else {
            $jquery_aleksi("#shared_session").hide();
          }
        }    
    });
}
function update_current_website(){
    var website_url = session.website.url;
    showOverlay();
    jQuery.ajax({
        url     : settings['update_website_url'],
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
    showOverlay();
    jQuery.ajax({
        url     : settings['update_website_url'],
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
    showOverlay();
    jQuery.ajax({
        url     : settings['share_session_url'],
        data    : JSON.stringify({'session_id': session_id}), 
        type    : 'POST',
        dataType: 'json',
        success : function(shared_session){
          var load_shared_session_url = window.settings['load_shared_session_url'].replace("__shared_session_hash",shared_session.hash);
          $jquery_aleksi("#shared_session_link").attr("href", load_shared_session_url);
          $jquery_aleksi("#share_session_button").hide();
          $jquery_aleksi("#shared_session").show();
          hideOverlay();
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
    showOverlay();
    jQuery.ajax({
        url     : settings['save_session_url'],
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
        url     : settings['create_quizlet_set_url'],
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
      'url': settings['sync_to_quizlet_url'],
      'type': 'POST',
      'tryCount': 0,
      'retryLimit': 3,
      'dataType': 'json', 
      'data'    : JSON.stringify({'prune_pins_on_sync': prune_pins_on_sync, 'prune_quizlet_on_sync': prune_quizlet_on_sync}), 
      'success': function(pins)
      {
        set_pins(pins);
        build_pins_table();
        update_create_quizlet_set_state();
      },
      'error': function(xhr, textStatus, errorThrown) {
        if (xhr.status == 401) {
        // handle error
          var ajax_retry_callback = (function (params) {
              return function () { $jquery_aleksi.ajax(params) }
          })(this);
          var quizlet_connect = new QuizletConnect(settings['quizlet_auth_url'], ajax_retry_callback);
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
      'url': settings['get_quizlet_sets_url'],
      'type': 'POST',
      'dataType': 'json', 
      'success': function(_quizlet_sets)
      {
        //set_quizlet_sets(_quizlet_sets);
        build_quizlet_set_selector();
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
      url: settings['check_quizlet_auth_url'],
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
