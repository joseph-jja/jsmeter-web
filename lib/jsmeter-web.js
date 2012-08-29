var JSMeterWeb = { };

JSMeterWeb.rowTemplate = "";

JSMeterWeb.edit = function() {

    $("#results").addClass("hidden");
    $("#inputCode").removeClass("hidden");
};

JSMeterWeb.processResults = function(results) {
    var tbody, rlen, i, row;

    tbody = $("#resultTable tbody");

    $("#results").removeClass("hidden");
    $("#inputCode").addClass("hidden");

    $("#resultTable tbody tr").remove();
    
    rlen = results.length;
    for ( i = 0; i < rlen; i+=1 ) {
        row = results[i];
        if ( isNaN(row) ) {
            row['rowClass'] = ( i % 2 === 0 ) ? "odd": "even";
            row['complex'] = ( row['complexity'] > 10 ) ? "exceeded": "";
            row['miComplex'] = ( row['mi'] > 100 ) ? "exceeded": "";
            tbody.append( JSMeterWeb.rowTemplate( row ) );
        } 
    } 
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
