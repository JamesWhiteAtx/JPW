/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Apr 2014     James.White
 *
 */

this.jPw = this.jPw || {};

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
(function(ebay) {
	ebay.spa = function(request, response){
	 	var form = nlapiCreateForm('eBay Portal');
		var myInlineHtml = form.addField( 'custpage_btn', 'inlinehtml');
	    var spa = nlapiRequestURL( 'https://rwresources.azurewebsites.net/ebay', null , null, 'GET');  
		myInlineHtml.setDefaultValue(spa.getBody());
		response.writePage( form );
	};
}( this.jPw.ebay = this.jPw.ebay || {}));

