var JSMeterWeb = { };

JSMeterWeb.edit = function() {

    $("#results").addClass("hidden");

    $("#inputCode").removeClass("hidden");

}
JSMeterWeb.processResults = function(results) {
    var tbody, rowTemplate, rlen, i, row;

    tbody = $("#resultTable tbody");
    rowTemplate = Handlebars.compile($("#result-row-template").html());

    $("#results").removeClass("hidden");

    $("#inputCode").addClass("hidden");

    rlen = results.length;

    $("#resultTable tbody tr").remove();
    
    for ( i =0; i < rlen; i+=1 ) {
        if ( isNaN(results[i]) ) {
            row = results[i];
            row['rowClass'] = ( i % 2 === 0 ) ? "odd": "even";
            row['complex'] = ( row['complexity'] > 10 ) ? "exceeded": "";
            row['miComplex'] = ( row['mi'] > 100 ) ? "exceeded": "";
            tbody.append( rowTemplate( row ) );
        } 
    } 
}
JSMeterWeb.analyze = function() {
    var data;

    data = $("#code").val();

    $.post("/jsmeter?mode=JSON",
            data.toString(),
            JSMeterWeb.processResults, 
            "json"
    );
}

JSMeterWeb.resize = function() {
    var offset = 10 + 10 + 20;
    $("#code").height($(document).height() - $("#docHead").height() - $("#buttonBar").height() - offset );    
};

$(window).bind("load", function() { 
    JSMeterWeb.resize();

    $(window).resize( JSMeterWeb.resize );
    $("#analyzeCode").bind("click", JSMeterWeb.analyze);
    $("#editCode").bind("click", JSMeterWeb.edit);
});
