var isMobile = false; //initiate as false
var isFacebook = false;
var url;

var initialized = false;
var enabled = false;


function linkHandler(e) {
    e.preventDefault();
    chrome.storage.sync.get('disableLinks', function (result) {
        if (!result.disableLinks) {
            e.run();
        }});
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action=='getStatus') 
            sendResponse({enabled: enabled, initialized: initialized});
        if (request.action=='initialize') {
            url = request.url;
            facebookRegExp = /https?:\/\/www.facebook.com\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;
            isFacebook = facebookRegExp.test(url);
            initialize_dialog();
            initialized = true;
            sendResponse();
        }
        if (request.action=='enable') {
            $(document).bind("click.doc",clickHandler);
            $("a").bind("click.link",linkHandler);
            enabled = true;
            sendResponse();
        }
        if (request.action=='disable') {
            $("#aleksi_dialog").dialog("close");
            $("a").unbind("click.link");
            $(document).unbind("click.doc");
            enabled = false;
            sendResponse();
        }
    }
);

chrome.runtime.sendMessage({action: 'reload'},function(response) {});
      
    
function initialize_dialog() {
    var body = document.getElementsByTagName('body');
    var dialog = document.createElement ("div");
    dialog.setAttribute("id","aleksi_dialog");
    document.body.appendChild(dialog);

    // device detection
    if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) isMobile = true;
    var ypos = 0;
    if (!isMobile){
    $(document).scroll(function(e){

        if ($(".ui-widget-overlay")) //the dialog has popped up in modal view
        {
            //fix the overlay so it scrolls down with the page
            $(".ui-widget-overlay").css({
                position: 'fixed',
                top: 0
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
//              if (isFacebook) {
      $( "#aleksi_dialog" ).dialog({
        autoOpen: false,
//                position: { my: "right top", at: "right top", of: window },
        maxHeight: $(window).height()*.95
      });
/*              } else {
      $( "#aleksi_dialog" ).dialog({
        autoOpen: false,
        position: { my: "right top", at: "right top", of: window },
        maxHeight: $(window).height()*.95
      });
      }
      */
    } else {
      $( "#aleksi_dialog" ).dialog({
        autoOpen: false,
      });
      $("#aleksi_dialog").click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        $('#aleksi_dialog').dialog('close');
      });
    }
    $("#aleksi_dialog").css({
        'z-index': '2147483647 !important'
    });
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
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
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
//    showBridge(null, null, null);

    // If at a node boundary, cross over and see what 
    // the next word is and check if this should be added to our temp word
    if (end === data.length - 1 || begin === 0) {

        var nextNode = getNextNode(textNode);
        var prevNode = getPrevNode(textNode);

        // Get the next node text
        if (end == data.length - 1 && nextNode) {
            var nextText = nextNode.textContent;

            // Demo only
//            showBridge(word, nextText, null);

            // Add the letters from the next text block until a whitespace, or end
            i = 0;
            while (i < nextText.length && !isW(nextText[i])) {
              word += nextText[i++];
            }

        } else if (begin === 0 && prevNode) {
            // Get the previous node text
            var prevText = prevNode.textContent;

            // Demo only
//            showBridge(word, null, prevText);

            // Add the letters from the next text block until a whitespace, or end
            i = prevText.length - 1;
            while (i >= 0 && !isW(prevText[i])) {
              word = prevText[i--] + word;
            }
        }
    }
    return word;
}

// Display analysis of the word the cursor is over
function clickHandler(e) {
    var word = getFullWord(e);
    word = word.replace(/([a-zA-Z\u00C0-\u02AF]+)[-.,()&$#!\[\]{}"']+$/g, "$1");
    if (word !== "" && !$(e.target).parents().hasClass('ui-button')) {
      lookup_word(word);
    }
    e.stopPropagation();
}

function lookup_word(word){
    var wordsUri;
    chrome.storage.sync.get('wordsUri', function (result) {
        wordsUri = result.wordsUri;
        jQuery.ajax({
            url     : wordsUri+word+'.html',
            type    : 'POST',
            dataType: 'html',
            beforeSend: function(msg){
                $( "#aleksi_dialog" ).dialog('option', 'title', word);
                if (!isMobile){
                  if ($(".ui-widget-overlay")) //the dialog has popped up in modal view
                  {
                      //fix the overlay so it scrolls down with the page
                      $(".ui-widget-overlay").css({
                          position: 'fixed',
                          top: 0
                      });
          
                      //get the current popup position of the dialog box
                      pos = $(".ui-dialog").position();
          
                      //adjust the dialog box so that it scrolls as you scroll the page
                      $(".ui-dialog").css({
                          position: 'fixed',
                          'z-index': '2147483647 !important',
                          top: pos.y
                      });
                  }
                }
                $( "#aleksi_dialog" ).dialog( "open" );
                $( "#aleksi_dialog" ).dialog( "moveToTop" );
                $( "#aleksi_dialog" ).text( "Requesting analysis..." );
            },
            success : function(data){
                $( "#aleksi_dialog" ).html(data);
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) { 
                $( "#aleksi_dialog" ).text( "No results were found." );
            }    
        });
    });
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

/*
// DEMO-ONLY code - this shows how the word is recombined across boundaries
function showBridge(word, nextText, prevText) {
  if (nextText) {
    $("#bridge").html("<span class=\"word\">" + word + "</span>  |  " + nextText.substring(0, 20) + "...").show();
  } else if (prevText) {
    $("#bridge").html("..." + prevText.substring(prevText.length - 20, prevText.length) + "  |  <span class=\"word\">" + word + "</span>").show();
  } else {
    $("#bridge").hide();
  }
}
*/
