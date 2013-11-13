/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Oct 2013     james.white
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){

	var alpahbet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r'];
	
   if ( request.getMethod() == 'GET' )
   {
        var form = nlapiCreateForm('eBay - Unshipped Orders');

        
        var url = 'https://api.sandbox.ebay.com/ws/api.dll';

        var headers = new Array();
        headers['X-EBAY-API-COMPATIBILITY-LEVEL'] = '841';
        headers['X-EBAY-API-DEV-NAME'] = '481891e7-46d4-4a19-8992-bbfef42842b7';
        headers['X-EBAY-API-APP-NAME'] = 'Roadwire-fb1b-4244-80f7-0a9a8f918293';
        headers['X-EBAY-API-CERT-NAME'] = '99fc89de-c5a8-4594-97a5-9974d1908432';
        headers['X-EBAY-API-SITEID'] = '0';
        headers['X-EBAY-API-CALL-NAME'] = 'GetSellingManagerSoldListings';

        var token = 'AgAAAA**AQAAAA**aAAAAA**9DJPUg**nY+sHZ2PrBmdj6wVnY+sEZ2PrA2dj6wFk4GhC5CAogudj6x9nY+seQ**3V0CAA**AAMAAA**PcqkIx0m6ICTidyzGK3gC3XBer7ww1EUAHhl2EJEopHUCw6kygGDClF2AjEvZj3W21H/aRQfJfr5VSJ6ZZcUj6yb1V73FgmhWYFEEDr3pTEe4AXtBPQmxBNjj2DvfeueJoqT59dVJRGWjeqL/VvgyV7+j92sz0jwMIc6G6m4dmTeYRkDgZFgh2W12GadVv58Tka1iul8w2li0J0O27FNhuuk05fTdKKW4G0DQPz10YqPCP9yRcZwF3fnB246rH2YxjiDhdQHvi4JevnDiiW6D0ZcfAlDBnH8sjhbh7SrqtU+ngpkJlLga5jrwTyXIWYQJtKMB2bQxf2R0HQYxWmKqTocnJgQk2K/E738qggcZXVBFS9VczznHSoDAXSIhJSfZ7RqXeesF1ATadaCiK/yxdmk/pH4+jAiiAiMuw6k0L4g5kSkToE3jFrM7zS77GO1FeET+jQfoZ1UA/jqkFVcZ2DRqEXX7qSnUfIH6plNm6K+hwKv4qsqwLhPLnCChP0Oms0wZlpozMeTFlg7qbXYvsXOGigguhhoSZyiwFc0tdi5MX2B6WO66loHJuaSMfeTMVwztfzjF5rVUtHh0LU38Mgdg5kG+EYGsg+wectXZ1363U87KlO8CnGKGq9wPekdapyb/qJdfg8UmFtnryjseV39yn+Ee5IflOK9rT5ngO5rJTa3uAvFaT0N1/xUvZtPCQBDde5GMzbJtQMJJyMCU8NmlmwN2bGVJMmhz4vnMHXj7s7X2Pbevq9fcHMwzw/y'; 

        payload = '<?xml version="1.0" encoding="utf-8"?>'+
        '<GetSellingManagerSoldListingsRequest xmlns="urn:ebay:apis:eBLBaseComponents">'+
        '<RequesterCredentials>'+
        '<eBayAuthToken>'+token+'</eBayAuthToken>'+
        '</RequesterCredentials>'+
        '<Filter>PaidNotShipped</Filter>'+
        '</GetSellingManagerSoldListingsRequest>?';

        var eBayResp = nlapiRequestURL( url, payload, headers);	

        var body = eBayResp.getBody();
        var responseXML = nlapiStringToXML(body);

        var orders = nlapiSelectNodes(responseXML, '//nlapi:SaleRecord');
        
        var trans;
        var itemId;
        var orderLineItemID;
        var eBayUrl, u;
        for (var i = 0; i < orders.length; i++) {
            
        	trans = nlapiSelectNodes(orders[i], '//nlapi:SellingManagerSoldTransaction');
        	itemId = nlapiSelectValue(trans[0], '//nlapi:ItemID');
        	orderLineItemID = nlapiSelectValue(trans[0], '//nlapi:OrderLineItemID');
        	
        	orderLineItemID = orderLineItemID.replace(/-/g, '_');
        	
            eBayUrl = 'http://payments.sandbox.ebay.com/ws/eBayISAPI.dll?AddTrackingNumber2&LineID=Transactions.'
            	+orderLineItemID
            	+'&flow=&from=1&cm=&pg=&islpvcode=&ru=http%3A%2F%2Fk2b-bulk.sandbox.ebay.com%2Fws%2FeBayISAPI.dll%3FSalesRecordConsole%26currentpage%3DSCSold%26dtt%3D1381184502208&claimid=';

            var field = form.addField("orderlink"+alpahbet[i], "url", "" );
            field.setDisplayType( "inline" )
            	.setLinkText( "Order:"+i+"  item id: "+itemId)
            	.setDefaultValue( eBayUrl );

            if (i == 0) {
            	field.setLayoutType('normal', 'startcol');
            };
            
        };        
        
        //form.addField("xenterempslink", "url", "" )	    	.setDisplayType( "inline" )	    	.setLinkText( "Order 2")	    	.setDefaultValue( "https://system.netsuite.com" + nlapiResolveURL( 'tasklink', 'EDIT_EMPLOYEE') );
	        
 
	        response.writePage( form );
	   }
	   else
	        dumpResponse(request,response);


}

function activeListings(request, response){
	var api = jPw.apiet.makeActiveListingsRequest(jPw.apiet.makeEnvSandBox());
	
	api.callApiCallback( 
		function(xmlObj){
			
			var list = nlapiCreateList('Active eBay Listings');
		    list.setStyle('grid');
		     
		   	list.addColumn('row', 'text', 'row');
		   	list.addColumn('partno', 'text', 'part #').setURL('item_url', true);
		   	list.addColumn('title', 'text', 'title');
		   	list.addColumn('ebayitemid', 'text', 'eBay ID').setURL('listing_url', true);
		   	list.addColumn('price', 'text', 'price');
		 	
			var node;
			var itemNodes = nlapiSelectNodes(xmlObj, '//nlapi:Item');
			for (var i = 0; i < itemNodes.length; i++) {
				node = itemNodes[i];
				
				list.addRow({
					row: parseInt(i)+1,
			    	partno: nlapiSelectValue(node, './/nlapi:SKU'),
			    	item_url: jPw.getSysUrlDomain() + '/app/common/item/item.nl?itemtype=InvtPart&id=' + nlapiSelectValue(node, './/nlapi:ApplicationData'),
			    	title: nlapiSelectValue(node, './/nlapi:Title'),
			    	ebayitemid: nlapiSelectValue(node, './/nlapi:ItemID'),
			    	listing_url: nlapiSelectValue(node, './/nlapi:ViewItemURL'),
			    	price: nlapiSelectValue(node, './/nlapi:CurrentPrice')
			    });
				
			};
			response.writePage( list );
		}, 
		function(xmlObj){ },
		function(xmlObj){ throw {message: "eBay API failed"}; }
	);
};