/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       20 Oct 2013     james.white
 *
 * Required
 * jPwJsUtils.js
 * jPwNsScriptUtils.js
 * jPwCars.js
 */

(function(parts) {

	parts.getPartSrchObj = function(filts, cols) {
		var search = {srchObj: jPw.SrchObj('item', filts, cols)};
		
		search.totalCount = search.srchObj.totalCount; 
		
		search.addCol = function(col) {
			search.srchObj.addCol(col);
			return this;
		};
		search.addFilt = function(filt) {
			search.srchObj.addFilt(filt);
			return this;
		};
		
		search.addCol(new nlobjSearchColumn('name'));
		search.addCol(new nlobjSearchColumn('custitem_prod_cat'));

		var partsList = [];
		
		search.results = function() {
			partsList = [];
			jPw.each(search.srchObj.results(), function() {
				var part = jPw.srchResWrap(this);
				partsList.push(part);
			});
			return partsList;
		};

		search.createSearch = function() {
			return search.srchObj.createSearch();
		};
		
		search.runSearch = function() {
			return search.createSearch().runSearch();
		};
		
		search.loopResSet = function(fcn, chunk, max) {
			var passPartFcn = function(record) {
				var part = jPw.srchResWrap(record);
				fcn(part);
			};

			var resultSet = search.runSearch();
			jPw.loopResSet(resultSet, passPartFcn, chunk, max);
			return search;
		};
		
		search.loopChunk = function(fcn, start, end) {
			var resultSet = search.runSearch();
			var results = resultSet.getResults(start, end);
			jPw.each(results, function() {
				var part = jPw.srchResWrap(this);
				fcn(part);
			});
		};
		
		return search;
	};

	parts.getLeaPtrnSearch = function() {
		var search = jPw.SrchObj('item', 
			[new nlobjSearchFilter('isinactive', null, 'is', 'F'),			// this item is active
			new nlobjSearchFilter('type', null, 'is', 'InvtPart'),  		// this is an inventory item
			new nlobjSearchFilter('isserialitem', null, 'is', 'T'), 		// this is a serialized item
			new nlobjSearchFilter('custitem_prod_cat', null, 'is', 9), 		// This is a leather kit
			new nlobjSearchFilter('custitem_parent_item', null, 'is', 'T'), // this is a leather pattern
			], 
			[new nlobjSearchColumn('name').setSort( false )]);
		return search;
	};
	
	parts.basePartNo = function(name, besSeller) {			
		if (besSeller === true) {
			return name.substr(0, name.lastIndexOf('-HV'));
		} else {
			return name;
		}
	};

	parts.isBesSeller = function (record) {
		return (record.getValue('custitem_leather_kit_type') == 6); // its a best seller, gotta work with what we have!
	};
	
	parts.isLeatherKit = function (record) {
		return (record.getValue('custitem_prod_cat') == 9); // its a leather kit, for some reason filering this via netsuite KILL performance in sandbox
	};
	
	
	parts.makeLeaPartObj = function(record) {
		var part = jPw.srchResWrap(record);
		part.isBesSeller = parts.isBesSeller(part);
		part.isLeatherKit = parts.isLeatherKit(part);
		part.basePartNo = parts.basePartNo(part.nameNoHier(), part.isBesSeller);
		return part;
	};

	
	parts.LeaSrchObj = function(filts, cols) {
		var search = {srchObj: jPw.SrchObj('item', filts, cols)};
		
		search.addCol = function(col) {
			search.srchObj.addCol(col);
			return this;
		};
		search.addFilt = function(filt) {
			search.srchObj.addFilt(filt);
			return this;
		};
		
		var partsList = [];
		
		var initMakeAddRepl = function() {
			partsList = [];
			return jPw.makeAddRepl(
				function (part) { partsList.push(part); }, 
				function (part, idx) { partsList[idx] = part; }, 
				function (part) { return part.isBesSeller && part.isLeatherKit; },
				function (part) { return part.basePartNo; },
				function (record) { return parts.makeLeaPartObj(record); }
			);
		};
		
		search.results = function() {
			var addRepl = initMakeAddRepl();
			addRepl.each(search.srchObj.results());
			return partsList;
		};

		search.createSearch = function() {
			return search.srchObj.createSearch();
		};
		
		search.runSearch = function() {
			return search.createSearch().runSearch();
		};
		
		search.loopResSet = function(fcn, chunk, max) {
			var addRepl = initMakeAddRepl();

			var resSet = search.runSearch();
			jPw.loopResSet(resSet, function(record) {
				addRepl.addOrRepl(record);
			}, chunk, max);

			jPw.each(partsList, function() {
				fcn(this);
			});
		};
		
		return search;
	};
	
	parts.getLeaKitSearch = function(ctlgs) {
		var search = parts.LeaSrchObj( 
			[new nlobjSearchFilter('isinactive', null, 'is', 'F'),			// this item is active
			new nlobjSearchFilter('type', null, 'is', 'InvtPart'),  		// this is an inventory item
			new nlobjSearchFilter('isserialitem', null, 'is', 'T'), 		// this is a serialized item
			//new nlobjSearchFilter('custitem_prod_cat', null, 'is', 9), 		// This is a leather kit, !! for some reason this filter KILLED performance in the sandbox, have not been able to test in production, gonna remove filter and check after the load in memory. did not see the same problem in parts.getLeaPtrnSearch 
			new nlobjSearchFilter('custitem_parent_item', null, 'is', 'F'), // this is not a pattern
			], 
			[new nlobjSearchColumn('name'),
			 new nlobjSearchColumn('custitem_leather_kit_type'),
			 new nlobjSearchColumn('custitem_prod_cat')
			]);
		if (ctlgs) {
			search.addFilt(new nlobjSearchFilter('custitem_item_prod_ctlg', null, 'anyof', ctlgs));
		};
		return search;
	};

	parts.getPtrnLeaSearch = function(ptrnId, ctlgs) {
		return parts.getLeaKitSearch (ctlgs)
			.addFilt(new nlobjSearchFilter('custitem_leather_pattern', null, 'anyof', ptrnId));
	};
	
	parts.getPtrnPtrnSearch = function(ptrnId) {
		return parts.getLeaPtrnSearch()
			.addFilt(new nlobjSearchFilter('custitem_leather_pattern', null, 'anyof', ptrnId));
	};
	
}( this.jPw.parts = this.jPw.parts || {}));

/*(function(parts) {
	parts.getPtrnIntCollRecs = function(carId, ptrnId, intColId, ctlgs) {

		var recColSrch = jPw.cars.getIntColRecSearch(carId)
			.addFilt(new nlobjSearchFilter('custrecord_int_color', null, 'is', intColId));
		var recColResults = recColSrch.results();

		var colIds = jPw.cars.colIdsOfIntColRecs(recColResults);
		
		var leaColSrch = parts.getPtrnLeaSearch(ptrnId, ctlgs)
			.addFilt(new nlobjSearchFilter('custitem_leather_color', null, 'anyof', colIds))
	
			.addCol(new nlobjSearchColumn('custitem_leather_color'))
			
			;
		var leaColResults = leaColSrch.results();
		
		return leaColResults;
	};
}( this.jPw.parts = this.jPw.parts || {}));*/


(function(parts) {
	parts.findSwatch = function(id) {
		if (!parts.swatchCache) {
			parts.swatchCache = jPw.MakeSrchCacheTrans('customrecord_swatch',  
				[], 
				[new nlobjSearchColumn('name'),
				 new nlobjSearchColumn('custrecord_swatch_image'),
				 new nlobjSearchColumn('custrecord_swatch_hex_code'),
				 new nlobjSearchColumn('custrecord_swatch_finish_id')
				],
				function(r) {
					return {
						id: r.getId(),
						name: r.getValue('name'),
						hex: r.getValue('custrecord_swatch_hex_code'),
						imgurl: r.getText('custrecord_swatch_image')
					};
				}
			);
			
		};
		
		return parts.swatchCache.findResultById(id);
	};
	
	parts.getLeaBoxDims = function(rows) {
		if (!jPw.leaBoxDims) {
			jPw.leaBoxDims = {
				row1: {length: 21,	width: 7, 	height: 25, weight: 15},	 	 
				row2: {length: 22,	width: 11, 	height: 27, weight: 25}, 	 
				row3: {length: 27,	width: 22, 	height: 16, weight: 37}
			};
		};
		if (rows == 1) {return jPw.leaBoxDims.row1;}
		else if (rows == 2) {return jPw.leaBoxDims.row2;}
		else if (rows == 3) {return jPw.leaBoxDims.row3;}
		else {return jPw.leaBoxDims.row1;}
	};

	parts.getLeaInstalledPrice = function(rows) {
		if (!jPw.leaInstPrice) {
			jPw.leaInstPrice = {
				row1: 799,	 	 
				row2: 1299, 	 
				row3: 1799
			};
		};
		if (rows == 1) {return jPw.leaInstPrice.row1;}
		else if (rows == 2) {return jPw.leaInstPrice.row2;}
		else if (rows == 3) {return jPw.leaInstPrice.row3;}
		else {return jPw.leaInstPrice.row2;}
	};
	
}( this.jPw.parts = this.jPw.parts || {}));

