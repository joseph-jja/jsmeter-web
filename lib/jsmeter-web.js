var JSMeterWeb = { };

JSMeterWeb.edit = function() {

    $("#results").addClass("hidden");

    $("#inputCode").removeClass("hidden");

}
JSMeterWeb.processResults = function(results) {
    var table, rowTemplate, rlen, i, row;

    table = $("#resultTable tbody");
    rowTemplate = Handlebars.compile($("#result-row-template").html());

    $("#results").removeClass("hidden");

    $("#inputCode").addClass("hidden");

    rlen = results.length;

    table.get(0).innerHTML = "";
    
    for ( i =0; i < rlen; i+=1 ) {
        if ( isNaN(results[i]) ) {
            row = results[i];
            row['rowClass'] = ( i % 2 === 0 ) ? "odd": "even";
            table.append( rowTemplate( row ) );
        } 
    } 
}
JSMeterWeb.analyze = function() {
    var data;

    data = $("#code").html();

    $.post("/jsmeter?mode=JSON",
            data.toString(),
            JSMeterWeb.processResults, 
            "json"
    );
}
$("#analyzeCode").bind("click", JSMeterWeb.analyze);
$("#editCode").bind("click", JSMeterWeb.edit);

JSMeterWeb.resize = function() {
    var offset = 10 + 10 + 20;
    $("#code").height($(document).height() - $("#docHead").height() - $("#buttonBar").height() - offset );    
};

JSMeterWeb.resize();

$(window).resize( JSMeterWeb.resize );

