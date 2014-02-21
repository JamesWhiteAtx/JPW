/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       31 Dec 2013     james.white
 *
 */

this.jPw = this.jPw || {};

(function(jPw) {
	jPw.parmCancelExecute = function(parmName, cntx) {
		var context = cntx || nlapiGetContext();
		var execute = context.getSetting('SCRIPT', parmName);
		
		if (execute != 'T') {
			var msg = 'Canceling execution of Script:'+context.getScriptId()+' Delpoyment:'+context.getDeploymentId() +
			' because parameter '+parmName+' = "'+execute+'"';
			nlapiLogExecution('AUDIT', 'Canceling execution of Script', msg);
			throw nlapiCreateError('SCHED_STOP', msg);
			return true;
		} else {
			return false;
		};
	};
	
	jPw.parmQtyExecute = function(execParm, qtyParm, cntx) {
		var context = cntx || nlapiGetContext();
		if (jPw.parmCancelExecute(execParm, cntx)) {
			return false;
		} else {
			return context.getSetting('SCRIPT', qtyParm) || 1000;
		};
	};	
}( this.jPw = this.jPw || {}));


(function(jPw) {

 	/*var writeErrResp = function (msg) {
		response.setContentType('PLAINTEXT', 'err.txt', 'inline');
		response.write('An Error Occurred' +'\n'+ msg );
	};*/

	var errObjResponse = function(errObj, msg) {
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
		//writeErrResp(errObj.getCode() +': '+ errObj.getDetails());
	};
	
	var reSched = function(msg, cntx) {
		var context = cntx ||nlapiGetContext();

		nlapiLogExecution('DEBUG', 'trying to re-schedule.');
		
		var status = false; //nlapiScheduleScript(context.getScriptId(), context.getDeploymentId());
		
		try {
			status = nlapiScheduleScript(context.getScriptId(), context.getDeploymentId());
		} catch (e) {
			errObjResponse(e, msg+', Error Trying to Re-Schedule Script:'+context.getScriptId()+' Deployment:'+context.getDeploymentId());
			//nlapiLogExecution('ERROR', msg+', Error Trying to Re-Scheduled Script:'+ctx.getScriptId()+' Deployment:'+ctx.getDeploymentId());
			return -1;
		};
		 
		if( status == 'QUEUED' ) { 
			nlapiLogExecution('AUDIT', 'Programatically Scheduled Script', msg+', Programatically Scheduled Script:'+context.getScriptId()+' Deployment:'+context.getDeploymentId());
			return 1;
		} else {
			nlapiLogExecution('ERROR', 'Failed to Programatically Schedule Script', msg+', Failed to Programatically Schedule Script:'+context.getScriptId()+' Deployment:'+context.getDeploymentId());
			return -1;
		};
	};

	var checkReSched = function(idx, cntx) {
		//if (idx % 10 == 0) {
		var context = cntx ||nlapiGetContext();
		if ( context.getRemainingUsage() < 100) {
			return true; 
		} else {
			return false;
		};
		//} else {			return false;		};
	};
	
	var updPercent = function(percent, cntx) {
		var context = cntx ||nlapiGetContext();
		context.setPercentComplete(percent);   
		context.getPercentComplete();  // displays percentage complete
		nlapiLogExecution('DEBUG', 'Percent: '+percent + '%');
	};
	
	jPw.ProcessAllReSched = function(results, resultFcn, mx, reSchedFcn) {
		var max = mx || 1000;
		
		var loopResults = function () {
			if ((results) && (results.length > 0)) {
				var percent = 0.00;
				updPercent(percent, context);

				nlapiLogExecution('AUDIT', 'BEGIN Processing', 'BEGIN Processing '+count+' records. Remaining Usage: ' + context.getRemainingUsage());
				var resCount = 0;
				
				var fcnRes;
				for (var i = 0; i < count; i++) {
					
					fcnRes = resultFcn(results[i], i, results);
					
					percent = Math.round( (100*(i+1)) / count );
					updPercent(percent, context);
					
					if (fcnRes === false) {
						nlapiLogExecution('AUDIT', 'Result Function loop break out');
						return -2;
					};
					resCount ++;

					if (checkReSched(i, context)) {
						break;
					};
				};
				
				nlapiLogExecution('AUDIT', 'END Processed', 'END Processed '+resCount+' records. Remaining Usage: ' + context.getRemainingUsage());
				
				return i;
			} else {
				nlapiLogExecution('AUDIT', 'No results');
				updPercent(90, context);
				return 0;
			};
		};
		
		var context = nlapiGetContext();
		try{
			var count = Math.min(results.length, max);
			
			var looped = loopResults();
			
			if ((reSchedFcn) && (reSchedFcn(looped, results, max) === false)) {
				nlapiLogExecution('AUDIT', 'Abandoned Re Schedule', 'Abandoned Re Schedule of Script:'+context.getScriptId()+' Deployment:'+context.getDeploymentId());
				return 0;
			};
			
			if (looped < 0) {
				return looped;
			} else if (looped < count) {
				return reSched('Fewer processed', context);
			} else if (results.length > max) {
				return reSched('More to process', context);
			} else if (looped == 1000) {
				return reSched('Processed 1000', context);
			} else {
				return 0;
			};
			
		} catch (e) {
			errObjResponse(e, 'Remaining Usage: ' + context.getRemainingUsage());
			return -1;
		};
		
	};
	
	jPw.ProcessSearchReSched = function(search, resultFcn, qty, reSchedFcn) {
		var max = qty || 999;
		max = Math.min(max, 999);

    	var resultSet = search.runSearch();
    	var results = resultSet.getResults(0, max + 1);

    	return jPw.ProcessAllReSched(results, resultFcn, max, reSchedFcn);
	};
	
	jPw.ProcReSchedThenNext = function(search, resultFcn, qty, scriptId, deploymentId, nextSchedFcn) {
		var procRes = ProcessSearchReSched(search, resultFcn, qty, reSchedFcn);
		
		if (procRes !== 0) {
			return procRes;
		};

		if ((nextSchedFcn) && (nextSchedFcn(procRes) === false)) {
			var context = nlapiGetContext();
			nlapiLogExecution('AUDIT', 'Abandoned Next Schedule', 'Script:'+context.getScriptId()+', Deployment:'+context.getDeploymentId()
					+' Abandoned Schedule of Next Script:'+scriptId+' Deployment:'+deploymentId);
			return 0;
		};
		
		nlapiLogExecution('DEBUG', 'trying to schedule next script.');
		
		var status = false;
		
		try {
			status = nlapiScheduleScript(scriptId, deploymentId);
		} catch (e) {
			errObjResponse(e, 'Error Trying to Schedule Next Script:'+scriptId+' Deployment:'+deploymentId);
			return -1;
		};
		 
		if( status == 'QUEUED' ) { 
			nlapiLogExecution('AUDIT', 'Programatically Scheduled Next Script', 'Programatically Scheduled Script:'+scriptId+' Deployment:'+deploymentId);
			return 1;
		} else {
			nlapiLogExecution('ERROR', 'Failed to Programatically Schedule Next Script', 'Failed to Programatically Schedule Next Script:'+scriptId+' Deployment:'+deploymentId);
			return -1;
		};
		
	};

}( this.jPw = this.jPw || {}));

(function(jPw) {
	
	jPw.scheduleTest = function(type) {
		var qty = jPw.parmQtyExecute('custscript_jpw_test_sched_re', 'custscript_jpw_test_sched_qty');

	    var filters = [
	                   new nlobjSearchFilter('custrecord_isis_imp_po_err', null, 'is', 'T' ),
	    ];
	    var columns = null;
	    var search = nlapiCreateSearch('customrecord_isis_imp_po', filters, columns);
		
	    
		var resultFcn = function(result) {
			var impRec = nlapiLoadRecord(result.getRecordType(), result.getId());
			impRec.setFieldValue('custrecord_isis_imp_po_err', 'F');
			impRec.setFieldValue('custrecord_isis_imp_po_msg', null);
			nlapiSubmitRecord(impRec, true);
		};
		
		jPw.ProcessSearchReSched(search, resultFcn, qty);
		
	};
	
}( this.jPw = this.jPw || {}));

/*
 	jPw.getSearchCount = function(search) {
		var resultSet = search.runSearch();

		var chunk = 1000;
		var start = 0;
		var results;
		var count = 0;

		results = resultSet.getResults(start, start + chunk);
		while (results && (results.length > 0)) {
			count = count + results.length;
			start = start + chunk;
			results = resultSet.getResults(start, start + chunk);
		};
		return count;
	};


        var recordName = 'customrecord_isis_prod_import'
        var filters = null;
        var columns = [new nlobjSearchColumn('custrecord_isis_prod_imp_serial'),
                       new nlobjSearchColumn('custrecord_isis_prod_imp_prodtype')];

        var search = nlapiCreateSearch(recordName, filters, null);

 var c = jPw.getSearchCount(search);

 search.setColumns(columns);
 */