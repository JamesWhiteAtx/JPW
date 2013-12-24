/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Oct 2013     james.white
 *
 */

this.jPw = this.jPw || {};

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
	        response.writePage( form );
	} 
	else
		dumpResponse(request,response);
};

/*
 * ebay.getActiveListingArr
 * eBay API call to retrieve array of active listings 
 */
(function(ebay) {

	ebay.getActiveListingArr = function(skuArr, setpFcn, itemFcn){
		var listingArr = [];
		
		var api = jPw.apiet.makeActiveListingsRequest();
		if ((skuArr) && (skuArr.length > 0)) {
			api.addSkuFilter(skuArr);
		};
		
		if (setpFcn) {
			setpFcn(api);
		};
		
		api.callApiCallback( 
			function(obj){
				var node;
				var itemNodes = obj.getRespAnyNodes('Item');// nlapiSelectNodes(xmlObj, '//nlapi:Item');
				for (var i = 0; i < itemNodes.length; i++) {
					node = itemNodes[i];

					var listing = {
						row: parseInt(i)+1,
						nsItemId: obj.getSubVal(node, 'ApplicationData'),
						sku: obj.getSubVal(node, 'SKU'),
						ebayItemId:  obj.getSubVal(node, 'ItemID'),
						listingUrl: obj.getSubVal(node, 'ViewItemURL'),
						title: obj.getSubVal(node, 'Title'),
						price: obj.getSubVal(node, 'CurrentPrice'),
						qty: obj.getSubVal(node, 'Quantity')
					};
					
					if (itemFcn) {
						itemFcn(listing, node, obj);
					};
					
					listingArr.push(listing);
				};
			}, 
			function(obj){ throw {message: "eBay ActiveListings API failed"}; }
		);
		return listingArr;
	};
}( this.jPw.ebay = this.jPw.ebay || {}));
	
/*
 * ebay.activeListings
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
	    
	    list.setScript('customscript_ec_rw_client_salesorder');
	    
	   	list.addColumn('row', 'text', 'row');
	   	list.addColumn('partno', 'text', 'SKU').setURL('item_url', true);
	   	list.addColumn('title', 'text', 'title');
	   	list.addColumn('ebayitemid', 'text', 'eBay ID').setURL('listing_url', true);
	   	list.addColumn('qty', 'text', 'qty').setURL('qty_url', true);
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
	
	ebay.ctlgFldId = 'custitem_item_prod_ctlg';
	ebay.listIdFldId = 'custitem_ebay_listing_id';
	ebay.listUrlFldId = 'custitem_ebay_listing_url';
	ebay.ctlgId = '3';
	
	ebay.addEbayItemCtlg = function (parm) {  //{internalId, record, submit}
		var record;
		if (typeof parm.record === 'object') {
			record = parm.record;
		} else {
			record = nlapiLoadRecord('serializedinventoryitem', parm.internalId, {recordmode: 'dynamic'});
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
			record = nlapiLoadRecord('serializedinventoryitem', parm.internalId, {recordmode: 'dynamic'});
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
	
	ebay.updEbayItem = function(parm) {//({internalId, record, eBayItemId, eBayUrl});
		var record;
		
		if (typeof parm.record === 'object') {
			record = parm.record;
		} else {
			record = nlapiLoadRecord('serializedinventoryitem', parm.internalId, {recordmode: 'dynamic'});
		};
		
		if (record) {
			record.setFieldValue(ebay.listIdFldId, parm.eBayItemId);
			record.setFieldValue(ebay.listUrlFldId, parm.eBayUrl);

			//remove from ebay listing product catalog
			ebay.addEbayItemCtlg({record: record, submit: false});
			
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
			record = nlapiLoadRecord('serializedinventoryitem', parm.internalId, {recordmode: 'dynamic'});
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
	
	ebay.updateNsItem = function (nsItemId, partNo, update, eBayItemId, eBayUrl) {
		
		var results = nlapiSearchRecord('item', null, 
				[new nlobjSearchFilter('internalid', null, 'is', nsItemId),
				 new nlobjSearchFilter('name', null, 'startswith', partNo)], 
				[new nlobjSearchColumn('name')]);
		
		jPw.each(results, function() {
			var internalId = this.getId();
			
			if (update) {
				ebay.updEbayItem({internalId: internalId, eBayItemId: eBayItemId, eBayUrl: eBayUrl});
			} else {
				ebay.clearEbayItemCtlg({internalId: internalId});
			};
			
		});
	};
	
	ebay.getEbayCfg = function() {
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
	};
	
}( this.jPw.ebay = this.jPw.ebay || {}));

/*
 * ebay.apiRespForm
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
 * ebay.removeListing
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
 * ebay.listingQuantity 
 * Suitelet Form, GET & POST
 */
(function(ebay) {

	var errResp = function (msg) {
		response.setContentType('PLAINTEXT', 'err.txt', 'inline');
		response.write( msg );
	};
	
	var badEbayitemid = function (id) {
		var numId = parseInt(id);
		if ((!numId) || (isNaN(numId))) {
			errResp('the ebayitemid parameter "'+id+'" is not a valid eBay item ID.');
			return true;
		} else {
			return false;
		};
	};
	
	var qtyNaN = function (qty) {
		var numQty = parseInt(qty);
		if ((!qty) || (isNaN(numQty))) {
			errResp('the qty parameter "'+qty+'" is not an integer.');
			return true;
		} else {
			return false;
		};
	};
	
	var valQty = function (qty) {
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
			
			if (badEbayitemid(ebayitemid)) {
				return;
			}
			if (qtyNaN(qty)) {
				return;
			};
			qty = valQty(qty);
			
			form = nlapiCreateForm('Change eBay Listing Quantity');
	        
			maintParm.addHidFlds(form);
			
			form.addField('itemid', 'text', '').setDisplayType('hidden').setDefaultValue(itemid);
			form.addField('partno', 'text', 'Part #', null, 'qty').setLayoutType('normal', 'startcol').setDisplayType('disabled').setDefaultValue(partno);
			form.addField('ebayitemid', 'text', 'eBay Item ID', null, 'qty').setDisplayType('disabled').setDefaultValue(ebayitemid);
			
			form.addField('qty', 'integer', 'Quantity', null, 'qty').setPadding(1).setDefaultValue(qty);

			form.addField('hint', 'text', '', null, 'qty').setDisplayType('inline').setDefaultValue('*Change qunatity to 0 to inactive the listing. (values allowed 0-10)');
			
	        form.addSubmitButton('Change Quantity');
	        
	        if (maintParm.hasVals()) {
				var listUrl = nlapiResolveURL('SUITELET', 'customscript_ebay_maint_list','customdeploy_ebay_maint_list', null) + maintParm.parmStr();
				var script = "window.location.replace('"+listUrl+"')";
		        form.addButton('buttoncancel', 'Cancel', script);
	        };
	        
	        response.writePage( form );
		} else if ( request.getMethod() == 'POST' ) {
			
			var maintParm = jPw.ebay.MaintParm(request);
			
			var partno = request.getParameter('partno');
			var itemid = request.getParameter('itemid');
			var ebayitemid = request.getParameter('ebayitemid');
			var qty = request.getParameter('qty');

			if ((!partno) || (!ebayitemid)) {
				errResp('Either partno parameter or ebayitemid parameter are required.');
				return;
			}
			if (badEbayitemid(ebayitemid)) {
				return;
			}
			if (qtyNaN(qty)) {
				return;
			};
			qty = valQty(qty);

			
			var api = jPw.apiet.makeReviseFixedPriceItemRequest();
			if (ebayitemid) {
				api.setItemID(ebayitemid);
			} else {
				api.setSKU(partno);
			};
			api.setQuantity(qty);

			var qtyUpdated = function (request, response, obj, respEbayItemId, respSku) {
				var apiGet = jPw.apiet.makeGetItemRequest();
				apiGet.setRequestProp("ItemID", respEbayItemId);
				apiGet.addOutputSelector('Item.ItemID')
					.addOutputSelector("Item.SKU")
					.addOutputSelector("Item.Quantity")
					.addOutputSelector('Item.ApplicationData')
					.addOutputSelector("Item.ListingDetails.ViewItemURL")
					;

				apiGet.callApiCallback( 
					function(objItmResp){
						var gotEbayItemId = objItmResp.getRespAnyVal('ItemID');
						var gotPartNo = objItmResp.getRespAnyVal('SKU');
						var gotQty = objItmResp.getRespAnyVal('Quantity');
						var gotInternId = objItmResp.getRespAnyVal('ApplicationData');
						var gotEbayUrl = objItmResp.getRespAnyVal('ViewItemURL');
						
						ebay.updateNsItem(gotInternId, gotPartNo, (gotQty > 0), gotEbayItemId, gotEbayUrl);
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
					msgFcn: function(obj){return 'eBay listing qty has been changed to '+qty+'.';},  
					notFailFcn: qtyUpdated
				}
			);
			
		} else {
			dumpResponse(request,response);
		};
	};
}( this.jPw.ebay = this.jPw.ebay || {}));

/*
 * ebay.eBayMaintSettings
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
				}
			}
		};
	};
	
	ebay.eBayMaintSettings = function(request, response){
		var form;
		if ( request.getMethod() == 'GET' ) {
			
			var maintParm = ebay.MaintParm(request);

			form = nlapiCreateForm('eBay Maintneance');

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

		var search = jPw.parts.LeaSrchObj( 
			[ 
			  ['isinactive', 'is', 'F'],
			  'and',
			  ['type', 'is', 'InvtPart'], 
			  'and', 
			  ['custitem_prod_cat', 'is', '9'], 
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
			map[record.basePartNo] = map[record.basePartNo] || {};
			map[record.basePartNo].record = record;
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
	   	list.addColumn('sku', 'text', 'eBay SKU');
	   	list.addColumn('ebayitemid', 'text', 'eBay ID').setURL('listing_url', true);
	   	list.addColumn('syncerr', 'text', '!');
	   	list.addColumn('qty', 'text', 'Qty').setURL('qty_url', true);
	   	list.addColumn('title', 'text', 'Title');
	   	list.addColumn('clear', 'text', '(-)').setURL('clear_url', true);
	   	
	   	//var sysDom = jPw.getSysUrlDomain();
		var nsItemUrl = '/app/common/item/item.nl?itemtype=InvtPart&id=';
		var addUpdUrl = nlapiResolveURL('SUITELET', 'customscript_ebay_listing_addupd','customdeploy_ebay_listing_addupd', null);
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
				addupd_url: record ? addUpdUrl + '&partno=' + key + '&internalid=' + record.getId() + maintParm.parmStr(): null,
		    	sku: listing ? listing.sku : null,
	   	    	qty: listing ? listing.qty : null,
 			    qty_url: listing ? qtyUrl + '&partno=' + listing.sku + '&ebayitemid=' + eBayItemId + '&qty=' + listing.qty + maintParm.parmStr(): null,
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
 * ebay.clearItemOfEbay
 * Suitelet proceudure to add NetSuite Item as an eBay Listing
 */
(function(ebay) {
	ebay.clearItemOfEbay = function(request, response){
		var partno = request.getParameter('partno');
		var internalid = request.getParameter('internalid');
		if ((!partno) && (!internalid)) {
			errResp('Either partno parameter or internalid parameter are required.');
			return;
		}
		var maintParm = ebay.MaintParm(request);
		
		ebay.clearEbayItem({internalId: internalid, submit: true});

		nlapiSetRedirectURL('SUITELET', 'customscript_ebay_maint_list','customdeploy_ebay_maint_list', null, maintParm.parmObj());
	};
}( this.jPw.ebay = this.jPw.ebay || {}));


/*
 * ebay.addUpdEbayImage
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
 * ebay.eBayAddUpdListing
 * Suitelet proceudure to add NetSuite Item as an eBay Listing
 */
(function(ebay) {

 	var errResp = function (msg) {
		response.setContentType('PLAINTEXT', 'err.txt', 'inline');
		response.write('An Error Occurred' +'\n'+ msg );
	};
	
	var getNsPart = function(internalid) {
		var baseSearch = jPw.parts.getLeaKitSearch();
		baseSearch.addFilt(new nlobjSearchFilter('internalid', null, 'is', internalid));
		var search = jPw.parts.getEbayPartsSearch(baseSearch);
		var parts = jPw.parts.eBayPartsList(search, true, 1);

		if ((parts) && (parts.length > 0)) {
			return parts[0];
		}
	};
	
	var updatePartImgs = function (part) {
		part.ebay_img_url = ebay.addUpdEbayImage(part.img_id);
		part.ebay_thumb_url = ebay.addUpdEbayImage(part.thumb_id);
	};
	
	var loadLeaReq = function (part, api) {
		api.setPartNo(part.base_part);
	    api.setNsItemId(part.item_id);

	    api.setTitle(part.color.slice(4) +' '+ part.descr);
		api.setItemProp("SubTitle", part.slctr_descr);
		
		var cfg = ebay.getEbayCfg();
		var file = nlapiLoadFile(cfg.lstngFileId);
		var descr = file.getValue();
		
		//var descr = '<H1>'+part.descr+'</H1><H2>'+part.color+'</H2>';
		if (descr) {
			api.setItemPropCdata("Description", descr);
		};

		api.setStartPrice(part.price);

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
		
		if ((part.ns_part) && (part.base_part != part.ns_part)) {
			api.addItemSpecific("Other Part Number", part.ns_part);
		};
		
	    //ItemCompatibilityList
		//addItemReq.addCompatMkYrMdTr("Toyota","2013","Camry","Hybrid LE Sedan 4-Door");
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

		updatePartImgs(part);
		
		var msgCorrId = '';
		var api;
		if (listing) { // update listing
			msgCorrId = 'Update';
			api = jPw.apiet.makeReviseFixedPriceItemRequest();
			api.setItemID(listing.ebayItemId);
		} else { // add new listing
			msgCorrId = 'Add';
			api = jPw.apiet.makeLeatherItemRequest();
			api.setItemProp("Quantity", "10");
		};
		
		loadLeaReq(part, api);

		msgCorrId = msgCorrId + ' ' + partno; 
        api.setRequestProp("MessageID", 'Add ' + msgCorrId);

    	//response.setContentType('XMLDOC');
        //response.write( api.getXmlEncode() );
        //return;        
        
		api.callApiCallback( 
			function(obj){
		    	var correlationId = obj.getRespAnyVal('CorrelationID');
		    	var eBayItemId = obj.getRespAnyVal('ItemID');
		    	var eBaySku = obj.getRespAnyVal('SKU');
		    	
				var apiItmReq = jPw.apiet.makeGetItemRequest();
			    var viewItemURL = apiItmReq.retrieveUrlForItemId(eBayItemId);

			    ebay.updEbayItem({internalId: internalid, eBayItemId: eBayItemId, eBayUrl: viewItemURL, submit: true});
			    
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
			errResp('Both partno parameter or internalid parameter are required.');
			return;
		}
	    try {
			var maintParm = ebay.MaintParm(request);
	    	ebay.addUpdListing(partno, internalid);
	    	nlapiSetRedirectURL('SUITELET', 'customscript_ebay_maint_list','customdeploy_ebay_maint_list', null, maintParm.parmObj());		
		} catch (e) {
			if ( e instanceof nlobjError ) {
				nlapiLogExecution( 'ERROR', e.getCode(), e.getDetails() );
				errResp(e.getCode() +': '+ e.getDetails());
			} else {
				nlapiLogExecution( 'ERROR', 'Unexpected Error', e.toString() )
				errResp('Unexpected Error' + '\n' + e.toString());
			};
			return;
		};
	};	
	
}( this.jPw.ebay = this.jPw.ebay || {}));

(function(ebay) {
	ebay.schedAddEbayCandidates = function(type) {
		//if ( type != 'scheduled' ) return; /* script should only execute during scheduled calls. */

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
		
		var search = jPw.parts.LeaSrchObj( 
				[ 
				  ['isinactive', 'is', 'F'],
				  'and',
				  ['type', 'is', 'InvtPart'], 
				  'and', 
				  ['custitem_prod_cat', 'is', '9'], 
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
				
				var percent;
				context.setPercentComplete(0.00);   
				context.getPercentComplete();  // displays percentage complete
				
				for (var i = 0; i < count; i++) {
					if (checkReSched(i, cntx)) {
						return false;
					};
					
					var record = jPw.parts.makeLeaPartObj( results[i] );
					
					var partno = record.basePartNo;
					var internalid = record.getId(); 
					
					jPw.ebay.addUpdListing(partno, internalid);
					
					percent = Math.round( (100*(i+1)) / count );
					context.setPercentComplete( percent );     // calculate the results
					context.getPercentComplete();  // displays percentage complete  
					addMsg('Percent: '+percent, 'DEBUG');
				};
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
				errResp(e.getCode() +': '+ e.getDetails());
			} else {
				nlapiLogExecution( 'ERROR', 'Unexpected Error', e.toString() )
				errResp('Unexpected Error' + '\n' + e.toString());
			};
			return;
		};
	};
}( this.jPw.ebay = this.jPw.ebay || {}));

