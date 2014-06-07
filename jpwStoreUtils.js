/**
 * Module Description
 * Javascript Utilities for the Web Store 
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Jun 2014     James.White
 *
 */

this.jPw = this.jPw || {};

(function(store, undefined) {

	var hvlistjson = function (request, response) {
		jPw.jsonResponse(request, response, store.getHvListJson());
	};
	
	var hvlistdownload = function (request, response) {
	    var hvlist = store.getHvListJson();
	    
		var titles = [];
	    for (var i = 0; i < hvlist.columns.length; i++) {
	    	titles.push(hvlist.columns[i].label);
	    };

	    var titleRow = '"' + titles.join('","') +'"';
	    
	    var file = titleRow; 
	    
	    var vals;

	    jPw.each(hvlist.rows, function() {
	            row = this;
	            vals = [];
	            for (var i = 0, len = hvlist.columns.length; i < len; i++) {
	                    vals.push( '"'+row[hvlist.columns[i].name]+'"' );
	            };
	            file = file + '\r\n' + vals.join(',');
	    });
		
	    response.setContentType('CSV', 'RoadwireHighVolume.csv', 'attachment');
	    response.writeLine(file);       
	};
	
	store.getHvListJson = function() {
	    var ss = nlapiLoadSearch(null, 'customsearch_ptrn_hv_in_store');
	    var rs = ss.runSearch();

	    var cols = [];    

	    for (var i = 0; i < ss.columns.length; i++) {
	    	cols.push ( {name: ss.columns[i].name, label: ss.columns[i].label} );
	    };

	    var rows = [];
	    var last = {};

	    rs.forEachResult(function (searchRow) {
	    	var row = {};
	    	for (var i = 0; i < ss.columns.length; i++) {
	    		row[cols[i].name] = searchRow.getText( ss.columns[i]) || searchRow.getValue( ss.columns[i]);
	    	};

	    	if (row.feedname != last.feedname) {
	    		last = row;
	        	rows.push(last);
	    	}
	    	
	    	return true;
	    });    

	    return {columns: cols, rows: rows, count: rows.length};
	};
	
	/**
	 * @param {nlobjRequest} request Request object
	 * @param {nlobjResponse} response Response object
	 * @returns {Void} Any output is written via response object
	 * 
	 */
	store.suitelet = function(request, response){
	    var type = request.getParameter('type');
	    switch(type){
	    		case 'hvlistjson': hvlistjson(request, response); break;
	            case 'hvlistdownload': hvlistdownload(request, response); break;
	            default:
	            	nlapiLogExecution('ERROR', 'invalid type parameter', type);
	            	jPw.jsonResponse( request, response, jPw.errResult("invalid type parameter: '" + type +"'") );
	            break;
	    };
	
	};

}( this.jPw.store = this.jPw.store || {}));

