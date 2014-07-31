/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       30 Jul 2014     James White
 *
 */

/**
 * @param {Object} dataIn Parameter object
 * @returns {Object} Output object
 */

var postRESTlet = function(request) {
	
	var propGetter = function(obj, prop){
		if (obj.hasOwnProperty(prop)) {
			return obj[prop];
		};

		prop = (prop + '').toLowerCase();
		for(var p in obj){
			if (obj.hasOwnProperty(p) && prop == p.toLowerCase()){
				return obj[p];
			};
		};
	};
    
    var setFld = function(ordRec, fld, prop, bool) {
    	var fldVal;
    	var propVal = propGetter(request, prop, bool);
    	
		if (bool) {
			if (propVal == true) {
				fldVal = 'T';
			} else {
				fldVal = 'F';
			};
		} else {
			fldVal = propVal;
		};
		ordRec.setFieldValue(fld, fldVal);
    	return propVal;
    };
    
	var setMembInfo = function(ordRec, email) {
	    //setFld(ordRec, 'custrecord_member_email', 'email');
	    ordRec.setFieldValue('custrecord_member_email', email);
	    setFld(ordRec, 'custrecord_last_name', 'lastName');
	    setFld(ordRec, 'custrecord_ship_postal', 'postal');
	    setFld(ordRec, 'custrecord_phone', 'phone');
	    setFld(ordRec, 'custrecord_order_total', 'total');
	    return nlapiSubmitRecord(ordRec, true);
	};

	var setLeaInfo = function(id, setids) {
		var orderRec = nlapiLoadRecord('customrecord_costco_order', id);
		var hasLeather = setFld(orderRec, 'custrecord_has_leather', 'leather', true);
	    if (hasLeather) {
	    	setFld(orderRec, 'custrecord_leather_price', 'leaprice');
	        setFld(orderRec, 'custrecord_leather_rows', 'rows');
	        setFld(orderRec, 'custrecord_pattern_name', 'ptrnname');
	        setFld(orderRec, 'custrecord_color_name', 'colorname');
	        setFld(orderRec, 'custrecord_leather_name', 'kitname');
	        if (setids) {
		        setFld(orderRec, 'custrecord_pattern_id', 'ptrnid');
		        setFld(orderRec, 'custrecord_color_id', 'colorid');
		        setFld(orderRec, 'custrecord_leather_id', 'kitid');
	        };
	        return nlapiSubmitRecord(orderRec, true);
	    } else {
	    	return id;
	    }; 
	};

	var setHtrInfo = function(id) {
		var orderRec = nlapiLoadRecord('customrecord_costco_order', id);
	    var hasHeaters = setFld(orderRec, 'custrecord_has_heaters', 'heaters', true);
	    if (hasHeaters) {
	    	setFld(orderRec, 'custrecord_heaters_price', 'heaterprice');
	        setFld(orderRec, 'custrecord_heaters_qty', 'heaterqty');
	        return nlapiSubmitRecord(orderRec, true);
	    } else {
	    	return id;
	    }; 
	};
	
	var setCarInfo = function(id, setids) {
		var hasCar = propGetter(request, 'car');
	    if (hasCar) {
	    	var orderRec = nlapiLoadRecord('customrecord_costco_order', id);	
	        setFld(orderRec, 'custrecord_make_name', 'makename');
	        setFld(orderRec, 'custrecord_year_name', 'yearname');    
	        setFld(orderRec, 'custrecord_body_name', 'bodyname');
	        setFld(orderRec, 'custrecord_model_name', 'modelname');
	        setFld(orderRec, 'custrecord_car_name', 'carname');
	        setFld(orderRec, 'custrecord_trim_name', 'trimname');
	        setFld(orderRec, 'custrecord_int_name', 'intname');

	        if (setids) {
		        setFld(orderRec, 'custrecord_make_id', 'makeid');
		        setFld(orderRec, 'custrecord_year_id', 'yearid');
		        setFld(orderRec, 'custrecord_body_id', 'bodyid');
		        setFld(orderRec, 'custrecord_model_id', 'modelid');
		        setFld(orderRec, 'custrecord_car_id', 'carid');
		        setFld(orderRec, 'custrecord_trim_id', 'trimid');
		        setFld(orderRec, 'custrecord_int_id', 'intid');
	        };
	        return nlapiSubmitRecord(orderRec, true);
	    } else {
	    	return id;
	    }; 
	};
	
	var email = propGetter(request, 'email');
	email = email.trim().toUpperCase();

    var orderRec = nlapiCreateRecord('customrecord_costco_order');
	
    var ordId = setMembInfo(orderRec, email);
	
	try {
		ordId = setLeaInfo(ordId, true);
	} catch(e) {
		ordId = setLeaInfo(ordId, false);
	};
	
	ordId = setHtrInfo(ordId, true);	
	
	try {
		ordId = setCarInfo(ordId, true);
	} catch(e) {
		ordId = setCarInfo(ordId, false);
	};
	
	return {
		id: ordId
	};
};
