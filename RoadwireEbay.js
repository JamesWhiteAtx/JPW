/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Oct 2013     james.white
 *
 * Requires:
 * eBayTradingApi.js
 * jPwJsUtils.js
 */

this.jPw = this.jPw || {};

/*
 * jPw.ebay.activeListings
 * Suitelet list form of active eBay Listings with links to maintenance forms
 */
(function(ebay) {
	ebay.alpahbet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r'];
}( this.jPw.ebay = this.jPw.ebay || {}));

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
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

            var field = form.addField("orderlink"+ebay.alpahbet[i], "url", "" );
            field.setDisplayType( "inline" )
            	.setLinkText( "Order:"+i+"  item id: "+itemId)
            	.setDefaultValue( eBayUrl );

            if (i == 0) {
            	field.setLayoutType('normal', 'startcol');
            };
            
        };        
	        response.writePage( form );
	} 
	else
		dumpResponse(request,response);
};

/*
 * jPw.ebay.getActiveListingArr
 * eBay API call to retrieve array of active listings 
 */
(function(ebay) {

	ebay.getActiveListingArr = function(skuArr, setupFcn, itemFcn){
		
		var api = jPw.apiet.makeActiveListingsRequest();
		api.addOutputSelector('PageNumber')
			.addOutputSelector('PaginationResult.TotalNumberOfEntries')
			.addOutputSelector('PaginationResult.TotalNumberOfPages')
			.addOutputSelector('ReturnedItemCountActual');

		if ((skuArr) && (skuArr.length > 0)) {
			api.addSkuFilter(skuArr);
		};
		
		if (setupFcn) {
			setupFcn(api);
		};
		
		var pageNumber = 1;
		var entriesPerPage = 2;
		var totalPages = 0;
		var pagesLoaded = 0;
		var listingArr = [];
		
		var loadListings = function() {
			api.setRequestProp("Pagination", {"EntriesPerPage": entriesPerPage, "PageNumber": pageNumber});	
			
			api.callApiCallback( 
				function(obj){
					var node;
					var itemNodes = obj.getRespAnyNodes('Item');// nlapiSelectNodes(xmlObj, '//nlapi:Item');
					for (var i = 0; i < itemNodes.length; i++) {
						node = itemNodes[i];

						var qty = obj.getSubVal(node, 'Quantity');
						var sold = obj.getSubVal(node, 'QuantitySold');
						var listing = {
							row: parseInt(i)+1,
							nsItemId: obj.getSubVal(node, 'ApplicationData'),
							sku: obj.getSubVal(node, 'SKU'),
							ebayItemId:  obj.getSubVal(node, 'ItemID'),
							listingUrl: obj.getSubVal(node, 'ViewItemURL'),
							title: obj.getSubVal(node, 'Title'),
							price: obj.getSubVal(node, 'CurrentPrice'),
							qty: qty,
							sold: sold,
							avail: (parseInt(qty) || 0) - (parseInt(sold) || 0)
						};
						
						if (itemFcn) {
							itemFcn(listing, node, obj);
						};
						
						listingArr.push(listing);
					};
					if (totalPages === 0) {
						totalPages = obj.getRespAnyVal('TotalNumberOfPages');
					};
					pagesLoaded ++;
					pageNumber ++;
				}, 
				function(obj){ throw {message: "eBay ActiveListings API failed"}; }
			);
			
		};		
		
		do {
			loadListings();
		} while (pagesLoaded < totalPages) ;
		
		return listingArr;
	};
}( this.jPw.ebay = this.jPw.ebay || {}));
	
/*
 * jPw.ebay.activeListings
 * Suitelet list form of active eBay Listings with links to maintenance forms
 */
(function(ebay) {
	ebay.activeListings = function(request, response){
		
		var listings = jPw.ebay.getActiveListingArr(null,
				function(api) {
					api.addOutputSelector('ItemArray.Item.PictureDetails.PictureURL')
				},
				function(listing, itemNode, obj) {
					listing.pictureUrls = [];
					
					var pictUrls = obj.getSubVals(itemNode, 'PictureURL');
					
					jPw.each(pictUrls, function() {
						var pictUrl = this;
						listing.pictureUrls.push(pictUrl);
					});
					
				}
		);		
		
		var list = nlapiCreateList('Active eBay Listings');
	    list.setStyle('grid');
	    
	    //list.setScript('customscript_ec_rw_client_salesorder');
	    
	   	list.addColumn('row', 'text', 'row');
	   	list.addColumn('partno', 'text', 'SKU').setURL('item_url', true);
	   	list.addColumn('title', 'text', 'title');
	   	list.addColumn('ebayitemid', 'text', 'eBay ID').setURL('listing_url', true);
	   	list.addColumn('qty', 'text', 'qty').setURL('qty_url', true);
	   	list.addColumn('sold', 'text', 'sold').setURL('qty_url', true);
	   	list.addColumn('price', 'text', 'price');
	   	list.addColumn('remove', 'text', 'Remove').setURL('remove_url', true);
	    list.addColumn('imageone', 'image', 'image 1');    		//.setURL('img_one_url', true);
	    list.addColumn('imagtwo', 'image', 'image 2');    		//.setURL('img_one_url', true);

	   	
	   	var remUrl = nlapiResolveURL('SUITELET', 'customscript_ebay_rem_listing','customdeploy_ebay_rem_listing', null);
	   	var qtyUrl = nlapiResolveURL('SUITELET', 'customscript_ebay_listing_qty','customdeploy_ebay_listing_qty', null);
	   	var sysDom = jPw.getSysUrlDomain();
		var nsItemUrl = sysDom + '/app/common/item/item.nl?itemtype=InvtPart&id=';
			   	
	   	jPw.each(listings, function() {
	   		var listing = this;
			list.addRow({
				row: listing.row,
		    	partno: listing.sku,
		    	item_url: nsItemUrl + listing.nsItemId,
		    	title: listing.title,
		    	ebayitemid: listing.ebayItemId,
		    	listing_url: listing.listingUrl,
		    	qty: listing.qty,
		    	sold: listing.sold,
		    	price: listing.price,
		    	remove: 'remove',
		    	qty_url: qtyUrl + '&partno=' + listing.sku + '&ebayitemid=' + listing.ebayItemId + '&qty=' + listing.qty,
		    	remove_url: remUrl + '&partno=' + listing.sku + '&itemid=' + listing.nsItemId + '&ebayitemid=' + listing.ebayItemId,
		    	
		    	imageone: listing.pictureUrls[0],
		    	imagtwo: listing.pictureUrls[1]
		    });
	   	});
	   	response.writePage( list );
	};
	
}( this.jPw.ebay = this.jPw.ebay || {}));

/*
 * Utility functions for eBay Maintenance Forms
 */
(function(ebay) {
	
	ebay.getEbayCtlgId = function() {
		var results = nlapiSearchRecord('customlist_product_catalog', null, 
			[ new nlobjSearchFilter('name', null, 'is', 'eBay Listings')], 
			[ new nlobjSearchColumn('name')]);
		return results[0].getId();
	};	
	ebay.ctlgId = ebay.getEbayCtlgId();

	ebay.ctlgFldId = 'custitem_item_prod_ctlg';
	ebay.listIdFldId = 'custitem_ebay_listing_id';
	ebay.listUrlFldId = 'custitem_ebay_listing_url';
	
	ebay.addEbayItemCtlg = function (parm) {  //{internalId, record, submit}
		var record;
		if (typeof parm.record === 'object') {
			record = parm.record;
		} else {
			//record = nlapiLoadRecord('serializedinventoryitem', parm.internalId, {recordmode: 'dynamic'});
			record = jPw.loadItemRecord(parm.internalId, {recordmode: 'dynamic'});
		};
		if (record) {
			//add ebay listing to the item catalog
			var ctlgIds = jPw.map(record.getFieldValues(ebay.ctlgFldId), function(){ // record.getFieldValues returns some same strange kind of array, used map so it was a generic array 
				return this;
			});
			if (jPw.addOnlyUniqueElm(ctlgIds , ebay.ctlgId)) {
				record.setFieldValues(ebay.ctlgFldId, ctlgIds);
				if (parm.submit !== false) {	
					return nlapiSubmitRecord(record, true);
				};
				
			};
		};
	};
	
	ebay.clearEbayItemCtlg = function (parm) {  //{internalId, record, submit}
		var record;
		
		if (typeof parm.record === 'object') {
			record = parm.record;
		} else {
			//record = nlapiLoadRecord('serializedinventoryitem', parm.internalId, {recordmode: 'dynamic'});
			record = jPw.loadItemRecord(parm.internalId, {recordmode: 'dynamic'});
		};
		if (record) {
			
			var ctlgIds = jPw.map(record.getFieldValues(ebay.ctlgFldId), function(){ // record.getFieldValues returns some same strange kind of array that splice does work on, used map so it was a generic array 
				return this;
			});
			
			if (jPw.arrRemove(ctlgIds , ebay.ctlgId) !== -1) {
				record.setFieldValues(ebay.ctlgFldId, ctlgIds);
				
				if (parm.submit !== false) {	
					return nlapiSubmitRecord(record, true);
				};
				
			};
		};
	};
	
	ebay.updEbayItem = function(parm) {//({internalId, record, eBayItemId, eBayUrl, avail, submit});
		var record;
		
		if (typeof parm.record === 'object') {
			record = parm.record;
		} else {
			//record = nlapiLoadRecord('serializedinventoryitem', parm.internalId, {recordmode: 'dynamic'});
			record = jPw.loadItemRecord(parm.internalId, {recordmode: 'dynamic'});
		};
		
		if (record) {
			record.setFieldValue(ebay.listIdFldId, parm.eBayItemId);
			record.setFieldValue(ebay.listUrlFldId, parm.eBayUrl);

			var qty = parseInt(parm.avail);
			if (isNaN(qty) || (qty > 0)) {
				//add to ebay listing product catalog
				ebay.addEbayItemCtlg({record: record, submit: false});
			} else {
				ebay.clearEbayItemCtlg({record: record, submit: false});
			};
			
			if (parm.submit !== false) {	
				return nlapiSubmitRecord(record, true);
			};
		};
	};
	
	ebay.clearEbayItem = function (parm) {  //{internalId, record, submit}
		var record;
		
		if (typeof parm.record === 'object') {
			record = parm.record;
		} else {
			//record = nlapiLoadRecord('serializedinventoryitem', parm.internalId, {recordmode: 'dynamic'});
			record = jPw.loadItemRecord(parm.internalId, {recordmode: 'dynamic'});
		};
		
		if (record) {
			record.setFieldValue(ebay.listIdFldId, null);
			record.setFieldValue(ebay.listUrlFldId, null);

			//remove from ebay listing product catalog
			ebay.clearEbayItemCtlg({record: record, submit: false});
			
			if (parm.submit !== false) {	
				return nlapiSubmitRecord(record, true);
			};
		};
	};
	
	ebay.updateNsItem = function (nsItemId, partNo, avail) {
		
		var results = nlapiSearchRecord('item', null, 
				[new nlobjSearchFilter('internalid', null, 'is', nsItemId),
				 new nlobjSearchFilter('name', null, 'startswith', partNo)], 
				[new nlobjSearchColumn('name')]);
		
		jPw.each(results, function() {
			var internalId = this.getId();
			
			if (avail > 0) {
				//ebay.updEbayItem({internalId: internalId, eBayItemId: eBayItemId, eBayUrl: eBayUrl, avail: 1});
				ebay.addEbayItemCtlg({internalId: internalId});
			} else {
				ebay.clearEbayItemCtlg({internalId: internalId});
			};
			
		});
	};
	
	/*ebay.getEbayCfg = function() {
		if (!ebay.cfgObj) {
		
			var results = nlapiSearchRecord('customrecord_ebay_config', null, null, 
				[ new nlobjSearchColumn('custrecord_ebay_cfg_lstng_file_id')]);

			if ((!results) || (results.length < 1)) {
				var msg = 'Thare are no eBay configuration records defined.';
				nlapiLogExecution('ERROR', msg);
				throw nlapiCreateError('EBAY_CONFIG_MISSING', msg);
				return;
			};

			ebay.cfgObj = {lstngFileId: results[0].getValue('custrecord_ebay_cfg_lstng_file_id')};
		};
		return ebay.cfgObj;
	};*/
	
}( this.jPw.ebay = this.jPw.ebay || {}));

/*
 * jPw.ebay.apiRespForm
 * Suitelet Form, base repsonse form
 */
(function(ebay) {
	ebay.apiRespForm = function(parm) { //request, response, api, title, msgFcn, notFailFcn, itemKey

		var xmlResp = function (obj) {
			parm.response.setContentType('XMLDOC');
			parm.response.write( obj.respXmlStr );					
		};
		
		parm.api.callApiCallback( 
			function(obj){
				var respEbayItemId = obj.getRespAnyVal(parm.itemKey || 'ItemID' );
				var respSku = obj.getRespAnyVal('SKU') ;
				
				if (parm.notFailFcn) {
					var fcnRet = parm.notFailFcn(parm.request, parm.response, obj, respEbayItemId, respSku);
					if (fcnRet === false) {
						xmlResp(obj);
						return;
					};
				};
				
				form = nlapiCreateForm(parm.title);

				form.addField('message', 'inlinehtml', '', null, 'message')
        			.setLayoutType('normal', 'startcol').setDisplayType('inline')
        			.setDefaultValue('<html><body><h1>'+parm.msgFcn(obj)+'</h1></body></html>');

				form.addField('partno', 'text', 'Part #', null, 'message').setPadding(1).setDisplayType('disabled').setDefaultValue(respSku);
				form.addField('ebayitemid', 'text', 'eBay Item ID', null, 'message').setDisplayType('disabled').setDefaultValue(respEbayItemId);
				
		        if ((parm.maintParm) && (parm.maintParm.hasVals())) {
					var listUrl = nlapiResolveURL('SUITELET', 'customscript_ebay_maint_list','customdeploy_ebay_maint_list', null) + parm.maintParm.parmStr();
					var script = "window.location.replace('"+listUrl+"')";
			        form.addButton('buttoncancel', 'Return to List', script);
		        };
				
				parm.response.writePage( form );
			}, 
			function(obj){ xmlResp(obj); }
		);
		
	};
}( this.jPw.ebay = this.jPw.ebay || {}));

/*
 * jPw.ebay.removeListing
 * Suitelet form, GET & POST
 */
(function(ebay) {
	ebay.removeListing = function(request, response){
		var form;
		if ( request.getMethod() == 'GET' ) {
			var maintParm = jPw.ebay.MaintParm(request);
			var partno = request.getParameter('partno');
			var ebayitemid = request.getParameter('ebayitemid');
			
			form = nlapiCreateForm('Remove eBay Listing');
	        
			maintParm.addHidFlds(form);
			form.addField('warnmsg', 'inlinehtml', '', null, 'warning')
        		.setLayoutType('normal', 'startcol').setDisplayType('inline')
        		.setDefaultValue('<html><body><h1>Are you sure you want to remove this eBay listing?</h1></body></html>');

			form.addField('partno', 'text', 'Part #', null, 'warning').setPadding(1).setDisplayType('disabled').setDefaultValue(partno);
			form.addField('ebayitemid', 'text', 'eBay Item ID', null, 'warning').setDisplayType('disabled').setDefaultValue(ebayitemid);
					
	        form.addSubmitButton('Remove Listing');

	        if (maintParm.hasVals()) {
				var listUrl = nlapiResolveURL('SUITELET', 'customscript_ebay_maint_list','customdeploy_ebay_maint_list', null) + maintParm.parmStr();
				var script = "window.location.replace('"+listUrl+"')";
		        form.addButton('buttoncancel', 'Cancel', script);
	        };
	        
	        response.writePage( form );
		} else if ( request.getMethod() == 'POST' ) {
			var maintParm = jPw.ebay.MaintParm(request);
			//var partno = request.getParameter('partno');
			var ebayitemid = request.getParameter('ebayitemid');

			var api = jPw.apiet.makeEndFixedPriceItemRequest();
			api.setItemID(ebayitemid);

			// send api request object to response form function 
			ebay.apiRespForm(
				{	request: request, 
					response: response,
					maintParm: maintParm,
					api: api, 
					title: 'eBay Listing Removed', 
					msgFcn: function(obj){return 'eBay listing has been removed.';},  
					notFailFcn: function (request, response, obj, respEbayItemId, respSku) {
						// find any items with ebay item id
						var results = nlapiSearchRecord('item', null, 
								[new nlobjSearchFilter(ebay.listIdFldId, null, 'is', respEbayItemId)], 
								[new nlobjSearchColumn('name')]);
						
						jPw.each(results, function() {
							var internalId = this.getId();
							ebay.clearEbayItem({internalId: internalId});
						});
					},
					itemKey: 'CorrelationID'
				}
			);
		} else {
			dumpResponse(request,response);
		};
	};
}( this.jPw.ebay = this.jPw.ebay || {}));

/*
 * jPw.ebay.listingQuantity 
 * Suitelet Form, GET & POST
 */
(function(ebay) {

	ebay.errResp = function (msg) {
		//response.setContentType('PLAINTEXT', 'err.txt', 'inline');
		//response.write('An Error Occurred' +'\n'+ msg );
		response.setContentType('HTMLDOC', 'err.html', 'inline');
		response.write( '<h1>An Error Occurred</h1><p>'+msg+'</p>' );
	};
	
	var badEbayitemid = function (id) {
		var numId = parseInt(id);
		if ((!numId) || (isNaN(numId))) {
			ebay.errResp('the ebayitemid parameter "'+id+'" is not a valid eBay item ID.');
			return true;
		} else {
			return false;
		};
	};
	
	var qtyNaN = function (qty) {
		var numQty = parseInt(qty);
		if (isNaN(numQty)) {
			ebay.errResp('the qty parameter "'+qty+'" is not valid qty.');
			return true;
		} else {
			return false;
		};
	};
	
	var parmNaN = function (name, val) {
		var numVal = parseFloat(val);
		if ((!numVal) || isNaN(numVal)) {
			ebay.errResp('the '+name+' parameter "'+val+'" is not a number.');
			return true;
		} else {
			return false;
		};
	};
	
	var valAvail = function (qty) {
		return Math.min(Math.max(Math.floor(qty), 0), 10);
	};
	
	ebay.listingQuantity = function(request, response){
		var form;
		if ( request.getMethod() == 'GET' ) {
			var maintParm = jPw.ebay.MaintParm(request);
			
			var partno = request.getParameter('partno');
			var itemid = request.getParameter('itemid');
			var ebayitemid = request.getParameter('ebayitemid');
			var qty = request.getParameter('qty');
			var sold = request.getParameter('sold') || 0;
			var price = request.getParameter('price');
			
			if (badEbayitemid(ebayitemid)) {
				return;
			}
			if (qtyNaN(qty)) {
				return;
			};
			if (qtyNaN(sold)) {
				return;
			};
			var avail = (qty - sold);
			
			if (parmNaN('price', price)) {
				return;
			};
			
			form = nlapiCreateForm('Change eBay Listing Quantity Available');
	        
			maintParm.addHidFlds(form);
			
			form.addField('itemid', 'text', '').setDisplayType('hidden').setDefaultValue(itemid);
			form.addField('partno', 'text', 'Part #', null, 'qty').setLayoutType('normal', 'startcol').setDisplayType('disabled').setDefaultValue(partno);
			form.addField('ebayitemid', 'text', 'eBay Item ID', null, 'qty').setDisplayType('disabled').setDefaultValue(ebayitemid);
			
			form.addField('qty', 'integer', 'Quantity', null, 'qty').setPadding(1).setDisplayType('disabled').setDefaultValue(qty);
			form.addField('sold', 'integer', 'Sold', null, 'qty').setDisplayType('disabled').setDefaultValue(sold);
			form.addField('avail', 'integer', 'Available', null, 'qty').setDefaultValue(avail);
			form.addField('hint', 'text', '', null, 'qty').setDisplayType('inline').setDefaultValue('*Change available to 0 to inactive the listing. (values allowed 0-10)');
			
			form.addField('price', 'currency', 'Price', null, 'qty').setPadding(1).setDefaultValue(price);
			
	        form.addSubmitButton('Update Listing');
	        
	        if (maintParm.hasVals()) {
				var listUrl = nlapiResolveURL('SUITELET', 'customscript_ebay_maint_list','customdeploy_ebay_maint_list', null) + maintParm.parmStr();
				var script = "window.location.replace('"+listUrl+"')";
		        form.addButton('buttoncancel', 'Cancel', script);
	        };
	        
	        response.writePage( form );
		} else if ( request.getMethod() == 'POST' ) {
			
			var maintParm = jPw.ebay.MaintParm(request);
			
			var partno = request.getParameter('partno');
			//var itemid = request.getParameter('itemid');
			var ebayitemid = request.getParameter('ebayitemid');
			var qty = request.getParameter('qty');
			var sold = request.getParameter('sold');
			var avail = request.getParameter('avail');
			var price = request.getParameter('price');

			if ((!partno) || (!ebayitemid)) {
				ebay.errResp('Either partno parameter or ebayitemid parameter are required.');
				return;
			}
			if (badEbayitemid(ebayitemid)) {
				return;
			}
			if (qtyNaN(qty)) {
				return;
			};
			if (qtyNaN(sold)) {
				return;
			};
			if (qtyNaN(avail)) {
				return;
			};

			var avail = valAvail(avail);
			
			if (parmNaN('price', price)) {
				return;
			};
			
			var api = jPw.apiet.makeReviseFixedPriceItemRequest();
			if (ebayitemid) {
				api.setItemID(ebayitemid);
			} else {
				api.setSKU(partno);
			};
			api.setQuantity(avail);
			api.setStartPrice(price);

			var qtyUpdated = function (request, response, obj, respEbayItemId, respSku) {
				var apiGet = jPw.apiet.makeGetItemRequest();
				apiGet.setRequestProp("ItemID", respEbayItemId);
				apiGet.addOutputSelector('Item.ItemID')
					.addOutputSelector("Item.SKU")
					.addOutputSelector("Item.Quantity")
					.addOutputSelector("Item.SellingStatus.QuantitySold")
					.addOutputSelector('Item.ApplicationData')
					.addOutputSelector("Item.ListingDetails.ViewItemURL")
					;

				apiGet.callApiCallback( 
					function(objItmResp){
						var gotEbayItemId = objItmResp.getRespAnyVal('ItemID');
						var gotPartNo = objItmResp.getRespAnyVal('SKU');
						var gotQty = objItmResp.getRespAnyVal('Quantity');
						var gotSold = objItmResp.getRespAnyVal('QuantitySold');
						var gotInternId = objItmResp.getRespAnyVal('ApplicationData');
						var gotEbayUrl = objItmResp.getRespAnyVal('ViewItemURL');
						
						var avail = parseInt(gotQty) - parseInt(gotSold); 
						
						ebay.updateNsItem(gotInternId, gotPartNo, avail);
					}, 
					function(objItmResp){ xmlResp(objItmResp); } 
				);	
			};
			
			// send api request object to response form function 
			ebay.apiRespForm (
				{	request: request, 
					response: response, 
					maintParm: maintParm,
					api: api, 
					title: 'eBay Listing Qty Changed', 
					msgFcn: function(obj){return 'eBay listing available has been changed to '+avail+'.';},  
					notFailFcn: qtyUpdated
				}
			);
			
		} else {
			dumpResponse(request,response);
		};
	};
}( this.jPw.ebay = this.jPw.ebay || {}));

/*
 * jPw.ebay.eBayMaintSettings
 * Suitelet list form of NetSuite items and eBay Listings
 */
(function(ebay) {
	
	ebay.maintLstMap = {
		bestOrEB:	{
			text: 'Either eBay Candidate or eBay Catalog',
			filter: [ ['custitem_ebay_candidate', 'is', 'T'],
			        'or',
			        ['custitem_item_prod_ctlg', 'anyof', jPw.ebay.ctlgId]  ] 
		},
		onlyEB:  	{
			text: 'Only eBay Catalog',
			filter: ['custitem_item_prod_ctlg', 'anyof', jPw.ebay.ctlgId] 
		},
		onlyBest:   {
			text: 'Only eBay Candidate',
			filter: ['custitem_ebay_candidate', 'is', 'T']  
		},
		bestNotEB: 	{
			text: 'eBay Candidates but NOT eBay Catalog',
			filter: [ ['custitem_ebay_candidate', 'is', 'T'],
			        'and',
			        ['not', ['custitem_item_prod_ctlg', 'anyof', jPw.ebay.ctlgId] ] ]  
		},
		eBNotBest:	{
			text: 'eBay Catalog but NOT eBay Candidates',
			filter: [ ['custitem_item_prod_ctlg', 'anyof', jPw.ebay.ctlgId],
			        'and',
			        ['not', ['custitem_ebay_candidate', 'is', 'T'] ] ]		  
		},
		none:		{
			text: 'None',
			filter: [] 
		}
	};
	
	var fltn = function(ob) {
		var toReturn = {};
		
		for (var i in ob) {
			if (!ob.hasOwnProperty(i)) continue;
			
			if ((typeof ob[i]) == 'object') {
				var flatObject = fltn (ob[i]);
				for (var x in flatObject) {
					if (!flatObject.hasOwnProperty(x)) continue;
					
					toReturn[x] = flatObject[x];
				}
			} else {
				toReturn[i] = ob[i];
			}
		}
		return toReturn;
	};
	
	var srlz = function(obj) {
		var str = '';
		var nxtStr = '';
		for (var key in obj) {
			var isObj = (obj[key] instanceof Object);
			if (isObj) {
				nxtStr = srlz(obj[key]);
			} else {
				nxtStr = key + '=' + obj[key];
			};
			if (nxtStr) {
				if (str != '') {
					str += '&';
				};
				str += nxtStr; 
			};
		};
		return str;
	};
	
	ebay.MaintParm = function(request){
		var nsitems = request.getParameter('nsitems');
		var partstr = request.getParameter('partstr');
		var eblstngs = request.getParameter('eblstngs');
		return {
			nsitems: nsitems,
			partstr: partstr,
			eblstngs: eblstngs,
			hasVals: function() {
				return (nsitems);
			},
			parmObj: function() {
				return {
					nsitems: nsitems,
					eblstngs: eblstngs,
					partstr: partstr
				};
			},
			parmStr: function(s) {
				return  (s || '&') + 'nsitems=' + nsitems + '&partstr=' + partstr + '&eblstngs=' + eblstngs;
			},
			addHidFlds: function(form) {
				if (form) {
					form.addField('nsitems', 'text', '').setDisplayType('hidden').setDefaultValue(nsitems);
					form.addField('partstr', 'text', '').setDisplayType('hidden').setDefaultValue(partstr);
					form.addField('eblstngs', 'text', '').setDisplayType('hidden').setDefaultValue(eblstngs);
				};
			}
		};
	};

	ebay.RtnParm = function(request) {
		var rtnParm = {
			//rawRtnUrl: request.getParameter('rtnurl'),
			// get rtnurl() {return escape(rtnParm.rawRtnUrl);},
			// set rtnurl(url) {rtnParm.rawRtnUrl = url;},

			rtnscpt: request.getParameter('rtnscpt'),
			rtndepl: request.getParameter('rtndepl'),
			rtnparm: request.getParameter('rtnparm'),
			rtnto: request.getParameter('rtnto') || 'return',

			hasVals: function() {
				return ((rtnParm.rtnscpt) && (rtnParm.rtndepl));
			},
			parmObj: function() {
				return fltn({
					rtnscpt: rtnParm.rtnscpt,
					rtndepl: rtnParm.rtndepl,
					rtnparm: rtnParm.rtnparm,
					rtnto: rtnParm.rtnto
				});
			},
			parmStr: function(s) {
				return  (s || '&') + srlz(rtnParm.parmObj());
			},
			addHidFlds: function(form) {
				if (form) {
					//form.addField('rtnurl', 'text', '').setDisplayType('hidden').setDefaultValue(rtnParm.rtnurl);
					form.addField('rtnscpt', 'text', '').setDisplayType('hidden').setDefaultValue(rtnParm.rtnscpt);
					form.addField('rtndepl', 'text', '').setDisplayType('hidden').setDefaultValue(rtnParm.rtndepl);
					form.addField('rtnto', 'text', '').setDisplayType('hidden').setDefaultValue(rtnParm.rtnto);
				};
			}
		};

		for (var parm in request.parameters) {
			if (!request.parameters.hasOwnProperty(parm)) continue;
			
			rtnParm[parm] = request.parameters[parm]; 
		};
		
		return rtnParm;
	};
	
	ebay.eBayMaintSettings = function(request, response){
		var form;
		if ( request.getMethod() == 'GET' ) {
			
			var maintParm = ebay.MaintParm(request);

			form = nlapiCreateForm('eBay Maintnenace');

			var groupn = form.addFieldGroup('groupn', 'NetSuite Items');
			var select = form.addField('nsitems', 'select', 'List NetSuite Items:', null, 'groupn').setLayoutType('midrow');

			var codes = Object.keys(jPw.ebay.maintLstMap);
			jPw.each(codes, function() {
				var code = this;
				select.addSelectOption(code, jPw.ebay.maintLstMap[code].text);
			});	
			if (maintParm.nsitems) {
				select.setDefaultValue(maintParm.nsitems);
			};

			var groupp = form.addFieldGroup('groupp', ' ');
			var partStr = form.addField('partstr', 'longtext', 'Part#(s):', null, 'groupp').setLayoutType('midrow').setDisplaySize(100, 2);
			if (maintParm.partstr) {
				partStr.setDefaultValue(maintParm.partstr);
			};
			
			var groupe = form.addFieldGroup('groupe', 'eBay');
			var chx = form.addField('eblstngs', 'checkbox', 'Include eBay Listings', null, 'groupe').setLayoutType('midrow');
			if (maintParm.eblstngs) {
				chx.setDefaultValue(maintParm.eblstngs);
			} else {
				chx.setDefaultValue('T');
			};
			
	        form.addSubmitButton('Generate List');
        
	        response.writePage( form );
		} else if ( request.getMethod() == 'POST' ) {
			var maintParm = ebay.MaintParm(request);
			nlapiSetRedirectURL('SUITELET', 'customscript_ebay_maint_list','customdeploy_ebay_maint_list', null, maintParm.parmObj());
			/*
			form = nlapiCreateForm('eBay Maintneance post');
			form.addField('b', 'text', 'best').setDefaultValue(best);
			form.addField('c', 'text', 'conj').setDefaultValue(conj);
			form.addField('d', 'text', 'ctlg').setDefaultValue(ctlg);
			form.addField('a', 'text', 'listings').setDefaultValue(listings);
			form.addSubmitButton('Ta Da, Listings! ..  no? Ok wait a minute....');
	        response.writePage( form );
	        */
		} else {
			dumpResponse(request,response);
		};
	};
	
	ebay.eBayMaintList = function(request, response){
		 var maintParm = ebay.MaintParm(request);
		
		if (!maintParm.eblstngs) {
			maintParm.eblstngs = 'F';
		};

		var search = jPw.parts.getPartSrchObj( 		// jPw.parts.LeaSrchObj( 
			[ 
			  ['isinactive', 'is', 'F'],
			  'and',
			  ['type', 'is', 'InvtPart'], 
			  //'and', ['custitem_prod_cat', 'is', '9'], 
			  'and', 
			  ['custitem_parent_item', 'is', 'F'],
			  'and',
			  ['name', 'doesnotcontain', 'Master']
			], 
			[new nlobjSearchColumn('name'),
			 new nlobjSearchColumn('custitem_leather_kit_type'),
			 new nlobjSearchColumn('custitem_prod_cat'),
			 new nlobjSearchColumn('custitem_ebay_candidate'),
			 new nlobjSearchColumn('custitem_item_prod_ctlg'),
			 new nlobjSearchColumn('custitem_ebay_listing_id'),
			 new nlobjSearchColumn('custitem_ebay_listing_url')		
			]);

		var listFilt = [];
		var partsArr = null;
		if (maintParm.partstr) {
			partsArr = maintParm.partstr.split(',');
			jPw.each(partsArr, function(idx) {
				part = this.trim();
				if (part) {
					if (idx > 0) {
						listFilt.push('or');
					};
					listFilt.push(['name', 'startswith', part]);
				};
			});
		} else {
			listFilt = jPw.ebay.maintLstMap[maintParm.nsitems].filter;
		};

		var records = [];
		if (listFilt.length > 0) {
			search.addFilt('and');	 
			search.addFilt(listFilt);	 
			records = search.results();
		};

		var listings;
		if (maintParm.eblstngs == 'T') { 
			listings = jPw.ebay.getActiveListingArr(partsArr);
		} else {
			listings = [];
		};

		var map = {};
		jPw.each(records, function() {
			var record = this;
			var nameNoHier = record.nameNoHier();			
			map[nameNoHier] = map[nameNoHier] || {};	// map[record.basePartNo] = map[record.basePartNo] || {};
			map[nameNoHier].record = record;			// map[record.basePartNo].record = record;
		});
		jPw.each(listings, function() {
			var listing = this;
			map[listing.sku] = map[listing.sku] || {};
			map[listing.sku].listing = listing;
		});
		
		var keys = Object.keys(map);
		keys.sort(function(a, b) {
		    return a - b;
		});
		

		var title = 'eBay Maintneance List ('+ keys.length+') ' + jPw.ebay.maintLstMap[maintParm.nsitems].text+',';
		if (maintParm.eblstngs != 'T') {
			title = title + ' No';
		};
		title = title + ' eBay Listings';
		var list = nlapiCreateList(title);
		
		var link = nlapiResolveURL('SUITELET', 'customscript_ebay_maint_cfg', 'customdeploy_ebay_maint_cfg', null);
		link = link + maintParm.parmStr();

		list.addPageLink('crosslink', 'Maintenance Settings', link);

		list.setStyle('grid');
	   	list.addColumn('partno', 'text', 'Part #');
	   	list.addColumn('nsname', 'text', 'NS Name').setURL('item_url', true);
	   	list.addColumn('ebcand', 'text', 'eBay Cand');
	   	list.addColumn('nsctlg', 'text', 'NS Catalog');
	   	list.addColumn('action', 'text', '(+)').setURL('addupd_url', true);
	   	list.addColumn('info', 'text', '(?)').setURL('lstinfo_url', true);
	   	list.addColumn('sku', 'text', 'eBay SKU');
	   	list.addColumn('ebayitemid', 'text', 'eBay ID').setURL('listing_url', true);
	   	list.addColumn('syncerr', 'text', '!');
	   	list.addColumn('price', 'text', 'price').setURL('qty_url', true);
	   	list.addColumn('qty', 'text', 'Qty').setURL('qty_url', true);
	   	list.addColumn('sold', 'text', 'Sold');
	   	list.addColumn('avail', 'text', 'Avail');
	   	list.addColumn('title', 'text', 'Title');
	   	list.addColumn('clear', 'text', '(-)').setURL('clear_url', true);
	   	
	   	//var sysDom = jPw.getSysUrlDomain();
		var nsItemUrl = '/app/common/item/item.nl?itemtype=InvtPart&id=';
		var addUpdUrl = nlapiResolveURL('SUITELET', 'customscript_ebay_listing_addupd','customdeploy_ebay_listing_addupd', null);
		var lstInfoUrl = nlapiResolveURL('SUITELET', 'customscript_ebay_item_listing','customdeploy_ebay_item_listing', null);
		var remvUrl = nlapiResolveURL('SUITELET', 'customscript_ebay_rem_listing','customdeploy_ebay_rem_listing', null);
		var qtyUrl = nlapiResolveURL('SUITELET', 'customscript_ebay_listing_qty','customdeploy_ebay_listing_qty', null);
		var clearItemUrl = nlapiResolveURL('SUITELET', 'customscript_ebay_item_clear','customdeploy_ebay_item_clear', null);

	   	keys.forEach(function(key) {
	   		var row = map[String(key)];
	   		var record = row.record;
	   		var listing = row.listing;
	   		
	   		var eBayItemId = listing ? listing.ebayItemId : null;
	   		var listingUrl = listing ? listing.listingUrl : null;
	   		var nsEbayId = record ? record.getValue('custitem_ebay_listing_id') : null;
	   		var nsEbayUrl = record ? record.getValue('custitem_ebay_listing_url') : null;
	   		var clgVals = record ? record.getValue('custitem_item_prod_ctlg') : '';
	   		var inEbCtlg = (clgVals.indexOf(jPw.ebay.ctlgId) != -1); 
	   		
	   		var syncErr = '';
	   		if (listing && record) {
		   		if (((eBayItemId) || (nsEbayId)) && (eBayItemId != nsEbayId)) {
		   			syncErr = syncErr + 'e';
		   		};
		   		if (((listingUrl) || (nsEbayUrl)) && (listingUrl != nsEbayUrl)) {
		   			syncErr = syncErr + 'u';
		   		};
		   		if ((listing && (!inEbCtlg) && (listing.qty > 0)) || (!listing && inEbCtlg)) {
		   			syncErr = syncErr + 'c';
		   		};
	   		};
	   		
	   		var clearTxt = null;
	   		var clearUrl = null;
	   		if (listing) {
	   			clearTxt = 'remove';
	   			clearUrl = remvUrl + '&partno=' + listing.sku + '&itemid=' + listing.nsItemId + '&ebayitemid=' + eBayItemId + maintParm.parmStr();
	   		} else if (inEbCtlg || (nsEbayId || nsEbayUrl)) {
	   			clearTxt = 'clear';
	   			clearUrl = clearItemUrl + '&partno=' + key + '&internalid=' + record.getId() + maintParm.parmStr();
	   		};
	   		
	   		list.addRow({
				partno: key,
				nsname: record ? record.nameNoHier() : null,
				item_url: record ? nsItemUrl + record.getId() + '&e=T' : null,
				ebcand: record ? record.getValue('custitem_ebay_candidate') : null,
				nsctlg: record ? record.getText('custitem_item_prod_ctlg') : null,
				action: record ? (listing ? 'update' : 'add') : null,
				addupd_url: record ? addUpdUrl + '&partno=' + key + '&internalid=' + record.getId() + maintParm.parmStr() : null,
				info: record ? 'info' : null,
				lstinfo_url: record ? lstInfoUrl + '&itemid=' + record.getId() + maintParm.parmStr() : null,
		    	sku: listing ? listing.sku : null,
		    	price: listing ? listing.price : null,
				qty: listing ? listing.qty : null,
				sold: listing ? listing.sold : null,
				avail: listing ? listing.avail: null,
 			    qty_url: listing ? qtyUrl + '&partno=' + listing.sku + '&ebayitemid=' + eBayItemId 
 			    		+ '&qty=' + listing.qty 
 			    		+ '&sold=' + listing.sold
 			    		+ '&price='	+ listing.price 
 			    		+ maintParm.parmStr(): null,
	   	    	title: listing ? listing.title : null,
		    	ebayitemid: eBayItemId,
		    	listing_url: listingUrl,
		    	syncerr: syncErr,
		    	clear: clearTxt,
		    	clear_url: clearUrl
		    });
	   	});
	   	
	   	response.writePage( list );
	};
	
}( this.jPw.ebay = this.jPw.ebay || {}));

/*
 * jPw.ebay.clearItemOfEbay
 * Suitelet proceudure to add NetSuite Item as an eBay Listing
 */
(function(ebay) {
	ebay.clearItemOfEbay = function(request, response){
		var partno = request.getParameter('partno');
		var internalid = request.getParameter('internalid');
		if ((!partno) && (!internalid)) {
			ebay.errResp('Either partno parameter or internalid parameter are required.');
			return;
		}
		var maintParm = ebay.MaintParm(request);
		
		ebay.clearEbayItem({internalId: internalid, submit: true});

		nlapiSetRedirectURL('SUITELET', 'customscript_ebay_maint_list','customdeploy_ebay_maint_list', null, maintParm.parmObj());
	};
}( this.jPw.ebay = this.jPw.ebay || {}));


/*
 * jPw.ebay.addUpdEbayImage
 */
(function(ebay) {
	ebay.addUpdEbayImage = function(imgId){

		var file = nlapiLoadFile(imgId);
		if (!file) {
			var msg = 'Failed to find image file for id "'+imgId+'".';
			nlapiLogExecution('ERROR', msg);
			throw nlapiCreateError('FILE_ID_MISSING', msg);
			return;
		};
		
		var results = nlapiSearchRecord('customrecord_ebay_image', null, 
				[ new nlobjSearchFilter('custrecord_ebay_img_ns_img_id', null, 'is', imgId)], 
				[ new nlobjSearchColumn('custrecord_ebay_img_fullurl')]);
		
		var imgResult;
		if ((results) && (results.length > 0)) {
			imgResult = results[0];
			return imgResult.getValue('custrecord_ebay_img_fullurl');
		};
		
		var api = jPw.apiet.makeUploadSiteHostedPicturesRequest(); 

		api.setExternalPictureURL('http://roadwire.biz/netsuitefile/' + imgId);
		
		api.setPictureName(file.getName());
		
		var retUrl;
		api.callApiCallback( 
			function(obj){
				var fullUrl = obj.getRespAnyVal('FullURL');
				var pictureName = obj.getRespAnyVal('PictureName');
				var pictureSet = obj.getRespAnyVal('PictureSet');
				var pictureFormat = obj.getRespAnyVal('PictureFormat');
				
				var ebImgRec
				if (imgResult) {
					ebImgRec = nlapiLoadRecord(imgResult.getRecordType(), imgResult.getId());
				} else {
					ebImgRec = nlapiCreateRecord('customrecord_ebay_image');
					ebImgRec.setFieldValue('custrecord_ebay_img_ns_img_id', imgId);		
				};
				
				ebImgRec.setFieldValue('name', pictureName);
				ebImgRec.setFieldValue('custrecord_ebay_img_fullurl', fullUrl);
				ebImgRec.setFieldValue('custrecord_ebay_img_pictfrmt', pictureFormat);
				ebImgRec.setFieldValue('custrecord_ebay_img_pictset', pictureSet);
				
				var id = nlapiSubmitRecord(ebImgRec, true);
				
				retUrl = fullUrl;
			}, 
			function(obj){ 
				var msg = obj.respXmlStr;
				nlapiLogExecution('ERROR', msg);
				throw nlapiCreateError('API_ERROR_RESPONSE', msg);
				return;
			}
		);	
		
		return retUrl;
	};
}( this.jPw.ebay = this.jPw.ebay || {}));

/*
 * jPw.ebay.eBayAddUpdListing
 * Suitelet proceudure to add NetSuite Item as an eBay Listing
 */
(function(ebay) {

	var getNsPart = function(internalid) {
		var results = nlapiSearchRecord('item', null, 
			[new nlobjSearchFilter('isinactive', null, 'is', 'F'),			// this item is active
			new nlobjSearchFilter('type', null, 'is', 'InvtPart'),  		// this is an inventory item
			new nlobjSearchFilter('internalid', null, 'is', internalid)	], 
			[new nlobjSearchColumn('name'),
			new nlobjSearchColumn('custitem_leather_kit_type'),
			new nlobjSearchColumn('custitem_prod_cat')	]);

		if ((results) && (results.length > 0)) {
			var result = results[0];
			
			var baseSearch;
			if (jPw.parts.isLeatherKit(result)) {
				baseSearch = jPw.parts.getLeaKitSearch();
			} else {
				baseSearch = jPw.parts.getPartSrchObj();
			}

			baseSearch.addFilt(new nlobjSearchFilter('internalid', null, 'is', internalid));
			var search = jPw.parts.getEbayPartsSearch(baseSearch);
			var parts = jPw.parts.eBayPartsList(search, true, 1);

			if ((parts) && (parts.length > 0)) {
				var part = parts[0];
				return part;
			};
		};
	};
	
	var updatePartImgs = function (part) {
		part.ebay_img_url = ebay.addUpdEbayImage(part.img_id);
		part.ebay_thumb_url = ebay.addUpdEbayImage(part.thumb_id);
		//JPW check overrides 
        //if (env.leaImg1Id) {
        //	var lea_img1_url = ebay.addUpdEbayImage(env.leaImg1Id);
        //	api.addPictureURL(lea_img1_url);
        	//part.img_id = env.leaImg1Id;
        	//part.thumb_id = env.leaImg1Id;
        //};
	};
	
	var loadDescription = function (part, api, lstngFileId) {
		//var cfg = ebay.getEbayCfg();
		var file = nlapiLoadFile(lstngFileId);
		
		var descr;
		if (file) {
			descr = file.getValue();
		} else {
			descr = '<H1>'+part.descr+'</H1>';
		};
		if (descr) {
			api.setItemPropCdata("Description", descr);
		};
	};
	
	var loadLeaReq = function (part, api) {
		api.setPartNo(part.ns_part);
	    api.setNsItemId(part.item_id);

	    api.setTitle(part.color.slice(4) +' '+ part.descr);
		api.setSubTitle(part.store_descr || part.slctr_descr);
		
		//api.setStartPrice(part.price);
		api.calcLeaStartPrice(part.rows, part.price);

		//api.setItemProp("PrivateNotes", "PrivateNotes");

		//PictureDetails
		if (part.img_id) {
			api.addPictureURL(part.ebay_img_url);
		};
		if (part.thumb_id) {
			api.addPictureURL(part.ebay_thumb_url);
		};
	    
		//ItemSpecifics
		api.addItemSpecific("Leather Color", part.color);
		api.addItemSpecific("Rows", part.rows);
		api.addItemSpecific("Airbags", part.airbags);
		api.addItemSpecific("Surface Finish", part.insert_style);
		
		//if ((part.ns_part) && (part.base_part != part.ns_part)) {api.addItemSpecific("Other Part Number", part.ns_part);};
	
	    //ItemCompatibilityList
		//addItemReq.addCompatMkYrMdTr("Toyota","2013","Camry","Hybrid LE Sedan 4-Door");
	};
	
	var loadHeaterReq = function (part, api) {
		api.setPartNo(part.ns_part);
	    api.setNsItemId(part.item_id);

	    api.setTitle(part.descr);
		api.setSubTitle(part.store_descr || part.slctr_descr);
		
		api.calcHeaterStartPrice(part.price);

		//PictureDetails
		if (part.img_id) {
			api.addPictureURL(part.ebay_img_url);
		};
		if (part.thumb_id) {
			api.addPictureURL(part.ebay_thumb_url);
		};
	};
	
	ebay.addUpdListing = function(partno, internalid) {
		var part =  getNsPart(internalid);
		if (!part) {
			var msg = 'No Item was found for internalid '+internalid+'.';
			throw nlapiCreateError('PARAM_ERROR', msg);
			return;
		};
		
		var listing = null;
		var listings = jPw.ebay.getActiveListingArr([partno]);
		if ((listings) && (listings.length > 0)) {
			listing = listings[0];
		};

		var avail;
		var msgCorrId = '';
		var api;
		if (listing) { // update listing
			msgCorrId = 'Update';
			api = jPw.apiet.makeReviseFixedPriceItemRequest();
			api.setItemID(listing.ebayItemId);
			avail = listing.avail;
		} else { // add new listing
			msgCorrId = 'Add';
			
			if (part.prodCtgry == 9) { 			// leather
				api = jPw.apiet.makeLeatherItemRequest();
			} else if (part.prodCtgry == 6) { 	// heater
				api = jPw.apiet.makeHeaterItemRequest();
			} else {
				api = jPw.apiet.makeAddFixedPriceItemRequest();
			};
			
			avail = 10;
			api.setItemProp('Quantity', avail);
		};

		var env = api.getEnvironment(); 
		
		updatePartImgs(part, env);

		if (part.prodCtgry == 9) { 			// leather
			loadLeaReq(part, api);
		} else if (part.prodCtgry == 6) { 	// heater
			loadHeaterReq(part, api);
		};
		
		loadDescription(part, api, env.lstngFileId);

		msgCorrId = msgCorrId + ' ' + partno; 
        api.setRequestProp("MessageID", 'Add ' + msgCorrId);

		//JPW check overrides 
        if (env.ovrdTitle) {
        	api.setTitle(env.ovrdTitle);	
        };
        if (env.ovrdDescr) {
        	api.setItemProp('Description', env.ovrdDescr);
        };
		
		//JPW
		/*xml = api.getXmlEncode();		
		return xml;*/

		api.callApiCallback( 
			function(obj){
		    	var correlationId = obj.getRespAnyVal('CorrelationID');
		    	var eBayItemId = obj.getRespAnyVal('ItemID');
		    	var eBaySku = obj.getRespAnyVal('SKU');
		    	
				var apiItmReq = jPw.apiet.makeGetItemRequest();
			    var viewItemURL = apiItmReq.retrieveUrlForItemId(eBayItemId);

			    ebay.updEbayItem({internalId: internalid, eBayItemId: eBayItemId, eBayUrl: viewItemURL, avail: avail, submit: true});
			}, 
			function(obj){
				//response.setContentType('XMLDOC');			    response.write( obj.respXmlObj );
				var msg = 'Add/Upd Leather Listing Err: ' + obj.getRespAnyVal('ShortMessage') + ' ' + obj.getRespAnyVal('LongMessage');
				throw nlapiCreateError('API_ERROR_RESPONSE', msg);
				return;
			}
		);		
	};
	
	ebay.eBayAddUpdListing = function(request, response){
		var partno = request.getParameter('partno');
		var internalid = request.getParameter('internalid');
		if ((!partno) || (!internalid)) {
			ebay.errResp('Both partno parameter and internalid parameter are required.');
			return;
		}
	    try {
			var maintParm = ebay.MaintParm(request);
			//JPW
			/*var xmlStr = ebay.addUpdListing(partno, internalid);
			response.setContentType('XMLDOC');
			response.write( xmlStr );
			return;*/
			
			ebay.addUpdListing(partno, internalid);
	    	nlapiSetRedirectURL('SUITELET', 'customscript_ebay_maint_list','customdeploy_ebay_maint_list', null, maintParm.parmObj());		
		} catch (e) {
			if ( e instanceof nlobjError ) {
				nlapiLogExecution( 'ERROR', e.getCode(), e.getDetails() );
				ebay.errResp(e.getCode() +': '+ e.getDetails());
			} else {
				nlapiLogExecution( 'ERROR', 'Unexpected Error', e.toString() )
				ebay.errResp('Unexpected Error' + '\n' + e.toString());
			};
			return;
		};
	};	
	
}( this.jPw.ebay = this.jPw.ebay || {}));

/*
 * jPw.ebay.eBayAddUpdImage
 * Suitelet proceudure to add NetSuite Item as an eBay Listing
 */
(function(ebay) {
	
	ebay.eBayAddUpdImage = function(request, response){
		var imgId = request.getParameter('imgid');
		if (!imgId) {
			ebay.errResp('The imgid parameter is required.');
			return;
		};

		try {
			var rtnParm = ebay.RtnParm(request);
			
			//ebay.addUpdEbayImage(imgId);
			

	        if ((rtnParm) && (rtnParm.hasVals())) {
	        	response.sendRedirect('SUITELET ', rtnParm.rtnscrpt);
	        };
			
		} catch (e) {
			if ( e instanceof nlobjError ) {
				nlapiLogExecution( 'ERROR', e.getCode(), e.getDetails() );
				ebay.errResp(e.getCode() +': '+ e.getDetails());
			} else {
				nlapiLogExecution( 'ERROR', 'Unexpected Error', e.toString() )
				ebay.errResp('Unexpected Error' + '\n' + e.toString());
			};
			return;
		};
		
		
		ebay.errResp('ebay.eBayAddUpdImage not yet implemented');
	};
	
}( this.jPw.ebay = this.jPw.ebay || {}));


(function(ebay) {
	ebay.schedAddEbayCandidates = function(type) {
		//if ( type != 'scheduled' ) return; /* script should only execute during scheduled calls. */

		if (jPw.parmCancelExecute('custscript_ebay_add_cands_resch')) {
			return ;
		};    
		
		var logExecutionMsg = function(e, errorDetailMsg) {
			var msg = new String();
			msg += errorDetailMsg;
			if(e.getCode != null) {
				msg += " "+ e.getDetails();
			} else {
				msg += " "+ e.toString();
			};
			return msg;  
		};

		var addMsg = function(msg, logType) {
			nlapiLogExecution(logType ||'DEBUG', msg);
		};
			
		var reSched = function(cntx) {
			var context = cntx ||nlapiGetContext();

			var status = nlapiScheduleScript(context.getScriptId(), context.getDeploymentId());
			 
			if( status == 'QUEUED' ) { 
				addMsg('Programatically Scheduled Script:'+context.getScriptId()+' Delpoyment:'+context.getDeploymentId(), 'AUDIT');
				return true;
			} else {
				addMsg('Failed to Programatically Scheduled Script:'+context.getScriptId()+' Delpoyment:'+context.getDeploymentId(), 'ERROR');
				return true;
			};
		};
		
		var checkReSched = function(idx, cntx) {
			if (idx % 10 == 0) {
				var context = cntx ||nlapiGetContext();
				if ( context.getRemainingUsage() < 100) {
					return reSched(cntx); 
				} else {
					return false;
				};
				
			} else {
				return false;
			};
		};
		
		var search = jPw.parts.getPartSrchObj(         // jPw.parts.LeaSrchObj( 
				[ 
				  ['isinactive', 'is', 'F'],
				  'and',
				  ['type', 'is', 'InvtPart'], 
				  //'and', ['custitem_prod_cat', 'is', '9'],
				  'and', 
				  ['custitem_parent_item', 'is', 'F'],
				  'and', 
				  ['custitem_ebay_candidate', 'is', 'T'],
				  'and', 
				  [
				   ['custitem_ebay_listing_id', 'is', '@NONE@'],
				   'or',
				   ['custitem_ebay_listing_url', 'is', '@NONE@'],
				   'or',
				   ['not', ['custitem_item_prod_ctlg', 'anyof', jPw.ebay.ctlgId] ],
				  ]
				], 
				[new nlobjSearchColumn('name'),
				 new nlobjSearchColumn('custitem_leather_kit_type'),
				 new nlobjSearchColumn('custitem_prod_cat'),
				 new nlobjSearchColumn('custitem_ebay_candidate'),
				 new nlobjSearchColumn('custitem_item_prod_ctlg'),
				 new nlobjSearchColumn('custitem_ebay_listing_id'),
				 new nlobjSearchColumn('custitem_ebay_listing_url')		
				]);
		
		var resultSet = search.runSearch();
		var max = 30;
		var loopAdds = function (cntx) {
			var results = resultSet.getResults(0, max+1);
			if ((results) && (results.length > 0)) {
				var count = Math.min(results.length, (max+1));
				
				nlapiLogExecution('AUDIT', 'BEGIN Processing '+count+' import records. Remaining Usage: ' + ctx.getRemainingUsage());
				var resCount = 0;

				var percent;
				context.setPercentComplete(0.00);   
				context.getPercentComplete();  // displays percentage complete
				
				for (var i = 0; i < count; i++) {
					if (checkReSched(i, cntx)) {
						return false;
					};
					
					var record = jPw.parts.makeLeaPartObj( results[i] );
					resCount ++;
					
					var partno = record.nameNoHier();	// basePartNo;
					var internalid = record.getId(); 
					
					jPw.ebay.addUpdListing(partno, internalid);
					
					percent = Math.round( (100*(i+1)) / count );
					context.setPercentComplete( percent );     // calculate the results
					context.getPercentComplete();  // displays percentage complete  
					addMsg('Percent: '+percent, 'DEBUG');
				};
				
				nlapiLogExecution('AUDIT', 'END Processed '+resCount+' import records. Remaining Usage: ' + ctx.getRemainingUsage());
				
				return (results.length > max);
			} else {
				return false;
			};
			
		};
		
		try{
			//addMsg('Ended scheduled script with update to script file', 'ERROR'); // the only way to stop 
			//return;
			var context = nlapiGetContext();
			if (loopAdds(context)) {
				reSched (context);
			};
		} catch (e) {
			if ( e instanceof nlobjError ) {
				nlapiLogExecution( 'ERROR', e.getCode(), e.getDetails() );
				ebay.errResp(e.getCode() +': '+ e.getDetails());
			} else {
				nlapiLogExecution( 'ERROR', 'Unexpected Error', e.toString() );
				ebay.errResp('Unexpected Error' + '\n' + e.toString());
			};
			return;
		};
	};
}( this.jPw.ebay = this.jPw.ebay || {}));

(function(ebay) {
	ebay.schedRemoveAllListings = function(type) {
		
		if (jPw.parmCancelExecute('custscript_ebay_clr_lst_resch')) {
			return ;
		};    
		
		var listings = jPw.ebay.getActiveListingArr();
		
		if ((!listings) && (listings.length == 1)) {
			return;
		};
		
		/*var idx = -1;
		var getNextListing = function() {
			idx = idx + 1;
			if (idx < listings.length) {
				return listings[idx];
			};
		};*/
		
		var clearListing = function(listing, i, listings) {
			var api = jPw.apiet.makeEndFixedPriceItemRequest();
			api.setItemID(listing.ebayItemId);
			
			var result = false;
			api.callApiCallback( 
				function(obj){
					result = ebay.clearEbayItem( {internalId: listing.nsItemId, submit: true} );
				}, 
				function(obj){ 
					xmlResp(obj); 
				}
			);		
			return result;
		};
		
		jPw.ProcessAllReSched(listings, clearListing, 100);
		
	};
}( this.jPw.ebay = this.jPw.ebay || {}));

/*
 * jPw.ebay.apiRespForm
 * Suitelet Form, base repsonse form
 */
(function(ebay) {

	ebay.getOrdsPdNoShip = function() {
		var orders = [];

		var api = jPw.apiet.makeGetSellingManagerSoldListingsRequest();
		api.setRequestProp('Filter', 'PaidNotShipped');

		api.callApiCallback( 
			function(obj){
				//response.setContentType('XMLDOC');
			    //response.write( obj.respXmlStr );
			    //return;
				var orderNodes = obj.getRespAnyNodes('SaleRecord');// nlapiSelectNodes(xmlObj, '//nlapi:Item');
				
				jPw.each(orderNodes, function() {
					var orderNode = this;
					
					var orderId = obj.getSubVal(orderNode, 'SaleRecordID');
					var buyer = obj.getSubVal(orderNode, 'BuyerEmail');
					
					var isoDt = obj.getSubVal(orderNode, 'CreationTime');
					var d = new Date( Date.parse(isoDt) );
					var creationTime = nlapiDateToString(d, 'datetime'); 
						
					var orderUrl = nlapiResolveURL('SUITELET', 'customscript_ebay_get_order','customdeploy_ebay_get_order', null);
					var completeUrl = nlapiResolveURL('SUITELET', 'customscript_ebay_completesale','customdeploy_ebay_completesale', null);

					var total = obj.getSubVal(orderNode, 'TotalAmount');
					var line = 0;
					
					var transNodes = obj.getSubNodes(orderNode, 'SellingManagerSoldTransaction');
					jPw.each(transNodes, function() {
						line ++ ;
						transNode = this;
						
						var orderLineItemID = obj.getSubVal(transNode, 'OrderLineItemID');
						var itemId = obj.getSubVal(transNode, 'ItemID');
						var transId = obj.getSubVal(transNode, 'TransactionID');
						var carrier = '';
						var qty = obj.getSubVal(transNode, 'QuantitySold');
						orders.push({
							orderid: orderId,
							buyer: buyer,
							creationtime: creationTime,
							line: line,
							ebayitemId: itemId,
							transactionid: transId,
							partno: obj.getSubVal(transNode, 'CustomLabel'),
							descr: obj.getSubVal(transNode, 'ItemTitle'),
							qty: qty,
							orderlineid: orderLineItemID,
							orderlineidus: orderLineItemID.replace(/-/g, '_'),
							total: total,
							order_url: orderUrl + '&orderid=' + orderLineItemID,
							complete: 'Complete',
							complete_url: completeUrl + '&ebayitemid=' + itemId + '&transactionid=' + transId + '&carrier=' + carrier,							
						});
					});
					
				});
			}, 
			function(obj){ 
				var msg = obj.respXmlStr;
				nlapiLogExecution('ERROR', msg);
				throw nlapiCreateError('API_ERROR_RESPONSE', msg);
			}
		);	
		return orders;
	};

	ebay.ordersPaidNotShip = function(request, response){
		var orders = ebay.getOrdsPdNoShip();
		
		var list = nlapiCreateList('Roadwire eBay Orders (Paid Not Shipped)');
	    list.setStyle('grid');
	   	
		list.addColumn('orderid', 'text', 'Order#');
		list.addColumn('buyer', 'text', 'Buyer');
	    list.addColumn('creationtime', 'text', 'Created');
		list.addColumn('line', 'text', 'Line#');
	    list.addColumn('partno', 'text', 'Part No');
	    list.addColumn('descr', 'text', 'Title').setURL('order_url', true);
	    list.addColumn('complete', 'text', 'Respond').setURL('complete_url', true);
	    list.addColumn('qty', 'text', 'Qty');
	    list.addColumn('orderlineid', 'text', 'ID');
	    list.addColumn('total', 'text', 'Total');
		
		jPw.each(orders, function() {
	   		var order = this;
			list.addRow(order);
		});

		response.writePage( list );
	};
	
	ebay.portOrdsPaidNoShip = function(portlet, column){
		var orders = ebay.getOrdsPdNoShip();
		portlet.setTitle('Roadwire eBay Orders (Paid Not Shipped)');

		portlet.addColumn('orderid', 'text', 'Order#').setURL('order_url', true);
		//portlet.addColumn('buyer', 'text', 'Buyer');
		portlet.addColumn('creationtime', 'text', 'Created').setURL('order_url', true);
		portlet.addColumn('line', 'text', 'Line#').setURL('order_url', true);
		portlet.addColumn('partno', 'text', 'Part No');
		//portlet.addColumn('descr', 'text', 'Title').setURL('order_url', true);
		portlet.addColumn('complete', 'text', 'Respond').setURL('complete_url', true);
		portlet.addColumn('qty', 'text', 'Qty');
		//portlet.addColumn('orderlineid', 'text', 'ID');
		portlet.addColumn('total', 'text', 'Total');
		
		jPw.each(orders, function() {
	   		var order = this;
	   		portlet.addRow(order);
		});
	};
	
	ebay.getOrder = function(request, response){
		var orderid = request.getParameter('orderid');
		var ebayitemid = request.getParameter('ebayitemid');
		var transactionid = request.getParameter('transactionid');
		
		if (!((orderid) || ((ebayitemid) && (transactionid)))) {
			ebay.errResp('Either orderid parameter or both ebayitemid parameter and transactionid parameter are required.');
			return;
		};
		if (!orderid) {
			orderid = ebayitemid.trim() +'-'+ transactionid.trim()
		};		
		
		var api = jPw.apiet.makeGetOrdersRequest();
		api.setRequestProp('DetailLevel', 'ReturnAll');
		api.addOrderId(orderid);

		api.callApiCallback( 
			function(obj){
				//<OrderArray><Order><OrderID>191041632512-934618335009				
				//http://k2b-bulk.ebay.com/ws/eBayISAPI.dll?EditSalesRecord&itemid=191041632512&transid=934618335009
				//<OrderArray><Order><OrderID>155994877016
				//http://k2b-bulk.ebay.com/ws/eBayISAPI.dll?EditSalesRecord&orderid=155994877016	
				response.setContentType('XMLDOC');
			    response.write( obj.respXmlStr );
			}, 
			function(obj){ 
				response.setContentType('XMLDOC');
			    response.write( obj.respXmlStr );
			}
		);	
		
	};
	
	ebay.completeSale = function(request, response){
		if ( request.getMethod() == 'GET' ) {

			var ebayitemid = request.getParameter('ebayitemid');
			var transactionid = request.getParameter('transactionid');
			var carrier = request.getParameter('carrier');
			if ((!ebayitemid) || (!transactionid)) {
				ebay.errResp('Both ebayitemid parameter and transactionid parameter are required.');
				return;
			};
			
			form = nlapiCreateForm('Complete eBay Sale');
	        
			form.addField('carrier', 'text', 'Carrier').setDefaultValue(carrier);
			form.addField('trackingno', 'text', 'Tracking No');			
					
			form.addField('ebayitemid', 'text', 'ebay Item ID').setDisplayType('disabled').setDefaultValue(ebayitemid);
			form.addField('transactionid', 'text', 'Transaction ID').setDisplayType('disabled').setDefaultValue(transactionid);
			
	        form.addSubmitButton('Complete Sale');

			var listUrl = nlapiResolveURL('SUITELET', 'customscript_ebay_orders_list','customdeploy_ebay_orders_list', null);
			var script = "window.location.replace('"+listUrl+"')";
	        form.addButton('buttoncancel', 'Cancel', script);
	        
	        response.writePage( form );
			
		} else if ( request.getMethod() == 'POST' ) {
		    try {
				var ebayitemid = request.getParameter('ebayitemid');
				var transactionid = request.getParameter('transactionid');
				var carrier = request.getParameter('carrier');
				var trackingno = request.getParameter('trackingno');
				
				if ((!ebayitemid) || (!transactionid) || (!trackingno)) {
					ebay.errResp('ebayitemid and transactionid and trackingno parameters are all required.');
					return;
				};
				
				var api = jPw.apiet.makeCompleteSaleRequest();
				
		    	api.setItemID(ebayitemid);
		    	api.setTransactionID(transactionid);
		    	api.setShipmentTrackingNumber(trackingno);
		    	api.setShippingCarrierUsed(carrier);
		    	api.setShippedTime(new Date());

		    	api.callApiCallback( 
		    		function(obj){
		    			response.setContentType('XMLDOC');
		    		    response.write( obj.respXmlStr );
		    		}, 
		    		function(obj){ 
						var msg = obj.respXmlStr;
						nlapiLogExecution('ERROR', msg);
						throw nlapiCreateError('API_ERROR_RESPONSE', msg);
		    		}
		    	);	
			} catch (e) {
				if ( e instanceof nlobjError ) {
					nlapiLogExecution( 'ERROR', e.getCode(), e.getDetails() );
					ebay.errResp(e.getCode() +': '+ e.getDetails());
				} else {
					nlapiLogExecution( 'ERROR', 'Unexpected Error', e.toString() )
					ebay.errResp('Unexpected Error' + '\n' + e.toString());
				};
				return;
			};
			
		};
		
	};	
	
}( this.jPw.ebay = this.jPw.ebay || {}));

/*
 * jPw.ebay.ordersLookup
 * eBay API call to lookup eBay order via GetSellingManagerSoldListings api  
 */
(function(ebay) {
	ebay.ordersLookup = function(request, response){
		if ( request.getMethod() == 'GET' )  {
		    var form = nlapiCreateForm('eBay Order Lookup');
		    
		    // add fields to the form
		    var field = form.addField('textfield','text', 'Text');
		    field.setLayoutType('normal','startcol');
		    form.addField('datefield','date', 'Date');
		    form.addField('currencyfield','currency', 'Currency');
		    form.addField('textareafield','textarea', 'Textarea');
		
		    form.addSubmitButton('Submit');
			
		    response.writePage( form );
/*		    // add a select field and then add the select options that will appear in the dropdown
		    var select = form.addField('selectfield','select','Custom');
		    select.addSelectOption('','');
		    select.addSelectOption('a','Albert');
		    select.addSelectOption('b','Baron');
		    select.addSelectOption('c','Chris');
		    select.addSelectOption('d','Drake');
		    select.addSelectOption('e','Edgar');
		
		    
		    //var sublist = form.addSubList('abcds', 'staticlist', 'label',  'tab1');
		    
		    // add a sublist to the form
		    var sublist = form.addSubList('sublist','inlineeditor','Inline Editor Sublist', 'tab1');
		    
		    // add fields to the sublist
		    sublist.addField('sublist1','select', 'Item', 'item');
		    sublist.addField('sublist2','text', 'Name');
		    sublist.addField('sublist3','currency', 'Currency');
		    sublist.addField('sublist4','textarea', 'Large Text');
		    sublist.addField('sublist5','float', 'Float');
		
		    // make the Name field unique. Users cannot provide the same value for the Name field.
		    sublist.setUniqueField('sublist2');
		    
		    var objs = [{sublist2:'bada'}, {sublist2:'bing'}];
		    sublist.setLineItemValues(objs);
*/
		    
		} else if ( request.getMethod() == 'POST' ) {
			ebay.errResp('Not yet implemented...');
		};
	};
	
}( this.jPw.ebay = this.jPw.ebay || {}));

(function(ebay) {

	/*
	 * jPw.ebay.getFormPickNsItem
	 * eBay API call to invoke NetSuite form to allow user to enter Item then submit   
	 */
	ebay.getFormPickNsItem = function(title, itmCaption, itemFldName) {
		var ItemFld = itemFldName || 'itemid';
	      // create the form
	    var form = nlapiCreateForm(title);
	    
	    // add fields to the form
	    var itmFld = form.addField(ItemFld, 'select', itmCaption, 'item');
	    itmFld.setMandatory(true);
	    itmFld.setLayoutType('normal','startcol');
	    
	    form.addSubmitButton('Submit');
	    
	    return form;
	};
	
	/*
	 * jPw.ebay.getFormItemListingInfo
	 * eBay API call to invoke form to display NetSuite Item and associated eBay Listing information
	 */
	ebay.getFormItemListingInfo = function(itemid) {
		if (!itemid) {
			throw nlapiCreateError('EBAY_PARAM_MISSING', 'parameter itemid is required.');
		};
		
		var results = null;
		if (itemid) {
			results = nlapiSearchRecord('item',  null, 
				[new nlobjSearchFilter('internalid', null, 'is', itemid)],
				[new nlobjSearchColumn('itemid'),
				 new nlobjSearchColumn('salesdescription'),
				 new nlobjSearchColumn('custitem_prod_cat'),
				 new nlobjSearchColumn('custitem_leather_kit_type'),
				 new nlobjSearchColumn('custitem_prod_cat'),
				 new nlobjSearchColumn('custitem_ebay_candidate'),
				 new nlobjSearchColumn('custitem_item_prod_ctlg'),
				 new nlobjSearchColumn('custitem_ebay_listing_id'),
				 new nlobjSearchColumn('custitem_ebay_listing_url'),
				 new nlobjSearchColumn('storedisplayimage'),
				 new nlobjSearchColumn('storedisplaythumbnail')]);
		};
		
		if ((!results) || (results.length < 1)) {
			ebay.errResp('No NetSuite items were found for itemfield = "' + itemid +'".');
			return;
		};
		
		var result = results[0];
		var nameHier = result.getValue('itemid');
		var nameNoHier = jPw.nameNoHier(nameHier);
		var nsItemId = result.getId();

		var arry = jPw.ebay.getActiveListingArr([nameNoHier],
			function(api) {
				api.addOutputSelector('ItemArray.Item.PictureDetails.PictureURL')
			},
			function(listing, itemNode, obj) {
				listing.pictureUrls = [];
				
				var pictUrls = obj.getSubVals(itemNode, 'PictureURL');
				
				jPw.each(pictUrls, function() {
					var pictUrl = this;
					listing.pictureUrls.push(pictUrl);
				});
			}
		);

		var listing = null;
		if ((arry) && (arry.length > 0)) {
			listing = arry[0];
		};			
		
		var title = 'Item eBay Listing - ' + nameNoHier;
		var form = nlapiCreateForm(title);
		var field;

		form.addFieldGroup('groupns', 'NetSuite Item').setCollapsible(true, false);
		
		field = form.addField('fieldname', 'text', 'Item Name', null, 'groupns');
		field.setLayoutType('normal','startcol')
			.setDisplayType('inline')
			.setDefaultValue(nameNoHier);
		
	   	var sysDom = jPw.getSysUrlDomain();
		var nsItemUrl = sysDom + '/app/common/item/item.nl?itemtype=InvtPart&id=' + nsItemId + '&e=T';
	    form.addField('fielditem', 'url', 'NS Item', null, 'groupns').setDisplayType( 'inline' ).setLinkText(nameHier).setDefaultValue(nsItemUrl);
	    
		form.addField('fieldescr', 'text', 'Description', null, 'groupns').setDisplayType('inline').setDefaultValue(result.getValue('salesdescription'));
		form.addField('fielditmtype', 'text', 'Item Type', null, 'groupns').setDisplayType('inline').setDefaultValue(result.getText('custitem_prod_cat'));
		form.addField('fieldkittype', 'text', 'Kit Type', null, 'groupns').setDisplayType('inline').setDefaultValue(result.getText('custitem_leather_kit_type'));
	    form.addField('fieldebaycand', 'checkbox', 'eBay Candidate', null, 'groupns').setDisplayType('disabled').setDefaultValue(result.getValue('custitem_ebay_candidate'));
	    form.addField('fieldebayctlg', 'text', 'Catalog(s)', null, 'groupns').setDisplayType('inline').setDefaultValue(result.getText('custitem_item_prod_ctlg'));
	    //form.addField('fieldurl', 'url', 'eBay Listing', null, 'groupns').setDisplayType( 'inline' ).setLinkText(result.getValue('custitem_ebay_listing_id')).setDefaultValue(result.getValue('custitem_ebay_listing_url'));

	    //var context = nlapiGetContext();
	    //form.addField('fieldtest', 'text', 'Test', null, 'groupns').setDisplayType('inline').setDefaultValue(
	    		//window.location.href
	    		//'Programatically Scheduled Script:'+context.getScriptId()+' Delpoyment:'+context.getDeploymentId()
	    //);
	    
		form.addFieldGroup('groupcomp', 'Comparison').setCollapsible(true, false);
		
		var errNsItemId, nsNsItemId, ebNsItemId,  
			errSku, nsSku, ebSku, 
			errEbayItemId, nsEbayItemId, ebEbayItemId,
			errEbayUrl, nsEbayUrl, ebEbayUrl,
			nsTitle, ebTitle;
		
		nsNsItemId = nsItemId;
		nsSku = nameNoHier;
		nsEbayItemId = result.getValue('custitem_ebay_listing_id');
		nsEbayUrl = result.getValue('custitem_ebay_listing_url');
		nsTitle = result.getValue('salesdescription')
					
		ebNsItemId = listing ? listing.nsItemId : '';
		ebSku = listing ? listing.sku : '';
		ebEbayItemId = listing ? listing.ebayItemId : '';
		ebEbayUrl = listing ? listing.listingUrl : '';
		ebTitle = listing ? listing.title : '';
		
		errNsItemId = (nsNsItemId == ebNsItemId) ? '' : '!';  
		errSku = (nsSku == ebSku) ? '' : '!';
		errEbayItemId = (nsEbayItemId == ebEbayItemId) ? '' : '!';
		errEbayUrl = (nsEbayUrl == ebEbayUrl) ? '' : '!';
		
		var tbl = 
		    '<table width="100%" border="0" cellspacing="0" cellpadding="0" class="listtable listborder">'+
		    	'<tbody>'+
		    		'<tr>'+
		    			'<td class="listheadertd listheadertextb" width="100"><div class="listheader">Type</div></td>'+
		    			'<td class="listheadertd listheadertextb"><div class="listheader">!</div></td>'+
		    			'<td class="listheadertd listheadertextb"><div class="listheader">NetSuite</div></td>'+
		    			'<td class="listheadertd listheadertextb"><div class="listheader">eBay</div></td>'+
		    		'</tr>'+
		    		'<tr><td class="listtext"> NS Item ID </td>'+
		    			'<td class="listtext">'+errNsItemId+'</td><td class="listtext">'+nsNsItemId+'</td><td class="listtext">'+ebNsItemId+'</td></tr>'+
		    		'<tr><td class="listtexthl"> SKU </td>'+
		    			'<td class="listtexthl">'+errSku+'</td><td class="listtexthl">'+nsSku+'</td><td class="listtexthl">'+ebSku+'</td></tr>'+
		    		'<tr><td class="listtext"> eBay Item ID </td>'+
		    			'<td class="listtext">'+errEbayItemId+'</td><td class="listtext">'+nsEbayItemId+'</td><td class="listtext">'+ebEbayItemId+'</td></tr>'+
		    		
		    		'<tr><td class="listtexthl"> eBay URL </td>'+
		    			'<td class="listtexthl">'+errEbayUrl+'</td>'+
		    			'<td class="listtexthl"><a class="dottedlink" href="'+nsEbayUrl+'" target="fldUrlWindow">'+nsEbayUrl+'</a></td>'+
		    			'<td class="listtexthl"><a class="dottedlink" href="'+ebEbayUrl+'" target="fldUrlWindow">'+ebEbayUrl+'</a></td>'+
		    		'</tr>'+
		    			
		    		'<tr><td class="listtext"> Title </td>'+
		    			'<td class="listtext"></td><td class="listtext">'+nsTitle+'</td><td class="listtext">'+ebTitle+'</td></tr>'+
		    	'</tbody>'+
		    '</table>';    

	    form.addField('fieldcomptbl', 'inlinehtml', '', null, 'groupcomp').setDefaultValue(tbl);

	    var nsCols = [
	        {	title: 'Store Display',
	        	id: result.getValue('storedisplayimage'),
	        	url: result.getText('storedisplayimage')
	        },
	        {	title: 'Store Thumbnail', 
	        	id: result.getValue('storedisplaythumbnail'),
	        	url: result.getText('storedisplaythumbnail')
	        }
	    ];
	    
		if ((nsCols) && (nsCols.length > 0)) {
			form.addFieldGroup('groupnsimgs', ' ').setCollapsible(true, false);

			
	   		var nsEbImgUrllBase = nlapiResolveURL('SUITELET', 'customscript_ebay_pictures','customdeploy_ebay_pictures', null);

			var context = nlapiGetContext();
			var thisUrlBase = nlapiResolveURL('SUITELET', context.getScriptId(), context.getDeploymentId(), null);
	   		var thisUrl = thisUrlBase+'&itemid='+itemid;
	   		var rtnParm = ebay.RtnParm(request);
	   		rtnParm.rtnurl = thisUrl;
	   		rtnParm.rtnto = title; 
	   		
			var nsMediUrl = '/app/common/media/mediaitem.nl?id=';
			
			var hdrHtml = '';
		    var rowLinkHtml = '';
		    var rowImgHtml = '';
		    jPw.each(nsCols, function() {
		    	var col = this;
		    	nsEbImgUrl = nsEbImgUrllBase + '&imgid='+ col.id + rtnParm.parmStr();
			    hdrHtml = hdrHtml + '<td class="listheadertd listheadertextb"><div class="listheader">'+col.title+'</div></td>';
			    rowLinkHtml = rowLinkHtml + '<td valign="top"> <a class="dottedlink" href="' + nsEbImgUrl + '">NetSuite eBay Picture</a> </td>';
			    rowImgHtml = rowImgHtml + '<td valign="top"><a href="' + nsMediUrl + col.id + '"><img src="'+ col.url +'"></a></td>';
		    });
			
		    var nsImgsHtml = '<h1>NetSuite Images</h1>'+ 
			    '<table width="100%" border="1" cellspacing="0" cellpadding="3" class="listtable listborder">'+
			    	'<tbody>'+
			    		'<tr>' + hdrHtml + '</tr>'+
		    			'<tr>' + rowLinkHtml + '</tr>'+
		    			'<tr>' + rowImgHtml + '</tr>'+
			    	'</tbody>'+
			    '</table>';    
		    
		    form.addField('fldnsimages', 'inlinehtml', ' ', null, 'groupnsimgs').setDefaultValue(nsImgsHtml);
		};
	    
	    if (listing) {
		    form.addFieldGroup('groupebayimgs', ' ');

		    var addUpdUrl = nlapiResolveURL('SUITELET', 'customscript_ebay_listing_addupd','customdeploy_ebay_listing_addupd', null);
			var script = "window.location.replace('"+addUpdUrl+"')";
		    //var script = "alert('Uno'); alert('Dos');"; //"nlShowMessage('d', 'f', 'b', 'e')";//"jPw.ebay.testy()"; //"window.location.reload()"; //"alert('Buttoni')";
	        form.addButton('buttonupdimages', 'Update eBay Images', script);
		    
			var hdrHtml = '';
		    var colHtml = '';
		    jPw.each(listing.pictureUrls, function(idx, pictUrl) {
			    hdrHtml = hdrHtml + '<td class="listheadertd listheadertextb"><div class="listheader">eBay Picture '+idx+'</div></td>';
			    colHtml = colHtml + '<td valign="top">'+
			    	'<a href="'+pictUrl.trim()+'" target="fldUrlWindow">'+
			    	'<img src="'+ pictUrl.trim() +'">'+
			    	'</a>'+
			    '</td>';
		    });
		    
		    var eBayImgsHtml = '<h1>eBay Pictures</h1>'+ 
			    '<table width="100%" border="1" cellspacing="0" cellpadding="3" class="listtable listborder">'+
			    	'<tbody>'+
			    		'<tr>' + hdrHtml + '</tr>'+
			    		'<tr>' + colHtml + '</tr>'+
			    	'</tbody>'+
			    '</table>';    
	    
		    form.addField('fldebayimages', 'inlinehtml', ' ', null, 'groupebayimgs').setDefaultValue(eBayImgsHtml);
	    };
	    
	    //form.setScript('customscript_ebay_item_listing');
		return form;
	};
	 
	ebay.testy = function() {
		alert('Testy!!!');
		window.location.reload();
	};
		
	/*
	 * jPw.ebay.itemListingInfoLkp
	 * eBay API call to lookup item then display NetSuite Item and associated eBay Listing information   
	 */
	ebay.itemListingInfoLkp = function(request, response){
		var itemFldName = 'itemid';
		if ( request.getMethod() == 'GET' )  {
		      // create the form
		    response.writePage( ebay.getFormPickNsItem('Item eBay Listing - Lookup', 'NetSuite Item', itemFldName) );
		} else if ( request.getMethod() == 'POST' ) {
			var itemid = request.getParameter(itemFldName);
			
			var form = ebay.getFormItemListingInfo(itemid);
			
			form.addPageLink('breadcrumb', 'Item Lookup', 
					nlapiResolveURL('SUITELET', 'customscript_ebay_item_listing', 'customdeploy_ebay_item_listing', null));
			
			response.writePage( form );
		};
	};

	/*
	 * jPw.ebay.itemListingInfo
	 * eBay API call to lookup item then display NetSuite Item and associated eBay Listing information   
	 */
	ebay.itemListingInfo = function(request, response){
		var itemid = request.getParameter('itemid');
		
		var maintParm = ebay.MaintParm(request);
			
		var form = ebay.getFormItemListingInfo(itemid);
		
        if (maintParm.hasVals()) {
			var listUrl = nlapiResolveURL('SUITELET', 'customscript_ebay_maint_list','customdeploy_ebay_maint_list', null) + maintParm.parmStr();
			form.addPageLink('breadcrumb', 'eBay Maintenance List', listUrl);
        };
			
		response.writePage( form );
	};
	
}( this.jPw.ebay = this.jPw.ebay || {}));

(function(ebay) {
	/*
	 * jPw.ebay.nsImgEbayPicture
	 * eBay API call to invoke NetSuite form to allow user to enter Item then submit   
	 */
	ebay.nsImgEbayPicture = function(request, response) {
		
		var getImgPictRows = function(imgId, title) {
			var filters = [];
			if (imgId) {
				filters.push(new nlobjSearchFilter('custrecord_ebay_img_ns_img_id', null, 'is', imgId ));
			};
			var imgCache = jPw.MakeSrchCache('customrecord_ebay_image', filters, 
					[new nlobjSearchColumn('custrecord_ebay_img_ns_img_id'),
					 new nlobjSearchColumn('custrecord_ebay_img_fullurl'),
					 new nlobjSearchColumn('custrecord_ebay_img_pictfrmt'),
					 new nlobjSearchColumn('custrecord_ebay_img_pictset')]);
			
			var imgIds = jPw.map(imgCache.results, function() {
		   		var imgRes = this;
		   		return imgRes.getValue('custrecord_ebay_img_ns_img_id');
			});

			var fileCache = jPw.MakeSrchCache('file', 
					[new nlobjSearchFilter('internalid', null, 'anyof', imgIds )], 
					[new nlobjSearchColumn('name'), new nlobjSearchColumn('folder')]);
			
			var nsMediUrl = '/app/common/media/mediaitem.nl?id=';

			var context = nlapiGetContext();
			var thisUrlBase = nlapiResolveURL('SUITELET', context.getScriptId(), context.getDeploymentId(), null);
	   		var thisUrl = thisUrlBase + '&imgid=' + imgId;
	   		var rtnParm = ebay.RtnParm(request);
	   		rtnParm.rtnurl = thisUrl;
	   		rtnParm.rtnto = title; 
	   		
	   		var updEbImgBase = nlapiResolveURL('SUITELET', 'customscript_ebay_image_addupd', 'customdeploy_ebay_image_addupd', null);
	   		var getUpdEbImgUrl = function(curImgId) {
		   		return updEbImgBase + '&imgid=' + curImgId + rtnParm.parmStr();
	   		};
	   		
			var rows = [];
			jPw.each(imgCache.results, function() {
		   		var imgRes = this;
		   		var nsImgId = imgRes.getValue('custrecord_ebay_img_ns_img_id');
		   		var ebImgRecUrl = nlapiResolveURL('RECORD', 'customrecord_ebay_image', imgRes.getId(), 'EDIT');

		   		var nsImgUrl = imgRes.getText('custrecord_ebay_img_ns_img_id');
		   		var ebImgUrl = imgRes.getValue('custrecord_ebay_img_fullurl');
		   		
		   		var row = {
		   				action: 		   					
		   				'<ul>'+
		   				  '<li><a class="dottedlink" href="'+ebImgRecUrl+'" target="blank">Edit</a></li>'+
		   				  '<li><hr></li>'+
		   				  '<li><a class="dottedlink" href="'+getUpdEbImgUrl(nsImgId)+'">Update eBay</a></li>'+
		   				'</ul>',
		   				nsimgid: nsImgId,
		   				nsimgsrc: '<a href="' + nsMediUrl + nsImgId + '" target="blank"><img src="'+ nsImgUrl +'"></a>',
		   				ebimgsrc: '<a href="' + ebImgUrl + '" target="blank"><img src="'+ ebImgUrl +'"></a>',
		   				ebimgfrmt: imgRes.getValue('custrecord_ebay_img_pictfrmt'),
		   				//ebimgset: imgRes.getValue('custrecord_ebay_img_pictset'),
		   				nsimgname: ''
		   		};
		   		
		   		var fileRes = fileCache.findResultById(row.nsimgid);
		   		if (fileRes) {
		   			row.nsimgname = fileRes.getText('folder') +'/'+ fileRes.getValue('name');
		   		};
		   		
		   		rows.push(row);
			});
			
			if ((rows.length < 1) && imgId) {
				
				var file = nlapiLoadFile(imgId);
				if (file) {
			   		var row = {
			   				action: 		   					
			   				'<ul>'+
			   				  '<li><a class="dottedlink" href="'+getUpdEbImgUrl(imgId)+'">Add To eBay</a></li>'+
			   				'</ul>',
			   				nsimgid: imgId,
			   				nsimgsrc: '<a href="' + nsMediUrl + imgId + '" target="blank"><img src="'+ file.getURL() +'"></a>',
			   				ebimgsrc: 'No eBay Picture Registered',
			   				ebimgfrmt: file.getType(),
			   				nsimgname: file.getName()
			   		};
			   		rows.push(row);
				};
			};
			
			return rows;
		};
		
		var createImgPictList = function(title) {
			
			var list = nlapiCreateList(title);
		    list.setStyle('grid');

		    list.addColumn('action', 'text', 'Action');
		    list.addColumn('nsimgid', 'text', 'Internal ID');
		    list.addColumn('nsimgname', 'text', 'Image Name');
			list.addColumn('nsimgsrc', 'text', 'NetSuite Image');
			list.addColumn('ebimgsrc', 'text', 'eBay Picture');
		    list.addColumn('ebimgfrmt', 'text', 'Format');
		    
		    return list; 
		};

		var imgId = request.getParameter('imgid');
		var title = 'NetSuite eBay Images';
		if (imgId) {
			title = 'NetSuite eBay Image, ID = ' + imgId;
		};
		
		var rows = getImgPictRows(imgId, title);
		var list = createImgPictList(title); 

		var rtnParm = ebay.RtnParm(request);
        if ((rtnParm) && (rtnParm.hasVals())) {
    		list.addPageLink('crosslink', rtnParm.rtnto, rtnParm.rtnurl);
        };
		
		jPw.each(rows, function() {
	   		var row = this;
			list.addRow(row);
		});
		
	   	response.writePage( list );
	};
	
}( this.jPw.ebay = this.jPw.ebay || {}));

