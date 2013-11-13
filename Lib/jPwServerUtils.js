/**
 * Module Description
 * Shared Suite Script server utility library
 *  
 * Version    Date            Author           Remarks
 * 1.00       26 Aug 2013     james.white
 *
 * Required
 * jPwNsScriptUtils.js
 */

/**
 * server response functions
 */
(function(jPw, undefined) {
	
	jPw.jsonResponse = function(request, response, respObject) {
		var respStr = JSON.stringify(respObject);
		
		if (request.getParameter("jsoncallback")){
			response.setContentType('JAVASCRIPT');
			response.write(request.getParameter("jsoncallback") +"("+ respStr +");") ;
		} else if (request.getParameter("callback")){
			response.setContentType('JAVASCRIPT');
			response.write(request.getParameter("callback") +"("+ respStr +");") ;
		} else {
			response.setContentType('JSON');
			response.write( respStr );
		}
	};
	
	var SUCCESS = 'success';
	var MSG = 'message';

	jPw.successRespond = function (request, response, result){
		if (!result) {
			result = {};
		}
		if (result[SUCCESS] !== true) {
			result[SUCCESS] = false;
		} else {
			result[SUCCESS] = true;
		};
		
		jPw.jsonResponse(request, response, result); 
	};

	jPw.errResult = function (msg, result) {
		if (!result) {
			result = {};
		};
		result[SUCCESS] = false;
		result[MSG] = msg;
		return result;
	};
	
	jPw.okResult = function (result) {
		if (!result) {
			result = {};
		};
		result[SUCCESS] = true;
		return result;
	}; 

	jPw.getIdParm = function (request, name) {
		var idParm = request.getParameter(name);
		if (!idParm) {
			return jPw.errResult('missing '+name+' parameter');
		};
		var numId = Number(idParm);
		if (isNaN(numId)) {
			return jPw.errResult(name+' is not a number');
		};
		return numId;
	};

	jPw.listResult = function (request, listName, fcn) {
		var items = fcn(request);
		if(!items) {
			return jPw.errResult('no '+listName+' returned');
		} else {
			return jPw.nameIdMap(items, listName);
		};
	};
	
}( this.jPw = this.jPw || {} ));

