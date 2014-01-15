/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       31 Dec 2013     james.white
 *
 */

this.jPw = this.jPw || {};

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
			errObjResponse(e, msg+', Error Trying to Re-Scheduled Script:'+context.getScriptId()+' Deployment:'+context.getDeploymentId());
			//nlapiLogExecution('ERROR', msg+', Error Trying to Re-Scheduled Script:'+ctx.getScriptId()+' Deployment:'+ctx.getDeploymentId());
			return true;
		};
		 
		if( status == 'QUEUED' ) { 
			nlapiLogExecution('AUDIT', msg+', Programatically Scheduled Script:'+context.getScriptId()+' Deployment:'+context.getDeploymentId());
			return true;
		} else {
			nlapiLogExecution('ERROR', msg+', Failed to Programatically Scheduled Script:'+context.getScriptId()+' Deployment:'+context.getDeploymentId());
			return true;
		};
	};

	var checkReSched = function(idx, cntx) {
		if (idx % 10 == 0) {
			var context = cntx ||nlapiGetContext();
			if ( context.getRemainingUsage() < 100) {
				return true; 
			} else {
				return false;
			};
			
		} else {
			return false;
		};
	};
	
	var updPercent = function(percent, cntx) {
		var context = cntx ||nlapiGetContext();
		context.setPercentComplete(percent);   
		context.getPercentComplete();  // displays percentage complete
		nlapiLogExecution('DEBUG', 'Percent: '+percent + '%');
	};
	
	jPw.ProcessAllReSched = function(results, resultFcn, mx) {
		var max = mx || 1000;
		
		var loopResults = function () {
			if ((results) && (results.length > 0)) {
				var percent = 0.00;
				updPercent(percent, context);
				
				var fcnRes;
				for (var i = 0; i < count; i++) {
					
					fcnRes = resultFcn(results[i], i, results);
					
					percent = Math.round( (100*(i+1)) / count );
					updPercent(percent, context);
					
					if (fcnRes === false) {
						nlapiLogExecution('AUDIT', 'Result Function loop break out');
						return -2;
					};

					if (checkReSched(i, context)) {
						break;
					};
				};
				return i;
			} else {
				nlapiLogExecution('AUDIT', 'No results');
				updPercent(90, context);
				return -1;
			};
		};
		
		try{
			var context = nlapiGetContext();
			
			var count = Math.min(results.length, max);
			
			var looped = loopResults();
			if (looped < 0) {
				return false;
			} else if (looped < count) {
				return reSched ('Fewer processed', context);
			} else if (results.length > max) {
				return reSched ('More to process', context);
			} else if (looped == 1000) {
				return reSched ('Processed 1000', context);
			};
		} catch (e) {
			errObjResponse(e);
			return;
		};
		
	};
	
	jPw.ProcessSearchReSched = function(search, resultFcn, max) {
		var chunk = max || 1000;

    	var resultSet = search.runSearch();
    	var results = resultSet.getResults(0, chunk + 1);

    	jPw.ProcessAllReSched(results, resultFcn, chunk);
	};

}( this.jPw = this.jPw || {}));

(function(jPw) {
	
	jPw.scheduleTest = function(type) {
		var context = nlapiGetContext();
		var re = context.getSetting('SCRIPT', 'custscript_jpw_test_sched_re');
		
		nlapiLogExecution('DEBUG', 'Re: '+re);
		if (re != 'T') {
			nlapiLogExecution('AUDIT', 'Bailed out');
			return;
		};
		
        var filters = [new nlobjSearchFilter('isinactive', null, 'is', 'F'),
                       new nlobjSearchFilter('custrecord_csvinvadj_upl_err', null, 'is', 'F' ),
                       new nlobjSearchFilter('custrecord_csvinvadj_adj_err', null, 'is', 'F' ),
                       new nlobjSearchFilter('custrecord_csvinvadj_adj_trans', null, 'is', '@NONE@')];
        var columns = [ new nlobjSearchColumn('internalid').setSort(),
                        new nlobjSearchColumn('custrecord_csvinvadj_item'),
                        new nlobjSearchColumn('custrecord_csvinvadj_estunitcost'),
                        new nlobjSearchColumn('custrecord_csvinvadj_serialnum'),
                        new nlobjSearchColumn('custrecord_csvinvadj_bin'),
                        new nlobjSearchColumn('custrecord_csvinvadj_adjustmentaccount'),
                        new nlobjSearchColumn('custrecord_csvinvadj_location').setSort()];
        var search = nlapiCreateSearch('customrecord_csvinvadj', filters, columns);
    	//var resultSet = search.runSearch();
    	//var chunk = 3;
    	//var results = resultSet.getResults(0, chunk + 1);

		var resultFcn = function(result) {
    		var impRec = nlapiLoadRecord(result.getRecordType(), result.getId());
    		impRec.setFieldValue('custrecord_csvinvadj_adj_err', 'T');
    		impRec.setFieldValue('custrecord_csvinvadj_err_msg', 'Testing Error');
    		nlapiSubmitRecord(impRec, true);
		};
    	
		//jPw.ProcessAllReSched(results, resultFcn, chunk);
		jPw.ProcessSearchReSched(search, resultFcn, 2);
	};
	
}( this.jPw = this.jPw || {}));

//search.runSearch()
//resultSet.getResults(0, max+1);

