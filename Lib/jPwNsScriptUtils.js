/**
 * Module Description
 * Shared Suite Script utility library
 * 
 * Version    Date            Author           Remarks
 * 1.00       26 Aug 2013     james.white
 *
 * Required
 * jsUtils.js
 */

/**
 * general suitescript utility functions
 */
(function(jPw, undefined) {
	
	jPw.nameNoHier = function (hierName) {
		return hierName.replace(/.*:\s+/, '');
	};
	
	jPw.nameIdMap = function (items, listName) {
		var result = {};
		result[listName] = jPw.map(items, function(){
			return {
				id:this.getId(),
				name:this.getValue('name') 
			};
		});
		return jPw.okResult(result);
	};
	
	jPw.setIdNm = function (srchSrc, col, targObj, memb, membNm) {
		var membId;
		if ((!srchSrc) || (!targObj)) {
			return;
		};
		if (!membNm) {
			membId= memb+'id';
			membNm = memb+'name';
		} else {
			membId= memb;
		}
		targObj[membId] = srchSrc.getValue(col);
		targObj[membNm] = srchSrc.getText(col);
	};

	jPw.getBoolVal = function (srchSrc, col) {
		if (srchSrc) {
			return ("T" === srchSrc.getValue(col));
		} else {
			return null;
		};
	};

	jPw.uniqNmVl = function (items, fldJoin, fldName, idAs) {
		var uniques = [];
		
		function addIfNot(id, name, idName, idValue) {
			var idx = jPw.indexOfEval(uniques, function(item){return (item.id === id);});
			if (idx === -1) {
				var newItem = {id: id, name: name };
				if (idName) {
					newItem[idName] = idValue; 
				}
				uniques.push(newItem);
			};
		};
		
		jPw.each(items, function(){
			var idVal = null;
			if (idAs) {
				idVal = this.getId();
			}
			addIfNot(this.getValue(fldJoin), this.getValue(fldName, fldJoin), idAs, idVal);
		});
		return uniques;
	}; 

	jPw.uniqNmVlSort = function (items, fldJoin, fldName, idAs) {
		return jPw.uniqNmVl(items, fldJoin, fldName, idAs).sort(function(a, b) {
			if (a.name< b.name) {
				return -1;
			}
			if (a.name > b.name) {
		    	return 1;
			}
			return 0;
		});	
	};
	
	jPw.SrchObj = function(recType, filts, cols) {
		var search = {
			recType: recType, 
			filts: filts || [], 
			cols: cols || [],
		};
		search.addCol = function(col) {
			this.cols.push(col);
			return this;
		};
		search.addFilt = function(filt) {
			this.filts.push(filt);
			return this;
		};
		search.results = function() {
			return nlapiSearchRecord(this.recType, null, this.filts, this.cols);
		};

		search.createSearch = function() {
			return nlapiCreateSearch(this.recType, this.filts, this.cols);
		};
		
		search.runSearch = function() {
			return search.createSearch().runSearch();
		};
		
		search.loopResSet = function(fcn, chunk, max) {
			var resultSet = search.runSearch();
			jPw.loopResSet(resultSet, fcn, chunk, max);
			return search;
		};
		
		search.totalCount = function(by) {
			var resultSet = search.runSearch();
			var chunk = by || 1000;
			
			var start = 0;
			var end = start + chunk;
			
			var resCnt;
			var count = 0;
			var curCols = search.cols;
			try {
				search.cols = [];
				var results;
				do {
					results = resultSet.getResults(start, end);
					resCnt = results ? results.length : 0; 
					count += resCnt; 
					start += chunk;
					end = start + chunk;
				} while ((results) && (results.length > 0) && (resCnt == chunk));
			} finally {
				search.cols = curCols;	
			};
			
			return count; 
		};
		
		return search;
	};

	jPw.MakeSrchCache = function(recType, filts, cols) {
		var srchObj = jPw.SrchObj(recType, filts, cols);
		var results = -1;
		
		var loadResults = function() {
			if (results === -1) {
				results = []; //srchObj.results();
				srchObj.loopResSet(function(result) {
					results.push(result);
				});
			};
		};
		
		var getResults = function() {
			loadResults();
			return results;
		};
		
		var findResult = function(fcn) {
			loadResults();
			var idx = jPw.indexOfEval(results, fcn);
			if (idx > -1) {
				return results[idx];
			} else {
				return null;
			}
		};
		
		var findResultById = function(id) {
			return findResult(
				function(result) {return result.id == id;}
			);
		};
		
		return {
			srchObj: srchObj,
			get results() {return getResults();},
			findResult: findResult,
			findResultById: findResultById
		};
	};

	jPw.MakeSrchCacheTrans = function(recType, filts, cols, transFcn) {
		var results = [];
		
		var cache = jPw.MakeSrchCache(recType, filts, cols);
		
		var findTransResult = function(fcn) {
			var idx = jPw.indexOfEval(results, fcn);
			if (idx > -1) {
				return results[idx];
			} else {
				return null;
			}
		};
		
		var findResult = function(fcn) {
			var result = findTransResult(fcn);
			if (!result) {
				var srchRes = cache.findResult(fcn);
				if (srchRes) {
					result = transFcn(srchRes);
					results.push(result);
				};
			};
			return result;
		};

		var findResultById = function(id) {
			return findResult(
				function(result) {return result.id == id;}
			);
		};
		
		return {
			srchObj: cache,
			results: results,
			findResult: findResult,
			findResultById: findResultById
		};
		
	};
	
	/**
	 * Function GetYrIdNms
	 * Addresses several bugs in NetSuite
	 * Car records can and do have inactive years assigned to them
	 * this in turn causes another NetSuite bug where the getValue() and getText() functions do not have corresponding id and names.
	 * This function will re-query the the list of 
	 */
	jPw.GetYrIdNms = function(yrNames, descending) {
		var sortDesc = descending || false;
		var yrFiltExpr = [];

		jPw.each(yrNames, function() {
			if (yrFiltExpr.length > 0) {
				yrFiltExpr.push('or');
			};
			yrFiltExpr.push([ 'name', 'is', this ]);
		});

		var filterExpr = [['isinactive', 'is', 'F'], 'and', yrFiltExpr];
		
		var yrRecs = nlapiSearchRecord('customrecord_year', null, 
				filterExpr,
				[new nlobjSearchColumn('name').setSort( sortDesc )]);

		return jPw.map(yrRecs, function(){ 
			return {id: this.getId(), name: this.getValue('name')}; 
		});
		
	};

	jPw.getSysUrlDomain = function() {
		var env = nlapiGetContext().getEnvironment();

		if (env=='SANDBOX') {
			return 'https://system.sandbox.netsuite.com';
		} else if (env=='BETA') {
			return  'https://system.na1.netsuite.com';
		} else {
			return  'https://system.netsuite.com';
		};
	};

	jPw.getRestUrlDomain = function() {
		//if (ovrd == 'DEBUG') { return 'https://debugger.sandbox.netsuite.com'; }
		var env = nlapiGetContext().getEnvironment();

		if (env=='SANDBOX') {
			return 'https://rest.sandbox.netsuite.com';
		} else if (env=='BETA') {
			return  'https://rest.na1.netsuite.com';
		} else {
			return  'https://rest.netsuite.com';
		};
	};

	/**
	 * The shopping domain exposes media items to non-secure http protocol, required for eBay images
	 */
	jPw.getShoppinUrlDomain = function() {
		var env = nlapiGetContext().getEnvironment();

		if (env=='SANDBOX') {
			return 'http://shopping.sandbox.netsuite.com';
		} else if (env=='BETA') {
			return  'http://shopping.na1.netsuite.com';
		} else {
			return  'http://shopping.netsuite.com';
		};
	};
	
	jPw.getRestUrl = function(identifier, id) {
		return jPw.getRestUrlDomain() + nlapiResolveURL('RESTLET', identifier, id, true);
	};

	/**
	 * Function indexOfSrchCol
	 * @param {nlobjSearch} search
	 * @returns {number} index of column or -1 if not there
	 */
	jPw.indexOfSrchCol = function(search, colName) {
		var srchCols = search.getColumns();

		return jPw.indexOfEval(srchCols, function (col) {
			return (col.getName() == colName);
		});
	};

	/**
	 * Function ensureSrchCol
	 * @param {nlobjSearch} search
	 * @returns {number} index of column 
	 */
	jPw.ensureSrchCol = function(search, colName) {
		var idx = jPw.indexOfSrchCol(search, colName);
		if (idx === -1) {
			search.addColumn(new nlobjSearchColumn(colName));
			return search.getColumns().length;
		} else {
			return idx;
		}
	};

	/**
	 * Function ensureSubmitTypeResults
	 * ensures that if a search  will have the appropriate search columns needed to determine its update type internal id 
	 * @param {nlobjSearch} search
	 * @returns {void} 
	 */
	jPw.ensureSubmitTypeResults = function(search) {
		var type = search.getSearchType();
		if (type.toUpperCase() == 'item'.toUpperCase()) {
			jPw.ensureSrchCol(search, 'type');
			jPw.ensureSrchCol(search, 'isserialitem');
			//ensureSrchCol(search, 'isLotItem'); // note enabled in Roadwire account
		};
	};	
	
	/**
	 * Function getItemSubmitTypeId
	 * returns the correct type internal id for functions such as nlapiSubmitField
	 * if record is an item, then this function assumes that the type isserialitem & {not isLotItem} column is included
	 * @param {nlobjSearchResult} record
	 * @returns {string} 
	 */
	jPw.getItemSubmitTypeId = function(record) {
		var type = record.getValue('type');
		var serItem; //lotItem

		if (type == 'InvtPart') {
			serItem = record.getValue('isserialitem');
			if (serItem == 'T') {return 'serializedinventoryitem';};
			//lotItem = record.getValue('isLotItem'); if (lotItem == 'T') {return 'lotnumberedinventoryitem';};			
			return 'inventoryitem';
		}
		else if (type == 'Assembly') {
			serItem = record.getValue('isserialitem');
			if (serItem == 'T') {return 'serializedassemblyitem';};
			//lotItem = record.getValue('isLotItem'); if (lotItem == 'T') {return 'lotnumberedinventoryitem';};			
			return 'assemblyitem';
		}
		else if (type == 'Description') {return 'descriptionitem';}
		else if (type == 'Discount') {return 'discountitem';}
		else if (type == 'Group') {return 'itemgroup';}
		else if (type == 'Kit') {return 'kititem';}
		else if (type == 'Markup') {return 'markupitem';}
		else if (type == 'NonInvtPart') {return 'noninventoryitem';}
		else if (type == 'OthCharge') {return 'otherchargeitem';}
		else if (type == 'Payment') {return 'paymentitem';}
		else if (type == 'Service') {return 'serviceitem';}
		else if (type == 'Subtotal') {return 'subtotalitem';}
		else {return type;}
		;
	};

	/**
	 * Function loadItemRecord
	 * returns and item nlobjRecord for the provided internal id 
	 * use this function if the item sub-type is not known at the time, this function will use a search to find the
	 * result then determine the type id to load the record
	 * @param {int} internalid
	 * @param {Object} initializeValues
	 * @returns  nlobjRecord, if record can be found
	 */
	jPw.loadItemRecord = function(internalid, initializeValues) {
		var search = nlapiCreateSearch('item', [ new nlobjSearchFilter('internalid', null, 'is', internalid) ],	null);
		jPw.ensureSubmitTypeResults(search);
		
		var resSet = search.runSearch();
		var results = resSet.getResults(0, 1);
		
		if ((results) && (results.length > 0)) {
			var typeId = jPw.getItemSubmitTypeId(results[0]);
			var record = nlapiLoadRecord(typeId, internalid, initializeValues);
			return record;
		};
	};
	
	jPw.sumbitMultiVals = function (vals, result, field, join) {
		var curValStr = result.getValue(field, join);
		var curVals = curValStr ? curValStr.split(',') : [];
		var missingVals = jPw.missingFrom(vals, curVals);
		if (missingVals.length > 0) {
			var newVals = curVals.concat(missingVals);
			var submtFld = field;
			if (join) {
				submtFld = join+'.'+submtFld;
			};
			
			//nlapiSubmitField(result.getRecordType(), result.getId(), submtFld, newVals);
			var record = nlapiLoadRecord(result.getRecordType(), result.getId());
			if (record) {
				record.setFieldValues(submtFld, newVals);
				nlapiSubmitRecord(record, true);
				return true;
			} else {
				return false;
			};
		} else {
			return false;
		};
	};
	
	
}( this.jPw = this.jPw || {} ));

(function(jPw, undefined) {
	/**
	 * @param  {nlobjSearchResultSet} resultSet to loop
	 * @param {function} function(item, index) to produce result elements
	 * @param {integer} chunk size of each getResults call
	 * @param {integer} maximum size of results
	 * @returns {array of objects} 
	 */
	jPw.loopResSet = function(resultSet, fcn, chunk, max) {
		var maxChunk = 1000;
		var chunkSize = chunk || maxChunk;
		if (chunkSize > maxChunk) {chunkSize = maxChunk;};
		if (chunkSize > max) {chunkSize = max;};
	
		var total = 0;
		var start = 0;
		var resCount = 0;
		var resEqualsChunk = true;
		while (resEqualsChunk && (!max || (total < max)) ) {
		  var results = resultSet.getResults(start, start + chunkSize);
		  resCount = results.length;
		  total = total + resCount; 

		  //for(var i in results){
		  for (var i = 0, len = results.length; i < len; i++) {
			  fcn(results[i], i);
		  };
		  
		  resEqualsChunk = (resCount === chunkSize);
		  if (resEqualsChunk) {
			  start = total;
			  if ((max) && ((total + chunkSize) > max)) {
				  chunkSize = max - total;
			  };
		  };
		  
		}
	};
}( this.jPw = this.jPw || {} ));


(function(jPw, undefined) {
	/**
	 * Wraps an existing netsuite nlobjSearchResult
	 *
	 * @param {nlobjSearchResult} record existing netsuite record to wrap in the ActiveRecord pattern
	 * @returns {Object} an friendlier nlobjRecord
	 */
	jPw.srchResWrap = function( record )
	{
	    var obj = {
	    	record: record,
    		getAllColumns: function() {return record.getAllColumns();},
    		getId: function() {return record.getId();},
    		getRecordType: function() {return record.getRecordType();},
    		getText: function(name, join, summary) {return record.getText(name, join || null, summary || null);},
    		getValue: function(name, join, summary) {return record.getValue(name, join || null, summary || null);},
    		
    		nameNoHier: function() {return jPw.nameNoHier( record.getValue('name') );},
	    };
	    return obj;
	};

}( this.jPw = this.jPw || {} ));

(function(jPw, undefined) {
	jPw.cstSubsName = 'Classic Soft Trim';
	
	var cstSubsidiary = undefined; 
	
	jPw.getCstSubsidiary = function() {
		if (!cstSubsidiary) {
			var results = nlapiSearchRecord('subsidiary', null,
				[new nlobjSearchFilter('namenohierarchy', null, 'is', jPw.cstSubsName)],	
				[new nlobjSearchColumn('namenohierarchy')]);
			if (results) {
				cstSubsidiary = {id: results[0].getId(), name: results[0].getValue('namenohierarchy')};
			}
		};
		return cstSubsidiary;
	};
	
}( this.jPw = this.jPw || {} ));

(function(jPw, undefined) {
	jPw.logErrObj = function(errObj, msg) {
		var type, details; 
		if ( errObj instanceof nlobjError ) {
			type = errObj.getCode();
			details = errObj.getDetails();
		} else {
			type = 'UNEXPECTED_ERROR';
			details = errObj.toString();
		};
		if (msg) {
			details = msg +' '+ details;
		}
		nlapiLogExecution('ERROR', type, details );
	};
}( this.jPw = this.jPw || {} ));


(function(jPw, undefined) {
	
	jPw.itemParmName = 'itemid';
	jPw.itemFldName = jPw.itemParmName;
	/*
	 * jPw.getFormPickNsItem
	 * eBay API call to invoke NetSuite form to allow user to enter Item then submit   
	 */
	jPw.getFormPickNsItem = function(parmObj) {
		var formTitle = parmObj.title || 'NetSuite Item Lookup';
		var itemCaption = parmObj.caption || 'NetSuite Item';
		var ItemFldName = parmObj.name || jPw.itemFldName;
	    
		// create the form
	    var form = nlapiCreateForm(formTitle);
	    
	    // add fields to the form
	    var itmFld = form.addField(ItemFldName, 'select', itemCaption, 'item');
	    itmFld.setMandatory(true);
	    itmFld.setLayoutType('normal','startcol');
	    
	    form.addSubmitButton('Submit');
	    
	    return form;
	};
	
	/*
	 * jPw.itemRespFormLkp
	 * eBay API call to lookup item then display NetSuite Item and associated eBay Listing information   
	 */
	jPw.itemRespFormLkp = function(response, title, caption, name) {
	    response.writePage( jPw.getFormPickNsItem({title: title, caption: caption, name: name}) );
	};

	/*jPw.itemSuiteletFormLkp = function(request, response){
		var parmObj = {};
		parmObj.title = context.getSetting('SCRIPT', 'custscript_itm_lkp_title');
		parmObj.caption = context.getSetting('SCRIPT', 'custscript_itm_lkp_caption');
		parmObj.name = context.getSetting('SCRIPT', 'custscript_itm_lkp_name');
		
		if ( request.getMethod() == 'GET' )  {
			response.writePage( jPw.getFormPickNsItem(parmObj) );
		} else if ( request.getMethod() == 'POST' ) {
			parmObj.fcn = context.getSetting('SCRIPT', 'custscript_itm_lkp_fcn');
			jPw.execFcnByName(parmObj.fcn);
		};
	};*/
	
}( this.jPw = this.jPw || {} ));
