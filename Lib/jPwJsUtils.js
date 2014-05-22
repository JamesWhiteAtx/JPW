/**
 * Module Description
 * Shared javascript utility library
 * 
 * Version    Date            Author           Remarks
 * 1.00       09 April 2013     james.white
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
	jPw.indexOfEval = function (arr, fcn) {
		for (var i = 0, len = arr.length; i < len; i++) {
			if (fcn(arr[i])) {
				return i;
			};
		};
		return -1;
	};

	jPw.findElemEval = function(arr, fcn) { 
		if (!arr || arr.length === 0) return null;
		for (var i = 0, len = arr.length; i < len; i++) {
			if (fcn(arr[i], arr, i)) {			
				return arr[i];
			};
		}
		return null;
	};
	
	
	jPw.addOnlyUniqueElm = function(arr, elm) {
		for (var i = 0, len = arr.length; i < len; i++) {
			if (arr[i] == elm) {
				return false;
			};
		};
		arr.push(elm);
		return true;
		//if (arr.indexOf(elm) === -1) {		//	arr.push(elm);		//	return true;
		//} else {		//	return false;		//};
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
	
	jPw.missingFrom = function(arrFrm, arrSrch) {
		if (!arrFrm) {
			return [];
		};
		if (!arrSrch) {
			return arrFrm;
		};
		return jPw.map(arrFrm, function(){
			var itm = this;
			for (var i = 0, len = arrSrch.length; i < len; i++) {
				if (arrSrch[i] == itm) {
					return;
				};
			};
			return itm;			
		});
	};
	
	jPw.arrUnion = function(x, y) {
		var obj = {};
		for (var i = x.length-1; i >= 0; -- i)
			obj[x[i]] = x[i];
		for (var i = y.length-1; i >= 0; -- i)
			obj[y[i]] = y[i];
		var res = [];
		for (var k in obj) {
			if (obj.hasOwnProperty(k))  // <-- optional
				res.push(obj[k]);
		};
		return res;
	};

	jPw.arrRemove = function(arr, elm) {
		if (arr instanceof Array) {
			//var delIdx = arr.indexOf(elm); // NetSuite has bad habit of changing strings to numbers, so changed this to use the less restrictive comparison so for eg. 3 == '3'
			var delIdx = -1;
			for (var i = 0, len = arr.length; i < len; i++) {
				if (arr[i] == elm) {
					delIdx = i;
					break;
				};
			};
			if (delIdx !== -1) {
				arr.splice(delIdx, 1);
			};
			return delIdx;
		} else {
			return -1;
		};
	};
	
	jPw.arrMinusArr = function(arrSrc, arrMinus) {
		for (var i = 0, len = arrMinus.length; i < len; i++) {
			jPw.arrRemove(arrSrc, arrMinus[i]);
		};
		return arrSrc;
	};
	
	// http://stackoverflow.com/questions/1129216/sorting-objects-in-an-array-by-a-field-value-in-javascript/4760279#4760279
	var dynamicSort = function(property) {
	    var sortOrder = 1;
	    if(property[0] === "-") {
	        sortOrder = -1;
	        property = property.substr(1);
	    }
	    return function (a,b) {
	        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
	        return result * sortOrder;
	    };
	};
	
	jPw.dynamicSortMultiple = function() {
	    /*
	     * save the arguments object as it will be overwritten
	     * note that arguments object is an array-like object
	     * consisting of the names of the properties to sort by
	     */
	    var props = arguments;
	    return function (obj1, obj2) {
	        var i = 0, result = 0, numberOfProperties = props.length;
	        /* try getting a different result from 0 (equal)
	         * as long as we have extra properties to compare
	         */
	        while(result === 0 && i < numberOfProperties) {
	            result = dynamicSort(props[i])(obj1, obj2);
	            i++;
	        }
	        return result;
	    };
	};

}( this.jPw = this.jPw || {}));	
	
(function(jPw, undefined) {

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
	
	jPw.objEmpty = function(obj) { 
		var name;
	    for (name in obj) {
	        return false;
	    }
	    return true; 
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
	
	jPw.encodeXml = function(s) {
		if (typeof s == 'string' || s instanceof String) {
		    return (s
			        .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
			        .replace(/</g, '&lt;').replace(/>/g, '&gt;')
			        .replace(/\t/g, '&#x9;').replace(/\n/g, '&#xA;').replace(/\r/g, '&#xD;')
			    );
		} else {
			return s;		
		};	
	};
	
}( this.jPw = this.jPw || {}));

(function(jPw, undefined) {

	jPw.fltn = function(ob) {
		var toReturn = {};
		
		for (var i in ob) {
			if (!ob.hasOwnProperty(i)) continue;
			
			if ((typeof ob[i]) == 'object') {
				var flatObject = jPw.fltn(ob[i]);
				for (var x in flatObject) {
					if (!flatObject.hasOwnProperty(x)) continue;
					
					toReturn[x] = flatObject[x];
				}
			} else {
				toReturn[i] = ob[i];
			}
		}
		return toReturn;
	};
	
	jPw.param = function(obj, name) {
		var str = '';

		var addStr = function(nxtStr) {
			if (str != '') {
				str += '&';
			};
			str += nxtStr; 
		};

		if (Array.isArray(obj)) {
			jPw.each(obj, function(idx, val) {
				addStr( name+'['+idx+']=' + val );
			});
		} else {
			for (var key in obj) {
				if ((obj[key] instanceof Object)) {
					addStr( jPw.param(obj[key], key) );	
				} else {
					addStr( key + '=' + obj[key] );
				};
			};
		};
		
		return str;
	};
	
}( this.jPw = this.jPw || {}));

(function(jPw, undefined) {
	jPw.pageArr = function(total, by) {
		var cur = 0;
		var arr = [];
		while(cur < total) {
			arr.push({from: cur, to: Math.min(total, cur+by)});
			cur += by;
		};
		return arr;
	};
}( this.jPw = this.jPw || {}));

(function(global, jPw, undefined) {

	jPw.execFcnByName = function(functionName, cntx /*, args */) {
		var context = cntx || global;
	    var args = Array.prototype.slice.call(arguments, 2);
	    var namespaces = functionName.split(".");
	    var func = namespaces.pop();
	    for (var i = 0; i < namespaces.length; i++) {
	        context = context[namespaces[i]];
	    }
	    return context[func].apply(context, args);
	};

}(this , this.jPw = this.jPw || {}));

