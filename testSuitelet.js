/**
 * Module Description
 *
 */


var test = function (request, response) {
 	var ctlgs = undefined;// [3];
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

	//jPw.slctr.modelsResult(makeId, year)
	
	var yrIds = jPw.cars.getYrIds(year);
	
	//results = jPw.cars.getCarYrSearch(makeId, yrIds, ctlgs)
	//.addCol(new nlobjSearchColumn('custrecord_model'))
	//.addCol(new nlobjSearchColumn('name', 'custrecord_model'))
	//.results();
/*
	var search = jPw.SrchObj('customrecord_current_classic_car', 
			null, 
			[new nlobjSearchColumn('name').setSort( false )]
		)
		//.addFilt(new nlobjSearchFilter('internalid', 'custrecord_car_type', 'noneof', '@NONE@'))
		.addFilt(new nlobjSearchFilter('custrecord_make', null, 'is', makeId))
		.addFilt(new nlobjSearchFilter('custrecord_year', null, 'anyof', yrIds))
		
		.addCol(new nlobjSearchColumn('custrecord_model'))
		.addCol(new nlobjSearchColumn('name', 'custrecord_model'))

		;
*/	
	var items = nlapiSearchRecord('customrecord_current_classic_car', null, 
			[
			 new nlobjSearchFilter('custrecord_make', null, 'is', makeId),
			 //new nlobjSearchFilter('custrecord_year', null, 'anyof', yrIds),
			 new nlobjSearchFilter('custrecord_model', null, 'is', modelId),
			],
			[
			new nlobjSearchColumn('name').setSort( false ),
			new nlobjSearchColumn('custrecord_year'),
			new nlobjSearchColumn('custrecord_model'),
			new nlobjSearchColumn('name', 'custrecord_model'),
			]);	
	
	
	var results = items;//search.results();
	
	jPw.jsonResponse( request, response, {results: results} );
	
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
		function(xmlObj){
			//var items = [];
			
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
			//jPw.jsonResponse( request, response, {count: items.length,  items: items} );
		}, 
		function(xmlObj){ jPw.jsonResponse( request, response, {result: 'warn'} );},
		function(xmlObj){ jPw.jsonResponse( request, response, {result: 'fail'} );}
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
	
	addItemReq = loadLeaReq(part);

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
	var addItemReq = jPw.apiet.makeLeatherItemRequest(jPw.apiet.makeEnvSandBox());

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
/*    var url = 'https://api.sandbox.ebay.com/ws/api.dll';

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
*/
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
//	'   <propertyName>Make</propertyName>'+
	'   <propertyName>Year</propertyName>'+
//	'   <propertyName>Model</propertyName>'+
//	'   <propertyName>Body</propertyName>'+
//	'   <propertyName>Submodel</propertyName>'+
//	'   <propertyName>Trim</propertyName>'+

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
	    	image: part.img_url,
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
     var list = nlapiCreateList('Simple List');
 
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


var bins = function () {
	var clscName = 'Classic Soft Trim';
	var unavailLocName = 'Unavailable - CST';
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
	//	nlapiDeleteRecord(binSearch[i].getRecordType(), binSearch[i].getId());
	//	addBins.push({usage: nlapiGetContext().getRemainingUsage()});
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
			recordMissingBin(unavailLoc.id, loc.branchNum + unavailSufx);
			recordMissingBin(unavailLoc.id, loc.branchNum + returnSufx);
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
	var cleanupLocId, cleanupBinId;
	
	for (var i = 0; i < cstLocs.length; i++) {
		locid = cstLocs[i].getId();
		locname = cstLocs[i].getValue('namenohierarchy');
		branchNum = cstLocs[i].getValue('externalid');
		invAvail = (cstLocs[i].getValue('makeinventoryavailable') === 'T');

		if (locname === unavailLocName) {
			//unavailLocIdx = locList.length;
		} else if ((branchNum) && invAvail) {
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
	};

	addBins.push({usage: nlapiGetContext().getRemainingUsage()});	
	
	return {addBins: addBins, locStr: locStr, binStr: binStr};
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
		case 'ebaycolors': ebaycolors( request, response);	break;
		case 'ebay': ebayPartsFile( request, response);	break;
		case 'list': demoList( request, response);	break;
		case 'bins': jPw.jsonResponse( request, response, bins() );	break;
		case 'ajax':
			var restResp = nlapiRequestURL( 'http://www.roadwire.biz/selector/makes', null , null, 'GET');	
			var responsebody = JSON.parse(restResp.getBody()); 
			jPw.jsonResponse( request, response, jPw.okResult({responsebody: responsebody}));
		break;
		case 'testrest': testRest(request, response, 'ebay');	break;
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
