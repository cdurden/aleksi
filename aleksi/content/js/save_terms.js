var pins = [];
function build_pins_table ()
{
    var table = $(document.createElement("table"));
    for (var i = 0; i < pins.length; i++) {
      var row = $(document.createElement("tr"));
      var fi_cell = $(document.createElement("td"));
      fi_cell.attr("class", "label");
      var en_cell = $(document.createElement("td"));
      var unpin_cell = $(document.createElement("td"));
      var unpin_link = $(document.createElement("a"));
      var icon_span = $(document.createElement("span"));
      unpin_link.attr("href", "javascript:unpin("+i.toString()+");");
      icon_span.attr("class", "ui-icon ui-icon-trash");
      icon_span.attr("style", "display:inline-block; direction:rtl;");
      icon_span.attr("style", "display:inline-block; direction:rtl;");
      unpin_link.append(icon_span);
      unpin_cell.append(unpin_link);
      //var fi = $(document.createTextNode(pins[i].fi));
      //var en = $(document.createTextNode(pins[i].en));
      var fi = $(document.createElement("div"));
      var en = $(document.createElement("div"));
      fi.text(pins[i].fi);
      en.text(pins[i].en);
      fi.attr('contenteditable','true');
      en.attr('contenteditable','true');
      function edit_fi_closure(i) {
        return function(e) {
          var key = e.keyCode || e.charCode;  // ie||others
          if(key == 13) {  // if enter key is pressed
            $(this).blur(); // lose focus
            return(edit_fi(i,$(this).text()));
          }
        }
      }
      function edit_en_closure(i) {
        return function(e) {
          var key = e.keyCode || e.charCode;  // ie||others
          if(key == 13) {  // if enter key is pressed
            $(this).blur(); // lose focus
            return(edit_en(i,$(this).text()));
          }
        }
      }
      fi.on("keydown", edit_fi_closure(i));
      en.on("keydown", edit_en_closure(i));
      fi.attr('fi_index',i);
      en.attr('en_index',i);
      fi_cell.append(fi);
      en_cell.append(en);
      row.append(fi_cell);
      row.append(en_cell);
      row.append(unpin_cell);
      table.append(row);
    }
    $("#aleksi_pins").find("table").replaceWith(table);
}
function unpin (i)
{
    pins.splice(i,1);
    reset_ui();
}
function edit_en (i, en)
{
    pins[i]['en'] = en;
//pins[i] = {fi: fi, en: en};
    reset_ui();
}
function edit_fi (i, fi)
{
    pins[i]['fi'] = fi;
    //pins[i] = {fi: fi, en: pins[i].en};
    reset_ui();
}
function pin (fi, en)
{
    //translations.push({translation: translation, en: en});
    pins = [{fi: fi, en: en}];
    reset_ui();
    $.ajax({
      'url': pin_url,
      'type': 'POST',
      'dataType': 'json', 
      //'data': JSON.stringify({'translation': translation, 'en': en}),
      'data': JSON.stringify({'pins': pins}),
      'success': function(data)
      {
        get_translations();
        $("#aleksi_pinned_status").text("Term data transferred to Quizlet study set!");
      },
      beforeSend: function()
      {
//      $(document).ready(function () {
        $("#aleksi_pinned_status").text("Transferring translation data to Quizlet...");
//      });
      },
      'error': function(data)
      {
//      $(document).ready(function () {
        $("#aleksi_pinned_status").text("An error occured while transferring translation data to Quizlet!");
//      });
      }
    });
}
function get_pins ()
{
    $.ajax({
      'url': load_pins_url,
      'type': 'POST',
      'dataType': 'json', 
      'success': function(data)
      {
        clear_pins();
        data['pins'].forEach( function(fi) {
            pins.append(fi);
        });
        reset_ui();
      },
/*      beforeSend: function()
      {
//      $(document).ready(function () {
//        $("#aleksi_pinned_status").text("Transferring fi data to Quizlet...");
//      });
      },
      */
      'error': function(data)
      {
//      $(document).ready(function () {
        $("#aleksi_pinned_status").text("An error occured while transferring fi data to Quizlet!");
//      });
      }
    });
}
function clear_pins ()
{
    pins = [];
}
function save_pins (url)
{
    //var x = document.getElementById("set_selector").selectedIndex;
    //var set_id = document.getElementsByTagName("option")[x].value;
    var set_id = $("input[name=set_id]:checked").val();
    var new_set_title = $("input[name=new_set_title]").val();
    var new_set_description = $("input[name=new_set_description]").val();
    $.ajax({
      'url': url,
      'type': 'POST',
      'dataType': 'json', 
      'data': JSON.stringify({set_id: set_id, pins: pins, new_set_title: new_set_title, new_set_description: new_set_description}),
      'success': function(data)
      {
        clear_pins();
        reset_ui();
        $("#aleksi_pinned_status").text("Term data transferred to Quizlet study set!");
      },
      beforeSend: function()
      {
//      $(document).ready(function () {
        $("#aleksi_pinned_status").text("Transferring fi data to Quizlet...");
//      });
      },
      'error': function(data)
      {
//      $(document).ready(function () {
        $("#aleksi_pinned_status").text("An error occured while transferring fi data to Quizlet!");
//      });
      }
    });
}
$(document).ready(function() {
  reset_ui();
});
