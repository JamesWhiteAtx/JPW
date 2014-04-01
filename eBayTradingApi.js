/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Oct 2013     james.white
 *
 * Requires:
 * jPwJsUtils.js
 */

this.jPw = this.jPw || {};

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
        apiet.getProductionHeaders = function () {
            var headers = apiet.getMotorsHeaders();
                headers['X-EBAY-API-COMPATIBILITY-LEVEL'] = '849';
                headers['X-EBAY-API-DEV-NAME'] = '481891e7-46d4-4a19-8992-bbfef42842b7';
                headers['X-EBAY-API-APP-NAME'] = 'Roadwire-36ca-46dd-ac36-2e3a7ba40080';
                headers['X-EBAY-API-CERT-NAME'] = 'a562fc05-3f60-4d85-a9ce-249b4ec4cbc1';
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
        
        apiet.makeEnvProduction = function () {
                var environment = {
                        uri: 'https://api.ebay.com/ws/api.dll',
                        headers: apiet.getProductionHeaders(),
                        authToken: 'AgAAAA**AQAAAA**aAAAAA**34OnUg**nY+sHZ2PrBmdj6wVnY+sEZ2PrA2dj6AFmYOlDJOGoAqdj6x9nY+seQ**RvwBAA**AAMAAA**uJrlEq/jW5TA7bd7pudUzSkEduO9/DDHyzvmjj8ODZRJx1UOa5eD9sX9vr+eLgtJNfiSOlhTGUIvttnchd+Zr7eYNc/F6X8HVPEkoMWDA3QKFI6TRi4Ried0sZYs9riP3VZ8KiNe6FIt2G1DVbtc6G4IwDADb1JE8D5xJ92AQYmiJCSDVPEKfuBSMkmr2z+OxCjzVep4QxowLdGl6DoxV2CloPsaYYOxF4oMlKZUSnvsLO7AlHIsPO+NyjB644obwNsImitwKqAEceyOIhRZFaCih598BrRSnnIxk8q+kiSD1Hn+RlYLiAlO2tP3C9+Aw9ja1rl5DGaDvaxkHl2gak+Z05boZoTxMYRlkX8n3qjv1DSRaQccM1eFykTpLKLR2P9JxcSDLwkHb1u1PYQSa6xw2gL7smJKymxOGpMRm3KjGkZhhiC27CnzSQP3oxnOPSdKJYoMaBp05olAx8IHUWXpv6SgqSckrWQ+9iqexPrJ6Wr5gRSEgSFOgv+/R0VK8JN6xxAxebZrPH9NOVP9w3RS/6ecG+9jEKry/3mcb6mIVBdUQadQ+4kiGLv88Pyag8pW9eBcqDFVkbEJBbJdAS98Tlu44gSaEQCwm/wTSSRwY3Fbn/KPiSIvRFA0h3UKFdLNftGbqhiGLbX9t7KgsK7PFx+/cejpPhhVCUfg42qRrUHycU56TvBfRDygodz7ydnXnq/HjDEiVB3EbR8mrLgTb7piLGgKgbV/vmGnyq3hsUCCpqzDCsQvuPksTo1N',
                        payPalEmail: 'Dennis.Harrison@classicsofttrim.com'
                };
                return environment;
        };
        
        apiet.getEbayCfg = function() {
                var results = nlapiSearchRecord('customrecord_ebay_config', null, 
                        [ new nlobjSearchFilter('isinactive', null, 'is', 'F')], 
                        [ new nlobjSearchColumn('custrecord_ebay_cfg_siteid'),
                          new nlobjSearchColumn('custrecord_ebay_cfg_trd_api_vers'),
                          new nlobjSearchColumn('custrecord_ebay_cfg_devid'),
                          new nlobjSearchColumn('custrecord_ebay_cfg_appid'),
                          new nlobjSearchColumn('custrecord_ebay_cfg_certid'),
                          new nlobjSearchColumn('custrecord_ebay_cfg_trd_api_uri'),
                          new nlobjSearchColumn('custrecord_ebay_cfg_auth_token'),
                          new nlobjSearchColumn('custrecord_ebay_cfg_pp_email'),
                          new nlobjSearchColumn('custrecord_ebay_cfg_1row_price'),
                          new nlobjSearchColumn('custrecord_ebay_cfg_2row_price'),
                          new nlobjSearchColumn('custrecord_ebay_cfg_3row_price'),
                          new nlobjSearchColumn('custrecord_ebay_cfg_1row_retail'),
                          new nlobjSearchColumn('custrecord_ebay_cfg_2row_retail'),
                          new nlobjSearchColumn('custrecord_ebay_cfg_3row_retail'),               
                        ]);
                
                if ((!results) || (results.length < 1)) {
                        var msg = 'Thare are no eBay configuration records defined.';
                        nlapiLogExecution('ERROR', msg);
                        throw nlapiCreateError('EBAY_CONFIG_MISSING', msg);
                        return;
                };
                
                var cfgRecord = results[0];
                
                var trdHeaders = [];
                trdHeaders['X-EBAY-API-SITEID'] = cfgRecord.getValue('custrecord_ebay_cfg_siteid');
                trdHeaders['X-EBAY-API-COMPATIBILITY-LEVEL'] = cfgRecord.getValue('custrecord_ebay_cfg_trd_api_vers');
                trdHeaders['X-EBAY-API-DEV-NAME'] = cfgRecord.getValue('custrecord_ebay_cfg_devid');
                trdHeaders['X-EBAY-API-APP-NAME'] = cfgRecord.getValue('custrecord_ebay_cfg_appid');
                trdHeaders['X-EBAY-API-CERT-NAME'] = cfgRecord.getValue('custrecord_ebay_cfg_certid');
                
                return {
                        trdUri: cfgRecord.getValue('custrecord_ebay_cfg_trd_api_uri'),
                        trdHeaders: trdHeaders,
                        authToken: cfgRecord.getValue('custrecord_ebay_cfg_auth_token'),
                        ppEmail: cfgRecord.getValue('custrecord_ebay_cfg_pp_email'),
                        price1Row: cfgRecord.getValue('custrecord_ebay_cfg_1row_price'),
                        price2Row: cfgRecord.getValue('custrecord_ebay_cfg_2row_price'),
                        price3Row: cfgRecord.getValue('custrecord_ebay_cfg_3row_price'),
                        retail1Row: cfgRecord.getValue('custrecord_ebay_cfg_1row_retail'),
                        retail2Row: cfgRecord.getValue('custrecord_ebay_cfg_2row_retail'),
                        retail3Row: cfgRecord.getValue('custrecord_ebay_cfg_3row_retail'),                
                };
        };
                
        apiet.makeEnvConfig = function() {
                var cfg = apiet.getEbayCfg();
                var environment = {
                        uri: cfg.trdUri,
                        headers: cfg.trdHeaders,
                        authToken: cfg.authToken,
                        payPalEmail: cfg.ppEmail,
                        price1Row: cfg.price1Row,
                        price2Row: cfg.price2Row,
                        price3Row: cfg.price3Row,
                        retail1Row: cfg.retail1Row,
                        retail2Row: cfg.retail2Row,
                        retail3Row: cfg.retail3Row,
                };
                return environment;
        };
        
        apiet.makeApiRequest = function (callName, env) {
                var environment;
                if (env) {
                        environment = env;
                } else {
                        environment = apiet.makeEnvConfig();
                };
                
                var obj = {request: {}};
                
                var requestProp = callName + 'Request';
                
                obj.request[requestProp] = {
                        "@xmlns": "urn:ebay:apis:eBLBaseComponents",
                    "RequesterCredentials": { "eBayAuthToken": '' }
                };

                obj.setRequestProp = function(prop, propVal) {
                        obj.request[requestProp][prop] = jPw.encodeXml( propVal );
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
                
                obj.getObjProp = function(propObj, propName, propVal) {
                        var defaultVal = propVal;
                        if (jPw.isUndefinedOrNull(defaultVal)) {
                                defaultVal = {};
                        };

                        var prop = propObj[propName];
                        
                        if (jPw.isUndefinedOrNull(prop)) {
                                if (typeof defaultVal === 'function') {
                                        propObj[propName] = defaultVal(obj);
                                } else {
                                        propObj[propName] = defaultVal;
                                };
                                prop = propObj[propName];
                        };
                        return prop;
                };
                
                obj.setPathProp = function(pathNames, propName, propVal) {
                        if (!Array.isArray(pathNames)) {
                                pathNames = [pathNames];
                        };
                        
                        var propObj = obj.request[requestProp];
                        jPw.each(pathNames, function() {
                                var propName = this;
                                propObj = obj.getObjProp(propObj, propName);
                        });
                        propObj[propName] = propVal;
                        return propObj[propName];
                };
                
                obj.getEnvironment = function () {
                        return environment;
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
                        obj.respXmlStr = obj.callApiXmlStr();
                        obj.respXmlObj = nlapiStringToXML(obj.respXmlStr);
                        return obj.respXmlObj; 
                };

                obj.getAnyNodes = function (xmlObj, name) {
                        var path = '//nlapi:'+name;
                        return nlapiSelectNodes(xmlObj, path);
                };
                obj.getSubNodes = function (xmlObj, name) {
                        var path = './/nlapi:'+name;
                        return nlapiSelectNodes(xmlObj, path);
                };
                obj.getFirstSubNode = function (xmlObj, name) {
                        var path = './/nlapi:'+name;
                        var nodes = nlapiSelectNodes(xmlObj, path);
                        if ((nodes) && (nodes.length > 0 )) {
                                return nodes[0];
                        };
                };
                
                obj.getRespAnyNodes = function (name) {
                        return obj.getAnyNodes(obj.respXmlObj, name);
                };

                obj.getVal = function (xmlObj, name) {
                        var path = 'nlapi:'+name;
                        return nlapiSelectValue(xmlObj, path);
                };

                obj.getAnyVal = function (xmlObj, name) {
                        var path = '//nlapi:'+name;
                        return nlapiSelectValue(xmlObj, path);
                };
                
                obj.getRespAnyVal = function (name) {
                        return obj.getAnyVal(obj.respXmlObj, name);
                };

                obj.getSubVal = function (xmlObj, name) {
                        var path = './/nlapi:'+name;
                        return nlapiSelectValue(xmlObj, path);
                };
                
                obj.getRespSubVal = function (name) {
                        return obj.getSubVal(obj.respXmlObj, name);
                };

                obj.getSubVals = function (xmlObj, name) {
                        var path = './/nlapi:'+name;
                        return nlapiSelectValues(xmlObj, path);
                };
                
                obj.getEbayAck = function () {
                        return obj.getRespAnyVal('Ack');
                };

                obj.eBayAckCallback = function (obj, notFailFcn, failFcn, warnFcn) {
                    var ack = obj.getEbayAck();
                        if ((ack == 'Success') || (ack == 'Warning')) {
                        
                                notFailFcn(obj);
                        
                                if ((ack == 'Warning') && (warnFcn)) {
                                warnFcn(obj);
                        };
                    } else if (ack == 'Failure') {
                        failFcn(obj);
                    };
                };

                obj.callApiCallback = function (notFailFcn, failFcn, warnFcn) {
                        obj.callApiXmlObj();
                        obj.eBayAckCallback(obj, notFailFcn, failFcn, warnFcn);
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
        
        //apiet.makeAddFixedPriceItemRequest = function (env) {
        apiet.makeFixedPriceItemRequest = function (callName, itemJson, env) {          
                
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

                //////////////////////////////////////////////
                var obj = apiet.makeApiRequest(callName, env); 
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
                        item[prop] = jPw.encodeXml( propVal );
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

                obj.setSubTitle = function(title) {
                        if (typeof title == 'string') {
                                obj.setItemProp('SubTitle', title.substring(0,55) );
                        };
                        return obj;
                };
                
                obj.setStartPrice = function(price) {
                        obj.setItemProp('StartPrice', {"@currencyID": "USD", "#text": price} );
                        return obj;
                };

                obj.setRetailPrice = function(price) {
                        obj.setItemProp('DiscountPriceInfo', {OriginalRetailPrice: price} );
                        return obj;
                };
                
                obj.calcLeaStartPrice = function(rows, defaultPrice) {
                        var rowPrice;
                        var env = obj.getEnvironment();
                        if (rows == 1)          {rowPrice = env.price1Row;}
                        else if (rows == 2) {rowPrice = env.price2Row;}
                        else if (rows == 3) {rowPrice = env.price3Row;}
                        else                            {rowPrice = env.price2Row;};
                        
                        var price = rowPrice || defaultPrice;
                        
                        obj.setStartPrice(price);
                        return obj;
                };

                obj.calcLeaRetailPrice = function(rows, defaultPrice) {
                        var rowPrice;
                        var env = obj.getEnvironment();
                        if (rows == 1)          {rowPrice = env.retail1Row;}
                        else if (rows == 2) {rowPrice = env.retail2Row;}
                        else if (rows == 3) {rowPrice = env.retail3Row;}
                        else                            {rowPrice = env.retail2Row;};
                        
                        var price = rowPrice || defaultPrice;
                        
                        obj.setRetailPrice(price);
                        return obj;
                };
                /* jpwxx 
                obj.calcHeaterStartPrice = function(defaultPrice) {
                        var env = obj.getEnvironment();
                        var price = env.htrPrice || defaultPrice;
                        obj.setStartPrice(price);
                        return obj;
                };
                obj.calcHeaterRetailPrice = function(defaultPrice) {
                        var env = obj.getEnvironment();
                        var price = env.htrPrice || defaultPrice;
                        obj.setRetailPrice(price);
                        return obj;
                };
                */
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
                obj.setSKU(partNo);
                obj.addItemSpecific("Manufacturer Part Number", partNo);
        };

        obj.setNsItemId = function(itemId) {
                obj.setItemProp("ApplicationData", itemId);
        };
        
                obj.setSKU = function(sku) {
                    return obj.setItemProp('SKU', sku);
                };
            
                obj.setItemID = function(id) {
                    return obj.setItemProp('ItemID', id);
                };
                
                obj.setQuantity = function(id) {
                    return obj.setItemProp('Quantity', id);
                };
        
                return obj;
        };
        
        apiet.makeAddFixedPriceItemRequest = function (env) {
                var itemJson = {
              "ApplicationData": '',
              "AutoPay": "true",
              "Country": "US",
              "Currency": "USD",
              "Description": '',
              "DiscountPriceInfo": '',
              "HitCounter": "HiddenStyle",
              "ListingDuration": "GTC",
              "ListingType": "FixedPriceItem",
              "Location": "Dallas, TX",
              "PaymentMethods": "PayPal",
              "PayPalEmailAddress": '',
              "PrimaryCategory": { "CategoryID": '' },
              "SecondaryCategory": { "CategoryID": '' },
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
              "PostalCode": "78759",
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
              "ShippingPackageDetails": {
                "ShippingIrregular": "false",
                "ShippingPackage": "USPSLargePack",
                "MeasurementUnit": "English",
                "WeightMajor": "15",
                "WeightMinor": "0"
              },
              "OutOfStockControl": "true"
            };

                var obj = apiet.makeFixedPriceItemRequest('AddFixedPriceItem', itemJson, env);

                obj.setItemProp('PayPalEmailAddress', obj.getEnvironment().payPalEmail);
                
                return obj;
        };
        
        apiet.makeRwNewItemRequest = function (env) {
                var obj = apiet.makeAddFixedPriceItemRequest(env);
                obj.setItemProp('ConditionID', '1000'); // Condition does not work with  Everything Else > Test Auctions > eBay Use Only        
                obj.addItemSpecific("Warranty","Yes");
                obj.addItemSpecific("Brand","Roadwire");
                return obj;
        };
        
        apiet.makeReviseFixedPriceItemRequest = function (env) {
                var obj = apiet.makeFixedPriceItemRequest('ReviseFixedPriceItem', {}, env);
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
                    
                    var viewItemURL = obj.getAnyVal(xmlObj, 'ViewItemURL');                 //nlapiSelectValue(xmlObj, '//nlapi:ViewItemURL');
                    
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
                        .addOutputSelector("ItemArray.Item.Quantity")
                        .addOutputSelector("ItemArray.Item.SellingStatus.QuantitySold")
                        .addOutputSelector("ItemArray.Item.SellingStatus.CurrentPrice");
                
                obj.addSkuFilter = function(sku) {
                        obj.setRequestProp("SKUArray", {"SKU": sku});
                };
                
                return obj;
        };
        
}( this.jPw.apiet = this.jPw.apiet || {}));

(function(apiet) {

        apiet.makeUploadSiteHostedPicturesRequest = function (env) {
                var obj = apiet.makeApiRequest('UploadSiteHostedPictures', env); 
                
                obj.setRequestProp('PictureSet', 'Supersize');

                obj.setExternalPictureURL = function(url) {
                    return obj.setRequestProp('ExternalPictureURL', url);
                };
            
                obj.setPictureName = function(name) {
                    return obj.setRequestProp('PictureName', name);
                };
                
                return obj;
        };
        
}( this.jPw.apiet = this.jPw.apiet || {}));

(function(apiet) {

        apiet.makeEndFixedPriceItemRequest = function (env) {
                var obj = apiet.makeApiRequest('EndFixedPriceItem', env); 
                
                obj.setRequestProp('EndingReason', 'NotAvailable');
                obj.setRequestProp('WarningLevel', 'High');

                obj.setSKU = function(sku) {
                    return obj.setRequestProp('SKU', sku);
                };
            
                obj.setItemID = function(id) {
                        obj.setRequestProp('MessageID', id);
                    return obj.setRequestProp('ItemID', id);
                };
                
                return obj;
        };
        
}( this.jPw.apiet = this.jPw.apiet || {}));

(function(apiet) {
        apiet.makeGetSellingManagerSoldListingsRequest = function (env) {
                var obj = apiet.makeApiRequest('GetSellingManagerSoldListings', env); 
        
                obj.adSearchTypeVal = function(type, val) {
                        var prop = obj.getRequestProp("Search", []);
                        prop.push({SearchType: type, SearchValue: val});
                        return obj;
                };
                
                return obj;
        };
        
        apiet.makeGetOrdersRequest = function (env) {
                var obj = apiet.makeApiRequest('GetOrders', env);

                obj.addOrderId = function(orderId) {
                        var ordBase = obj.getRequestProp('OrderIDArray');

                        if (jPw.isUndefinedOrNull(ordBase.OrderID)) {
                                ordBase.OrderID = [];
                        };
                        ordBase.OrderID.push(orderId);

                        return obj;
                };
                
                return obj;
        };
        
        apiet.makeCompleteSaleRequest = function (env) {
                var obj = apiet.makeApiRequest('CompleteSale', env);

                obj.setRequestProp('Shipped', 'true');
                obj.setRequestProp('Paid', 'true');

                obj.setItemID = function(id) {
                    return obj.setRequestProp('ItemID', id);
                };
                obj.setTransactionID = function(id) {
                    return obj.setRequestProp('TransactionID', id);
                };

                obj.setTrackingDetailsProp = function(propName, propVal) {
                        return obj.setPathProp(['Shipment', 'ShipmentTrackingDetails'], propName, propVal);     
                };
                
                obj.setShipmentTrackingNumber = function(number) {
                        return obj.setTrackingDetailsProp('ShipmentTrackingNumber', number);
                };
                
                obj.setShippingCarrierUsed = function(carrier) {
                        return obj.setTrackingDetailsProp('ShippingCarrierUsed', carrier);
                };
                
                obj.setShippedTime = function(date) {
                        return obj.setPathProp('Shipment', 'ShippedTime', date.toISOString());  
                };
                
                return obj;
        };
        
}( this.jPw.apiet = this.jPw.apiet || {}));

