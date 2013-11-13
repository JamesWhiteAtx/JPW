/**
 * Module Description
 * Shared javascript utility library
 * 
 * Version    Date            Author           Remarks
 * 1.00       26 Aug 2013     james.white
 *
 * 
 */

/**
 * jQuery like utility functions 
 */
(function(jPw, undefined) {
	jPw.each = function(arr, fcn){ // mimics jQuery each. no more redef of i!
		if (!arr || arr.length === 0) return;
		for(var i in arr){
			var x = fcn.call(arr[i], i, arr[i]);
			if(typeof x != 'undefined' && !(x)) break;
		}
	}; 

	jPw.map = function(arr, fcn){
		if (!arr || arr.length === 0) return [];
		var result = [];
		for(var i in arr){
			var x = fcn.call(arr[i], i, arr[i]);
			if(typeof x !== 'undefined' && x !== null) result.push(x);
		}
		return result;
	};
}( this.jPw = this.jPw || {} ));


/**
 * general javascript utility functions 
 */
(function(jPw, undefined) {
    /**
     * @memberOf jPw
     */
    jPw.MakeUniqSplitr = function () {
		var splitr = {};
		
		var vals = [];
		splitr.splitVals = function (valsStr) {
			var vls = valsStr.split(',');
			for(var i = 0; i<vls.length; i++){
				if(vals.indexOf(vls[i]) === -1) {
					vals.push(vls[i]);
				}
			};
			return splitr;
		};
		splitr.getVals = function () { return vals; };

		var idsNames = [];
		splitr.splitIdsNames = function (idsStr, namesStr, compNames) {
			var ids = idsStr.split(',');
			var names = namesStr.split(',');
			var cnt = Math.min(ids.length, names.length);
			var curComp, idx, compArr, compProp;
			
			if (compNames) {
				compArr = names;
				compProp = 'name';
			} else {
				compArr = ids;
				compProp = 'id';
			};
			
			for(var i = 0; i<cnt; i++){
				curComp = compArr[i];
				idx = jPw.indexOfEval(idsNames, function(item){return (item[compProp] === curComp);});
				if (idx === -1) {
					idsNames.push({id: ids[i], name: names[i]});
				};
			};

			return splitr;
		};
		splitr.getIdsNames = function () { return idsNames; };

		return splitr;
	};

	/**
     * @memberOf jPw
     */
	jPw.indexOfEval = function (arr, func) {
		for (var i = 0, len = arr.length; i < len; i++) {
			if (func(arr[i])) {
				return i;
			};
		};
		return -1;
	};
	
	jPw.addOnlyUniqueElm = function(arr, elm) {
		if (arr.indexOf(elm) === -1) {
			arr.push(elm);
		};
	};
	
	jPw.addOnlyUniqueObj = function(arr, obj, eqlFcn) {
		function objectEquals(obj1, obj2) {
			for (var i in obj1) {
				if (obj1[i] != obj2[i]) {
					return false;
				};
			};
			return true;
		};
		
		var evalFcn = eqlFcn || objectEquals; 
		for (var i = 0, len = arr.length; i < len; i++) {
			if (evalFcn(arr[i], obj, i)) {
				return i;
			};
		};
		arr.push(obj);
		return arr.length-1;
	};
	
	jPw.getOrAddObj = function(arr, obj, eqlFcn) {
		var idx = jPw.addOnlyUniqueObj(arr, obj, eqlFcn);
		return arr[idx];
	};
	
	
	function replacer(key, value) {
	    if (typeof value === 'number' && !isFinite(value)) {
	        return String(value);
	    }
	    return value;
	};
	
	jPw.Stringify = function (jsonobj) {
		return JSON.stringify(jsonobj, replacer);
	};
	
	jPw.makeAddRepl = function (addFcn, replFcn, replEvalFcn, getValFcn, transfFcn) {
		var vals = []; 
		var addRepl = {addFcn: addFcn, replFcn: replFcn, replEvalFcn: replEvalFcn, getValFcn: getValFcn, transfFcn: transfFcn};
		
		addRepl.addOrRepl = function(obj) {
			var item = (addRepl.transfFcn ? addRepl.transfFcn(obj) : obj);
			var val = (addRepl.getValFcn ? addRepl.getValFcn(item) : item);
			var idx = vals.indexOf(val);
			if (idx === -1) {
				vals.push(val);
				addRepl.addFcn(item);
			} else if (addRepl.replEvalFcn(item, val)) {
				addRepl.replFcn(item, idx);
			};
		};
		
		addRepl.each = function(arr) {
			jPw.each(arr, function() {
				addRepl.addOrRepl(this);
			});
		};
		
		return addRepl;
	};

	jPw.isUndefinedOrNull = function (val) {
		return ((typeof val === 'undefined') || (val === null));
	};
	
}( this.jPw = this.jPw || {}));


(function(jPw, undefined) {
	/*	This work is licensed under Creative Commons GNU LGPL License.
		License: http://creativecommons.org/licenses/LGPL/2.1/
   		Version: 0.9
		Author:  Stefan Goessner/2006
		Web:     http://goessner.net/
		
		 Modified: James White 10/28/2013 - exculded creating nodes from functions
	 */
	jPw.json2xml = function(o, tab) {
	   var toXml = function(v, name, ind) {
	      var xml = "";
	      if (typeof v === 'function') {
	    	  // do nothing
	      }
	      else if (v instanceof Array) {
	         for (var i=0, n=v.length; i<n; i++)
	            xml += ind + toXml(v[i], name, ind+"\t") + "\n";
	      }
	      else if (typeof(v) == "object") {
	         var hasChild = false;
	         xml += ind + "<" + name;
	         for (var m in v) {
	            if (m.charAt(0) == "@")
	               xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
	            else
	               hasChild = true;
	         }
	         xml += hasChild ? ">" : "/>";
	         if (hasChild) {
	            for (var m in v) {
	               if (m == "#text")
	                  xml += v[m];
	               else if (m == "#cdata")
	                  xml += "<![CDATA[" + v[m] + "]]>";
	               else if (m.charAt(0) != "@")
	                  xml += toXml(v[m], m, ind+"\t");
	            }
	            xml += (xml.charAt(xml.length-1)=="\n"?ind:"") + "</" + name + ">";
	         }
	      }
	      else {
	         xml += ind + "<" + name + ">" + v.toString() +  "</" + name + ">";
	      }
	      return xml;
	   }, xml="";
	   for (var m in o)
	      xml += toXml(o[m], m, "");
	   return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
	};

	jPw.json2xmlEncode = function(o, tab) {
		return '<?xml version="1.0" encoding="utf-8"?>' + jPw.json2xml(o, tab);
	};
	
}( this.jPw = this.jPw || {}));

