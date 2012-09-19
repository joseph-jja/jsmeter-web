var JSMeterWeb = { };

JSMeterWeb.rowTemplate = "";

JSMeterWeb.edit = function() {

    $("#results").addClass("hidden");
    $("#inputCode").removeClass("hidden");
};

JSMeterWeb.processResults = function(results) {
    var container;

    container = $("#results");

    container.removeClass("hidden");
    $("#inputCode").addClass("hidden");

    $("table", container).remove();

    container.append( JSMeterWeb.rowTemplate( results ) );
};

JSMeterWeb.analyze = function() {
    var data;

    data = $("#code").val();

    $.post("/jsmeter?mode=JSON", data.toString(), JSMeterWeb.processResults, "json");
};

JSMeterWeb.resize = function() {
    var offset = 10 + 10 + 20;
    $("#code").height($(document).height() - $("#docHead").height() - $("#buttonBar").height() - offset );    
};

$(window).bind("load", function() { 
    JSMeterWeb.resize();

    $(window).resize( JSMeterWeb.resize );
    $("#analyzeCode").bind("click", JSMeterWeb.analyze);
    $("#editCode").bind("click", JSMeterWeb.edit);
    
    JSMeterWeb.rowTemplate = Handlebars.compile($("#result-row-template").html());
});
