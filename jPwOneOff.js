/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Nov 2013     james.white
 *
 */
(function(jPw) {
	jPw.indexOfEval = function (arr, fcn) {
		for (var i = 0, len = arr.length; i < len; i++) {
			if (fcn(arr[i])) {
				return i;
			};
		};
		return -1;
	};

	jPw.bins = function () {
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
	
}( this.jPw = this.jPw || {}));
	
(function(jPw) {
	var getEbayCtlgId = function() {
		var results = nlapiSearchRecord('customlist_product_catalog', null, 
			[ new nlobjSearchFilter('name', null, 'is', 'eBay Listings')], 
			[ new nlobjSearchColumn('name')]);
		return results[0].getId();
	};	

	jPw.Catalog = function() {

		var results = nlapiSearchRecord('customlist_product_catalog', null, 
				[ ], 
				[ new nlobjSearchColumn('name')]);

		var out = 'Product Catalog';
		for (var i = 0; i < results.length; i++) {
			out = out + '\n' +'id: '+results[i].getId()+ ' name: '+ results[i].getValue('name');
		};	
		
		out = out + '\n' + 'eBay id is - ' + getEbayCtlgId(); 
		return out;
	};
}( this.jPw = this.jPw || {}));
	
(function(jPw) {
/*
 	var mpartno;
	var id;
	var results = 'ISIS M Kit Import Results';
	for (var i = 0; i < jPw.isisMkits.length; i++) {
		mpartno = jPw.isisMkits[i];
		try {
			id = jPw.CopyMKit(mpartno);
			if (id) {
				results = results + '\n' + mpartno +' new item id: '+id;
			} else {
				results = results + '\n' + mpartno +' Failed' ;
			}
		} catch (e) {
			results = results + '\n' +mpartno +' Failed - '+ e + '\n';
		}
		
	};

*/
	jPw.isisMkits = [
		'M587633',
		'M535610',
		'M599697',
		'M603266',
		'M611576',
		'M595823',
		'M595848',
		'M612925',
		'M545865',
		'M595843',
		'M598968',
		'M587639',
		'M595816',
		'M603560',
		'M603564',
		'M603285',
		'M598954',
		'M611584',
		'M592688',
		'M610231',
		'M602135',
		'M610413',
		'M610196',
		'M569560',
		'M599614',
		'M521062',
		'M535618',
		'M592687',
		'M612895',
		'M602133',
		'M618328',
		'M618926',
		'M613301',
		'M613276'];

	jPw.CopyMKit = function(mpartno) {
		var itemname = mpartno.substring(1,10);

		var items = nlapiSearchRecord('item', null, 
			[new nlobjSearchFilter('itemid', null, 'is', itemname)],
			[new nlobjSearchColumn('custitem_leather_pattern'), 
			new nlobjSearchColumn('custitem_leather_color'),
			new nlobjSearchColumn('custitem_carpet')]);

		if ((!items) || (items.length < 1)) {return null;}

		var regItem = items[0];
		var ptrnId = regItem.getValue('custitem_leather_pattern');
		var colorId = regItem.getValue('custitem_leather_color');
		var carpetId = regItem.getValue('custitem_carpet');


		items = nlapiSearchRecord('item', null, 
		[
		new nlobjSearchFilter('custitem_leather_pattern', null, 'is', ptrnId),
		new nlobjSearchFilter('custitem_parent_item', null, 'is', 'F'),
		new nlobjSearchFilter('matrixchild', null, 'is', 'F')
		],
		[new nlobjSearchColumn('custitem_leather_kit_type')]);

		if ((!items) || (items.length < 1)) {return null;}

		var srcItem = items[0];
		var srcId = srcItem.getId();

		var record = nlapiCopyRecord('serializedinventoryitem', srcId);

		record.setFieldValue('itemid', mpartno);
		record.setFieldValue('custitem_leather_color', colorId);
		record.setFieldValue('custitem_carpet', carpetId);

		var salesdescription = record.getFieldValue('salesdescription');
		record.setFieldValue('salesdescription', 'DIFFERENT GRADE - '+salesdescription);

		var purchasedescription = record.getFieldValue('purchasedescription');
		var idx = purchasedescription.indexOf('(Q');
		if (idx > -1) {
			purchasedescription = purchasedescription.substring(0, idx) + '(M-Kit)';
		};
		record.setFieldValue('purchasedescription', purchasedescription );
		record.setFieldValue('custitem_leather_kit_type', 1);
		record.setFieldValue('custitem_product_note', 'M-Kit');

		record.setFieldValue('isonline', 'T');
		record.setFieldValue('custitem_import_source', 'ISIS M Kits');

		var storedescription = record.getFieldValue('storedescription').replace('All Leather', 'M-Kit').replace('All Vinyl', 'M-Kit').replace('2 Tone', 'M-Kit').replace('3 Tone', 'M-Kit');
		record.setFieldValue('storedescription', storedescription);

		var storedetaileddescription = record.getFieldValue('storedetaileddescription').replace('All Leather', 'M-Kit').replace('All Vinyl', 'M-Kit').replace('2 Tone', 'M-Kit').replace('3 Tone', 'M-Kit');
		record.setFieldValue('storedetaileddescription', storedetaileddescription);

		return nlapiSubmitRecord(record, true);
	};
	
	
}( this.jPw = this.jPw || {}));


/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	//response.setContentType('PLAINTEXT', 'results.txt', 'inline');
	//response.write( jPw.Catalog() );
	
	var respObject = {testing: 'testing', tesin: 123}; //jPw.bins();
	var respStr = JSON.stringify(respObject);
	response.setContentType('JSON');
	response.write( respStr );
};
