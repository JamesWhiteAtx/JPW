/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Oct 2013     james.white
 *
 */

(function(apiet) {

	apiet.getMotorsHeaders = function () {
		var headers = [];
		headers['X-EBAY-API-SITEID'] = '100';
	    return headers;
	};
	
	apiet.getSandBoxHeaders = function () {
	    var headers = apiet.getMotorsHeaders();
		headers['X-EBAY-API-COMPATIBILITY-LEVEL'] = '845';
		headers['X-EBAY-API-DEV-NAME'] = '481891e7-46d4-4a19-8992-bbfef42842b7';
		headers['X-EBAY-API-APP-NAME'] = 'Roadwire-fb1b-4244-80f7-0a9a8f918293';
		headers['X-EBAY-API-CERT-NAME'] = '99fc89de-c5a8-4594-97a5-9974d1908432';
	    return headers;
	};
		
	apiet.makeEnvSandBox = function () {
		var environment = {
			uri: 'https://api.sandbox.ebay.com/ws/api.dll',
			headers: apiet.getSandBoxHeaders(),
			authToken: 'AgAAAA**AQAAAA**aAAAAA**9DJPUg**nY+sHZ2PrBmdj6wVnY+sEZ2PrA2dj6wFk4GhC5CAogudj6x9nY+seQ**3V0CAA**AAMAAA**PcqkIx0m6ICTidyzGK3gC3XBer7ww1EUAHhl2EJEopHUCw6kygGDClF2AjEvZj3W21H/aRQfJfr5VSJ6ZZcUj6yb1V73FgmhWYFEEDr3pTEe4AXtBPQmxBNjj2DvfeueJoqT59dVJRGWjeqL/VvgyV7+j92sz0jwMIc6G6m4dmTeYRkDgZFgh2W12GadVv58Tka1iul8w2li0J0O27FNhuuk05fTdKKW4G0DQPz10YqPCP9yRcZwF3fnB246rH2YxjiDhdQHvi4JevnDiiW6D0ZcfAlDBnH8sjhbh7SrqtU+ngpkJlLga5jrwTyXIWYQJtKMB2bQxf2R0HQYxWmKqTocnJgQk2K/E738qggcZXVBFS9VczznHSoDAXSIhJSfZ7RqXeesF1ATadaCiK/yxdmk/pH4+jAiiAiMuw6k0L4g5kSkToE3jFrM7zS77GO1FeET+jQfoZ1UA/jqkFVcZ2DRqEXX7qSnUfIH6plNm6K+hwKv4qsqwLhPLnCChP0Oms0wZlpozMeTFlg7qbXYvsXOGigguhhoSZyiwFc0tdi5MX2B6WO66loHJuaSMfeTMVwztfzjF5rVUtHh0LU38Mgdg5kG+EYGsg+wectXZ1363U87KlO8CnGKGq9wPekdapyb/qJdfg8UmFtnryjseV39yn+Ee5IflOK9rT5ngO5rJTa3uAvFaT0N1/xUvZtPCQBDde5GMzbJtQMJJyMCU8NmlmwN2bGVJMmhz4vnMHXj7s7X2Pbevq9fcHMwzw/y',
			payPalEmail: 'RoadwireSeller1@yahoo.com'
		};
		return environment;
	};

	apiet.makeApiRequest = function (callName, env) {
		
		var obj = {request: {}};
		
		var requestProp = callName + 'Request';
		
		obj.request[requestProp] = {
			"@xmlns": "urn:ebay:apis:eBLBaseComponents",
		    "RequesterCredentials": { "eBayAuthToken": '' }
		};

		obj.setRequestProp = function(prop, propVal) {
			obj.request[requestProp][prop] = propVal;
		    return obj.request[requestProp][prop];
		};
		
		
		obj.getRequestProp = function(propName, propVal) {
			var defaultVal = propVal;
			if (jPw.isUndefinedOrNull(defaultVal)) {
				defaultVal = {};
			};
			
			var prop = obj.request[requestProp][propName];
			
			if (jPw.isUndefinedOrNull(prop)) {
				if (typeof defaultVal === 'function') {
					obj.request[requestProp][propName] = defaultVal(obj);
				} else {
					obj.request[requestProp][propName] = defaultVal;
				};
				prop = obj.request[requestProp][propName];
			};
			return prop;
		};
		
		obj.getEnvironment = function () {
			return env;
		};
		
		obj.getHeaders = function () {
			var headers = obj.getEnvironment().headers;
			headers['X-EBAY-API-CALL-NAME'] = callName;
		    return headers;
		};

		obj.getXmlEncode = function () {
		    return jPw.json2xmlEncode(obj.request);
		};
	    
		obj.callApi = function () {
			var url = obj.getEnvironment().uri;
			var xmlStr = obj.getXmlEncode();
			var headers = obj.getHeaders();
	        return nlapiRequestURL( url, xmlStr, headers );	
		};
		
		obj.callApiXmlStr = function () {
			var response = obj.callApi();
			return response.getBody();
		};
		
		obj.callApiXmlObj = function () {
			return nlapiStringToXML(obj.callApiXmlStr());
		};
		
		obj.getEbayAck = function (xmlObj) {
			return nlapiSelectValue(xmlObj, '//nlapi:Ack');
		};

		obj.eBayAckCallback = function (xmlObj, notFailFcn, failFcn, warnFcn) {
		    var ack = obj.getEbayAck(xmlObj);
			if ((ack == 'Success') || (ack == 'Warning')) {
		    	
				notFailFcn(xmlObj);
		    	
				if (ack == 'Warning') {
		    		warnFcn(xmlObj);
		    	};
		    } else if (ack == 'Failure') {
		        failFcn(xmlObj);
		    };
		};

		obj.callApiCallback = function (notFailFcn, failFcn, warnFcn) {
			var xmlObj = obj.callApiXmlObj();
			obj.eBayAckCallback(xmlObj, notFailFcn, failFcn, warnFcn);
		};
		
		obj.addOutputSelector = function(selector) {
			var prop = obj.getRequestProp("OutputSelector", []);
			prop.push(selector);
			return obj;
		};
		
		obj.request[requestProp].RequesterCredentials.eBayAuthToken = obj.getEnvironment().authToken;
		
		return obj;
	};
	
}( this.jPw.apiet = this.jPw.apiet || {}));

(function(apiet) {
	
	apiet.makeAddFixedPriceItemRequest = function (env) {
		
		function makePictureDetails() {
			var obj = {
		        GalleryType: "Plus",
		        PhotoDisplay: "SuperSizePictureShow"
		    };
			      
			obj.addPictureURL = function(url) {
				if (!obj.PictureURL) {
					obj.PictureURL = [];
				};
				obj.PictureURL.push(url);
				return obj;
			};
			
			return obj;
		};
		
		function makeNameValueList() {
			var obj = {
	            NameValueList: []
			};
			
			obj.addNameValue = function(name, value) {
				obj.NameValueList.push({
					Name: name,
			        Value: value
				});
				return obj;
			};
			
			return obj;
		};
		
		function makeItemCompatibilityList() {
	        var obj = {
	        	Compatibility: []
	        };

	        obj.addItemCompatibility = function(compat) {
	        	obj.Compatibility.push(compat);
	        };
	        
			return obj;
		};

		var itemJson = {
		      "ApplicationData": '',
		      "Country": "US",
		      "Currency": "USD",
		      "Description": '',
		      "HitCounter": "HiddenStyle",
		      "ListingDuration": "GTC",
		      "ListingType": "FixedPriceItem",
		      "Location": "Dallas, TX",
		      "PaymentMethods": "PayPal",
		      "PayPalEmailAddress": '',
		      "PrimaryCategory": { "CategoryID": '' },
		      "PrivateListing": "false",
		      "Quantity": '',
		      "PrivateNotes": '',
		      "ShippingDetails": {
		        "ApplyShippingDiscount": "false",
		        "CalculatedShippingRate": {
		          "WeightMajor": {
		            "@measurementSystem": "English",
		            "@unit": "lbs",
		            "#text": "0"
		          },
		          "WeightMinor": {
		            "@measurementSystem": "English",
		            "@unit": "oz",
		            "#text": "0"
		          }
		        },
		        "SalesTax": {
		          "SalesTaxPercent": "0.0",
		          "ShippingIncludedInTax": "false"
		        },
		        "ShippingServiceOptions": {
		          "ShippingService": "UPSGround",
		          "ShippingServiceCost": {
		            "@currencyID": "USD",
		            "#text": "0.0"
		          },
		          "ShippingServiceAdditionalCost": {
		            "@currencyID": "USD",
		            "#text": "0.0"
		          },
		          "ShippingServicePriority": "1",
		          "FreeShipping": "true"
		        },
		        "ShippingType": "Flat",
		        "ThirdPartyCheckout": "false",
		        "ShippingDiscountProfileID": "0",
		        "InternationalShippingDiscountProfileID": "0",
		        "SellerExcludeShipToLocationsPreference": "true"
		      },
		      "ShipToLocations": "US",
		      "Site": "eBayMotors",
		      "StartPrice": '',
		      "SubTitle": '',
		      "Title": '',
		      "SKU": '',
		      "PostalCode": "75019",
		      "DispatchTimeMax": "5",
		      "ReturnPolicy": {
		        "RefundOption": "MoneyBack",
		        "ReturnsWithinOption": "Days_30",
		        "ReturnsAcceptedOption": "ReturnsAccepted",
		        "Description": "Returns accepted before installation",
		        "WarrantyOfferedOption": "WarrantyOffered",
		        "WarrantyTypeOption": "ManufacturerWarranty",
		        "WarrantyDurationOption": "Months_1",
		        "ShippingCostPaidByOption": "Buyer",
		        "RestockingFeeValueOption": "Percent_15"
		      },
		      "InventoryTrackingMethod": "SKU",
		      "ConditionID": "1000",
		      "ShippingPackageDetails": {
		        "ShippingIrregular": "false",
		        "ShippingPackage": "USPSLargePack",
		        "MeasurementUnit": "English",
		        "WeightMajor": "15",
		        "WeightMinor": "0"
		      },
		      "OutOfStockControl": "true"
		    };
		
		var obj = apiet.makeApiRequest('AddFixedPriceItem', env); 
		obj.setRequestProp("Item", itemJson);
		
		obj.getItem = function() {
			return obj.getRequestProp("Item");
		};
		
		obj.getItemProp = function(propName, propVal) {
			var defaultVal = propVal;
			if (jPw.isUndefinedOrNull(defaultVal)) {
				defaultVal = {};
			};
			
			var item = obj.getItem();
			var itemProp = item[propName]; 
			
			
			if (jPw.isUndefinedOrNull(itemProp)) {
				if (typeof defaultVal === 'function') {
					item[propName] = defaultVal(obj);
				} else {
					item[propName] = defaultVal;
				};
				itemProp = item[propName]; 
			};
		
			return itemProp;
		};
		
		obj.setItemProp = function(prop, propVal) {
			var item = obj.getItem();
			item[prop] = propVal;
		    return item[prop];
		};

		obj.setItemPropCdata = function(prop, cdata) {
		    return obj.setItemProp(prop, {"#cdata": cdata});
		};

		obj.setTitle = function(title) {
			if (typeof title == 'string') {
				obj.setItemProp('Title', title.substring(0,80) );
			};
			return obj;
		};
		
		obj.setStartPrice = function(price) {
			obj.setItemProp('StartPrice', {"@currencyID": "USD", "#text": price} );
			return obj;
		};

		obj.setStoreCategoryID = function(ctgy) {
			obj.getItemProp('Storefront').StoreCategoryID = ctgy;
			return obj;
		};

		obj.setStoreCategory2ID = function(ctgy) {
			obj.getItemProp('Storefront').StoreCategory2ID = ctgy;
			return obj;
		};

		obj.addPictureURL = function(url) {
			var prop = obj.getItemProp('PictureDetails', makePictureDetails);
			prop.addPictureURL(url);
			return obj;
		};
		
		obj.addItemSpecific = function(name, value) {
			var prop = obj.getItemProp('ItemSpecifics', makeNameValueList);
			prop.addNameValue(name, value);
			return obj;
		};

		obj.addItemCompatibility = function(compat) {
			var prop = obj.getItemProp('ItemCompatibilityList', makeItemCompatibilityList);
			prop.addItemCompatibility(compat);
			return obj;
		};
		
        obj.addCompatMkYrMdTr = function(mk, yr, md, tr) {
        	obj.addItemCompatibility(
		    	makeNameValueList()
					.addNameValue("Make", mk)
					.addNameValue("Year", yr)
					.addNameValue("Model", md)
					.addNameValue("Trim", tr)
			);
        };

        obj.setPartNo = function(partNo) {
    		obj.setItemProp("SKU", partNo);
    		obj.addItemSpecific("Manufacturer Part Number", partNo);
        };

        obj.setNsItemId = function(itemId) {
            obj.setRequestProp("MessageID", 'Add ' + itemId);
    		obj.setItemProp("ApplicationData", itemId);
        };
        
		obj.setItemProp('PayPalEmailAddress', obj.getEnvironment().payPalEmail);
        
		return obj;
	};
	
	apiet.makeLeatherItemRequest = function (env) {
		var obj = apiet.makeAddFixedPriceItemRequest(env);
		
		obj.setItemProp('PrimaryCategory', { "CategoryID": "33702" });
		//obj.setItemProp('SecondaryCategory', { "CategoryID": "???" });
		obj.addItemSpecific("Warranty","Yes");
		obj.addItemSpecific("Brand","Roadwire");

		return obj;
	};
	
}( this.jPw.apiet = this.jPw.apiet || {}));
	
(function(apiet) {

	apiet.makeGetItemRequest = function (env) {

		var obj = apiet.makeApiRequest('GetItem', env); 
		
		obj.addOutputSelector = function(selector) {
			var prop = obj.getRequestProp("OutputSelector", []);
			prop.push(selector);
			return obj;
		};
		
		obj.retrieveUrlForItemId = function(eBayItemId) {
			obj.setRequestProp("ItemID", eBayItemId);
			obj.addOutputSelector("Item.SKU")
				.addOutputSelector("Item.ListingDetails.ViewItemURL");
			
			
		    var eBayResp = obj.callApi();	
		    var xml = eBayResp.getBody();
			
		    var xmlObj = nlapiStringToXML(xml);
		    var viewItemURL = nlapiSelectValue(xmlObj, '//nlapi:ViewItemURL');
		    
		    return viewItemURL;
		};
		
		return obj;
	};

}( this.jPw.apiet = this.jPw.apiet || {}));

(function(apiet) {

	apiet.makeGetSellerListRequest = function (env) {
		var obj = apiet.makeApiRequest('GetSellerList', env); 
		return obj;
	};

	apiet.makeActiveListingsRequest = function (env) {

		var obj = apiet.makeGetSellerListRequest(env); 
		
		var date = new Date();
		obj.setRequestProp("EndTimeFrom", date.toISOString());
		date.setDate(date.getDate() + 93); 
		obj.setRequestProp("EndTimeTo", date.toISOString());
		
		obj.setRequestProp("Pagination", {"EntriesPerPage": "200", "PageNumber": "1"});
		obj.setRequestProp("DetailLevel", "ReturnAll");
		
		obj.addOutputSelector("ItemArray.Item.SKU")
			.addOutputSelector("ItemArray.Item.ApplicationData")
			.addOutputSelector("ItemArray.Item.Title")
			.addOutputSelector("ItemArray.Item.ItemID")
			.addOutputSelector("ItemArray.Item.ListingDetails.ViewItemURL")
			.addOutputSelector("ItemArray.Item.SellingStatus.CurrentPrice");			
		
		return obj;
	};
	
}( this.jPw.apiet = this.jPw.apiet || {}));
