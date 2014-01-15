/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       20 Nov 2013     james.white
 *
 */

(function(jPw, undefined) {
	/**
	 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
	 * @returns {Void}
	 */
	jPw.schedDelSavedSrch = function(type) {
		//if ( type != 'scheduled' ) return; /* script should only execute during scheduled calls. */
		var context = nlapiGetContext();
		var srchId = context.getSetting('SCRIPT', 'custscript_del_srch_search');

		var max = 1000;
		//var list = 'Delete From Saved Search';

		var logExecutionMsg = function(e, errorDetailMsg) {
			var msg = new String();
			msg += errorDetailMsg;
			if(e.getCode != null) {
				msg += " "+ e.getDetails();
			} else {
				msg += " "+ e.toString();
			};
			return msg;  
		};

		var addMsg = function(msg, logType) {
			nlapiLogExecution(logType ||'DEBUG', msg);
			//list = list + '\n' + msg;
		};
		
		var checkReSched = function() {
			if ( nlapiGetContext().getRemainingUsage() < 100) {
				var context = nlapiGetContext();
				var status = nlapiScheduleScript(context.getScriptId(), context.getDeploymentId());
				 
				if( status == 'QUEUED' ) { 
					addMsg('Programatically Scheduled Script:'+context.getScriptId()+' Delpoyment:'+context.getDeploymentId(), 'AUDIT');
					return true;
				} else {
					addMsg('Failed to Programatically Scheduled Script:'+context.getScriptId()+' Delpoyment:'+context.getDeploymentId(), 'ERROR');
					return true;
				};
			};
		};
		
		var loopDelete = function(results) {
			var total = results.length;
			//var doPerc = (total < 1000);
			var percent;
			
			//if (doPerc) {
			context.setPercentComplete(0.00);   
			context.getPercentComplete();  // displays percentage complete
			//};
			
			var deleted = 0;
			for ( var i = 0; results != null && i < results.length;  i++ ) {
				if ( checkReSched() ) {
					return false;
				};
				var record = results[i];
				try{
					addMsg('Deleting Record:' + record.getRecordType() +' Internal ID:'+ record.getId() +'. ', 'DEBUG');
					
					nlapiDeleteRecord(record.getRecordType(), record.getId());
					deleted = deleted + 1;
					
					percent = (100*i) / total;
					//if (doPerc) {
					context.setPercentComplete( percent );     // calculate the results
					context.getPercentComplete();  // displays percentage complete  
					//};
					addMsg('Percent: '+percent, 'DEBUG');

				}catch(err){
					var errorDetailMsg = 'Error deleting Record:' + record.getRecordType() +' Internal ID:'+ record.getId() +'. ';
					addMsg(logExecutionMsg(err, errorDetailMsg), 'ERROR');
					continue;
				};
			};
			if (deleted == 0) {
				addMsg('Exiting because 0 deleted of ' + total, 'ERROR');
				return false;
			} else {
				return true;
			}
		};
		
		var SvdSrchResults = function(srchId, max) {
			var srcSvdSrch = nlapiLoadSearch(null, srchId);
			var srcResSet = srcSvdSrch.runSearch();
				
			return srcResSet.getResults(0, max);		
		};
		
		var doAChunk = function() {
			var srchResults = SvdSrchResults(srchId, max);
			var count;
			if ((srchResults) && (srchResults.length > 0)) {
				count = srchResults.length;
				addMsg('Deleting '+count+' records...', 'DEBUG');
				var loopRes = loopDelete(srchResults);
				if ( loopRes ) {
					return (count == max);
				} else {
					return false;
				};
			} else {
				var context = nlapiGetContext();
				addMsg('No results for delete Script:'+context.getScriptId()+' Delpoyment:'+context.getDeploymentId()+' search ID:'+srchId, 'AUDIT');
				return false;
			};
		};
		
		var iter = 1;
		var moreChunks = true;
		while (moreChunks) {
			addMsg('Deleting chunk '+iter+'...', 'DEBUG');
			moreChunks = doAChunk();
			iter++;
			if (iter > 100) {
				addMsg('Exited loop after 100 chunks.', 'ERROR');
				break;
			} // just in case, don't run on endlessly
		};

		//response.setContentType('PLAINTEXT', 'results.txt', 'inline');
		//response.write(list);
	};

}( this.jPw = this.jPw || {}));
