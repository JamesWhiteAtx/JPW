/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 Sep 2013     james.white
 *
 */

/**
 * @param {Object} dataIn Parameter object
 * @returns {Object} Output object
 */

/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 Sep 2013     james.white
 *
 */

var ebay = function () {
	var baseSearch = jPw.parts.getLeaKitSearch([3]);
	var list = jPw.parts.instNutsEbayList(baseSearch);
	
	return list;
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
			 new nlobjSearchColumn('location').setSort( false ),
			 new nlobjSearchColumn('binnumber').setSort(false)
			 ]
		 );
	};
	
	var binSearch = searchBins(locIds); 
	
	//addBins.push({usage: nlapiGetContext().getRemainingUsage()});
	//for (var i = 0; ((!!binSearch) && (i < binSearch.length)); i++) {
		//nlapiDeleteRecord(binSearch[i].getRecordType(), binSearch[i].getId());
		//addBins.push({usage: nlapiGetContext().getRemainingUsage()});
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

	var branchNum, invAvail, binNum, binId, unavailLocId, unIdx, unBr;
	var locStr = "";
	var binStr = "";
	var unBinStr = "";
	var cleanupLocId, cleanupBinId, uncleanBinId;
	
	for (var i = 0; i < cstLocs.length; i++) {
		locid = cstLocs[i].getId();
		locname = cstLocs[i].getValue('namenohierarchy');
		branchNum = cstLocs[i].getValue('externalid');
		invAvail = (cstLocs[i].getValue('makeinventoryavailable') === 'T');

		if (locname === unavailLocName) {
			unavailLocId = locid;
			binSearch = searchBins([unavailLocId]);
			if (!!binSearch)  {
				for (var ii = 0; ii < binSearch.length; ii++) {
					binNum =  binSearch[ii].getValue('binnumber').toString();
					unIdx = binNum.indexOf(unavailSufx);
					if (unIdx != -1) {
						unBr = binNum.substring(0, unIdx);
						binId = binSearch[ii].getId();
						unBinStr = unBinStr + " WHEN '"+unBr+"' THEN " + binId ; 

						if (unBr == cleanupBranch) {
							uncleanBinId = binId;
						};
					};
				};
			};
		} else if ((branchNum) && invAvail) {
			locStr = locStr +  " WHEN '"+branchNum+"' THEN " + locid ;

			if (branchNum == cleanupBranch) {
				cleanupLocId = locid;
			};
			
			binSearch = searchBins([locid]);
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
	if (uncleanBinId) {
		unBinStr = unBinStr + " ELSE " + uncleanBinId;
	};

	addBins.push({usage: nlapiGetContext().getRemainingUsage()});	
	
	return {addBins: addBins, locStr: locStr, binStr: binStr, unavailLocId: unavailLocId, unBinStr: unBinStr};
};


var testPostHandler = function(request) {
	return JSON.stringify(
		{"test": "test post?", "request": request}
	);
};

var testGetHandler = function(request) {
	var type = request.type;
	
	switch(type) {
	case 'bins': return {bins: bins()}; break;
	case 'ebay': return ebay(); break;
	default: 
		nlapiLogExecution('ERROR', 'invalid type parameter', type);
		jPw.jsonResponse( request, response, jPw.errResult("invalid type parameter: '" + type +"'") );
		break;
	};

};
