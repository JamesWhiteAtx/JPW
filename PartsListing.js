/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 Sep 2013     james.white
 *
 * Required
 * jsUtils.js
 * SuiteScriptUtil.js
 * Cars.js
 * ServerUtils.js
 */
(function(parts) {
	/**
	 * @returns {nlobjSearch}
	 */
	parts.getBestSelSearch = function() {
		return nlapiCreateSearch('item', 
			[
				new nlobjSearchFilter('isinactive', null, 'is', 'F'),
				new nlobjSearchFilter('type', null, 'is', 'InvtPart'),
				new nlobjSearchFilter('isserialitem', null, 'is', 'T'),
				new nlobjSearchFilter('custitem_parent_item', null, 'is', 'F'), // not a pattern
				new nlobjSearchFilter('custitem_leather_kit_type', null, 'is', '6'), // best seller
				new nlobjSearchFilter('internalid','CUSTITEM_LEATHER_PATTERN', 'noneof', '@NONE@'),
				new nlobjSearchFilter('custitem_prod_cat', null, 'is', '9') // Leather Kit
			],
			[
				new nlobjSearchColumn('itemid'), 
			]
		);
	};

	parts.getBestSelResSet = function() {
		var search = getBestSelSearch();
		search.addFilters(
			[
				new nlobjSearchColumn('salesdescription'), 
				new nlobjSearchColumn('custitem_leather_pattern').setSort( false ),
				new nlobjSearchColumn('custrecord_pattern_desc', 'CUSTITEM_LEATHER_PATTERN'),
				
				new nlobjSearchColumn('custitem_leather_color'),
				new nlobjSearchColumn('custrecord_swatch', 'custitem_leather_color'),
				new nlobjSearchColumn('custitem_ins_color'),
				new nlobjSearchColumn('custrecord_swatch', 'custitem_ins_color'),
				new nlobjSearchColumn('custitem_3t_insert_clr2'),
				new nlobjSearchColumn('custrecord_swatch', 'custitem_3t_insert_clr2'),
				
				new nlobjSearchColumn('storedisplayimage'), 
				new nlobjSearchColumn('storedisplaythumbnail'), 
				new nlobjSearchColumn('custitem_decoration_summary'), 
				new nlobjSearchColumn('custrecord_rows', 'CUSTITEM_LEATHER_PATTERN'), 
				new nlobjSearchColumn('custrecord_airbag', 'CUSTITEM_LEATHER_PATTERN'), 
				new nlobjSearchColumn('custrecord_car_type', 'CUSTITEM_LEATHER_PATTERN')
			]
		);
		return search.runSearch();
	};
		
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

	parts.bestSellerList = function (maxItems) {
		
		var list = [];
		var sysDom = jPw.getSysUrlDomain();

		var fullUrl = function(url) {
			if (url) {
				return sysDom + url;
			} else {
				return '';
			}
		};

		var assignColSwatch = function(id, item, hexProp, urlProp ) {
			if (id) {
				var swatch = parts.findSwatch(id);
				if (swatch) {
					item[hexProp] = swatch.hex;
					item[urlProp] = fullUrl(swatch.imgurl);
				};
			};
		};
	
		var partsResSet = jPw.parts.getBestSelResSet();
		jPw.loopResSet(partsResSet,
			function(part) {
				var cars = part.getValue('custrecord_car_type', 'CUSTITEM_LEATHER_PATTERN');
				var carIds = cars.split(",");
				
				var carsResSet = jPw.cars.getCurPtrnCarsSearch(carIds).runSearch();
				jPw.loopResSet(carsResSet,
					function(car) {
						var years = car.getText('custrecord_year').split(",");
						jPw.each(years, function(idx, year) {

							var item = {
								item_id: part.getId(),
						    	part_no: part.getValue('itemid').replace(/.*:\s+/, ''),
						    	pattern: part.getText('custitem_leather_pattern'),
						    	description: part.getValue('salesdescription'),
						    	color: part.getText('custitem_leather_color'),
								color_hex: '',
								color_url: '',
								insert1: part.getText('custitem_ins_color'),
								insert1_hex: '',
								insert1_url: '',
								insert2: part.getText('custitem_3t_insert_clr2'),
								insert2_hex: '',
								insert2_url: '',
						    	img_url: fullUrl( part.getText('storedisplayimage')), 
						    	thumb_url: fullUrl(part.getText('storedisplaythumbnail')), 
						    	decorations: part.getValue('custitem_decoration_summary'),
						    	rows: part.getText('custrecord_rows', 'CUSTITEM_LEATHER_PATTERN'), 
							   	airbags: part.getText('custrecord_airbag', 'CUSTITEM_LEATHER_PATTERN'),
								car_id: car.getId(),
								car_name: car.getValue('name'),
								car_make: car.getText('custrecord_make'),
								car_year: year,
								car_model: car.getText('custrecord_model'),
								car_body: car.getText('custrecord_body'),
								car_trim: car.getText('custrecord_tl')
							};

		
							assignColSwatch(part.getValue('custrecord_swatch', 'custitem_leather_color'), item, "color_hex", "color_url");
							assignColSwatch(part.getValue('custrecord_swatch', 'custitem_ins_color'), item, "insert1_hex", "insert1_url");
							assignColSwatch(part.getValue('custrecord_swatch', 'custitem_3t_insert_clr2'), item, "insert2_hex", "insert2_url");
							
							list.push(item);
						});
					}
				);
				
			},
			null, 
			maxItems
		);
		
		return list;
	};
	
	parts.bestSellerDenormal = function (maxItems) {
		var items = [];
		var ptrns = [];
		var cars = [];
		var makes = [];
		
		var search = jPw.parts.getBestSelSearch();
		search.addColumns([new nlobjSearchColumn('custrecord_car_type', 'CUSTITEM_LEATHER_PATTERN'),
		                  new nlobjSearchColumn('custitem_leather_pattern').setSort( false ),
		                  new nlobjSearchColumn('custitem_leather_color').setSort( false )]);
		var partsResSet = search.runSearch();
		jPw.loopResSet(partsResSet,
			function(part) {
				var part_id = part.getId();
				var pattern_id  = part.getValue('custitem_leather_pattern');

				jPw.addOnlyUniqueObj(items, {
					part_id: part_id,
					pattern_id: pattern_id
				});
				
				var carsVals = part.getValue('custrecord_car_type', 'CUSTITEM_LEATHER_PATTERN');
				var carIds = carsVals.split(",");
				
				var carsSearch = jPw.cars.getCurPtrnCarsSearch(carIds);
				
				var carsResSet = carsSearch.runSearch();
				jPw.loopResSet(carsResSet,
					function(car) {
						jPw.addOnlyUniqueObj(cars, {
							car_id: car.getId(),
							car_make_id: car.getValue('custrecord_make')
						});
					}, 
					null, 
					maxItems
				);
			}, 
			null, 
			maxItems
		);
		

		for (var i = 0, len = items.length; i < len; i++) {
			jPw.addOnlyUniqueObj(ptrns, {
				pattern_id: items[i].pattern_id
			});
		};
		for (var i = 0, len = cars.length; i < len; i++) {
			jPw.addOnlyUniqueObj(makes, {
				car_make_id: cars[i].car_make_id
			});
		};
		
		return makes;
	};

}( this.jPw.parts = this.jPw.parts || {}));

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	var type = request.getParameter('type');
	switch(type){
		case 'bestsellers': jPw.successRespond(request, response, jPw.okResult({parts: jPw.parts.bestSellerList()})); break;
		case 'bestSellerDenormal': jPw.successRespond(request, response, jPw.okResult({parts: jPw.parts.bestSellerDenormal()})); break;
		default: nlapiLogExecution('ERROR', 'invalid type parameter', type); break;
	};
}
