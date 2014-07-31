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
	
	var propGetter = function(obj, prop){
		if (obj.hasOwnProperty(prop)) {
			return obj[prop];
		};

		prop = (prop + '').toLowerCase();
		for(var p in obj){
			if (obj.hasOwnProperty(p) && prop == p.toLowerCase()){
				return obj[p];
			};
		};
	};
    
    var setFld = function(ordRec, fld, prop, bool) {
    	var fldVal;
    	var propVal = propGetter(request, prop, bool);
    	
		if (bool) {
			if (propVal == true) {
				fldVal = 'T';
			} else {
				fldVal = 'F';
			};
		} else {
			fldVal = propVal;
		};
		ordRec.setFieldValue(fld, fldVal);
    	return propVal;
    };
    
	var setMembInfo = function(ordRec, email) {
	    //setFld(ordRec, 'custrecord_member_email', 'email');
	    ordRec.setFieldValue('custrecord_member_email', email);
	    setFld(ordRec, 'custrecord_last_name', 'lastName');
	    setFld(ordRec, 'custrecord_ship_postal', 'postal');
	    setFld(ordRec, 'custrecord_phone', 'phone');
	    setFld(ordRec, 'custrecord_order_total', 'total');
	    return nlapiSubmitRecord(ordRec, true);
	};

	var setLeaInfo = function(id, setids) {
		var orderRec = nlapiLoadRecord('customrecord_costco_order', id);
		var hasLeather = setFld(orderRec, 'custrecord_has_leather', 'leather', true);
	    if (hasLeather) {
	    	setFld(orderRec, 'custrecord_leather_price', 'leaprice');
	        setFld(orderRec, 'custrecord_leather_rows', 'rows');
	        setFld(orderRec, 'custrecord_pattern_name', 'ptrnname');
	        setFld(orderRec, 'custrecord_color_name', 'colorname');
	        setFld(orderRec, 'custrecord_leather_name', 'kitname');
	        if (setids) {
		        setFld(orderRec, 'custrecord_pattern_id', 'ptrnid');
		        setFld(orderRec, 'custrecord_color_id', 'colorid');
		        setFld(orderRec, 'custrecord_leather_id', 'kitid');
	        };
	        return nlapiSubmitRecord(orderRec, true);
	    } else {
	    	return id;
	    }; 
	};

	var setHtrInfo = function(id) {
		var orderRec = nlapiLoadRecord('customrecord_costco_order', id);
	    var hasHeaters = setFld(orderRec, 'custrecord_has_heaters', 'heaters', true);
	    if (hasHeaters) {
	    	setFld(orderRec, 'custrecord_heaters_price', 'heaterprice');
	        setFld(orderRec, 'custrecord_heaters_qty', 'heaterqty');
	        return nlapiSubmitRecord(orderRec, true);
	    } else {
	    	return id;
	    }; 
	};
	
	var setCarInfo = function(id, setids) {
		var hasCar = propGetter(request, 'car');
	    if (hasCar) {
	    	var orderRec = nlapiLoadRecord('customrecord_costco_order', id);	
	        setFld(orderRec, 'custrecord_make_name', 'makename');
	        setFld(orderRec, 'custrecord_year_name', 'yearname');    
	        setFld(orderRec, 'custrecord_body_name', 'bodyname');
	        setFld(orderRec, 'custrecord_model_name', 'modelname');
	        setFld(orderRec, 'custrecord_car_name', 'carname');
	        setFld(orderRec, 'custrecord_trim_name', 'trimname');
	        setFld(orderRec, 'custrecord_int_name', 'intname');

	        if (setids) {
		        setFld(orderRec, 'custrecord_make_id', 'makeid');
		        setFld(orderRec, 'custrecord_year_id', 'yearid');
		        setFld(orderRec, 'custrecord_body_id', 'bodyid');
		        setFld(orderRec, 'custrecord_model_id', 'modelid');
		        setFld(orderRec, 'custrecord_car_id', 'carid');
		        setFld(orderRec, 'custrecord_trim_id', 'trimid');
		        setFld(orderRec, 'custrecord_int_id', 'intid');
	        };
	        return nlapiSubmitRecord(orderRec, true);
	    } else {
	    	return id;
	    }; 
	};
	
	var email = propGetter(request, 'email');
	email = email.trim().toUpperCase();
	
	//var hasLea = propGetter(request, 'leather');
	//var rows = propGetter(request, 'rows');
	//var hasHtrs = propGetter(request, 'heaters');
	//var htrQty = propGetter(request, 'heaterqty');
	
    var orderRec = nlapiCreateRecord('customrecord_costco_order');
	
    var ordId = setMembInfo(orderRec, email);
	
	try {
		ordId = setLeaInfo(ordId, true);
	} catch(e) {
		ordId = setLeaInfo(ordId, false);
	};
	
	ordId = setHtrInfo(ordId, true);	
	
	try {
		ordId = setCarInfo(ordId, true);
	} catch(e) {
		ordId = setCarInfo(ordId, false);
	};
	
	return {
		id: ordId
	};
};

var testGetHandler = function(request) {
	return JSON.stringify({ typo: request.record_type, ideo: request.internalid });
	
	var type = request.type;
	
	switch(type) {
	//case 'bins': return {bins: bins()}; break;
	//case 'ebay': return ebay(); break;
	default: 
		nlapiLogExecution('ERROR', 'invalid type parameter', type);
		return JSON.stringify({ typo: request.record_type, ideo: request.internalid }); // {code: 'ERROR', msg:'invalid type parameter'});
		break;
	};

};
