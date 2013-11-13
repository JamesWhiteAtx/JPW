/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       20 Sep 2013     james.white
 *
 * Required
 * jPwJsUtils.js
 * jPwNsScriptUtils.js
 * jPwParts.js
 */

(function(cars) {
	
	cars.getMakesSearch = function(ctlgs) {
		var search = jPw.SrchObj('customrecord_car_make', null, [new nlobjSearchColumn('name').setSort(false)]);
		if (ctlgs) {
			search.addFilt(new nlobjSearchFilter('custrecord_make_prod_ctlg', null, 'allof', ctlgs));
		} else {
			search.addFilt(new nlobjSearchFilter('custrecord_car_types', null, 'anyof', ['1']));
		};
		return search;
	};

	cars.getCarBaseSearch = function(ctlgs) {
		var search = jPw.SrchObj('customrecord_current_classic_car', null, [new nlobjSearchColumn('name').setSort( false )]);
		if (ctlgs) {
			search.addFilt(new nlobjSearchFilter('custrecord_car_prod_ctlg', null, 'allof', ctlgs));
		};
		return search;
	};
	
	//cars.getCurCarSearch = function(ctlgs) {return cars.getCarBaseSearch(ctlgs).addFilt(new nlobjSearchFilter('custrecord_classic_car', null, 'anyof', [1]));};
	//cars.getClsCarSearch = function(ctlgs) {return cars.getCarBaseSearch(ctlgs).addFilt(new nlobjSearchFilter('custrecord_classic_car', null, 'anyof', [3]));};

	cars.getPtrnCarSearch = function(ctlgs) {
		return jPw.cars.getCarBaseSearch(ctlgs).addFilt(new nlobjSearchFilter('internalid','custrecord_car_type', 'noneof', '@NONE@')); // only cars that have patterns
	};

	cars.getCarMkSearch = function(makeId, ctlgs) {
		return jPw.cars.getPtrnCarSearch(ctlgs).addFilt(new nlobjSearchFilter('custrecord_make', null, 'is', makeId));
	};

	cars.getCarYrSearch = function(makeId, yrIds, ctlgs) {
		return jPw.cars.getCarMkSearch(makeId, ctlgs)
			.addFilt(new nlobjSearchFilter('custrecord_year', null, 'anyof', yrIds));
	};

	cars.getCarMdSearch = function(makeId, yrIds, modelId, ctlgs) {
		return jPw.cars.getCarYrSearch(makeId, yrIds, ctlgs)
			.addFilt(new nlobjSearchFilter('custrecord_model', null, 'is', modelId));
	};

	cars.getCarBdSearch = function(makeId, yrIds, modelId, bodyId, ctlgs) {
		return jPw.cars.getCarMdSearch(makeId, yrIds, modelId, ctlgs)
			.addFilt(new nlobjSearchFilter('custrecord_body', null, 'is', bodyId));
	};

	cars.getCarTlSearch = function(makeId, yrIds, modelId, bodyId, trimId, ctlgs) {
		return jPw.cars.getCarBdSearch(makeId, yrIds, modelId, bodyId, ctlgs)
			.addFilt(new nlobjSearchFilter('custrecord_tl', null, 'is', trimId));
	};
	
}( this.jPw.cars = this.jPw.cars || {}));
/*
(function(cars) {
	cars.makeBaseSearch = function() {
		return jPw.SrchObj('customrecord_car_make', null, [new nlobjSearchColumn('name').setSort( false )]);
	};

	cars.makeCurSearch = function() {
		return cars.makeBaseSearch().addFilt(new nlobjSearchFilter('custrecord_car_types', null, 'anyof', ['1']));
	};

	cars.makeClsSearch = function() {
		return cars.makeBaseSearch().addFilt(new nlobjSearchFilter('custrecord_car_types', null, 'anyof', ['3']));
	};
	
	cars.carBaseSearch = function() {
		return jPw.SrchObj('customrecord_current_classic_car');
	};

	cars.curCarSearch = function() {
		return jPw.cars.carBaseSearch().addFilt(new nlobjSearchFilter('custrecord_classic_car', null, 'is', 1));
	};

	cars.curClsSearch = function() {
		return cars.carBaseSearch().addFilt(new nlobjSearchFilter('custrecord_classic_car', null, 'is', 3));
	};

	cars.ptrnCarSearch = function() {
		return jPw.cars.curCarSearch().addFilt(new nlobjSearchFilter('internalid','custrecord_car_type', 'noneof', '@NONE@'));
	};

	cars.carMkSearch = function(makeId) {
		return jPw.cars.ptrnCarSearch().addFilt(new nlobjSearchFilter('custrecord_make', null, 'is', makeId));
	};

	cars.carYrSearch = function(makeId, yrIds) {
		return jPw.cars.carMkSearch(makeId)
			.addFilt(new nlobjSearchFilter('custrecord_year', null, 'anyof', yrIds));
	};

	cars.carMdSearch = function(makeId, yrIds, modelId) {
		return jPw.cars.carYrSearch(makeId, yrIds)
			.addFilt(new nlobjSearchFilter('custrecord_model', null, 'is', modelId));
	};

	cars.carBdSearch = function(makeId, yrIds, modelId, bodyId) {
		return jPw.cars.carMdSearch(makeId, yrIds, modelId)
			.addFilt(new nlobjSearchFilter('custrecord_body', null, 'is', bodyId));
	};

	cars.carTlSearch = function(makeId, yrIds, modelId, bodyId, trimId) {
		return jPw.cars.carBdSearch(makeId, yrIds, modelId, bodyId)
			.addFilt(new nlobjSearchFilter('custrecord_tl', null, 'is', trimId));
	};

}( this.jPw.cars = this.jPw.cars || {}));
*/
(function(cars) {
	
	cars.getIntColRecSearch = function(carId) {
		return jPw.SrchObj('customrecord_mfr_int_rec_color',
			[new nlobjSearchFilter('custrecord_car', null, 'is', carId)],
			[new nlobjSearchColumn('name').setSort( false ),
			 new nlobjSearchColumn('custrecord_int_color'),
			 new nlobjSearchColumn('custrecord_rec_kit_color'),
			 new nlobjSearchColumn('custrecord_alt_kit_color')]);
	};

	cars.colIdsOfIntColRecs = function(recColResults) {
		var colIds = [];
		jPw.each(recColResults,
			function () {
				var recId = this.getValue('custrecord_rec_kit_color');
				if (recId) {
					jPw.addOnlyUniqueElm(colIds, recId);
				};
				var altId = this.getValue('custrecord_alt_kit_color');
				if (altId) {
					jPw.addOnlyUniqueElm(colIds, altId);
				};
			}
		);
		return colIds;
	}; 
	
	cars.getCarPtrnIntColRecs = function(carId, ptrnId, ctlgs) {

		var recColSrch = cars.getIntColRecSearch(carId);
		var recColResults = recColSrch.results();

		var colIds = cars.colIdsOfIntColRecs(recColResults);
		
		var leaColSrch = jPw.parts.getPtrnLeaSearch(ptrnId, ctlgs)
			.addFilt(new nlobjSearchFilter('custitem_leather_color', null, 'anyof', colIds))
			.addCol(new nlobjSearchColumn('custitem_leather_color'))
			;
		var leaColResults = leaColSrch.results();
		
		var idxOfLeaCol = function(colId) {
			if (!colId) {
				return -1;
			};
			return jPw.indexOfEval(leaColResults, function(item) {
				return (item.getValue('custitem_leather_color') === colId); 
			});
		};
		
		var getOrAddIdObj = function(arr, obj) {
			return jPw.getOrAddObj(arr, obj, function(arrItem, compObj) {
				return (arrItem.id === compObj.id); 
			});
		};
		
		var intCols = [];
		jPw.each(recColResults,
			function () {
				var recCol = this;
				
				var recId = recCol.getValue('custrecord_rec_kit_color');
				var recIdx = idxOfLeaCol(recId);
				
				var altId = recCol.getValue('custrecord_alt_kit_color');
				var altIdx = idxOfLeaCol(altId);
				
				var curIntCol = {id: recCol.getValue('custrecord_int_color'), name: recCol.getText('custrecord_int_color'), recs: [], alts: []};
				var intCol;
				
				if ((recId) && (recIdx != -1)) {
					intCol = getOrAddIdObj(intCols, curIntCol);
					getOrAddIdObj(intCol.recs, {
						id: recId, 
						name: recCol.getText('custrecord_rec_kit_color'),
						itmId: leaColResults[recIdx].getId()
					});
				};
				if ((altId) && (altIdx != -1)) {
					intCol = getOrAddIdObj(intCols, curIntCol);
					getOrAddIdObj(intCol.alts, {
						id: altId, 
						name: recCol.getText('custrecord_alt_kit_color'),
						itmId: leaColResults[altIdx].getId()
					});
				};
			}
		);
		return intCols;
	};

	cars.getIntColRecItmIds = function(ptrnId, carId, intColId, ctlgs) {
		
		var intCols = jPw.cars.getCarPtrnIntColRecs(carId, ptrnId, ctlgs);

		var recColItmIds = [];
		jPw.each(intCols, function() {
			var intCol = this;
			if (intCol.id == intColId) {
				jPw.each(intCol.recs, function() {
					var recCol = this;
					jPw.addOnlyUniqueObj(recColItmIds, {id: recCol.itmId, type: 'Recommended'});
				});
				jPw.each(intCol.alts, function() {
					var altCol = this;
					jPw.addOnlyUniqueObj(recColItmIds, {id: altCol.itmId, type: 'Alternate'});
				});
				
			}
		});
		
		return recColItmIds;
	};	
	
}( this.jPw.cars = this.jPw.cars || {}));

(function(cars) {
	cars.getColIntColSearch = function(carId) {
		return jPw.SrchObj('customrecord_mfr_int_rec_color',
			[new nlobjSearchFilter('custrecord_car', null, 'is', carId)],
			[new nlobjSearchColumn('name').setSort( false ),
			new nlobjSearchColumn('custrecord_int_color'),
			new nlobjSearchColumn('name','custrecord_int_color')]);
	};

	cars.getCarRecCols = function(carId, intColId) {
		var results = jPw.cars.getColIntColSearch(carId)
			.addFilt(new nlobjSearchFilter('internalid', 'custrecord_int_color', 'is', intColId))
			.addCol(new nlobjSearchColumn('custrecord_rec_kit_color'))
			.addCol(new nlobjSearchColumn('name', 'custrecord_rec_kit_color'))
			.addCol(new nlobjSearchColumn('custrecord_alt_kit_color'))
			.addCol(new nlobjSearchColumn('name', 'custrecord_alt_kit_color'))
			.results();	
		
		if (!results) {
			return [];
		};
		
		var recs = jPw.map(jPw.uniqNmVlSort(results, 'custrecord_rec_kit_color', 'name'), function() {
			var item = this;
			item.type = 'Recommended';
			return item;
		});		
		var alts = jPw.map(jPw.uniqNmVlSort(results, 'custrecord_alt_kit_color', 'name'), function() {
			var item = this;
			item.type = 'Alternate';
			return item;
		});		
			
		return recs.concat(alts);
	};
}( this.jPw.cars = this.jPw.cars || {}));

(function(cars) {
	cars.getYrIds = function(year) {
		var yrRecs = nlapiSearchRecord('customrecord_year', null, 
				[new nlobjSearchFilter('name', null, 'is', year)], 
				[new nlobjSearchColumn('name').setSort( false )]);
	
		return jPw.map(yrRecs, function(){ 
			return this.getId(); 
		});
	};
}( this.jPw.cars = this.jPw.cars || {}));


(function(cars) {
	/**
	 * @param {string[]} carIds array of car internal ids
	 * @returns {nlobjSearch}
	 */
	cars.getCarsSearch = function(carIds) {
		var search = nlapiCreateSearch('customrecord_current_classic_car', 
				null,
				[	
					new nlobjSearchColumn('name'),
					new nlobjSearchColumn('custrecord_make').setSort( false ),
					new nlobjSearchColumn('custrecord_year').setSort( true ),
					new nlobjSearchColumn('custrecord_model'),
					new nlobjSearchColumn('custrecord_body'),
					new nlobjSearchColumn('custrecord_tl')
				]
			);
		if (carIds) {
			search.addFilter(new nlobjSearchFilter('internalid', null, 'anyOf', carIds));
		};
		return search;
	};

	/**
	 * @param {string[]} carIds array of car internal ids
	 * @returns {nlobjSearch}
	 */
	cars.getCurCarsSearch = function(carIds) {
		var search = jPw.cars.getCarsSearch(carIds);
		search.addFilter(new nlobjSearchFilter('custrecord_classic_car', null, 'is', 1));
		return search;
	};

	/**
	 * @param {string[]} carIds array of car internal ids
	 * @returns {nlobjSearch}
	 */
	cars.getClsCarsSearch = function(carIds) {
		var search = jPw.cars.getCarsSearch(carIds);
		search.addFilter(new nlobjSearchFilter('custrecord_classic_car', null, 'is', 3));
		return search;
	};

	/**
	 * @param {string[]} carIds array of car internal ids
	 * @returns {nlobjSearch}
	 */
	cars.getCurPtrnCarsSearch = function(carIds) {
		var search = jPw.cars.getCurCarsSearch(carIds);
		search.addFilter(new nlobjSearchFilter('internalid', 'custrecord_car_type', 'noneof', '@NONE@'));
		return search;
	};
	
}( this.jPw.cars = this.jPw.cars || {}));

