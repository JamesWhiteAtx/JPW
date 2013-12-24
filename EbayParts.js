/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       08 Oct 2013     james.white
 *
 * Required
 * jPwJsUtils.js
 * jPwNsScriptUtils.js
 * jPwParts.js
 * jPwCars.js
 */
(function(parts) {
	
	/**
	 * @param {jPw.SrchObj} search jPw search definition object
	 * @returns {jPw.SrchObj} jPw search definition object
	 */
	parts.getEbayPartsSearch = function(search) {
		
		search
			.addCol(new nlobjSearchColumn('salesdescription'))
			.addCol(new nlobjSearchColumn('custitem_selector_descr'))
			.addCol(new nlobjSearchColumn('custitem_prod_cat'))
			.addCol(new nlobjSearchColumn('custitem_prod_sub_cat'))
			.addCol(new nlobjSearchColumn('custitem_leather_pattern').setSort( false ))
			.addCol(new nlobjSearchColumn('custrecord_pattern_desc', 'CUSTITEM_LEATHER_PATTERN'))
			.addCol(new nlobjSearchColumn('custitem_leather_color'))
			.addCol(new nlobjSearchColumn('custrecord_swatch', 'custitem_leather_color'))
			.addCol(new nlobjSearchColumn('custitem_ins_color'))
			.addCol(new nlobjSearchColumn('custrecord_swatch', 'custitem_ins_color'))
			.addCol(new nlobjSearchColumn('custitem_3t_insert_clr2'))
			.addCol(new nlobjSearchColumn('custrecord_swatch', 'custitem_3t_insert_clr2'))
			.addCol(new nlobjSearchColumn('storedisplayimage'))
			.addCol(new nlobjSearchColumn('storedisplaythumbnail')) 
			.addCol(new nlobjSearchColumn('custitem_decoration_summary')) 
			.addCol(new nlobjSearchColumn('custrecord_rows', 'CUSTITEM_LEATHER_PATTERN')) 
			.addCol(new nlobjSearchColumn('custrecord_airbag', 'CUSTITEM_LEATHER_PATTERN')) 
			.addCol(new nlobjSearchColumn('custitem_insert_style'))
			.addCol(new nlobjSearchColumn('custrecord_car_type', 'CUSTITEM_LEATHER_PATTERN'))
			.addCol(new nlobjSearchColumn('upccode'))
			.addCol(new nlobjSearchColumn('shippackage'))
			.addCol(new nlobjSearchColumn('weight'))
		;
		
		return search;
	};

	
	/**
	 * @param {jPw.SrchObj} search jPw search definition object
	 * @returns {any[]} array of ebay part objects
	 */
	parts.eBayPartsList = function (search, excludeCars, maxItems) {
		
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
		
		var assignLnWdHt = function(item) {
			var dims = jPw.parts.getLeaBoxDims(item.rows);
			item.length = dims.length;
			item.width = dims.width;
			item.height = dims.height;
		};
		
		var assignPrice = function(item) {
			item.price = jPw.parts.getLeaInstalledPrice(item.rows);
		}

		var assignStoreUrlId = function(item, partRecord) {
			item.storeurl_id = partRecord.getId();
			if (!partRecord.isBesSeller) {
				var ptrnId = partRecord.getValue('custitem_leather_pattern');
				
				var ptrns = parts.getLeaPtrnSearch()
					.addFilt(new nlobjSearchFilter('custitem_leather_pattern', null, 'is', ptrnId))
					.results();
				
				if ((ptrns) && (ptrns.length > 0)) {
					item.storeurl_id = ptrns[0].getId();
				}
			}
		};
		
		search.loopResSet(
			function(part) {
				
				var item = {
						item_id: part.getId(),
				    	base_part: part.basePartNo,
				    	ns_part: part.nameNoHier(),
				    	pattern: part.getText('custitem_leather_pattern'),
				    	descr: part.getValue('salesdescription'),
				    	slctr_descr: part.getValue('custitem_selector_descr'),
				    	category: part.getText('custitem_prod_cat'),
				    	sub_category: part.getText('custitem_prod_sub_cat'),
				    	color: part.getText('custitem_leather_color'),
						color_hex: '',
						color_url: '',
						insert1: part.getText('custitem_ins_color'),
						insert1_hex: '',
						insert1_url: '',
						insert2: part.getText('custitem_3t_insert_clr2'),
						insert2_hex: '',
						insert2_url: '',
						img_id:part.getValue('storedisplayimage'),
				    	img_url: fullUrl( part.getText('storedisplayimage')), 
				    	thumb_id: part.getValue('storedisplaythumbnail'),
				    	thumb_url: fullUrl(part.getText('storedisplaythumbnail')), 
				    	decorations: part.getValue('custitem_decoration_summary'),
				    	rows: part.getText('custrecord_rows', 'CUSTITEM_LEATHER_PATTERN'), 
					   	airbags: part.getText('custrecord_airbag', 'CUSTITEM_LEATHER_PATTERN'),
					   	insert_style: part.getText('custitem_insert_style'),
					   	upccode: part.getValue('upccode'),
					   	shippackage: part.getValue('shippackage'),
					   	weight: part.getValue('weight')
					};
				
				assignPrice(item);
				assignLnWdHt(item);
				assignColSwatch(part.getValue('custrecord_swatch', 'custitem_leather_color'), item, "color_hex", "color_url");
				assignColSwatch(part.getValue('custrecord_swatch', 'custitem_ins_color'), item, "insert1_hex", "insert1_url");
				assignColSwatch(part.getValue('custrecord_swatch', 'custitem_3t_insert_clr2'), item, "insert2_hex", "insert2_url");

				assignStoreUrlId(item, part);
				
				var carVals = part.getValue('custrecord_car_type', 'CUSTITEM_LEATHER_PATTERN');
				var carIds = carVals.split(",");
				
				var carSrch = jPw.cars.getPtrnCarSearch()
					.addFilt(new nlobjSearchFilter('internalid', null, 'anyOf', carIds))
					.addCol(new nlobjSearchColumn('custrecord_make'))
					.addCol(new nlobjSearchColumn('custrecord_year').setSort( true ))
					.addCol(new nlobjSearchColumn('custrecord_model'))
					.addCol(new nlobjSearchColumn('custrecord_body'))
					.addCol(new nlobjSearchColumn('custrecord_tl'))				
					;
				var carsResSet = carSrch.runSearch();
				
				if (!excludeCars) {
					var cars = [];
					jPw.loopResSet(carsResSet,
						function(car) {
							var years = car.getText('custrecord_year').split(",");
							jPw.each(years, function(idx, year) {
								cars.push({
									make: car.getText('custrecord_make'),
									year: year,
									model: car.getText('custrecord_model'),
									body: car.getText('custrecord_body'),
									trim: car.getText('custrecord_tl')
								});
							});
						}
					);
					if (cars.length > 0) {
						item.cars = cars;
					};
				};
				
				list.push(item);
			},
			null, 
			maxItems
		);
		
		return list;
	};
	
	
}( this.jPw.parts = this.jPw.parts || {}));

(function(parts) {

	parts.instNutsEbayList = function(baseSearch, excludeCars, maxItems) {
		var search = jPw.parts.getEbayPartsSearch(baseSearch);
		var partsList = jPw.parts.eBayPartsList(search, excludeCars, maxItems);
		
		var getCarListStr = function (cars) {
			if (!cars) {return '';}
			return jPw.map(cars, function() {
				return this.make+' '+this.year+' '+this.model+' '+this.body+' '+this.trim;
			}).join('; ');
		};
		
		var getItemSpecificsStr = function (obj) {
			var details = [];
			var val;
			for (var prop in obj) {
			    if (obj.hasOwnProperty(prop)) {
			    	val = obj[prop];
			    	if (val) {
			    		details.push(prop+'='+val);
			    	};
			    }
			};
			if (details.length > 0) {
				return details.join(';');
			} else {
				return '';
			};
		};
		
		rows = jPw.map(partsList, function() {
			var part = this;
			return {
				Add_Edit_Remove: 'Add', 	
				Category: part.category, 
				Sub_Category: part.sub_category, 	
				Brand: 'Roadwire', 
				Model_Number: part.base_part,
				Product_Short_Description: part.slctr_descr, 	
				Product_Long_Description: part.color+' '+part.descr,
				Mfr_UPC:  part.upccode,
				Product_Picture_URL:  part.img_url,
				Product_Literature_URL: '',
				Product_Specific_Weblink: 'http://roadwire.com/s.nl?it=A&id='+ part.storeurl_id,	
				MSRP: part.price,
				MAP: part.price,
				Speakers: '',
				Product_Depth: '',
				Universal_Product: 'No',
				Vehicle_Fit_Info: getCarListStr(part.cars), 
				Item_Specifics: getItemSpecificsStr({		    	
					Rows: part.rows, 
					Airbags: part.airbags,
					Decorations: part.decorations,
					'Insert Color': part.insert1,
					'2nd Insert Color': part.insert2
				}),
				Shipping_Package_Depth:  part.height,
				Shipping_Package_Width:  part.width,
				Shipping_Package_Length:  part.length,
				Shipping_Package_Weight:  part.weight
			};
		});
		
		return rows;
	};

}( this.jPw.parts = this.jPw.parts || {}));

/*
Add_Edit_Remove	
Category	
Sub_Category	
Brand	
Model_Number	
Product_Short_Description	
Product_Long_Description	
Mfr_UPC	
Product_Picture_URL	
Product Literature_URL	
Product_Specific_Weblink  http://roadwire.com/s.nl/it.A/id.334031/.f  http://roadwire.com/s.nl?it=A&id=334031	
MSRP	
MAP	
Speakers	
Product_Depth	
Universal_Product	
Vehicle_Fit_Info	
Item_Specifics	
Shipping_Package_Depth	
Shipping_Package_Width	
Shipping_Package_Length	
Shipping_Package_Weight
*/
