                function loadPopup() {
                $.ajax({
                type: "GET",
                url: "popupdata.html"
                }).done(function(data) {

                $.mobile.activePage.append($(data)).trigger("create");
                $("#popup1").popup().popup("open");
                });
                }

$(document).on("pagebeforechange", function(e, data) {
    // We only want to handle changePage() calls where the caller is
    // asking us to load a page by URL
    if (typeof data.toPage === "string") {
        // We are being asked to load a page by URL
        var u = $.mobile.path.parseUrl(data.toPage),
            _re = "#contact";
        if (u.hash.search(_re) !== -1) {
            var id = urlParam("id", data.toPage); 
            $.ajax({
                type: "POST",
                url: "get.php?id=" + id
            }).done(function(data) {
                data = $.parseJSON(data);
                var msg = '<div data-role="collapsible" data-collapsed="false"  data-theme="b" data-content-theme="d"> <h4>' + data.contact[0].name + '</h4><p>';
                msg += '<div>' + data.contact[0].address + '</div>';
                msg += '<div>' + data.contact[0].city + '</div>';
                msg += '<div>' + data.contact[0].email + '</div>';
                msg += '<div></div>';
                msg += '<div><b>' + data.contact[0].company + '</b></div></p> </div>';
                runtimePopup(msg);
            });

            e.preventDefault(); 
        } 
    }
});
// Determine url param
var urlParam = function(name, url) {
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(url);
    return results !== null ? results[1] || "" : "";
}

function runtimePopup(message, popupafterclose) {
    var template = "<div data-role='popup' class='ui-content messagePopup' style='max-width:280px'>"
      + "<a href='#' data-role='button' data-theme='g' data-icon='delete' data-iconpos='notext' "
      + " class='ui-btn-left closePopup'>Close</a> <span> "
      + message + " </span> </div>";

