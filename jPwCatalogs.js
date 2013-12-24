/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Sep 2013     james.white
 *
 * Required
 * jPwJsUtils.js
 * jPwNsScriptUtils.js
 */

(function(jPw, undefined) {
	jPw.clearCatalog = function(recType, ctlgId, ctlgFldId) {
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
					var submitType = record.getRecordType();
					nlapiSubmitField(submitType, recId, ctlgFldId, ctlgIds);
				};
			};		
		});//, null, 10);
		
	};

	jPw.clearItemCatalog = function(ctlgId) {
		jPw.clearCatalog('Item', ctlgId, 'custitem_item_prod_ctlg');
	};

	jPw.clearCarCatalog = function(ctlgId) {
		jPw.clearCatalog('customrecord_current_classic_car', ctlgId, 'custrecord_car_prod_ctlg');
	};

	jPw.clearMakeCatalog = function(ctlgId) {
		jPw.clearCatalog('customrecord_car_make', ctlgId, 'custrecord_make_prod_ctlg');
	};
	
	jPw.assignCtlgFromSrch = function(srchId, ctlgId, ctlgFld) {

		if ((!srchId) || (!ctlgId)) {return;};
		
		var srchRes = nlapiSearchRecord('SavedSearch', null, 
				[new nlobjSearchFilter('internalid', null, 'is', srchId)],[new nlobjSearchColumn('title'), new nlobjSearchColumn('recordtype')]);
		
		if ((!srchRes) || (srchRes.length < 0)) {return;};
		
		var recType = srchRes[0].getValue('recordtype');

		var srcSvdSrch = nlapiLoadSearch(recType, srchId);

		var ctlgFldId = ctlgFld;
		if (!ctlgFldId) {
			var srchCols = srcSvdSrch.getColumns();
			var cltgIdx = jPw.indexOfEval(srchCols, function (col) {
				return (col.getLabel() == 'Product Catalog');
			});
			if (cltgIdx !== -1) {
				ctlgFldId = srchCols[cltgIdx].getName();
			} else {
				ctlgFldId = 'custitem_item_prod_ctlg';
			};
		};
		srcSvdSrch.addFilter(new nlobjSearchFilter(ctlgFldId, null, 'noneof', [ctlgId]));
		jPw.ensureSrchCol(srcSvdSrch, ctlgFldId);
		jPw.ensureSubmitTypeResults(srcSvdSrch);

		// clear out the current catalog
		jPw.clearCatalog(recType, ctlgId, ctlgFldId);
		
		// start setting the catalog for each record returned by the saved search
		jPw.setCtlgForSrch(srcSvdSrch, ctlgId, ctlgFldId);
	};
		
	jPw.setCtlgForSrch = function(search, ctlgId, ctlgFldId) {
		// start setting the catalog for each record returned by the saved search
		var srcResSet = search.runSearch();

		jPw.loopResSet(srcResSet, function(record) {
			var recId = record.getId();
			var ctlgIds;
			var ctlgStr = record.getValue(ctlgFldId);
			if (ctlgStr) {
				ctlgIds = ctlgStr.split(',');
				if(ctlgIds.indexOf(ctlgId) === -1) {
					ctlgIds.push(ctlgId);
				};
			} else {
				ctlgIds = [ctlgId];
			};
			var submitType = record.getRecordType();
			nlapiSubmitField(submitType, recId, ctlgFldId, ctlgIds);
		});//, null, 10);
	};

	jPw.assignCarCtlgFromItms = function(ctlgId) {
		
		var carCtlgFld = 'custrecord_car_prod_ctlg';
		
		var carSrch = function(ids) {
			return nlapiCreateSearch('customrecord_current_classic_car', 
				[new nlobjSearchFilter('internalid', null, 'anyof', ids)],
				[new nlobjSearchColumn(carCtlgFld)]
			);
		};

		// clear all cars for this catalog
		jPw.clearMakeCatalog(ctlgId);
		jPw.clearCarCatalog(ctlgId);
		
		var ptrnCarSrch = nlapiCreateSearch('customrecord_leather_pattern', 
			[new nlobjSearchFilter('custitem_item_prod_ctlg', 'custitem_leather_pattern', 'allof', [ctlgId])],
			[new nlobjSearchColumn('custrecord_car_type'), new nlobjSearchColumn('custrecord_make', 'custrecord_car_type')]
		);

		var carIds = [];
		var makeIds = [];		
		var ptrnCarResSet = ptrnCarSrch.runSearch();
		jPw.loopResSet(ptrnCarResSet, function(record) {
			var makeId = record.getValue('custrecord_make', 'custrecord_car_type');
			if(makeIds.indexOf(makeId) === -1) {
				makeIds.push(makeId);
			};
			
			var idStr = record.getValue('custrecord_car_type');
			var ids, id;
			if (idStr) {
				ids = idStr.split(',');
				for(var i = 0; i<ids.length; i++){
					id = ids[i];
					if(carIds.indexOf(id) === -1) {
						carIds.push(id);
					};
					if (carIds.length >= 200) {
						jPw.setCtlgForSrch(carSrch(carIds), ctlgId, carCtlgFld);
						carIds = [];
					};
				};
			};			
		}); //, null, 15);
		if (carIds.length > 0) {
			jPw.setCtlgForSrch(carSrch(carIds), ctlgId, carCtlgFld);
		};
		
		if (makeIds.length > 0) {
			var makeSrch =  nlapiCreateSearch('customrecord_car_make', 
					[new nlobjSearchFilter('internalid', null, 'anyof', makeIds)],
					[new nlobjSearchColumn('custrecord_make_prod_ctlg')]);

			jPw.setCtlgForSrch(makeSrch, ctlgId, 'custrecord_make_prod_ctlg');
		};
		
	};
	
}( this.jPw = this.jPw || {}));

(function(jPw, undefined) {
	/**
	 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
	 * @returns {Void}
	 */
	jPw.scheduledAssignCatalog = function(type) {
		//if ( type != 'scheduled' ) return; /* script should only execute during scheduled calls. */
		var context = nlapiGetContext();
		var srchId = context.getSetting('SCRIPT', 'custscript_asgn_ctlg_search');
		var ctlgId = context.getSetting('SCRIPT', 'custscript_asgn_ctlg_prod_ctlg');
		var ctlgFld = context.getSetting('SCRIPT', 'custscript_asgn_ctlg_ctlg_fld_id');
	
		jPw.assignCtlgFromSrch(srchId, ctlgId, ctlgFld);
	};

	/**
	 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
	 * @returns {Void}
	 */
	jPw.scheduledAssignCarItemCatalog = function(type) {
		//if ( type != 'scheduled' ) return; /* script should only execute during scheduled calls. */
		var context = nlapiGetContext();
		var ctlgId = context.getSetting('SCRIPT', 'custscript_asgn_car_it_prod_ctlg');
		
		jPw.assignCarCtlgFromItms(ctlgId);
	};
	
	/**
	 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
	 * @returns {Void}
	 */
	jPw.scheduledClearItemCatalog = function(type) {
		//if ( type != 'scheduled' ) return; /* script should only execute during scheduled calls. */
		var context = nlapiGetContext();
		var ctlgId = context.getSetting('SCRIPT', 'custscript_clr_ctlg_prod_ctlg');
	
		jPw.clearMakeCatalog(ctlgId);
		jPw.clearCarCatalog(ctlgId);
		jPw.clearItemCatalog(ctlgId);
	};

	/**
	 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
	 * @returns {Void}
	 */
	jPw.scheduledClearCarCatalog = function(type) {
		//if ( type != 'scheduled' ) return; /* script should only execute during scheduled calls. */
		var context = nlapiGetContext();
		var ctlgId = context.getSetting('SCRIPT', 'custscript_clr_car_prod_ctlg');
		
		jPw.clearMakeCatalog(ctlgId);
		jPw.clearCarCatalog(ctlgId);	
	};
	
}( this.jPw = this.jPw || {}));


(function(jPw, undefined) {
	jPw.addPtrnCarCtlgs = function (ptrnId, ctlgs) {
		if ((!ptrnId) || (!ctlgs)) {
			return;
		};
		
		var cars = nlapiSearchRecord('customrecord_current_classic_car', null,
				[new nlobjSearchFilter('internalid' ,'custrecord_car_type', 'is', ptrnId )], // this is actually searching for pattern internalid
				[new nlobjSearchColumn('custrecord_make'), new nlobjSearchColumn('custrecord_car_prod_ctlg')]);
		
		var makeIds = [];
		jPw.each(cars, function() {
			var car = this;
			if ( jPw.sumbitMultiVals(ctlgs, car, 'custrecord_car_prod_ctlg') ) {
				jPw.addOnlyUniqueElm(makeIds, car.getValue('custrecord_make'));
			}
		});
		
		if (makeIds.length > 0) {
			jPw.addMakeCtlgs(makeIds, ctlgs);
		};
	};
	
	jPw.addMakeCtlgs = function (makeIds, ctlgs) {
		var makes = nlapiSearchRecord('customrecord_car_make', null,
				[new nlobjSearchFilter('internalid', null, 'anyof', makeIds)],
				[new nlobjSearchColumn('custrecord_make_prod_ctlg'),]);	
		jPw.each(makes, function() {
			var make = this;
			jPw.sumbitMultiVals(ctlgs, make, 'custrecord_make_prod_ctlg');
		});
	};
	
	jPw.delPtrnCarCtlgs = function (ptrnId, ctlgs) {
		if ((!ptrnId) || (!ctlgs)) {
			return;
		};
		var cars = nlapiSearchRecord('customrecord_current_classic_car', null,
				[new nlobjSearchFilter('internalid' ,'custrecord_car_type', 'is', ptrnId )], // this is actually searching for pattern internalid
				[new nlobjSearchColumn('custrecord_make'), new nlobjSearchColumn('custrecord_car_prod_ctlg')]);
		
		var makeIds = [];
		jPw.each(cars, function() {
			var car = this;
			
			var curCtlgStr = car.getValue('custrecord_car_prod_ctlg');
			var curCtlgs = curCtlgStr ? curCtlgStr.split(',') : [];
			var chkCtlgs = jPw.arrUnion(curCtlgs, ctlgs);
			var delCtlgs = [];

			var carId = car.getId();
			var ptrns = nlapiSearchRecord('customrecord_current_classic_car', null,
					[new nlobjSearchFilter('internalid', null, 'is', carId)],
					[new nlobjSearchColumn('internalid' ,'custrecord_car_type')]);

			jPw.each(chkCtlgs, function() {
				var ctlg = this;
				var ctlgFound = false;
				
				jPw.each(ptrns, function() {
					var ptrn = this;
					var ptrnId = ptrn.getId();
					
					// search for pattern with attached item with the catalog in question
					var itmSrch = nlapiCreateSearch('customrecord_leather_pattern', 
							[new nlobjSearchFilter('internalid' , null, 'is', ptrnId),
							 new nlobjSearchFilter('custitem_item_prod_ctlg', 'custitem_leather_pattern', 'anyof', ctlg)]);
					
					var itmRes = itmSrch.runSearch().getResults(0, 1); // only need to find one to keep it
					if((itmRes) && (itmRes.length > 0)) { // if value found, record found and quite each loop, no need to search more
						ctlgFound = true;
						return;
					};
				});
				
				if (!ctlgFound) {
					delCtlgs.push(ctlg);
				};
 			});
			
			if (delCtlgs.length > 0) { // there are ctlgs to remove
				//var newCltgs = curCtlgs.filter(function(i) {return !(delCtlgs.indexOf(i) > -1);});
				var newCltgs = jPw.arrMinusArr(curCtlgs, delCtlgs);
				
				//nlapiSubmitField(car.getRecordType(), car.getId(), 'custrecord_car_prod_ctlg', newCltgs);
				var record = nlapiLoadRecord(car.getRecordType(), car.getId());
				if (record) {
					record.setFieldValues('custrecord_car_prod_ctlg', newCltgs);
					nlapiSubmitRecord(record, true);
				};
				
				jPw.addOnlyUniqueElm(makeIds, car.getValue('custrecord_make'));
			};
			
		});
		
		if (makeIds.length > 0) {
			jPw.delMakeCtlgs(makeIds, ctlgs);
		};
	};
	
	jPw.delMakeCtlgs = function (makeIds, ctlgs) {
		var makes = nlapiSearchRecord('customrecord_car_make', null,
				[new nlobjSearchFilter('internalid', null, 'anyof', makeIds)],
				[new nlobjSearchColumn('custrecord_make_prod_ctlg'),]);	
		jPw.each(makes, function() {
			var make = this;
			var makeId = make.getId();
			
			var curCtlgStr = make.getValue('custrecord_make_prod_ctlg');
			var curCtlgs = curCtlgStr ? curCtlgStr.split(',') : [];
			var chkCtlgs = jPw.arrUnion(curCtlgs, ctlgs);
			var delCtlgs = [];

			jPw.each(chkCtlgs, function() {
				var ctlg = this;
				
				var carSrch = nlapiCreateSearch('customrecord_current_classic_car', 
						[new nlobjSearchFilter('custrecord_make', null, 'is', makeId),
						 new nlobjSearchFilter('custrecord_car_prod_ctlg', null, 'anyof', ctlg)]);

				var carRes = carSrch.runSearch().getResults(0, 1); // only need to find one to keep it
				if ((!carRes) || (carRes.length < 1)) { 		   // if value not found for any sub record, it should be removed 
					delCtlgs.push(ctlg);
				};
			});
			
			if (delCtlgs.length > 0) { // there are ctlgs to remove
				//var newCltgs = curCtlgs.filter(function(i) {return !(delCtlgs.indexOf(i) > -1);});
				var newCltgs = jPw.arrMinusArr(curCtlgs, delCtlgs);
				
				//nlapiSubmitField(make.getRecordType(), make.getId(), 'custrecord_make_prod_ctlg', newCltgs);
				var record = nlapiLoadRecord(make.getRecordType(), make.getId());
				if (record) {
					record.setFieldValues('custrecord_make_prod_ctlg', newCltgs);
					nlapiSubmitRecord(record, true);
				};

			};
			
		});
	};
	
	jPw.itemUeAftCtlgs = function (type) {
		if (type == 'edit' ) {
			var oldCtlgs, newCtlgs, addedCtlgs, deletedCtlgs; 
			
			var oldRec = nlapiGetOldRecord();
			if (!oldRec) { // there are reports that errs with null, try again, just in case it works 
				oldRec = nlapiGetOldRecord();
			};
			if (oldRec) { 
				oldCtlgs = oldRec.getFieldValues('custitem_item_prod_ctlg');
			} else {
				nlapiLogExecution('ERROR', 'itemUeAftCtlgs Edit', 'nlapiGetOldRecord() returned null' );
				return;
			};
			
			var newRec = nlapiGetNewRecord();
			newCtlgs = newRec.getFieldValues('custitem_item_prod_ctlg');
			
			deletedCtlgs = jPw.missingFrom(oldCtlgs, newCtlgs);
			addedCtlgs = jPw.missingFrom(newCtlgs, oldCtlgs);
			
			if (((addedCtlgs) && (addedCtlgs.length > 0)) || ((deletedCtlgs) && (deletedCtlgs.length > 0))) {
				//var itmId = nlapiGetRecordId();
				var ptrnId = newRec.getFieldValue('custitem_leather_pattern');

				if ((addedCtlgs) && (addedCtlgs.length > 0)) {
					nlapiLogExecution('DEBUG', 'itemUeAftCtlgs Edit', 'Add Ctlgs ptrnId '+ptrnId+' ctlgs '+addedCtlgs.join(',') );
					jPw.addPtrnCarCtlgs(ptrnId, addedCtlgs);
				};
				if ((deletedCtlgs) && (deletedCtlgs.length > 0)) {
					nlapiLogExecution('DEBUG', 'itemUeAftCtlgs Edit', 'Del Ctlgs ptrnId '+ptrnId+' ctlgs '+deletedCtlgs.join(',') );
					jPw.delPtrnCarCtlgs(ptrnId, deletedCtlgs);
				};
			};
		}
	  
		else if (type == 'delete' ) {
			var ptrnId, oldCtlgs;
			var oldRec = nlapiGetOldRecord();
			if (!oldRec) { // there are reports that errs with null, try again, just in case it works 
				oldRec = nlapiGetOldRecord();
			};
			if (oldRec) { 
				ptrnId = oldRec.getFieldValue('custitem_leather_pattern');
				oldCtlgs = oldRec.getFieldValues('custitem_item_prod_ctlg');
			} else {
				nlapiLogExecution('ERROR', 'itemUeAftCtlgs Delete', 'nlapiGetOldRecord() returned null' );
				return;
			};

			nlapiLogExecution('DEBUG', 'itemUeAftCtlgs Delete', 'oldCtlgs '+ (oldCtlgs ? oldCtlgs.join(',') : 'zilch') );
			jPw.delPtrnCarCtlgs(ptrnId, oldCtlgs);
		};
		
	};
}( this.jPw = this.jPw || {}));
