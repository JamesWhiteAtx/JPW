/**
 * Module Description
 *
 */

var test = function (request, response) {
	respObject = [{code:1,value:"one"},{code:1,value:"one"},{code:1,value:"one"},{code:1,value:"one"}];
	jPw.jsonResponse(request, response, respObject);
	/*
	var html  ='<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/xhtml">'
	+'<body>'
	+'<h1>Clearance List</h1>'
	+'</body>'
	+'</html>';
	response.setContentType('HTMLDOC');
	response.write( html );
	*/
};
/*
 	var form = nlapiCreateForm('SPA');
	var myInlineHtml = form.addField( 'custpage_btn', 'inlinehtml');
    var restResp = nlapiRequestURL( 'https://rwresources.azurewebsites.net/ebay', null , null, 'GET');  
	myInlineHtml.setDefaultValue(restResp.getBody());
	response.writePage( form );

 */
/*	var ptrnLastCar = function(ptrnId) {

		var results = nlapiSearchRecord('customrecord_leather_pattern', null,
				[ ['internalid', 'is', ptrnId] ],
				[
				 new nlobjSearchColumn('custrecord_make', 'CUSTRECORD_CAR_TYPE'),
				 new nlobjSearchColumn('custrecord_model', 'CUSTRECORD_CAR_TYPE'),
				 new nlobjSearchColumn('custrecord_body', 'CUSTRECORD_CAR_TYPE'),
				 new nlobjSearchColumn('custrecord_year', 'CUSTRECORD_CAR_TYPE'),
				 new nlobjSearchColumn('custrecord_tl', 'CUSTRECORD_CAR_TYPE'),
				 ]
		);

		var lastIdx = -1;
		var lastYear = 0;
		var result;
		if ((results) && (results.length > 0)) {
			cars = results.length;
			for (var i = 0; i < results.length; i++) {
				result = results[i];
				var years = result.getText('custrecord_year', 'CUSTRECORD_CAR_TYPE').split(",");
				var max_year = Math.max.apply(Math, years);
				if (max_year > lastYear) {
					lastYear = max_year;
					lastIdx = i;
				};
			};
		};

		if (lastIdx > -1) {
			car = results[lastIdx];
		};
		
	};
*/
/*	
	var ctgryId = request.getParameter('ctgryid');
        var subId = request.getParameter('subid');
        var ctlgId = request.getParameter('ctlgid');
        var itemId = request.getParameter('itemid');
        
        var lstgCfgs = jPw.ebay.makeLstgCfgs();
        
        var cfg = lstgCfgs.calcCfg(ctgryId, subId, ctlgId, itemId);
        
        jPw.jsonResponse( request, response, {cfg: cfg} );      
*/      

var setIsisCtgryPrices = function() {
        var getMap = function() {
                var map = {};

                var ss = nlapiLoadSearch(null, 'customsearch_isis_ctgry_price');
                var rs = ss.runSearch();
                var results = rs.getResults(0, 1000);
                var result;
                for (var i = 0, len = results.length; i < len; i++) {
                        result = results[i];
                        var ctgry = result.getValue('custrecord_isis_price_ctgry_ctgry').toString();
                        var sub = result.getValue('custrecord_isis_price_ctgry_sub').toString();
                        var price = result.getValue('custrecord_isis_price_ctgry_price');
                        
                        if (!map[ctgry]) {
                                map[ctgry] = {};
                        };
                        map[ctgry][sub] = price;
                };
                
                return map;
        };
        
        var map = getMap();

        var ss = nlapiLoadSearch(null, 'customsearch_isis_non_lea_ctgry_no_price');
        var rs = ss.runSearch();
        var results = rs.getResults(0, 1000);
        var result, ctgry, sub, price, record, co;
        for (var i = 0, len = results.length; i < len; i++) {
                result = results[i];
                ctgry = result.getValue('custrecord_isis_part_conv_prod_ctgry').toString();
                sub = result.getValue('custrecord_isis_part_conv_prod_sub_ctgry').toString();
                co = map[ctgry];
                if (co) {
                        price = co[sub];
                        if (price) {
                                record = nlapiLoadRecord(results[i].getRecordType(), results[i].getId());
                                record.setFieldValue('custrecord_isis_part_conv_price', price);
                                nlapiSubmitRecord(record);
                        };
                };
        };      
        

};

var loadMultiEbayPages = function (request, response) {
        var api = jPw.apiet.makeActiveListingsRequest();

        api.addOutputSelector('PageNumber')
                .addOutputSelector('PaginationResult.TotalNumberOfEntries')
                .addOutputSelector('PaginationResult.TotalNumberOfPages')
                .addOutputSelector('ReturnedItemCountActual');

        var pageNumber = 1;
        var entriesPerPage = 2;
        var totalPages = 0;
        var pagesLoaded = 0;
        var resp = [];
        
        var loadListings = function() {
                api.setRequestProp("Pagination", {"EntriesPerPage": entriesPerPage, "PageNumber": pageNumber}); 
                api.callApiCallback( 
                        function(obj){
                                //response.setContentType('XMLDOC');
                                //response.write( obj.respXmlStr );
                                resp.push({
                                        entries: obj.getRespAnyVal('TotalNumberOfEntries'),
                                        pages: obj.getRespAnyVal('TotalNumberOfPages'),
                                        page: obj.getRespAnyVal('PageNumber'),
                                        count: obj.getRespAnyVal('ReturnedItemCountActual')
                                });
                                if (totalPages === 0) {
                                        totalPages = obj.getRespAnyVal('TotalNumberOfPages');
                                };
                                pagesLoaded ++;
                                pageNumber ++;
                        }, 
                        function(obj){ 
                        }
                );
        };

        do {
                loadListings();
        } while (pagesLoaded < totalPages) ;


        jPw.jsonResponse( request, response, {resp: resp} );

};

var getEbayOrders = function (request, response) {
        var api = jPw.apiet.makeGetSellingManagerSoldListingsRequest();
//      api.setRequestProp('Filter', 'PaidNotShipped');
        api.adSearchTypeVal('SaleRecordID', '109');
        api.setRequestProp('Sort', 'SaleDate');

//response.setContentType('XMLDOC');
//response.write( api.getXmlEncode() );
//return;

        api.callApiCallback( 
                function(obj){
//response.setContentType('XMLDOC');
//response.write( obj.respXmlStr );
//return;
                        var orders = [];
                        var saleNodes = obj.getRespAnyNodes('SaleRecord');// nlapiSelectNodes(xmlObj, '//nlapi:Item');
                        
                        jPw.each(saleNodes, function() {
                                var saleNode = this;
                                
                                var orderUrlBase = nlapiResolveURL('SUITELET', 'customscript_ebay_get_order','customdeploy_ebay_get_order', null);
                                var completeUrlBase = nlapiResolveURL('SUITELET', 'customscript_ebay_completesale','customdeploy_ebay_completesale', null);

                                var saleOrdId = obj.getVal(saleNode, 'SaleRecordID');
                                var buyer = obj.getSubVal(saleNode, 'BuyerEmail');
                                
                                var isoDt = obj.getSubVal(saleNode, 'CreationTime');
                                var d = new Date( Date.parse(isoDt) );
                                var creationTime = nlapiDateToString(d, 'datetime'); 
                                        
                                var status = null;
                                var statusNode = obj.getFirstSubNode(saleNode, 'OrderStatus');
                                if (statusNode) {
                                        status = obj.getSubVal(statusNode, 'PaidStatus')
                                                +' '+ obj.getSubVal(statusNode, 'ShippedStatus')
                                                +' '+ obj.getSubVal(statusNode, 'PaymentMethodUsed');
                                };

                                var total = obj.getSubVal(saleNode, 'TotalAmount');

                                var transOrdId;
                                var orderLineItemID;
                                var itemId;
                                var transId;
                                var partno;
                                var descr;
                                var qty;
                                var carrier;
                                var orderUrl;
                                var actionName;
                                var actionUrl;
                                
                                var pushOrder = function() {
                                        orders.push({
                                                saleordid: saleOrdId,
                                                status: status,
                                                buyer: buyer,
                                                creationtime: creationTime,
                                                total: total,

                                                line: line,
                                                transordid: transOrdId,
                                                order_url: orderUrl,
                                                partno: partno,
                                                descr: descr,
                                                ebayitemId: itemId,
                                                transactionid: transId,
                                                action: actionName,
                                                action_url: actionUrl,
                                                qty: qty,
                                                orderlineid: orderLineItemID,
                                                //orderlineidus: orderLineItemID.replace(/-/g, '_'),
                                        });
                                };
                                
                                var line = 0;
                                var transNodes = obj.getSubNodes(saleNode, 'SellingManagerSoldTransaction');
                                if ((!transNodes) || (transNodes.length == 0) || (transNodes.length > 1)) {
                                        pushOrder();
                                        saleOrdId = null;
                                        status = null;
                                        buyer = null;
                                        creationTime = null;
                                        total = null;
                                }
                                jPw.each(transNodes, function() {
                                        transNode = this;
                                        
                                        line ++ ;
                                        transOrdId = obj.getSubVal(transNode, 'SaleRecordID');
                                        orderLineItemID = obj.getSubVal(transNode, 'OrderLineItemID');
                                        itemId = obj.getSubVal(transNode, 'ItemID');
                                        transId = obj.getSubVal(transNode, 'TransactionID');
                                        partno = obj.getSubVal(transNode, 'CustomLabel'),
                                        descr = obj.getSubVal(transNode, 'ItemTitle'),
                                        qty = obj.getSubVal(transNode, 'QuantitySold');
                                        carrier = '';
                                        orderUrl = orderUrlBase + '&orderid=' + orderLineItemID;
                                        actionName = 'Complete';
                                        actionUrl = completeUrlBase + '&ebayitemid=' + itemId + '&transactionid=' + transId + '&carrier=' + carrier;
                                        
                                        pushOrder();
                                });
                                
                        });

                        var list = nlapiCreateList('Roadwire eBay Orders');
                    list.setStyle('grid');

                    list.addColumn('saleordid', 'text', 'Sale ID');
                        list.addColumn('status', 'text', 'Status');
                        list.addColumn('buyer', 'text', 'Buyer');
                    list.addColumn('creationtime', 'text', 'Created');
                    list.addColumn('total', 'text', 'Total');

                    list.addColumn('transordid', 'text', 'Trans ID').setURL('order_url', true);
                        //list.addColumn('line', 'text', 'Line#');
                    list.addColumn('partno', 'text', 'Part No');
                    list.addColumn('descr', 'text', 'Title');
                    list.addColumn('qty', 'text', 'Qty');
                    list.addColumn('action', 'text', 'Action').setURL('action_url', true);
                    list.addColumn('orderlineid', 'text', 'Order Line Item ID');
                        
                        jPw.each(orders, function() {
                                var order = this;
                                list.addRow(order);
                        });
                        response.writePage( list );
                }, 
                function(obj){ 
                        var msg = obj.respXmlStr;
                        nlapiLogExecution('ERROR', msg);
                        throw nlapiCreateError('API_ERROR_RESPONSE', msg);
                }
        );              
};

var eBayCompleteSale = function (request, response) {
        var api = jPw.apiet.makeCompleteSaleRequest();

        api.setItemID('110136071289');
        api.setTransactionID('27208450001');
        api.setShipmentTrackingNumber('JPW-123456');
        api.setShippingCarrierUsed('JPW Long Haulage');
        api.setShippedTime(new Date());
        
        api.callApiCallback( 
                function(obj){
                        response.setContentType('XMLDOC');
                    response.write( obj.respXmlStr );
                }, 
                function(obj){ 
                        var x = '<fail>fail</fail>'+obj.respXmlStr;
                        response.setContentType('PLAINTEXT', 'error.txt', 'inline');
                        response.write( x );
                }
        );      
};

var eBayOrder = function (request, response) {

        var api = jPw.apiet.makeGetOrdersRequest();
        api.setRequestProp('DetailLevel', 'ReturnAll');
        api.addOrderId('110136071289-27208450001');

        //var xmlStr = api.getXmlEncode();
        //response.setContentType('XMLDOC');
        //response.write( xmlStr );
        
        api.callApiCallback( 
                function(obj){
                        response.setContentType('XMLDOC');
                    response.write( obj.respXmlStr );
                }, 
                function(obj){ 
                        var x = '<fail>fail</fail>'+obj.respXmlStr;
                        response.setContentType('PLAINTEXT', 'error.txt', 'inline');
                        response.write( x );
                }
        );      
        
};

var eBayUnshippedOrders = function (request, response) {
        
        var api = jPw.apiet.makeGetSellingManagerSoldListingsRequest();
        api.setRequestProp('Filter', 'PaidNotShipped');

        api.callApiCallback( 
                function(obj){
                        var orders = [];
                        var orderNodes = obj.getRespAnyNodes('SaleRecord');// nlapiSelectNodes(xmlObj, '//nlapi:Item');
                        
                        jPw.each(orderNodes, function() {
                                var orderNode = this;
                                
                                var orderId = obj.getSubVal(orderNode, 'SaleRecordID');
                                var buyer = obj.getSubVal(orderNode, 'BuyerEmail');
                                
                                var isoDt = obj.getSubVal(orderNode, 'CreationTime');
                                var d = new Date( Date.parse(isoDt) );
                                var creationTime = nlapiDateToString(d, 'datetime'); 
                                        
                                var total = obj.getSubVal(orderNode, 'TotalAmount');
                                var line = 0;
                                
                                var transNodes = obj.getSubNodes(orderNode, 'SellingManagerSoldTransaction');
                                jPw.each(transNodes, function() {
                                        line ++ ;
                                        transNode = this;
                                        
                                        var orderLineItemID = obj.getSubVal(transNode, 'OrderLineItemID');
                                        var qty = obj.getSubVal(transNode, 'QuantitySold');
                                        orders.push({
                                                orderid: orderId,
                                                buyer: buyer,
                                                creationtime: creationTime,
                                                line: line,
                                                ebayitemId: obj.getSubVal(transNode, 'ItemID'),
                                                transactionid: obj.getSubVal(transNode, 'TransactionID'),
                                                partno: obj.getSubVal(transNode, 'CustomLabel'),
                                                qty: qty,
                                                orderlineid: orderLineItemID,
                                                orderlineidus: orderLineItemID.replace(/-/g, '_'),
                                                total: total
                                        });
                                });
                                
                        });

                        var list = nlapiCreateList('Roadwire eBay Orders (Paid Not Shipped)');
                    list.setStyle('grid');
                        
                    list.addColumn('orderid', 'text', 'Order#');
                        list.addColumn('buyer', 'text', 'Buyer');
                    list.addColumn('creationtime', 'text', 'Created');
                        list.addColumn('line', 'text', 'Line#');
                    list.addColumn('partno', 'text', 'Part No');
                    list.addColumn('qty', 'text', 'Qty');
                    list.addColumn('orderlineid', 'text', 'ID');
                    list.addColumn('total', 'text', 'Total');
                        
                        jPw.each(orders, function() {
                                var order = this;
                                list.addRow(order);
                        });
                        response.writePage( list );
                }, 
                function(obj){ 
                        response.setContentType('XMLDOC');
                        response.write( obj.respXmlStr );
                }
        );      
        
};

//var xmlStr = api.getXmlEncode();
//response.setContentType('XMLDOC');
//response.write( xmlStr );

//jPw.jsonResponse( request, response, {count: jPw.getIsisImpCount()} );

var clearEbayCatalog = function () {
        var results = nlapiSearchRecord('item', null, 
                        [ new nlobjSearchFilter('custitem_item_prod_ctlg', null, 'anyof', '3'),
                        new nlobjSearchFilter('custitem_ebay_listing_url', null, 'isempty')
                        ], 
                        [ new nlobjSearchColumn('name')]);

        jPw.each(results, function() {
                var rec = this;
                var id = rec.getId();
                nlapiSubmitField('serializedinventoryitem', id, 'custitem_item_prod_ctlg', null);
        });

};

var eBayUploadPictures = function (request, response) { 
        
        var api = jPw.apiet.makeGetItemRequest();
        api.setRequestProp("ItemID", '110127617073');
        api.addOutputSelector('Item.ItemID')
                .addOutputSelector("Item.SKU")
                .addOutputSelector("Item.Quantity")
                .addOutputSelector('Item.ApplicationData')
                .addOutputSelector("Item.ListingDetails.ViewItemURL")
                ;

        api.callApiCallback( 
                function(obj){
                        response.setContentType('XMLDOC');
                    response.write( obj.respXmlStr );
                }, 
                function(obj){ 
                        var x = '<fail>fail</fail>'+obj.respXmlStr;
                        response.setContentType('PLAINTEXT', 'error.txt', 'inline');
                        response.write( x );
                        
                        
                }
        );      

        
        //var xmlStr = api.getXmlEncode();
        //response.setContentType('XMLDOC');
    //response.write( xmlStr );
        return;
        
        var imgId = 6379;
        
        var file = nlapiLoadFile(imgId);
        if (!file) {
                var msg = 'Failed to find image file for id "'+imgId+'".';
                nlapiLogExecution('ERROR', msg);
                throw nlapiCreateError('FILE_ID_MISSING', msg);
                return;
        };
        
        var api = jPw.apiet.makeUploadSiteHostedPicturesRequest(); //jPw.apiet.makeEnvProduction()

        api.setExternalPictureURL('http://roadwire.biz/netsuitefile/' + imgId);
        api.setPictureName(file.getName());
        
        
        api.callApiCallback( 
                function(obj){
                        var fullUrl = obj.getRespAnyVal('FullURL');
                        var pictureName = obj.getRespAnyVal('PictureName');
                        var pictureSet = obj.getRespAnyVal('PictureSet');
                        var pictureFormat = obj.getRespAnyVal('PictureFormat');
                        
                        var results = nlapiSearchRecord('customrecord_ebay_image', null, 
                                        [ new nlobjSearchFilter('custrecord_ebay_img_ns_img_id', null, 'is', imgId)], 
                                        [ new nlobjSearchColumn('name')]);
                        
                        var ebImgRec
                        if ((results) && (results.length > 0)) {
                                ebImgRec = nlapiLoadRecord(results[0].getRecordType(), results[0].getId());
                        } else {
                                ebImgRec = nlapiCreateRecord('customrecord_ebay_image');
                                ebImgRec.setFieldValue('custrecord_ebay_img_ns_img_id', imgId);         
                        };
                        
                        ebImgRec.setFieldValue('name', pictureName);
                        ebImgRec.setFieldValue('custrecord_ebay_img_fullurl', fullUrl);
                        ebImgRec.setFieldValue('custrecord_ebay_img_pictfrmt', pictureFormat);
                        ebImgRec.setFieldValue('custrecord_ebay_img_pictset', pictureSet);
                        
                        var id = nlapiSubmitRecord(ebImgRec, true);
                        
                        jPw.jsonResponse( request, response, {
                                id: id,
                                fullUrl: fullUrl,
                                pictureName: pictureName,
                                pictureSet: pictureSet,
                                pictureFormat: pictureFormat
                        });
                        
                        //var ebImgrec = nlapiCreateRecord('customrecord_ebay_image');
                        //ptrnRec.setFieldValue('name', ptrn);
                        
                        //response.setContentType('PLAINTEXT', 'test.txt', 'inline');
                        //response.write( 'ebay url: '+ url );
                        
                        //response.setContentType('XMLDOC');
                    //response.write( obj.respXmlStr );
                }, 
                function(obj){ 
                        var x = '<fail>fail</fail>'+obj.respXmlStr;
                        response.setContentType('PLAINTEXT', 'error.txt', 'inline');
                        response.write( x );
                }
        );      
        
        //jPw.jsonResponse( request, response, {url: url, headers: headers} );

};

var completeSaleRequest = function (request, response) {
    var url = 'https://api.sandbox.ebay.com/ws/api.dll';

    var headers = new Array();
    headers['X-EBAY-API-COMPATIBILITY-LEVEL'] = '841';
    headers['X-EBAY-API-DEV-NAME'] = '481891e7-46d4-4a19-8992-bbfef42842b7';
    headers['X-EBAY-API-APP-NAME'] = 'Roadwire-fb1b-4244-80f7-0a9a8f918293';
    headers['X-EBAY-API-CERT-NAME'] = '99fc89de-c5a8-4594-97a5-9974d1908432';
    headers['X-EBAY-API-SITEID'] = '100';
    headers['X-EBAY-API-CALL-NAME'] = 'CompleteSale';

    var token = 'AgAAAA**AQAAAA**aAAAAA**9DJPUg**nY+sHZ2PrBmdj6wVnY+sEZ2PrA2dj6wFk4GhC5CAogudj6x9nY+seQ**3V0CAA**AAMAAA**PcqkIx0m6ICTidyzGK3gC3XBer7ww1EUAHhl2EJEopHUCw6kygGDClF2AjEvZj3W21H/aRQfJfr5VSJ6ZZcUj6yb1V73FgmhWYFEEDr3pTEe4AXtBPQmxBNjj2DvfeueJoqT59dVJRGWjeqL/VvgyV7+j92sz0jwMIc6G6m4dmTeYRkDgZFgh2W12GadVv58Tka1iul8w2li0J0O27FNhuuk05fTdKKW4G0DQPz10YqPCP9yRcZwF3fnB246rH2YxjiDhdQHvi4JevnDiiW6D0ZcfAlDBnH8sjhbh7SrqtU+ngpkJlLga5jrwTyXIWYQJtKMB2bQxf2R0HQYxWmKqTocnJgQk2K/E738qggcZXVBFS9VczznHSoDAXSIhJSfZ7RqXeesF1ATadaCiK/yxdmk/pH4+jAiiAiMuw6k0L4g5kSkToE3jFrM7zS77GO1FeET+jQfoZ1UA/jqkFVcZ2DRqEXX7qSnUfIH6plNm6K+hwKv4qsqwLhPLnCChP0Oms0wZlpozMeTFlg7qbXYvsXOGigguhhoSZyiwFc0tdi5MX2B6WO66loHJuaSMfeTMVwztfzjF5rVUtHh0LU38Mgdg5kG+EYGsg+wectXZ1363U87KlO8CnGKGq9wPekdapyb/qJdfg8UmFtnryjseV39yn+Ee5IflOK9rT5ngO5rJTa3uAvFaT0N1/xUvZtPCQBDde5GMzbJtQMJJyMCU8NmlmwN2bGVJMmhz4vnMHXj7s7X2Pbevq9fcHMwzw/y'; 

    var payload = '<?xml version="1.0" encoding="utf-8"?>'+
    '<CompleteSaleRequest xmlns="urn:ebay:apis:eBLBaseComponents">'+
    '<RequesterCredentials>'+
        '<eBayAuthToken>AgAAAA**AQAAAA**aAAAAA**9DJPUg**nY+sHZ2PrBmdj6wVnY+sEZ2PrA2dj6wFk4GhC5CAogudj6x9nY+seQ**3V0CAA**AAMAAA**PcqkIx0m6ICTidyzGK3gC3XBer7ww1EUAHhl2EJEopHUCw6kygGDClF2AjEvZj3W21H/aRQfJfr5VSJ6ZZcUj6yb1V73FgmhWYFEEDr3pTEe4AXtBPQmxBNjj2DvfeueJoqT59dVJRGWjeqL/VvgyV7+j92sz0jwMIc6G6m4dmTeYRkDgZFgh2W12GadVv58Tka1iul8w2li0J0O27FNhuuk05fTdKKW4G0DQPz10YqPCP9yRcZwF3fnB246rH2YxjiDhdQHvi4JevnDiiW6D0ZcfAlDBnH8sjhbh7SrqtU+ngpkJlLga5jrwTyXIWYQJtKMB2bQxf2R0HQYxWmKqTocnJgQk2K/E738qggcZXVBFS9VczznHSoDAXSIhJSfZ7RqXeesF1ATadaCiK/yxdmk/pH4+jAiiAiMuw6k0L4g5kSkToE3jFrM7zS77GO1FeET+jQfoZ1UA/jqkFVcZ2DRqEXX7qSnUfIH6plNm6K+hwKv4qsqwLhPLnCChP0Oms0wZlpozMeTFlg7qbXYvsXOGigguhhoSZyiwFc0tdi5MX2B6WO66loHJuaSMfeTMVwztfzjF5rVUtHh0LU38Mgdg5kG+EYGsg+wectXZ1363U87KlO8CnGKGq9wPekdapyb/qJdfg8UmFtnryjseV39yn+Ee5IflOK9rT5ngO5rJTa3uAvFaT0N1/xUvZtPCQBDde5GMzbJtQMJJyMCU8NmlmwN2bGVJMmhz4vnMHXj7s7X2Pbevq9fcHMwzw/y</eBayAuthToken>'+
        '</RequesterCredentials>'+
        '<WarningLevel>High</WarningLevel>'+
        '<FeedbackInfo>'+
                '<CommentType>Positive</CommentType>'+
                '<CommentText>Roadwire most valued buyer. Thank you Test User.</CommentText>'+
                '<TargetUser>testuser_wesley.alford</TargetUser>'+
        '</FeedbackInfo>'+
        '<OrderLineItemID>110127610770-27142761001</OrderLineItemID>'+
        '<Shipment>'+
            '<Notes>Shipped UPS Ground to Postal Code 98102</Notes>'+
            '<ShipmentTrackingDetails>'+
                    '<ShipmentTrackingNumber>TRK65321</ShipmentTrackingNumber>'+
                    '<ShippingCarrierUsed>UPS</ShippingCarrierUsed>'+
            '</ShipmentTrackingDetails>'+
        '</Shipment>'+
        '<Shipped>true</Shipped>'+
        '</CompleteSaleRequest>';

    var eBayResp = nlapiRequestURL( url, payload, headers);     

    var body = eBayResp.getBody();
    var responseXML = nlapiStringToXML(body);

    var ack = nlapiSelectValue(responseXML, '//nlapi:Ack');
    
    response.setContentType('XMLDOC');
    response.write( responseXML );

};

/*
<CompleteSaleRequest xmlns="urn:ebay:apis:eBLBaseComponents">
<RequesterCredentials>
<eBayAuthToken>AgAAAA**AQAAAA**aAAAAA**9DJPUg**nY+sHZ2PrBmdj6wVnY+sEZ2PrA2dj6wFk4GhC5CAogudj6x9nY+seQ**3V0CAA**AAMAAA**PcqkIx0m6ICTidyzGK3gC3XBer7ww1EUAHhl2EJEopHUCw6kygGDClF2AjEvZj3W21H/aRQfJfr5VSJ6ZZcUj6yb1V73FgmhWYFEEDr3pTEe4AXtBPQmxBNjj2DvfeueJoqT59dVJRGWjeqL/VvgyV7+j92sz0jwMIc6G6m4dmTeYRkDgZFgh2W12GadVv58Tka1iul8w2li0J0O27FNhuuk05fTdKKW4G0DQPz10YqPCP9yRcZwF3fnB246rH2YxjiDhdQHvi4JevnDiiW6D0ZcfAlDBnH8sjhbh7SrqtU+ngpkJlLga5jrwTyXIWYQJtKMB2bQxf2R0HQYxWmKqTocnJgQk2K/E738qggcZXVBFS9VczznHSoDAXSIhJSfZ7RqXeesF1ATadaCiK/yxdmk/pH4+jAiiAiMuw6k0L4g5kSkToE3jFrM7zS77GO1FeET+jQfoZ1UA/jqkFVcZ2DRqEXX7qSnUfIH6plNm6K+hwKv4qsqwLhPLnCChP0Oms0wZlpozMeTFlg7qbXYvsXOGigguhhoSZyiwFc0tdi5MX2B6WO66loHJuaSMfeTMVwztfzjF5rVUtHh0LU38Mgdg5kG+EYGsg+wectXZ1363U87KlO8CnGKGq9wPekdapyb/qJdfg8UmFtnryjseV39yn+Ee5IflOK9rT5ngO5rJTa3uAvFaT0N1/xUvZtPCQBDde5GMzbJtQMJJyMCU8NmlmwN2bGVJMmhz4vnMHXj7s7X2Pbevq9fcHMwzw/y</eBayAuthToken>
</RequesterCredentials>
<WarningLevel>High</WarningLevel>
<FeedbackInfo>
        <CommentType>Positive</CommentType>
        <CommentText>Roadwire most valued buyer. Thank you Test User.</CommentText>
        <TargetUser>testuser_wesley.alford</TargetUser>
</FeedbackInfo>
<OrderLineItemID>110127796493-27152503001</OrderLineItemID>
<Shipment>
    <Notes>Shipped UPS Ground to Postal Code 98102</Notes>
    <ShipmentTrackingDetails>
            <ShipmentTrackingNumber>TRK123</ShipmentTrackingNumber>
            <ShippingCarrierUsed>UPS</ShippingCarrierUsed>
    </ShipmentTrackingDetails>
</Shipment>
<Shipped>true</Shipped>
</CompleteSaleRequest>
*/

/*var ctlgs = undefined;// [3];
        var makeId = 1;
        var year = '2014';
        var yrIds = [2];
        var modelId = 12;
        var bodyId = 3;
        var trimId = 44;
        var carId = 860;
        var ptrnId=2927;
        var intColId = 10; //ash
        var custId = 5753;
        var itemId = 329792;
*/
var attachment = function (request, response) {
        
        function errHtml(msg) {
                nlapiLogExecution('ERROR', msg, msg);
                response.setContentType('PLAINTEXT', 'attachErr.txt', 'inline');
                response.write( msg );
        };

        var record = request.getParameter('record');
        var id = request.getParameter('id');
        var name = request.getParameter('name');
        var folder = request.getParameter('folder');
        var filename = request.getParameter('filename');
        var filetype = request.getParameter('filetype');
        
        var attach;             

        if (record) {
                var attachs = recordAttchs(record, id, name, folder, filename, filetype);
                if (Array.isArray(attachs)) {
                        attach = attachs[0];
                } else {
                        errHtml(attachs);
                        return;
                };
        } else {
                errHtml('missing "record" parameters');
                return;
        };
        
        writeFile(response, attach.id);
};

var file = function (request, response) {
        var fileid = request.getParameter('id');
        var filepath = request.getParameter('path');
        if (fileid) {
                writeFile(response, fileid);
        } else if (filepath) {
                writeFile(response, filepath);
        } else {
                response.setContentType('PLAINTEXT', 'fileErr.txt', 'inline');
                response.write( 'missing "id", or "path" parameters' );
        };
};

function writeFile(response, id) {
        var file = nlapiLoadFile(id);
        if (file) { 
                response.setContentType(file.getType(), file.getName(), 'inline');
                response.write( file.getValue() ); 
        } else {
                response.setContentType('PLAINTEXT', 'err.txt', 'inline');
                response.write( 'no file returned for id "'+id+'"' );
        };
};

function recordAttchs(record, id, name, folder, filename, filetype) {
        var recordId; 
        
        switch(record){
        case 'pattern': recordId = 'customrecord_leather_pattern'; break;
        default: 
                return 'invalid record parameter "'+ record +'"';
                break;
        };
        
        if ((!id) && (!name)){
                return 'missing "id" and "name" parameter';
        }
        
        var key;
        var filts = [];
        if (id) {
                key = id;
                filts.push( new nlobjSearchFilter('internalid', null, 'is', id) );
        } else if (name) {
                key = name;
                filts.push( new nlobjSearchFilter('name', null, 'is', name) );
        };

        var records = nlapiSearchRecord(recordId, null, filts,
        [        new nlobjSearchColumn('internalid', 'file'),
                new nlobjSearchColumn('name', 'file'),
                new nlobjSearchColumn('folder', 'file'),
                new nlobjSearchColumn('filetype', 'file'),
        ]);     
        
        if ((!records) || (records.length < 1)) {
                return 'no attachemnts for "' + record + '" "' + key +'"' ;
        };

        var attachs = jPw.map(records, function () {
                var attch = {
                                id: this.getValue('internalid', 'file'),
                                folder: this.getText('folder', 'file'),
                                filename: this.getValue('name', 'file'),
                                filetype: this.getValue('filetype', 'file')
                };
                
                if ( ((!folder) || (folder == attch.folder))
                && ((!filename) || (filename == attch.filename))
                && ((!filetype) || (filetype == attch.filetype)) ) {
                        return attch;
                }
        });
        
        if (attachs.length < 1) {
                return 'no attachemnts for folder "' + folder + '" ", filename "' + filename + '" ", filetype "' + filetype +'"' ;
        };
        
        return attachs;
};

var activeEbayListings = function (request, response) {

        //jPw.jsonResponse( request, response, {printDate: date.toISOString()} );       
        //return;    
        
        var api = jPw.apiet.makeActiveListingsRequest(jPw.apiet.makeEnvSandBox());
        //var x = api.callApiXmlStr();
    //response.setContentType('XMLDOC');
    //response.write( x );
    //return;
        
        api.callApiCallback( 
                function(obj){
                        //var items = [];
                        
                        var list = nlapiCreateList('Active eBay Listings');
                    list.setStyle('grid');
                     
                        list.addColumn('row', 'text', 'row');
                        list.addColumn('partno', 'text', 'part #').setURL('item_url', true);
                        list.addColumn('title', 'text', 'title');
                        list.addColumn('ebayitemid', 'text', 'eBay ID').setURL('listing_url', true);
                        list.addColumn('price', 'text', 'price');
                        
                        var node;
                        var itemNodes = nlapiSelectNodes(obj.respXmlObj, '//nlapi:Item');
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
                        //jPw.jsonResponse( request, response, {count: items.length,  items: items} );
                }, 
                function(obj){ jPw.jsonResponse( request, response, {result: 'warn'} );},
                function(obj){ jPw.jsonResponse( request, response, {result: 'fail'} );}
        );      

};

var testAddItem = function (request, response) {
/*      
        var api = jPw.apiet.makeGetItemRequest(jPw.apiet.makeEnvSandBox());
    var viewItemURL = api.retrieveUrlForItemId("110127617612");
        jPw.jsonResponse( request, response, {viewItemURL: viewItemURL} );      
return;    
*/    
        var internalId = 246145 ;
        
        var baseSearch = jPw.parts.getLeaKitSearch([3]);
        baseSearch.addFilt(new nlobjSearchFilter('internalid', null, 'is', internalId));
        var search = jPw.parts.getEbayPartsSearch(baseSearch);
        
        var parts = jPw.parts.eBayPartsList(search, false, 1);
        var part = parts[0];
        
        var addItemReq = loadLeaReq(part);

    addItemReq.setRequestProp("WarningLevel", "High");
        
    var eBayResp = addItemReq.callApi();        
    var xml = eBayResp.getBody();

    var xmlObj = nlapiStringToXML(xml);
    var ack = nlapiSelectValue(xmlObj, '//nlapi:Ack');
    
    if ((ack == 'Success') || (ack == 'Warning')) {
        var correlationId = nlapiSelectValue(xmlObj, '//nlapi:CorrelationID');
        var eBayItemId = nlapiSelectValue(xmlObj, '//nlapi:ItemID');
        var eBaySku = nlapiSelectValue(xmlObj, '//nlapi:SKU');
        
                nlapiSubmitField('serializedinventoryitem', internalId, 'custitem_ebay_listing_id', eBayItemId);

                var api = jPw.apiet.makeGetItemRequest(jPw.apiet.makeEnvSandBox());
            var viewItemURL = api.retrieveUrlForItemId(eBayItemId);

                nlapiSubmitField('serializedinventoryitem', internalId, 'custitem_ebay_listing_url', viewItemURL);
                
        jPw.jsonResponse( request, response, {
                ack: ack,
                eBaySku: eBaySku,
                eBayItemId: eBayItemId,
                correlationId: correlationId,
                internalId: internalId,
                viewItemURL: viewItemURL
        });
        return;
        
    } else if (ack == 'Failure') {
        var errs = nlapiSelectNodes(xmlObj, '//nlapi:Errors');
        var msg = nlapiSelectValue(errs[0], '//nlapi:ShortMessage');            
        jPw.jsonResponse( request, response, {failure: msg} );
        return;
    };

    //var xml = addItemReq.getXmlEncode();
    response.setContentType('XMLDOC');
    response.write( xml ); 
        //jPw.jsonResponse( request, response, {count: parts.length, parts: parts} );   
};

function loadLeaReq(part) {
        var addItemReq = jPw.apiet.makeLeatherItemRequest();

        addItemReq.setPartNo(part.base_part);
    addItemReq.setNsItemId(part.item_id);

        addItemReq.setTitle(part.descr);
        addItemReq.setItemProp("SubTitle", part.slctr_descr);

        var descr = '';
         
        if ((part.cars) && (part.cars.length > 0)) {
                descr = descr +'<H4>This part is compatible with '+part.cars.length+' vehicle(s)</H4>';
                descr = descr +'<table width="100%" cellspacing="0" style="background-color:#FFFFFF" id="v4-27ctbl" class="fTbl"><tbody>'
                        +'<tr>'+'<td>Year</td><td>Make</td><td>Model</td><td>Body</td><td>Trim</td>'+'</tr>';
                
                for (var i = 0; i < part.cars.length; i++) {
                        var car = part.cars[i];
                        descr = descr +
                        '<tr>'
                        +'<td>'+car.year+'</td>'
                        +'<td>'+car.make+'</td>'
                        +'<td>'+car.model+'</td>'
                        +'<td>'+car.body+'</td>'
                        +'<td>'+car.trim+'</td>'
                        +'</tr>';
                };

                descr = descr +'</tbody></table>';
        };
        
        descr = descr +'<H1>'+part.descr+'</H1><H2>'+part.color+'</H2>'
        +'<div><img src="'+part.color_url+'" border="0" alt="001 Black" title="001 Black"></div>';  
        
        addItemReq.setItemPropCdata("Description", descr);

        addItemReq.setItemProp("Quantity", "10");
        addItemReq.setStartPrice(part.price);

        //addItemReq.setItemProp("PrivateNotes", "PrivateNotes");

        //PictureDetails
        addItemReq.addPictureURL("http://i.ebayimg.sandbox.ebay.com/00/s/MjQwWDI0MA==/$(KGrHqNHJC8FFk2)zBI6BSbl5QUvGg~~60_35.JPG");
    addItemReq.addPictureURL("http://i.ebayimg.sandbox.ebay.com/00/s/MzI2WDc2MQ==/$(KGrHqJHJBoFJfTMphHHBSbl7,MQO!~~60_12.JPG");

        //ItemSpecifics
        addItemReq.addItemSpecific("Leather Color", part.color);
        addItemReq.addItemSpecific("Rows", part.rows);
        addItemReq.addItemSpecific("Airbags", part.airbags);
        addItemReq.addItemSpecific("Surface Finish", part.insert_style);
        
        if ((part.ns_part) && (part.base_part != part.ns_part)) {
                addItemReq.addItemSpecific("Other Part Number", part.ns_part);
        };
        
    //ItemCompatibilityList
        /*
        addItemReq.addCompatMkYrMdTr("Toyota","2013","Camry","Hybrid LE Sedan 4-Door");
        addItemReq.setStoreCategoryID("580036");
        addItemReq.setStoreCategory2ID("580035");

        */
        return addItemReq;
};

var addEbayLeaListing = function (request, response) {

        var addItemReq = jPw.apiet.makeLeatherItemRequest(jPw.apiet.makeEnvSandBox());

        addItemReq.setPartNo("545865");
    addItemReq.setNsItemId("206574");

        addItemReq.setTitle("Leather Seats for Toyota 07-11 Camry Hybrid/LE/CE w/AB's Smooth Q");
        addItemReq.setItemProp("SubTitle", "HYBRID/LE/CE (Factory Smooth)");
        addItemReq.setItemPropCdata("Description", "<H1>Leather Seats for Toyota 07-11 Camry Hybrid/LE/CE w/AB's Smooth Q</H1><H2>092 Stone</H2>");
        addItemReq.setItemProp("Quantity", "10");
        addItemReq.setStartPrice("1299.0");

        //addItemReq.setItemProp("PrivateNotes", "PrivateNotes");

        //PictureDetails
        addItemReq.addPictureURL("http://i.ebayimg.sandbox.ebay.com/00/s/MjQwWDI0MA==/$(KGrHqNHJC8FFk2)zBI6BSbl5QUvGg~~60_35.JPG");
    addItemReq.addPictureURL("http://i.ebayimg.sandbox.ebay.com/00/s/MzI2WDc2MQ==/$(KGrHqJHJBoFJfTMphHHBSbl7,MQO!~~60_12.JPG");

        //ItemSpecifics
        addItemReq.addItemSpecific("Leather Color", "092 Stone");
        addItemReq.addItemSpecific("Rows","2");
        addItemReq.addItemSpecific("Airbags","Side Airbags");
        addItemReq.addItemSpecific("Surface Finish","Smooth");
        
        addItemReq.addItemSpecific("Other Part Number","545865-HV");
        
    //ItemCompatibilityList
        /*
        addItemReq.addCompatMkYrMdTr("Toyota","2013","Camry","Hybrid LE Sedan 4-Door");
        addItemReq.addCompatMkYrMdTr('Toyota', '2010', 'Camry', 'Hybrid Sedan 4-Door');
        addItemReq.addCompatMkYrMdTr('Toyota', '2013', 'Camry', 'L Sedan 4-Door');

        addItemReq.setStoreCategoryID("580036");
        addItemReq.setStoreCategory2ID("580035");

        */

    addItemReq.AddFixedPriceItemRequest.WarningLevel = "High";
        
    var eBayResp = addItemReq.callApi();        
    var xml = eBayResp.getBody();
        
        //var xml = addItemReq.getXmlEncode();

    response.setContentType('XMLDOC');
    response.write( xml ); 
};

var eBayFitment = function (request, response) {
        var url = 'http://svcs.ebay.com/services/marketplacecatalog/ProductMetadataService/v1';

    var headers = new Array();
    headers['X-EBAY-SOA-OPERATION-NAME'] = 'getCompatibilitySearchValuesBulk';
    headers['X-EBAY-SOA-SERVICE-VERSION'] = '1.3.0';
        headers['X-EBAY-SOA-SECURITY-APPNAME'] = 'Roadwire-36ca-46dd-ac36-2e3a7ba40080';
        headers['X-EBAY-SOA-GLOBAL-ID'] = 'EBAY-MOTOR';
        headers['X-EBAY-SOA-RESPONSE-DATA-FORMAT'] = 'JSON';
    
        var payload = '<?xml version="1.0" encoding="UTF-8"?>'+
        '<getCompatibilitySearchValuesBulkRequest xmlns="http://www.ebay.com/marketplace/marketplacecatalog/v1/services">'+
        '   <categoryId>33707</categoryId>'+
/*
        '   <propertyFilter>'+
        '      <propertyName>Make</propertyName>'+
        '      <value>'+
        '         <text>'+
        '            <value>Honda</value>'+
        '         </text>'+
        '      </value>'+
        '   </propertyFilter>'+

        '   <propertyFilter>'+
        '      <propertyName>Year</propertyName>'+
        '      <value>'+
        '         <text>'+
        '            <value>2012</value>'+
        '         </text>'+
        '      </value>'+
        '   </propertyFilter>'+

        '   <propertyFilter>'+
        '      <propertyName>Model</propertyName>'+
        '      <value>'+
        '         <text>'+
        '            <value>Accord</value>'+
        '         </text>'+
        '      </value>'+
        '   </propertyFilter>'+
*/      
//      '   <propertyName>Make</propertyName>'+
        '   <propertyName>Year</propertyName>'+
//      '   <propertyName>Model</propertyName>'+
//      '   <propertyName>Body</propertyName>'+
//      '   <propertyName>Submodel</propertyName>'+
//      '   <propertyName>Trim</propertyName>'+

        '</getCompatibilitySearchValuesBulkRequest>';   
        
    var eBayResp = nlapiRequestURL( url, payload, headers );    
    
    var body = eBayResp.getBody();
    //var responseXML = nlapiStringToXML(body);

        response.setContentType('JSON');
    //response.setContentType('XMLDOC');
    response.write( body ); 
};


function ebaycolors(request, response)
{
        var sysDom = jPw.getSysUrlDomain();
        
        var list = nlapiCreateList('Simple List');
    list.setStyle('grid');
     
        list.addColumn('row', 'text', 'row');
        var column = list.addColumn('name', 'text', 'part no')
                .setURL('item_url', true);
        
        list.addColumn('item_url', 'text', 'item_url');
        list.addColumn('description', 'text', 'description');
    list.addColumn('color', 'text', 'color');
    list.addColumn('image', 'image', 'image')
        .setURL('img_url', true);
    list.addColumn('swatch', 'image', 'swatch')
                .setURL('thumb_url', true);
        
        var baseSearch = jPw.parts.getLeaKitSearch([3]);
        var search = jPw.parts.getEbayPartsSearch(baseSearch);
        var parts = jPw.parts.eBayPartsList(search, true, 1000);

        var part;
        jPw.each(parts, function(index, part) {
                list.addRow({
                        row: parseInt(index)+1,
                        item_id: part.item_id,
                name: part.part_no,
                description: part.descr,
                color: part.color,
                image: part.img_url, // 'http://i.ebayimg.com/00/s/MTAwWDIyNA==/z/dEQAAOxyVLNSp4qk/$_1.JPG?set_id=8800004005', //
                img_url: part.img_url,
                item_url: jPw.getSysUrlDomain() + '/app/common/item/item.nl?itemtype=InvtPart&id=' + part.item_id,
                swatch: part.thumb_url,
                thumb_url: part.thumb_url
            });
        });
        
     //list.addRows( results );
 
     response.writePage( list );
};

function ebayPartsFile(request, response)
{
        var type = 'ebay';
                
        var url = jPw.getRestUrl('customscript_jpw_test_restlet','customdeploy_jpw_test_restlet'); 

        var cred = getCredentials();
        //Setting up Headers 
        var headers = new Array();
        headers['User-Agent-x'] = 'SuiteScript-Call';
        headers['Authorization'] = 'NLAuth nlauth_account='+cred.account+', nlauth_email='+cred.email+', nlauth_signature='+cred.password+', nlauth_role='+cred.role;
        headers['Content-Type'] = 'application/json';   
        //headers['Content-Type'] = 'text/plain';
        
        if (type) {
                url = url + '&type=' + (type);
        };
        
        var restResp = nlapiRequestURL( url, null , headers, 'GET');
        
        //var responsebody = restResp.getBody();
        var rows = JSON.parse(restResp.getBody());
        
        var row = rows[0];

        var titles = [];
        for (var col in row) {
            if (row.hasOwnProperty(col)) {
                titles.push(col);
            }
        };
        var titleRow = '"' + titles.join('","') +'"';
        
        var file = titleRow; 
        
        var vals;
        jPw.each(rows, function() {
                row = this;
                vals = [];
                for (var i = 0, len = titles.length; i < len; i++) {
                        vals.push( '"'+row[titles[i]]+'"' );
                };
                file = file + '\r\n' + vals.join(',');
        });

        //response.write(file);
        
        response.setContentType('CSV', 'NetSuiteExport.csv', 'attachment');
        response.writeLine(file);       
};

function demoList(request, response)
{
     var list = nlapiCreateList('Simple Listx', false);
 
     // You can set the style of the list to grid, report, plain, or normal, or you can get the
    // default list style that users currently have specified in their accounts.
     list.setStyle(request.getParameter('style'));
     
     var column = list.addColumn('number', 'text', 'Numberx', 'left');
     column.setURL(nlapiResolveURL('RECORD','salesorder'));
     column.addParamToURL('idq','salesrep', true);
 
     list.addColumn('trandate', 'date', 'Date', 'left');
     list.addColumn('name_display', 'text', 'Customer', 'left');
     list.addColumn('salesrep_display', 'text', 'Sales Rep', 'left');
     list.addColumn('amount', 'currency', 'Amount', 'right');
 
     var returncols = new Array();
     returncols[0] = new nlobjSearchColumn('trandate');
     returncols[1] = new nlobjSearchColumn('number');
     returncols[2] = new nlobjSearchColumn('name');
     returncols[3] = new nlobjSearchColumn('salesrep');
     returncols[4] = new nlobjSearchColumn('amount');
 
     var results = nlapiSearchRecord('estimate', null, new nlobjSearchFilter('mainline',null,'is','T'), returncols);
     
     list.addRows( results );
 
     list.addPageLink('crosslink', 'Create Phone Call', nlapiResolveURL('TASKLINK','EDIT_CALL'));
     list.addPageLink('crosslink', 'Create Sales Order',
        nlapiResolveURL('TASKLINK','EDIT_TRAN_SALESORD'));
 
     list.addButton('custombutton', 'Simple Button', alert('Hello World'));
     response.writePage( list );
};

// Add CST Bins for CST Locations
var bins = function () {
        var clscName = 'Classic Soft Trim';
        var unavailLocName = '550 - Inventory Cleanup';  // 'Unavailable - CST';
        var cleanupBranch = '550';
        var unavailSufx = '-Unavailable';
        var returnSufx = '-Returned';

        var addBins = [];
        
        var sub = nlapiSearchRecord('subsidiary', null,
                [ new nlobjSearchFilter('namenohierarchy', null, 'is', clscName)],      
                [new nlobjSearchColumn('namenohierarchy')]);
        
        
        if ((!sub) || (sub.length < 0)) {
                nlapiLogExecution('ERROR', 'Subsidiary Search Error ', 'No subsidiaries with name containing "'+clscName+'" were found.'); 
                return 'Subsidiary Search Error ';
        }

        var clscId = sub[0].getId();

        
        var searchCstLocs = function() {
                return nlapiSearchRecord('Location', null,
                        [new nlobjSearchFilter('subsidiary', null, 'anyof', [clscId] )],
                        [
                         new nlobjSearchColumn('namenohierarchy').setSort(false),
                         new nlobjSearchColumn('externalid'),
                         new nlobjSearchColumn('makeinventoryavailable')
                         ]);
        };

        var cstLocs = searchCstLocs(); 
        
        if ((!cstLocs) || (cstLocs.length < 0)) {
                nlapiLogExecution('ERROR', 'Location Search Error ', 'No locations found for subsidiary id '+clscId+'.'); 
                return 'Location Search Error ';
        };
        
        var locIds = [];
        var locList = [];
        var unavailLocIdx;
        var locid, locname;
        for (var i = 0; i < cstLocs.length; i++) {
                locid = cstLocs[i].getId();
                locname = cstLocs[i].getValue('namenohierarchy');

                locIds.push(locid);
         
                if (locname === unavailLocName) {
                        unavailLocIdx = locList.length;
                };
                locList.push({
                        id: locid,
                        name: locname,
                        branchNum: cstLocs[i].getValue('externalid'),
                        invAvail: (cstLocs[i].getValue('makeinventoryavailable') === 'T')
                });
        };

        var searchBins = function(locIds) {
                return nlapiSearchRecord('bin', null,
                        [ new nlobjSearchFilter('location', null, 'anyof', locIds)],
                        [
                         new nlobjSearchColumn('binnumber'),
                         new nlobjSearchColumn('location').setSort( false ),
                         ]
                 );
        };
        
        var binSearch = searchBins(locIds); 
        
        //addBins.push({usage: nlapiGetContext().getRemainingUsage()});
        //for (var i = 0; ((!!binSearch) && (i < binSearch.length)); i++) {
        //      nlapiDeleteRecord(binSearch[i].getRecordType(), binSearch[i].getId());
        //      addBins.push({usage: nlapiGetContext().getRemainingUsage()});
        //};
        //return addBins;
        
        var bins = [];
        for (var i = 0; ((!!binSearch) && (i < binSearch.length)); i++) {
                 bins.push({
                        id: binSearch[i].getId(), 
                        number: binSearch[i].getValue('binnumber').toString(),
                        locId: binSearch[i].getValue('location')
                });
        };

        var unavailLoc;
        if (unavailLocIdx) {
                unavailLoc = locList[unavailLocIdx];
        };

        var recordMissingBin = function(locId, binNumber) {
                var idx = jPw.indexOfEval(bins, function(bin){
                        return (bin.locId === locId) && (bin.number === binNumber);
                });
                if (idx === -1) {  // have to add this bin
                         addBins.push({
                                locId: locId,
                                binNumber: binNumber
                        });
                };
        };

        for (var i = 0; i < locList.length; i++) {

                //addBins.push({usage: nlapiGetContext().getRemainingUsage()});
                
                var loc = locList[i];
                
                if ((!loc.invAvail) || (!loc.branchNum)) { 
                        continue;
                };
                
                recordMissingBin(loc.id, loc.branchNum);
                
                if (unavailLoc) {
                        if (unavailLoc.id != loc.id) {
                                recordMissingBin(unavailLoc.id, loc.branchNum + unavailSufx);
                                recordMissingBin(unavailLoc.id, loc.branchNum + returnSufx);
                        };
                };
                
        };

        for (var i = 0; i < addBins.length; i++) {
                var binRec = nlapiCreateRecord('bin');
                binRec.setFieldValue('location', addBins[i].locId);
                binRec.setFieldValue('binnumber',  addBins[i].binNumber);
                var id = nlapiSubmitRecord(binRec, true);
        };
        
        //addBins.push({usage: nlapiGetContext().getRemainingUsage()});
        
        // re-query what's there and report it 
        cstLocs = searchCstLocs(); 

        var branchNum, invAvail, binNum, binId;
        var locStr = "";
        var binStr = "";
        var unavailBinStr = "", unavailBinId;
        var cleanupLocId, cleanupBinId;
        var unavailLocId;
        
        for (var i = 0; i < cstLocs.length; i++) {
                locid = cstLocs[i].getId();
                locname = cstLocs[i].getValue('namenohierarchy');
                branchNum = cstLocs[i].getValue('externalid');
                invAvail = (cstLocs[i].getValue('makeinventoryavailable') === 'T');

                if (locname === unavailLocName) {
                        unavailLocId = locid;
                        
                        var binSearch = searchBins([unavailLocId]);
                        if (!!binSearch)  {
                                for (var ii = 0; ii < binSearch.length; ii++) {
                                        binNum =  binSearch[ii].getValue('binnumber').toString();
                                        binId = binSearch[ii].getId();
                                        
                                        var idx = binNum.indexOf(unavailSufx);
                                        if (idx != -1) {
                                                var branchId = binNum.substring(0,idx).trim();
                                                unavailBinStr = unavailBinStr +  " WHEN '"+branchId+"' THEN " + binId;
                                        };
                                        
                                };
                        };
                        
                };
                if ((branchNum) && invAvail) {
                        locStr = locStr +  " WHEN '"+branchNum+"' THEN " + locid ;

                        if (branchNum == cleanupBranch) {
                                cleanupLocId = locid;
                        };
                        
                        var binSearch = searchBins([locid]);
                        if (!!binSearch)  {
                                for (var ii = 0; ii < binSearch.length; ii++) {
                                        binNum =  binSearch[ii].getValue('binnumber').toString();
                                        binId = binSearch[ii].getId();
                                        if (branchNum == cleanupBranch) {
                                                cleanupBinId = binId;
                                        };
                                        if (binNum == branchNum) {
                                                break;
                                        };
                                
                                };
                        };
                        if (binId) {
                                binStr = binStr +  " WHEN '"+branchNum+"' THEN " + binId;
                        };
                };
        
        };
        
        if (cleanupLocId) {
                locStr = locStr +  " ELSE " + cleanupLocId ;
        };
        if (cleanupBinId) {
                binStr = binStr +  " ELSE " + cleanupBinId ;
                unavailBinStr = unavailBinStr  +  " ELSE " + cleanupBinId ;
        };

        addBins.push({usage: nlapiGetContext().getRemainingUsage()});   
        
        return {addBins: addBins, locStr: locStr, binStr: binStr, unavailLocId: unavailLocId, unavailBinStr: unavailBinStr};
};

var testList = function (maxItems) {
        var list = [];
        
        var partsResSet = jPw.parts.bestSelResSet();
        jPw.loopResSet(partsResSet,
                function(part) {
                        list.push(part);
                },
                null, 
                maxItems
        );
        
        return list;
};

function getCredentials()
{
    return {
        account: nlapiGetContext().getCompany(),
        email: 'james.white@classicsofttrim.com', //nlapiGetContext().getEmail(),
        password: 'Eleven)h139th',
        role: '3'
    };
}

var getTestRestletResponse = function (type) {
        var url = jPw.getRestUrl('customscript_jpw_test_restlet','customdeploy_jpw_test_restlet'); 
        var jsonobj={"record_type":"inventoryitem??u","internalid":"324745"};
        var myJSONText = jPw.Stringify(jsonobj);

        var cred = getCredentials();
        //Setting up Headers 
        var headers = new Array();
        headers['User-Agent-x'] = 'SuiteScript-Call';
        headers['Authorization'] = 'NLAuth nlauth_account='+cred.account+', nlauth_email='+cred.email+', nlauth_signature='+cred.password+', nlauth_role='+cred.role;
        //Cookie: 'JSESSIONID=7nZ2SJmSGfXKPYH1VQn3P15759KYRdt1hdnFVpnLNqvq1hTrwGf27vYfpLzyyX6wDL2nQZTZ22QW6NQs6gsjV1cpyJX49h2K8yNQTYY7TvLJ6gDT5hL0GjrTJ35LXMfR!1943585314';
        headers['Content-Type'] = 'application/json';   
        
        if (type) {
                url = url + '&type=' + (type);
        };
        
        return nlapiRequestURL( url, null , headers, 'GET');    
};

var testRest = function (request, response, type) {
        var restResp = getTestRestletResponse(type);
        
        var responsebody = {}; 
        //responsebody = JSON.parse(restResp.getBody());
        responsebody = restResp.getBody();
        response.write(responsebody);
/*      
        jPw.jsonResponse( request, response, jPw.okResult(
                {
                        responsebody: responsebody,
                }
        ) );
*/
};

function Schedule(type) {
        //if ( type != 'scheduled' ) return; /* script should only execute during scheduled calls. */

        var context = nlapiGetContext();
        var srchId = context.getSetting('SCRIPT', 'custscript_search');
        var ctlgId = context.getSetting('SCRIPT', 'custscript_prod_ctlg');
        
        var srchRes = nlapiSearchRecord('SavedSearch', null, 
                        [new nlobjSearchFilter('internalid', null, 'is', srchId)],[new nlobjSearchColumn('title'), new nlobjSearchColumn('recordtype')]);
        
        if ((!srchRes) || (srchRes.length < 0)) {return;};
        
        var recType = srchRes[0].getValue('recordtype');

        var srcSvdSrch = nlapiLoadSearch(recType, srchId);
        
        var srchCols = srcSvdSrch.getColumns();

        var ctlgFldId;
        var cltgIdx = jPw.indexOfEval(srchCols, function (col) {
                return (col.getLabel() == 'Product Catalog');
        });
        if (cltgIdx !== -1) {
                ctlgFldId = srchCols[cltgIdx].getName();
        } else {
                ctlgFldId = 'custitem_item_prod_ctlg';
        };
        srcSvdSrch.addFilter(new nlobjSearchFilter(ctlgFldId, null, 'noneof', [ctlgId]));
        jPw.ensureSrchCol(srcSvdSrch, ctlgFldId);
        jPw.ensureSubmitTypeResults(srcSvdSrch);

        // clear out the current catalog
        var curCtlgSrch = nlapiCreateSearch(recType, 
                        [new nlobjSearchFilter(ctlgFldId, null, 'anyof', [ctlgId])],
                        [new nlobjSearchColumn(ctlgFldId)]
                );
        jPw.ensureSubmitTypeResults(curCtlgSrch);
        
        var curCtlgResSet = curCtlgSrch.runSearch();
        jPw.loopResSet(curCtlgResSet, function(record) {
                var recId = record.getId();
                var ctlgStr = record.getValue(ctlgFldId);
                if (ctlgStr) {
                        var ctlgIds = ctlgStr.split(',');
                        var delIdx = ctlgIds.indexOf(ctlgId);
                        if (delIdx !== -1) {
                                ctlgIds.splice(delIdx, 1);
                                var submitType = jPw.getInputTypeId(record);
                                nlapiSubmitField(submitType, recId, ctlgFldId, ctlgIds);
                                var xREMAINING = nlapiGetContext().getRemainingUsage();
                        };
                };              
        });//, null, 10);
        
        // start setting the catalog for each record returned by the saved search
        var srcResSet = srcSvdSrch.runSearch();

        jPw.loopResSet(srcResSet, function(record) {
                var recId = record.getId();
        
                var ctlgIds;
                var ctlgStr = record.getValue(ctlgFldId);
                if (ctlgStr) {
                        ctlgIds = ctlgStr.split(',');
                } else {
                        ctlgIds = [];
                };
                ctlgIds.push(ctlgId);
                var submitType = jPw.getInputTypeId(record);
                nlapiSubmitField(submitType, recId, ctlgFldId, ctlgIds);
                REMAINING = nlapiGetContext().getRemainingUsage();
        });//, null, 10);
        
        //var q = 'q';
};

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
        
        var type = request.getParameter('type');
        switch(type){
                case 'test': test(request, response); break;
                case 'attachment': attachment(request, response); break;
                case 'file': file(request, response); break;
                case 'ebaycolors': ebaycolors( request, response);      break;
                case 'ebay': ebayPartsFile( request, response); break;
                case 'list': demoList( request, response);      break;
                case 'bins': jPw.jsonResponse( request, response, bins() );     break;
                case 'ajax':
                        var restResp = nlapiRequestURL( 'http://www.roadwire.biz/selector/makes', null , null, 'GET');  
                        var responsebody = JSON.parse(restResp.getBody()); 
                        jPw.jsonResponse( request, response, jPw.okResult({responsebody: responsebody}));
                break;
                case 'testrest': testRest(request, response, 'ebay');   break;
                case 'bestSellers': 
                        var list = jPw.parts.bestSellerList(10);
                        jPw.jsonResponse( request, response, jPw.okResult({count: list.length, list: list}) );
                break;
                case 'bestSellerDenormal': 
                        var list = jPw.parts.bestSellerDenormal(100);
                        jPw.jsonResponse( request, response, jPw.okResult({count: list.length, list: list}) );
                break;
                default: 
                        nlapiLogExecution('ERROR', 'invalid type parameter', type);
                        jPw.jsonResponse( request, response, jPw.errResult("invalid type parameter: '" + type +"'") );
                break;
        };
        
}