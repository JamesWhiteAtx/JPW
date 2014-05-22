/**
 * Module Description
 * Inventory Adjustment form client code
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Apr 2014     James White
 *
 */

(function(jPw, $, undefined) {
	var setReasonAcct = function(type, name) {
		console.log('setReasonAcct');
		if ((name == 'custbody_reason_code_fld') || (name == 'subsidiary'))	{
			var subsCd = nlapiGetFieldValue('subsidiary');
			var rsnCd = nlapiGetFieldValue('custbody_reason_code_fld');
			var acctId = null;
			if ((subsCd) && (rsnCd)) {
				var acctId = nlapiLookupField('customrecord_reason_codes', rsnCd, 'custrecord_account');
			};
			nlapiSetFieldValue('account', acctId, true, true);
		};
	};

	jPw.fieldChanged = function(type, name, linenum){
		if (name == 'custbody_reason_code_fld') {
			setReasonAcct(type, name);
		};
	};

	jPw.postSourcing = function(type, name) {
		if (name == 'subsidiary') {
			setReasonAcct(type, name);
		};
	};
}( this.jPw = this.jPw || {}, jQuery ));


