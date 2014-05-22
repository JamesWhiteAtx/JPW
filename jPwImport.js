/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Nov 2013     james.white
 *
 */

(function(jPw, undefined) {
	
	jPw.logExecutionMsg = function(e, errorDetailMsg) {
		var msg = new String();
		msg += errorDetailMsg;
		if(e.getCode != null) {
			msg += " "+ e.getDetails();
		} else {
			msg += " "+ e.toString();
		};
		return msg;  
	};
	jPw.pnvl = function(value, number) {
		if(number){
			if(isNaN(parseFloat(value))) return 0;
			return parseFloat(value);
		}
		if(value == null) return '';
		return value;
	};
	if (!jPw.indexOfEval) {
		jPw.indexOfEval = function (arr, fcn) {
			for (var i = 0, len = arr.length; i < len; i++) {
				if (fcn(arr[i])) {
					return i;
				};
			};
			return -1;
		};
	};
	
	jPw.getSrchCache = function(recType, filts, cols, transfFcn) {
		var items = [];
		var results = nlapiSearchRecord(recType, null, filts, cols);
		for (var i = 0, len = results.length; (results != null) && (i < len); i++) {
			items.push(transfFcn(results[i]));
		};
		
		var findItem = function(fcn) {
			var idx = jPw.indexOfEval(items, fcn);
			if (idx > -1) {
				return items[idx];
			} else {
				return null;
			}
		};
		
		var findItemById = function(id) {
			return findItem(
				function(result) {return result.id == id;}
			);
		};
		
		return {
			results: results,
			items: items,
			findItem: findItem,
			findItemById: findItemById
		};
	};
	
	jPw.getPartMapCache = function() {
		var cache = jPw.getSrchCache('customrecord_isis_part_map',
			[ ], 
			[ new nlobjSearchColumn('custrecord_isis_map_prod_type'),
			  new nlobjSearchColumn('custrecord_isis_map_rows'),
			  new nlobjSearchColumn('custrecord_isis_map_kit_type'),
			  new nlobjSearchColumn('custrecord_isis_map_trim_level'),
			  new nlobjSearchColumn('custrecord_isis_map_template_item'),
			  new nlobjSearchColumn('custrecord_isis_map_parent')],
			function (result) {return {
				ptId: result.getValue('custrecord_isis_map_prod_type'),
				ptCd: result.getText('custrecord_isis_map_prod_type'),
				rows: result.getValue('custrecord_isis_map_rows'),
				kitTypeId: result.getValue('custrecord_isis_map_kit_type'),
				kitTypeName: result.getText('custrecord_isis_map_kit_type'),
				trimLvl: result.getValue('custrecord_isis_map_trim_level'),
				templateId: result.getValue('custrecord_isis_map_template_item'),
				templateName: result.getText('custrecord_isis_map_template_item'),
				parentId: result.getValue('custrecord_isis_map_parent'),
				parentName: result.getText('custrecord_isis_map_parent')
			};}
		);

		cache.findMap = function(ptId, rows, kitTypeId, trimLvl) {

			var map = cache.findItem(
				function(itm) {return (itm.ptId == ptId) && (itm.rows == rows) && (itm.kitTypeId == kitTypeId) && (itm.trimLvl == trimLvl);	}
			);
			return map;
		};
		
		cache.findTemplateId = function(ptId, rows, kitTypeId, trimLvl) {
			var map = cache.findItem(ptId, rows, kitTypeId, trimLvl);
			if (map) {return map.templateId;}
		};
		
		return cache;
	};
	
	jPw.NsAirBag = function(isisAirBag) {
		if (isisAirBag == 'ALL') {return 1;} // ALL
		else if (isisAirBag == 'SAB') {return 4;} // Side Airbags
		else if (isisAirBag == 'FRT/REAR SAB') {return 2;} //Front/Rear Side AirBags
		else if (isisAirBag == 'NOAB') {return 3;} // No Airbags
		else {return 5;}; // With or Without Airbags
	};
	
	jPw.leaContent = function(isisTrimLlvl) {
		if (isisTrimLlvl == 'R') {return 2;} // premium
		else {return 1;}; //Standard
	};
	
	jPw.itemExists = function(itmName) {
		var results = nlapiSearchRecord('item', null, 
				[ new nlobjSearchFilter('name', null, 'is', itmName)], 
				[ new nlobjSearchColumn('itemid')]);

		return ((results) && (results.length > 0));
	};
	jPw.getPtrnId = function(ptrnName) {
		var results = nlapiSearchRecord('customrecord_leather_pattern', null,[ new nlobjSearchFilter('name', null, 'is', ptrnName )]);
		if ((results) && (results.length > 0)) {
			return results[0].getId(); 
		} 
	};
	jPw.ptrnExists = function(ptrnName) {
		return(!!jPw.getPtrnId());
	};
	
	jPw.getPtrnPtId = function() {
		var name = 'LEATHER PATTERN';
		var types = nlapiSearchRecord('customrecord_isis_prod_type', null, [ new nlobjSearchFilter('name', null, 'is', name)]);
		if ((types) && (types.length > 0)) {
			return types[0].getId();
		} else {
			throw nlapiCreateError('TYPE_MISSING', 'failed to find ISIS Prod Type "'+name+'"');
		};
	};
	
	jPw.getPtHash = function() {
		var results = nlapiSearchRecord('customrecord_isis_prod_type', null, [], 
				[new nlobjSearchColumn('name'), 
				new nlobjSearchColumn('custrecord_isis_pt_prod_ctgry'),
				new nlobjSearchColumn('custrecordisis_pt_prod_sub_ctgry')]);

		var pth = {};
		for (var i = 0, len = results.length; i < len; i++) {
			var ptCd = results[i].getValue('name').toString();
			pth[ptCd] = {
				code: ptCd,
				id: results[i].getId(),
				ctgry: results[i].getValue('custrecord_isis_pt_prod_ctgry'),
				subCtgry: results[i].getValue('custrecordisis_pt_prod_sub_ctgry')
			};
		};
		return pth;
	};
	jPw.getClrHash = function() {
		var results = nlapiSearchRecord('customrecord_isis_colr_map', null, [], 
				[new nlobjSearchColumn('name'), 
				new nlobjSearchColumn('custrecord_isis_colr_map_ns_colr')]);

		var clrh = {};
		for (var i = 0, len = results.length; i < len; i++) {
			var clrCd = results[i].getValue('name').toString();
			clrh[clrCd ] = results[i].getId();
		};
		return clrh;
	};
	
}( this.jPw = this.jPw || {}));	

(function(jPw, undefined) {
	jPw.isisImportBeforeSubmit = function(type){
		var max = 1000;
	    if (type != 'create') {
	    	return;
	    };

		try {
		    var itmName = nlapiGetFieldValue('custrecord_isis_prod_imp_prodcd').toString();
	    	if (jPw.itemExists(itmName)) {
	    		nlapiSetFieldValue('custrecord_isis_prod_imp_exstserr', 'T');
	    		throw nlapiCreateError('ITEM_FOUND', 'An item name already exists in NetSuite: "'+itmName+'"');
	    	};

	    	nlapiSetFieldValue('custrecord_isis_prod_imp_exstserr', 'F');
	    	nlapiSetFieldValue('custrecord_isis_prod_imp_converterr', 'F');
			nlapiSetFieldValue('custrecord_isis_prod_imp_err', 'F');
		} catch (e) {
    		var msg = jPw.logExecutionMsg(e, 'Error Importing Record - ');
    		
    		nlapiSetFieldValue('custrecord_isis_prod_imp_err', 'T');
    		nlapiSetFieldValue('custrecord_isis_prod_imp_err_msg', msg);
		};
    };
    
    
	jPw.importResSet = function(resultSet, fcn, chunk, max) {
		var context = nlapiGetContext();
		
		var checkReSched = function() {
			if ( context.getRemainingUsage() < 100) {
				var status = nlapiScheduleScript(context.getScriptId(), context.getDeploymentId());
				if( status == 'QUEUED' ) { 
					nlapiLogExecution('AUDIT', 'Programatically Scheduled Script:'+context.getScriptId()+' Delpoyment:'+context.getDeploymentId());
					return true;
				} else {
					nlapiLogExecution('ERROR', 'Failed to Programatically Scheduled Script:'+context.getScriptId()+' Delpoyment:'+context.getDeploymentId());
					return true;
				};
			};
		};
		
		var maxChunk = 1000;
		var chunkSize = chunk || maxChunk;
		if (chunkSize > maxChunk) {chunkSize = maxChunk;};
		if (chunkSize > max) {chunkSize = max;};
	
		var reScheduled = false;
		var total = 0;
		var start = 0;
		var resCount = 0;
		var resEqualsChunk = true;
		while (resEqualsChunk && (!max || (total < max)) && (!reScheduled) ) {
			var results = resultSet.getResults(start, start + chunkSize);
			resCount = 0;

			for (var i = 0, len = results.length; i < len; i++) {
				reScheduled = checkReSched();
				if ( reScheduled ) {
					break;
				};
				resCount ++;
				fcn(results[i], i, start, start + chunkSize);
			};
			total = total + resCount;
			if ( reScheduled ) {
				break;
			};

			resEqualsChunk = (resCount === chunkSize);
			if (resEqualsChunk) {
				start = total;
				if ((max) && ((total + chunkSize) > max)) {
					chunkSize = max - total;
				};
			};
		};
		nlapiLogExecution('AUDIT', 'Processed '+total+' import records.');
	};

	
    jPw.loadIsisPatterns = function() {
    	    	
    	var checkPtrnExsts = function(ptrn, record) {
    		//var ptrns = nlapiSearchRecord('customrecord_leather_pattern', null,[ new nlobjSearchFilter('name', null, 'is', ptrn )]);
    		if (jPw.ptrnExists(ptrn)) {
    			var msg = 'Custom Pattern '+ptrn+' already exists';
        		
    			nlapiLogExecution('AUDIT', msg);
        		
        		var impRec = nlapiLoadRecord(record.getRecordType(), record.getId());
        		impRec.setFieldValue('custrecord_isis_prod_imp_converterr', 'T');
        		impRec.setFieldValue('custrecord_isis_prod_imp_exstserr', 'T');
        		impRec.setFieldValue('custrecord_isis_prod_imp_err', 'T');
        		impRec.setFieldValue('custrecord_isis_prod_imp_err_msg', msg);
        		nlapiSubmitRecord(impRec, true);
        		
    			return true;
    		} else {
    			return false;
    		};
    	};
    	
    	var ptrnPtId = jPw.getPtrnPtId();

    	var search = nlapiCreateSearch('customrecord_isis_prod_import',  
		[ new nlobjSearchFilter('custrecord_isis_prod_imp_prodtype', null, 'is', ptrnPtId ),
    	  new nlobjSearchFilter('custrecord_isis_prod_imp_converterr', null, 'is', 'F' ),
    	  new nlobjSearchFilter('custrecord_isis_prod_imp_exstserr', null, 'is', 'F' ),
    	  new nlobjSearchFilter('custrecord_isis_prod_imp_err', null, 'is', 'F' ),
    	  new nlobjSearchFilter('custrecord_isis_prod_imp_item', null, 'is', '@NONE@'),
    	  new nlobjSearchFilter('custrecord_isis_prod_imp_pattern', null, 'is', '@NONE@' )],
    	[ new nlobjSearchColumn('custrecord_isis_prod_imp_prodcd'),
    	  new nlobjSearchColumn('custrecord_isis_prod_imp_ptrn'),
    	  new nlobjSearchColumn('custrecord_isis_prod_imp_descr'),
    	  new nlobjSearchColumn('custrecord_isis_prod_imp_seldisp'),
    	  new nlobjSearchColumn('custrecord_isis_prod_imp_trmlvl'),
    	  new nlobjSearchColumn('custrecord_isis_prod_imp_rows'),
    	  new nlobjSearchColumn('custrecord_isis_prod_imp_airbag'),
    	  new nlobjSearchColumn('custrecord_isis_prod_imp_note'),
    	]);
    	
    	var resSet = search.runSearch();
    	
    	jPw.importResSet(resSet, 
    		function(record, idx, start, end) {
    	    	try {
        			var ptrn = record.getValue('custrecord_isis_prod_imp_ptrn');
    	    		
        			if (checkPtrnExsts(ptrn, record)) {
        				return ;
        			}
        			
        			var ptrnRec = nlapiCreateRecord('customrecord_leather_pattern');
        			
        			ptrnRec.setFieldValue('name', ptrn);
        			ptrnRec.setFieldValue('custrecord_pattern_desc', record.getValue('custrecord_isis_prod_imp_ptrn'));
        			ptrnRec.setFieldValue('custrecord_selector_descr', record.getValue('custrecord_isis_prod_imp_seldisp'));
        			
        			ptrnRec.setFieldValue('custrecord_spec_edition', 'F');
        			ptrnRec.setFieldValue('custrecord_lthr_content', jPw.leaContent(record.getValue('custrecord_isis_prod_imp_trmlvl')));
        			ptrnRec.setFieldValue('custrecord_rows', record.getValue('custrecord_isis_prod_imp_rows'));
        			ptrnRec.setFieldValue('custrecord_airbag', jPw.NsAirBag(record.getValue('custrecord_isis_prod_imp_airbag')));
        			ptrnRec.setFieldValue('custrecord_spec_notes', 'ISIS Import '+record.getValue('custrecord_isis_prod_imp_note'));
        			ptrnRec.setFieldValue('custrecord_is_processed', 'F');	
        			
        			ptrnRec.setFieldValue('custrecord_ptrn_import_source', 'ISIS Import');
        			
        			var ptrnId = nlapiSubmitRecord(ptrnRec, true);
        			nlapiLogExecution('DEBUG', 'Created '+ ptrn+'. id: '+ptrnId);
        			
            		var impRec = nlapiLoadRecord(record.getRecordType(), record.getId());
            		impRec.setFieldValue('custrecord_isis_prod_imp_pattern', ptrnId);
            		nlapiSubmitRecord(impRec, true);
    	    	} catch (e) {
    	    		var msg = jPw.logExecutionMsg(e, 'Error Converting Record - ');
    	    		nlapiLogExecution('ERROR', msg);

            		var impRec = nlapiLoadRecord(record.getRecordType(), record.getId());
            		impRec.setFieldValue('custrecord_isis_prod_imp_converterr', 'T');
            		impRec.setFieldValue('custrecord_isis_prod_imp_err', 'T');
            		impRec.setFieldValue('custrecord_isis_prod_imp_err_msg', msg);
            		nlapiSubmitRecord(impRec, true);
    	    	};
    		} 
    	);
    	
    };
    
    jPw.importItemsFromIsis = function() {
    	
    	var checkItmExsts = function(itmName, record) {
    		var items = nlapiSearchRecord('item', null,[ new nlobjSearchFilter('name', null, 'is', itmName )]);
    		
    		if ((items) && (items.length > 0)) {
    			var msg = 'Item '+itmName+' already exists';
        		
    			nlapiLogExecution('AUDIT', msg);
        		
        		var impRec = nlapiLoadRecord(record.getRecordType(), record.getId());
        		impRec.setFieldValue('custrecord_isis_prod_imp_converterr', 'T');
        		impRec.setFieldValue('custrecord_isis_prod_imp_exstserr', 'T');
        		impRec.setFieldValue('custrecord_isis_prod_imp_err', 'T');
        		impRec.setFieldValue('custrecord_isis_prod_imp_err_msg', msg);
        		nlapiSubmitRecord(impRec, true);
        		
    			return true;
    		} else {
    			return false;
    		};
    	};

    	var getImpResSet = function() {
        	var search = nlapiCreateSearch('customrecord_isis_prod_import',  
        			[ new nlobjSearchFilter('custrecord_isis_prod_imp_converterr', null, 'is', 'F' ),
        	    	  new nlobjSearchFilter('custrecord_isis_prod_imp_exstserr', null, 'is', 'F' ),
        	    	  new nlobjSearchFilter('custrecord_isis_prod_imp_err', null, 'is', 'F' ),
        	    	  new nlobjSearchFilter('custrecord_isis_prod_imp_item', null, 'is', '@NONE@'),
        	    	  new nlobjSearchFilter('custrecord_isis_prod_imp_pattern', null, 'is', '@NONE@' )],
        	    	[ new nlobjSearchColumn('custrecord_isis_prod_imp_prodcd').setSort( false ),
        	    	  new nlobjSearchColumn('custrecord_isis_prod_imp_prodtype'),
        	    	  new nlobjSearchColumn('custrecord_isis_prod_imp_prntprod'),
        	    	  new nlobjSearchColumn('custrecord_isis_prod_imp_descr'),
        	    	  new nlobjSearchColumn('custrecord_isis_prod_imp_seldisp'),
        	    	  new nlobjSearchColumn('custrecord_isis_prod_imp_rows'),
        	    	  new nlobjSearchColumn('custrecord_isis_prod_imp_trmlvl'),
        	    	  new nlobjSearchColumn('custrecord_isis_prod_imp_leatype'),
        	    	  new nlobjSearchColumn('custrecord_isis_prod_imp_leacol'),
        	    	  new nlobjSearchColumn('custrecord_isis_prod_imp_inst1'),
        	    	  new nlobjSearchColumn('custrecord_isis_prod_imp_inst2'),
        	    	  new nlobjSearchColumn('custrecord_isis_prod_imp_ptrn'),
        	    	  new nlobjSearchColumn('custrecord_isis_prod_imp_airbag'),
        	    	  new nlobjSearchColumn('custrecord_isis_prod_imp_ptrninns'),
        	    	  new nlobjSearchColumn('custrecord_isis_prod_imp_converterr'),
        	    	  new nlobjSearchColumn('custrecord_isis_prod_imp_exstserr'),
        	    	  new nlobjSearchColumn('custrecord_isis_prod_imp_err'),
        	    	  new nlobjSearchColumn('custrecord_isis_prod_imp_err_msg'),
        	    	  new nlobjSearchColumn('custrecord_isis_prod_imp_item'),
        	    	  new nlobjSearchColumn('custrecord_isis_prod_imp_pattern'),
        	    	]);
        	
        	return search.runSearch();
    	};
    	
    	var load300 = function(pt, prodCd, result, partCache, clrHash) {
    		var lea = {
    			ptId: pt.id,
    			ptCd: pt.cd,
    			prodCd: prodCd,
    			ptrnCd: result.getValue('custrecord_isis_prod_imp_ptrn'),
    			rows: result.getValue('custrecord_isis_prod_imp_rows'),
    			kitTypeId: result.getValue('custrecord_isis_prod_imp_leatype'),
    			kitTypeName: result.getText('custrecord_isis_prod_imp_leatype'),
    			trimLvl: result.getValue('custrecord_isis_prod_imp_trmlvl')
    		};
    		
    		lea.ptrnId = jPw.getPtrnId(lea.ptrnCd); 
    		if (!lea.ptrnId) {
    			throw nlapiCreateError('PTR_MISSING', prodCd+' failed to find pattern for ptrn:'+lea.ptrnCd);
    		};
    		
    		var map = partCache.findMap(lea.ptId, lea.rows, lea.kitTypeId, lea.trimLvl);
    		if (!map) {
    			throw nlapiCreateError('MAP_MISSING', prodCd+' failed to find map for ptCd:'+lea.ptCd+' rows:'+lea.rows+' kitType:'+lea.kitTypeName+' lvl:'+lea.trimLvl);
    		};
    		if (!map.templateId) {
    			throw nlapiCreateError('TEMPLATE_MISSING', prodCd+' failed to find templateId for pCdt:'+lea.ptCd+' rows:'+lea.rows+' kitType:'+lea.kitTypeName+' lvl:'+lea.trimLvl);
    		};
    		
    		nlapiLogExecution('DEBUG', prodCd+' template: '+map.templateId);
    		var record = nlapiCopyRecord('serializedinventoryitem', map.templateId, {recordmode: 'dynamic', customform: 11});  // RW Serialized Inventory Part Form
    		if (!record) {
    			throw nlapiCreateError('TEMPLATE_MISSING', prodCd+' failed to find template:'+map.templateId);
    		};
    		
    		// clear
    		record.setFieldValue('location', null);
    		record.setFieldValue('preferredlocation', null);
    		record.setFieldValue('custitem_model', null);
    		record.setFieldValue('storedescription', null);
    		record.setFieldValue('pagetitle', null);
    		record.setFieldValue('metataghtml', null);
    		record.setFieldValue('searchkeywords', null);
    		
    		record.setFieldValue('name', lea.prodCd);
    		record.setFieldValue('storedisplayname', lea.prodCd);
    		record.setFieldValue('salesdescription', result.getValue('custrecord_isis_prod_imp_descr'));
    		record.setFieldValue('custitem_selector_descr', result.getValue('custrecord_isis_prod_imp_seldisp'));
    		
    		record.setFieldValue('custitem_leather_color', result.getValue('custrecord_isis_prod_imp_leacol'));
    		
    		record.setFieldValue('custitem_ins_color', result.getValue('custrecord_isis_prod_imp_inst1'));
    		record.setFieldValue('custitem_3t_insert_clr2', result.getValue('custrecord_isis_prod_imp_inst2'));
    		
    		record.setFieldValue('custitem_leather_pattern', lea.ptrnId);

    		record.setFieldValue('custitem_leather_kit_type', lea.kitTypeId);
    		
    		// if special custitem_decoration_summary
    		
    		nlapiLogExecution('DEBUG', 'load leather '+ lea.prodCd+', template: '+map.templateId);

    		/*
    		custrecord_isis_prod_imp_prodcd
    		custrecord_isis_prod_imp_prodtype
    		custrecord_isis_prod_imp_prntprod
    		custrecord_isis_prod_imp_descr
    		custrecord_isis_prod_imp_seldisp
    		custrecord_isis_prod_imp_rows
    		custrecord_isis_prod_imp_trmlvl
    		custrecord_isis_prod_imp_leatype
    		custrecord_isis_prod_imp_leacol
    		custrecord_isis_prod_imp_inst1
    		custrecord_isis_prod_imp_inst2
    		custrecord_isis_prod_imp_ptrn
    		custrecord_isis_prod_imp_airbag
    		custrecord_isis_prod_imp_ptrninns
    		custrecord_isis_prod_imp_converterr
    		custrecord_isis_prod_imp_exstserr
    		custrecord_isis_prod_imp_err
    		custrecord_isis_prod_imp_err_msg
    		custrecord_isis_prod_imp_item
    		custrecord_isis_prod_imp_pattern
    		*/    		
    		
    	};
    	
    	var impFcnNm = 'impFcn';
    	var getImpPtHash = function(partCache, clrHash) {
    		var pth = jPw.getPtHash();
    		pth.partCache = partCache;
    		pth.clrHash = clrHash;
    		
    		pth['300'][impFcnNm] = load300;
    		pth['LEATHER PATTERN'][impFcnNm] = function(pt, prodCd, record, partCache) {nlapiLogExecution('DEBUG', 'leather pattern, do nothing??');};
    		
    		return pth;
    	};
    	
    	var loadDefault = function(pt, prodCd, record, partCache) {
    		nlapiLogExecution('DEBUG', 'load deflaut');
    	};
    	
    	var addIsisProd = function(record, idx, start, end) {
	    	try {
    			var prodCd = record.getValue('custrecord_isis_prod_imp_prodcd').toString();
    			if (checkItmExsts(prodCd, record)) {
    				return ;
    			};
    			var pt = {
    				id: record.getValue('custrecord_isis_prod_imp_prodtype'),
    				cd: record.getText('custrecord_isis_prod_imp_prodtype')	
    			};
    			
    			nlapiLogExecution('DEBUG', 'prod type: '+pt.cd);
    			var impFcn = ptHash[pt.cd][impFcnNm] || loadDefault;
    			impFcn(pt, prodCd, record, ptHash.partCache, ptHash.clrHash);
    			
	    	} catch (e) {
	    		var msg = jPw.logExecutionMsg(e, 'Error Converting Record - ');
	    		nlapiLogExecution('ERROR', msg);
	    		/*
        		var impRec = nlapiLoadRecord(record.getRecordType(), record.getId());
        		impRec.setFieldValue('custrecord_isis_prod_imp_converterr', 'T');
        		impRec.setFieldValue('custrecord_isis_prod_imp_err', 'T');
        		impRec.setFieldValue('custrecord_isis_prod_imp_err_msg', msg);
        		nlapiSubmitRecord(impRec, true);
        		*/
	    	};
		};
    	
		var ptHash = getImpPtHash(jPw.getPartMapCache(), jPw.getClrHash());
		//new nlobjSearchFilter('custrecord_isis_map_prod_type', null, 'is', ptHash['300'].id)
	
		jPw.importResSet(getImpResSet(), addIsisProd);
    	
    };
    
    jPw.importlet = function (request, response) {
    	//jPw.loadIsisPatterns();
    	jPw.importItemsFromIsis();
    };
	
}( this.jPw = this.jPw || {}));


/*
custrecord_isis_prod_imp_prodcd
custrecord_isis_prod_imp_prodtype
custrecord_isis_prod_imp_prntprod
custrecord_isis_prod_imp_descr
custrecord_isis_prod_imp_seldisp
custrecord_isis_prod_imp_rows
custrecord_isis_prod_imp_trmlvl
custrecord_isis_prod_imp_leatype
custrecord_isis_prod_imp_leacol
custrecord_isis_prod_imp_inst1
custrecord_isis_prod_imp_inst2
custrecord_isis_prod_imp_ptrn
custrecord_isis_prod_imp_airbag
custrecord_isis_prod_imp_ptrninns
custrecord_isis_prod_imp_converterr
custrecord_isis_prod_imp_exstserr
custrecord_isis_prod_imp_err
custrecord_isis_prod_imp_err_msg
custrecord_isis_prod_imp_item
custrecord_isis_prod_imp_pattern
*/