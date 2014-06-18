/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       26 Aug 2013     james.white
 *
 * Required
 * jPwJsUtils.js
 * jPwNsScriptUtils.js
 * jPwCars.js
 * jPwParts.js
 * jPwNsScriptUtils.js
 * 
 */

(function(slctr) {
        slctr.makesResult = function(ctlgs, logo) {
                /*return jPw.listResult(request, 'makes',
                        function () {
                                var srch = jPw.cars.getMakesSearch(ctlgs);
                                srch.addCol(new nlobjSearchColumn('custrecord_make_logo'));
                                return srch.results();  
                        });
                */
                var srch = jPw.cars.getMakesSearch(ctlgs)
                if (logo) {
                        srch.addCol(new nlobjSearchColumn('custrecord_make_logo'));
                };
                var results = srch.results();   

                var makes = jPw.map(results, function(){
                        var make = {
                                id:this.getId(),
                                name:this.getValue('name')
                        };
                        if (logo) {
                                make.logourl = this.getText('custrecord_make_logo');
                        };
                        return make;
                });
                
                return jPw.okResult({
                        makes: makes 
                });
        };

        slctr.yearsResult = function(makeId, ctlgs, anyCar) {
                var results = jPw.cars.getCarMkSearch(makeId, ctlgs, anyCar).addCol(new nlobjSearchColumn('custrecord_year')).results();
                if (!results) {
                        return jPw.errResult('no years returned', {makeid: makeId});
                };
                
                var spltr = jPw.MakeUniqSplitr();
                jPw.each(results, function() {
                        spltr.splitVals(this.getText('custrecord_year'));
                });
                
                var yrNames = spltr.getVals();

                var sortedYrIdNms = jPw.GetYrIdNms(yrNames, true);
                
                return jPw.okResult({
                        makeid: makeId,
                        years: sortedYrIdNms 
                });
        };

        slctr.modelsResult = function(makeId, year, ctlgs, anyCar) {
                var yrIds = jPw.cars.getYrIds(year);

                var results;
                if ((yrIds) && (yrIds.length>0)) {
                        results = jPw.cars.getCarYrSearch(makeId, yrIds, ctlgs, anyCar)
                                .addCol(new nlobjSearchColumn('custrecord_model'))
                                .addCol(new nlobjSearchColumn('name', 'custrecord_model'))
                                .results();
                };
                if (!results) {
                        return jPw.errResult('no models returned');
                };
                
                return jPw.okResult({
                        makeid: makeId,
                        year: year,
                        models: jPw.uniqNmVlSort(results, 'custrecord_model', 'name', 'carid')
                });
        };

        slctr.bodiesResult = function(makeId, year, modelId, ctlgs, anyCar){
                var yrIds = jPw.cars.getYrIds(year);

                var results = jPw.cars.getCarMdSearch(makeId, yrIds, modelId, ctlgs, anyCar)
                        .addCol(new nlobjSearchColumn('custrecord_body'))
                        .addCol(new nlobjSearchColumn('name', 'custrecord_body'))
                        .results();
                if (!results) {
                        return jPw.errResult('no bodies returned');
                };
                
                return jPw.okResult({
                        makeid: makeId,
                        year: year,
                        modelid: modelId,
                        bodies: jPw.uniqNmVlSort(results, 'custrecord_body', 'name', 'carid')
                });
        };

        slctr.trimsResult = function(makeId, year, modelId, bodyId, ctlgs, anyCar) {
                var yrIds = jPw.cars.getYrIds(year);
                
                var results = jPw.cars.getCarBdSearch(makeId, yrIds, modelId, bodyId, ctlgs, anyCar)
                        .addCol(new nlobjSearchColumn('custrecord_tl'))
                        .addCol(new nlobjSearchColumn('name', 'custrecord_tl'))
                        .results();
                if (!results) {
                        return jPw.errResult('no trims returned');
                };
                
                return jPw.okResult({
                        makeid: makeId,
                        year: year,
                        modelid: modelId,
                        bodyid: bodyId,
                        trims: jPw.uniqNmVlSort(results, 'custrecord_tl', 'name', 'carid')
                });
        };

        slctr.carsResult = function(makeId, year, modelId, bodyId, trimId, ctlgs, anyCar) {
                var yrIds = jPw.cars.getYrIds(year);
                
                var results = jPw.cars.getCarTlSearch(makeId, yrIds, modelId, bodyId, trimId, ctlgs, anyCar)
                        .addCol(new nlobjSearchColumn('name'))
                        .addCol(new nlobjSearchColumn('custrecord_ab'))
                        .addCol(new nlobjSearchColumn('custrecord_rw'))
                        .results();
                if (!results) {
                        return jPw.errResult('no cars returned');
                };
                
                return jPw.okResult({
                        makeid: makeId,
                        year: year,
                        modelid: modelId,
                        bodyid: bodyId,
                        trimid: trimId,
                        cars: jPw.map(results, function(){
                                return {
                                    id:this.getId(),
                                        name:this.getValue('name'),
                                    airbagid:this.getValue('custrecord_ab'),
                                    airbagname:this.getText('custrecord_ab'),
                                    rowid:this.getValue('custrecord_rw'),
                                    rowname:this.getText('custrecord_rw')
                                 };
                        }) 
                });
        };
}( this.jPw.slctr = this.jPw.slctr || {}));

(function(slctr) {
        slctr.getLeaPtrnItm = function(ptrnId) {
                var id;

                var results = nlapiSearchRecord('item', null,
                                [new nlobjSearchFilter('custitem_leather_pattern', null, 'anyof', ptrnId),
                                new nlobjSearchFilter('custitem_prod_cat', null, 'is', 9),
                                new nlobjSearchFilter('custitem_parent_item', null, 'is', 'T')]);

                if (results) {
                        id = results[0].getId();
                };
                return id;
        };
        
        slctr.carptrnsResult = function(carId, ctlgs) {
        
                var search = jPw.SrchObj('customrecord_leather_pattern', 
                        [
                         new nlobjSearchFilter('custrecord_car_type', null, 'anyof', carId),
                        ], 
                        [
                         new nlobjSearchColumn('name'),
                         new nlobjSearchColumn('custrecord_pattern_desc'),
                         new nlobjSearchColumn('custrecord_selector_descr'),
                         new nlobjSearchColumn('custrecord_spec_edition'),
                         new nlobjSearchColumn('custrecord_seat_config'),
                         new nlobjSearchColumn('custrecord_spec_notes'),
                         new nlobjSearchColumn('custrecord_lthr_content'),
                         new nlobjSearchColumn('custrecord_rows'),
                         new nlobjSearchColumn('custrecord_airbag'),
                         new nlobjSearchColumn('custrecord_ns_style'),
                         new nlobjSearchColumn('custrecordfits_factory_leather'),
                        ]);     
                
                if (ctlgs) {
                        search
                                .addFilt(new nlobjSearchFilter('internalid','custitem_leather_pattern', 'noneof', '@NONE@')) // pattern has attached items
                                .addFilt(new nlobjSearchFilter('isinactive', 'custitem_leather_pattern', 'is', 'F'))                    // item is active
                                .addFilt(new nlobjSearchFilter('type', 'custitem_leather_pattern', 'is', 'InvtPart'))           // item is an inventory item
                                .addFilt(new nlobjSearchFilter('isserialitem', 'custitem_leather_pattern', 'is', 'T'))          // item is a serialized item
                                .addFilt(new nlobjSearchFilter('custitem_prod_cat', 'custitem_leather_pattern', 'is', 9))               // item is a leather kit
                                .addFilt(new nlobjSearchFilter('custitem_parent_item', 'custitem_leather_pattern', 'is', 'F')) // item is not a pattern
                                .addFilt(new nlobjSearchFilter('custitem_item_prod_ctlg', 'custitem_leather_pattern', 'allof', ctlgs)) // item belongs to catalogs 
                                ;               
                };
                
                var results = search.results(); 

                if (!results) {
                        return jPw.errResult('no patterns returned');
                };

                
                var patterns = jPw.map(results, function(){
                        var ptrn = {
                            id:this.getId(),
                                name:this.getValue('name'),
                                descr:this.getValue('custrecord_pattern_desc'),
                                seldescr:this.getValue('custrecord_selector_descr'),
                                specialedition: jPw.getBoolVal(this, 'custrecord_spec_edition'),
                                specialnotes:this.getValue('custrecord_spec_notes'),
                                seatconfigs:this.getValue('custrecord_seat_config')
                        };
            ptrn.ptrnitemid = slctr.getLeaPtrnItm(ptrn.id);
            jPw.setIdNm(this, 'custrecord_lthr_content', ptrn, 'leacont');
            jPw.setIdNm(this, 'custrecord_rows', ptrn, 'rows');
            jPw.setIdNm(this, 'custrecord_airbag', ptrn, 'airbag');
            jPw.setIdNm(this, 'custrecord_ns_style', ptrn, 'insertstyle');
            jPw.setIdNm(this, 'custrecordfits_factory_leather', ptrn, 'fitsfact');
                        return ptrn;
                }) ;

                return jPw.okResult({
                        carid: carId,
                        patterns: patterns
                });
        };
        
        slctr.carptrnsSOResult = function(carId, ctlgs) {
                var result = slctr.carptrnsResult(carId, ctlgs);
                
                result.patterns = jPw.map(result.patterns, function(){
                        var ptrn = this;
                        var attchs = jPw.files.recordAttchs('pattern', ptrn.id, null, 'Pattern Schematics', null, 'PDF');
                        if (Array.isArray(attchs)) {
                                ptrn.schematic = jPw.files.getFileUrl( attchs[0].id ); 
                        };
                        return ptrn;
                });
                
                return result;
        };

}( this.jPw.slctr = this.jPw.slctr || {}));

(function(slctr) {
        slctr.carintcolsResult = function(carId, ptrnId, ctlgs) {
/*              var results = jPw.cars.getColIntColSearch(carId).results();             if (!results) { return jPw.errResult('no interior colors returned for car id '+carId);  };*/            
                var intColRecs = jPw.cars.getCarPtrnIntColRecs(carId, ptrnId, ctlgs);
                if (!intColRecs) {
                        return jPw.errResult('no interior colors returned for car id '+carId+', pattern id'+ptrnId+', catalogs'+ctlgs);
                };
                var intColors = jPw.map(intColRecs, function(){
                        return {id: this.id, name: this.name};
                });
                
                return jPw.okResult({
                        carid: carId,
                        intColors: intColors  //jPw.uniqNmVlSort(results, 'custrecord_int_color', 'name')
                });
        };
}( this.jPw.slctr = this.jPw.slctr || {}));

/*
(function(slctr) {
        slctr.getPtrnItemIds = function(ptrnId) {
                var ptrns = nlapiSearchRecord('customrecord_leather_pattern', null, 
                                [new nlobjSearchFilter('internalid', null, 'is', ptrnId),
                         new nlobjSearchFilter('custitem_parent_item', 'CUSTITEM_LEATHER_PATTERN', 'is', 'T'),
                         new nlobjSearchFilter('matrixchild', 'CUSTITEM_LEATHER_PATTERN', 'is', 'F')], 
                                [new nlobjSearchColumn('name','CUSTITEM_LEATHER_PATTERN'),
                                 new nlobjSearchColumn('internalid','CUSTITEM_LEATHER_PATTERN'),]);
                if(!ptrns) {
                        return null;
                } else {
                        return jPw.map(ptrns, function(){
                                return this.getValue('internalid','CUSTITEM_LEATHER_PATTERN') ;
                        });
                };
        };

        slctr.getPtrnColors = function(ptrnItemIds, colorIds) {
                
                var colSearch = jPw.SrchObj('item', 
                                [new nlobjSearchFilter('parent', null, 'anyof', ptrnItemIds ),
                     new nlobjSearchFilter('matrixchild', null, 'is', 'T')]     , 
                                [new nlobjSearchColumn('name'),
                                 new nlobjSearchColumn('custitem_leather_color'),
                                 new nlobjSearchColumn('name', 'custitem_leather_color').setSort( false ),
                                 new nlobjSearchColumn('custrecord_swatch', 'custitem_leather_color'),
                                 new nlobjSearchColumn('custitem_leather_kit_type'),
                                 new nlobjSearchColumn('custitem_is_special_edition'),
                                 new nlobjSearchColumn('custitem_customizations'),
                                 new nlobjSearchColumn('custitem_decoration_summary')
                                ]); 

                if (colorIds) {
                        colSearch.addFilt( new nlobjSearchFilter('internalid', 'custitem_leather_color', 'anyof', colorIds) );
                };
                
                var kits = colSearch.results();
                
                if(!kits) {
                        return null;
                };              

                return jPw.map(kits, function(){
                        var item = {
                                id:this.getId(),
                        name:this.getValue('name').replace(/.*:\s+/, ''),
                        leacolor:this.getValue('custitem_leather_color'),
                        leacolorname:this.getValue('name', 'custitem_leather_color'),
                        leacolorswatch:this.getValue('custrecord_swatch', 'custitem_leather_color'),
                        kittype:this.getValue('custitem_leather_kit_type'),
                        isspecial:('T' == this.getValue('custitem_is_special_edition')),
                        customizations:(this.getValue('custitem_customizations')|| '').split(','),
                        customizationnames:(this.getText('custitem_customizations')|| '').split(','),
                        price:this.getValue('unitprice', 'pricing') || this.getValue('onlineprice'),
                        decorations:this.getValue('custitem_decoration_summary')
                    };
                    if (item.leacolorswatch) {
                        var swatches = nlapiSearchRecord('customrecord_swatch', null, 
                                        [new nlobjSearchFilter('internalid', null, 'is', item.leacolorswatch)], 
                                        [new nlobjSearchColumn('name'),
                                         new nlobjSearchColumn('custrecord_swatch_image'),
                                         new nlobjSearchColumn('custrecord_swatch_hex_code'),
                                         new nlobjSearchColumn('custrecord_swatch_finish_id')
                                        ]);
                        
                        if ((swatches) && (swatches.length>0)) {
                                item.swatchid = swatches[0].getId();
                                        item.swatchname = swatches[0].getValue('name');
                                        item.swatchhex = swatches[0].getValue('custrecord_swatch_hex_code');
                                        item.swatchimgurl = swatches[0].getText('custrecord_swatch_image');
                        };
                    }; 

                    return item;
                  });
        };

        slctr.ptrncolorsResultx = function(ptrnId, carId, intColId) {
                var ptrnItemIds = jPw.slctr.getPtrnItemIds(ptrnId);
                if(!ptrnItemIds) {
                        return jPw.errResult('no pattern items for pattern id: '+ptrnId);
                };
                
                var recColors = null;
                var colorIds = null;
                if ((typeof carId === 'number') && (typeof intColId === 'number')) {
                        recColors = jPw.cars.getCarRecCols(carId, intColId);
                        colorIds = jPw.map(recColors, function(){
                                if (this.id) {
                                        return this.id ;
                                };
                        });             
                };

                var ptrnCols = jPw.slctr.getPtrnColors(ptrnItemIds, colorIds);
                if(!ptrnCols) {
                        return jPw.errResult('no leather items for pattern item id: '+ptrnItemIds);
                };      
                
                if (recColors) {
                        var col;
                        var idx;
                        var ptrnRecCols = [];
                        jPw.each(recColors, function() {
                                col = this.id; 
                                idx = jPw.indexOfEval(ptrnCols, function(item){return (item.leacolor === col);});
                                if (idx !== -1) {
                                        var item = ptrnCols[idx]; 
                                        item.rectype = this.type;
                                        ptrnRecCols.push(item);
                                }
                        });
                        ptrnCols = ptrnRecCols; 
                };
                
                return jPw.okResult({
                        ptrnid: ptrnId,
                        ptrnitemids: ptrnItemIds,
                        colorids: colorIds,
                        colors: ptrnCols
                });
        };
}( this.jPw.slctr = this.jPw.slctr || {}));
*/
(function(slctr) {
        slctr.ptrnLeaResults = function(leaSearch, extraCols, extraMapFcn, hvAndBase) {

                leaSearch
                        .addCol(new nlobjSearchColumn('custitem_leather_color'))
                        .addCol(new nlobjSearchColumn('name', 'custitem_leather_color').setSort( false ))
                        .addCol(new nlobjSearchColumn('custrecord_swatch', 'custitem_leather_color'))
                        .addCol(new nlobjSearchColumn('custitem_is_special_edition'))
                        .addCol(new nlobjSearchColumn('custitem_clearance_item'))
                        .addCol(new nlobjSearchColumn('custitem_customizations'))
                        .addCol(new nlobjSearchColumn('custitem_decoration_summary'))   
                        .addCol(new nlobjSearchColumn('storedisplayimage'))
                ;

                if (extraCols) {
                	jPw.each(extraCols, function() {
                		leaSearch.addCol(this);
                	});
                };
                
                var kits = leaSearch.results((!hvAndBase));
                
                if(!kits) {
                        return null;
                };              
        
                return jPw.map(kits, function(){
                        var item = {
                                id:this.getId(),
                        name:this.nameNoHier(),
                        leacolor:this.getValue('custitem_leather_color'),
                        leacolorname:this.getValue('name', 'custitem_leather_color'),
                        leacolorswatch:this.getValue('custrecord_swatch', 'custitem_leather_color'),
                        isspecial:('T' == this.getValue('custitem_is_special_edition')),
                        isclearance:('T' == this.getValue('custitem_clearance_item')),
                        customizations:(this.getValue('custitem_customizations')|| '').split(','),
                        customizationnames:(this.getText('custitem_customizations')|| '').split(','),
                        decorations:this.getValue('custitem_decoration_summary'),
                        storeimgurl:this.getText('storedisplayimage')
                    };
                jPw.setIdNm(this, 'custitem_leather_kit_type', item, 'kittype');                
        
                        if (item.leacolorswatch) {
                        var swatches = nlapiSearchRecord('customrecord_swatch', null, 
                                        [new nlobjSearchFilter('internalid', null, 'is', item.leacolorswatch)], 
                                        [new nlobjSearchColumn('name'),
                                         new nlobjSearchColumn('custrecord_swatch_image'),
                                         new nlobjSearchColumn('custrecord_swatch_hex_code'),
                                         new nlobjSearchColumn('custrecord_swatch_finish_id')
                                        ]);
                        
                        if ((swatches) && (swatches.length>0)) {
                                item.swatchid = swatches[0].getId();
                                        item.swatchname = swatches[0].getValue('name');
                                        item.swatchhex = swatches[0].getValue('custrecord_swatch_hex_code');
                                        item.swatchimgurl = swatches[0].getText('custrecord_swatch_image');
                        };
                    };
                    
                    if (extraMapFcn) {
                        extraMapFcn(item, this);
                    };
        
                    return item;
                  });
                
        };

        slctr.ptrnrecsResult = function(ptrnId, carId, intColId, ctlgs, extraFilts, extraCols, extraMapFcn, hvAndBase) {
                var recItmIds = jPw.cars.getIntColRecItmIds(ptrnId, carId, intColId, ctlgs);
                
                var itmIds = jPw.map(recItmIds, function(){
                        return this.id; 
                }); 
                
                var srch = jPw.parts.getLeaKitSearch()
                        .addFilt(new nlobjSearchFilter('internalid', null, 'anyof', itmIds));

                if (extraFilts) {
                	jPw.each(extraFilts, function() {
                		srch.addFilt(this);
                	});
                };
                
                var ptrnKits = slctr.ptrnLeaResults(srch, extraCols, extraMapFcn, hvAndBase);
                
                jPw.each(ptrnKits, function() {
                        var itmId = this.id;
                        var idx = jPw.indexOfEval(recItmIds, function(rec) {return (rec.id == itmId);});
                        if (idx !== -1) {
                                this.rectype = recItmIds[idx].type;
                        };
                });

                return jPw.okResult({
                        ptrnid: ptrnId,
                        carId: carId, 
                        intColId: intColId, 
                        ctlgs: ctlgs,
                        kits: ptrnKits
                });
        };

        slctr.ptrnkitsResult = function(ptrnId, ctlgs) {
                var ptrnKits = slctr.ptrnLeaResults(jPw.parts.getPtrnLeaSearch(ptrnId, ctlgs));
        
                return jPw.okResult({
                        ptrnid: ptrnId,
                        kits: ptrnKits
                });
        };
        
        slctr.ptrnkitsSOResults = function(search, ptrnId, custId, ctlgs) {
                search.addFilt(new nlobjSearchFilter('customer', 'pricing', 'is', custId));
                
                var ptrnKits = slctr.ptrnLeaResults(search,
                        [	new nlobjSearchColumn('onlineprice'),
                         	new nlobjSearchColumn('pricelevel', 'pricing'), 
                         	new nlobjSearchColumn('unitprice', 'pricing')
                        ], 
                        function(item, record){
                        	item.unitprice = record.getValue('unitprice', 'pricing');
                        	item.onlineprice = record.getValue('onlineprice');
                        },
                        true
                );
                
                var typeOrd = [10, 3, 6, 7, 4, 5, 1, 2];
                
                return ptrnKits.sort(function(reca, recb) {
                        var typea = reca.kittypeid;
                        var typeb = recb.kittypeid;
                        
                        var orda = typeOrd[typea]; 
                        var ordb = typeOrd[typeb];
                        
                        if (orda < ordb) {
                                return -1;
                        }
                        if (orda > ordb) {
                        return 1;
                        }
                        return 0;
                });     ;
        };
        
        slctr.ptrnrecsSOResult = function(ptrnId, carId, intColId, custId, ctlgs) {
                var recItmIds = jPw.cars.getIntColRecItmIds(ptrnId, carId, intColId, ctlgs);
                var itmIds = jPw.map(recItmIds, function(){
                        return this.id; 
                }); 
                /*
                var srch = jPw.parts.getLeaKitSearch()
                        .addFilt(new nlobjSearchFilter('internalid', null, 'anyof', itmIds));
                var ptrnKits = slctr.ptrnLeaResults(srch);
                */
                var search = jPw.parts.getLeaKitSearch().addFilt(new nlobjSearchFilter('internalid', null, 'anyof', itmIds));
                var ptrnKits = slctr.ptrnkitsSOResults(search, ptrnId, custId, ctlgs);
                
                jPw.each(ptrnKits, function() {
                        var itmId = this.id;
                        var idx = jPw.indexOfEval(recItmIds, function(rec) {return (rec.id == itmId);});
                        if (idx !== -1) {
                                this.rectype = recItmIds[idx].type;
                        };
                });

                return jPw.okResult({
                        ptrnid: ptrnId,
                        carId: carId, 
                        intColId: intColId, 
                        ctlgs: ctlgs,
                        kits: ptrnKits
                });
        };
        
        slctr.ptrnkitsSOResult = function(ptrnId, custId, ctlgs) {
                /*
                var search = jPw.parts.getPtrnLeaSearch(ptrnId, ctlgs)
                        .addFilt(new nlobjSearchFilter('customer', 'pricing', 'is', custId));
                
                var ptrnKits = slctr.ptrnLeaResults(search,
                        [new nlobjSearchColumn('onlineprice'),
                        new nlobjSearchColumn('pricelevel', 'pricing'), 
                        new nlobjSearchColumn('unitprice', 'pricing')], 
                        function(item, record){
                        item.unitprice = record.getValue('unitprice', 'pricing');
                        item.onlineprice = record.getValue('onlineprice');
                        }
                );
                */
                var search = jPw.parts.getPtrnLeaSearch(ptrnId, ctlgs);
                var ptrnKits = slctr.ptrnkitsSOResults(search, ptrnId, custId, ctlgs);
                
                return jPw.okResult({
                        ptrnid: ptrnId,
                        kits: ptrnKits
                });
        };
        
        slctr.itemqtysResult = function(itemId, subsId) {
                var qtySrch = jPw.SrchObj('item', [
                                new nlobjSearchFilter('internalid', null, 'is', itemId),
                                new nlobjSearchFilter('isinactive', 'inventorylocation', 'is', 'F'),
                                new nlobjSearchFilter('makeinventoryavailable', 'inventorylocation', 'is', 'T'),
                                new nlobjSearchFilter('locationquantityavailable', null, 'greaterthan', 0),
                        ], [
                            new nlobjSearchColumn('subsidiary', 'inventorylocation'),
                            new nlobjSearchColumn('inventorylocation'), 
                            new nlobjSearchColumn('locationquantityavailable')
                        ]);
                
                //if (subsId) {
                //      qtySrch.addFilt(new nlobjSearchFilter('subsidiary', 'inventorylocation', 'anyof', subsId));
                //};
                
                var results = qtySrch.results();

                var qtys = jPw.map(results, function(){
                        return {
                                //subId: this.getId('subsidiary', 'inventorylocation'),
                                subs: this.getValue('subsidiary', 'inventorylocation'),
                                id: this.getValue('inventorylocation'),
                                name: this.getText('inventorylocation'),
                                qty: this.getValue('locationquantityavailable')
                        };
                });
        
                if (qtys.length == 0) {
                        qtys.push({subs: 0, itemid: itemId, id:0, name:'None found in inventory',qty:undefined});
                };
                
                var sub = nlapiSearchRecord('subsidiary', null,
                                [ new nlobjSearchFilter('internalid', null, 'is', 4)],  
                                [new nlobjSearchColumn('namenohierarchy')]);

                var subsName;
                if ((sub) && (sub.length > 0)) {
                        subsName = sub[0].getValue('namenohierarchy');
                };
                
                return jPw.okResult({
                        itemId: itemId,
                        subsId: subsId,
                        subsName: subsName,
                        qtys: qtys
                });
        };
        
        slctr.trimcolorsResult = function() {
                var results = nlapiSearchRecord('customrecord_lthr_insert_finish_colors', null, 
                [       new nlobjSearchFilter('isinactive', null, 'is', 'F'),
                        new nlobjSearchFilter('custrecord_leather_trim_color', null, 'is', 'T'),
                        new nlobjSearchFilter('custrecord_2t_clr', null, 'is', 'F'),
                        new nlobjSearchFilter('custrecord_3t_color', null, 'is', 'F'),
                ],
                [new nlobjSearchColumn('name')]);

                return jPw.nameIdMap(results, 'colors');
        };
        
        slctr.insertcolorsResult = function() {
                var results = nlapiSearchRecord('customrecord_lthr_insert_finish_colors', null, 
                [       new nlobjSearchFilter('isinactive', null, 'is', 'F'),
                        new nlobjSearchFilter('custrecord_insert_color', null, 'is', 'T'),
                        new nlobjSearchFilter('custrecord_2t_clr', null, 'is', 'F'),
                        new nlobjSearchFilter('custrecord_3t_color', null, 'is', 'F'),
                ],
                [new nlobjSearchColumn('name')]);

                return jPw.nameIdMap(results, 'colors');
        };

                
}( this.jPw.slctr = this.jPw.slctr || {}));

(function(slctr) {

        slctr.makesResponse = function(request, ctlgs){
                return jPw.slctr.makesResult(ctlgs);
        };

        slctr.makeLogosResponse = function(request, ctlgs){
                return jPw.slctr.makesResult(ctlgs, true);
        };
        
        slctr.yearsResponse = function(request, ctlgs, anyCar){
                var makeId = jPw.getIdParm(request, 'makeid');
                if (typeof makeId !== 'number') {
                        return makeId;
                } else {
                        return jPw.slctr.yearsResult(makeId, ctlgs, anyCar);
                }
        };
        
        slctr.modelsResponse = function(request, ctlgs, anyCar){
                var makeId = jPw.getIdParm(request, 'makeid');
                if (typeof makeId !== 'number') {
                        return makeId;
                };
                var year = request.getParameter('year');
                if (!year) {
                        return jPw.errResult('missing year parameter');
                };
                return jPw.slctr.modelsResult(makeId, year, ctlgs, anyCar);
        };
        
        slctr.bodiesResponse = function(request, ctlgs, anyCar){
                var makeId = jPw.getIdParm(request, 'makeid');
                if (typeof makeId !== 'number') {
                        return makeId;
                };
                var year = request.getParameter('year');
                if (!year) {
                        return jPw.errResult('missing year parameter');
                };
        
                var modelId = jPw.getIdParm(request, 'modelid');
                if (typeof modelId !== 'number') {
                        return modelId;
                };
                return jPw.slctr.bodiesResult(makeId, year, modelId, ctlgs, anyCar);
        };
        
        slctr.trimsResponse = function(request, ctlgs, anyCar){
                var makeId = jPw.getIdParm(request, 'makeid');
                if (typeof makeId !== 'number') {
                        return makeId;
                };
                var year = request.getParameter('year');
                if (!year) {
                        return jPw.errResult('missing year parameter');
                };
                var modelId = jPw.getIdParm(request, 'modelid');
                if (typeof modelId !== 'number') {
                        return modelId;
                };
                var bodyId = jPw.getIdParm(request, 'bodyid');
                if (typeof bodyId !== 'number') {
                        return bodyId;
                };
                
                return jPw.slctr.trimsResult(makeId, year, modelId, bodyId, ctlgs, anyCar);
        };
        
        slctr.carsResponse = function(request, ctlgs, anyCar){
                var makeId = jPw.getIdParm(request, 'makeid');
                if (typeof makeId !== 'number') {
                        return makeId;
                };
                var year = request.getParameter('year');
                if (!year) {
                        return jPw.errResult('missing year parameter');
                };
                
                var modelId = jPw.getIdParm(request, 'modelid');
                if (typeof modelId !== 'number') {
                        return modelId;
                };
                var bodyId = jPw.getIdParm(request, 'bodyid');
                if (typeof bodyId !== 'number') {
                        return bodyId;
                };
                var trimId = jPw.getIdParm(request, 'trimid');
                if (typeof trimId !== 'number') {
                        return trimId;
                };
                
                return jPw.slctr.carsResult(makeId, year, modelId, bodyId, trimId, ctlgs, anyCar);
        };
        
        slctr.carptrnsResponse = function(request, ctlgs) {
                var carId = jPw.getIdParm(request, 'carid');
                if (typeof carId !== 'number') {
                        return carId;
                };
                return jPw.slctr.carptrnsResult(carId, ctlgs);
        };

        slctr.carptrnsSOResponse = function(request, ctlgs) {
                var carId = jPw.getIdParm(request, 'carid');
                if (typeof carId !== 'number') {
                        return carId;
                };
                return jPw.slctr.carptrnsSOResult(carId, ctlgs);
        };
        
        slctr.carintcolsResponse = function(request, ctlgs) {
                var carId = jPw.getIdParm(request, 'carid');
                if (typeof carId !== 'number') {
                        return carId;
                };
                
                var ptrnId = jPw.getIdParm(request, 'ptrnid');
                if (typeof ptrnId !== 'number') {
                        return ptrnId;
                };
                
                return jPw.slctr.carintcolsResult(carId, ptrnId, ctlgs);
        };
        
        slctr.ptrnrecsResponse = function(request, ctlgs) {
                var ptrnId = jPw.getIdParm(request, 'ptrnid');
                if (typeof ptrnId !== 'number') {
                        return ptrnId;
                };
                
                var carId = jPw.getIdParm(request, 'carid');
                if (typeof carId !== 'number') {
                        return carId;
                };

                var intColId = jPw.getIdParm(request, 'intcolid');
                if (typeof intColId !== 'number') {
                        return intColId;
                };
                
                return jPw.slctr.ptrnrecsResult(ptrnId, carId, intColId, ctlgs);
        };

        slctr.ptrnkitsResponse = function(request, ctlgs) {
                var ptrnId = jPw.getIdParm(request, 'ptrnid');
                if (typeof ptrnId !== 'number') {
                        return ptrnId;
                };
                
                return jPw.slctr.ptrnkitsResult(ptrnId, ctlgs);
        };

        
        slctr.ptrnrecsEbayResponse = function(request, ctlgs) {
            var ptrnId = jPw.getIdParm(request, 'ptrnid');
            if (typeof ptrnId !== 'number') {
                    return ptrnId;
            };
            
            var carId = jPw.getIdParm(request, 'carid');
            if (typeof carId !== 'number') {
                    return carId;
            };

            var intColId = jPw.getIdParm(request, 'intcolid');
            if (typeof intColId !== 'number') {
                    return intColId;
            };
            
            return jPw.slctr.ptrnrecsResult(ptrnId, carId, intColId, ctlgs,
            		null,
            		[new nlobjSearchColumn('custitem_ebay_listing_url')],
		            function(item, record){
		            	item.ebaylisturl = record.getValue('custitem_ebay_listing_url');
		            },
		            false);
        };
        
        slctr.ptrnrecsCostcoResponse = function(request, ctlgs) {
            var ptrnId = jPw.getIdParm(request, 'ptrnid');
            if (typeof ptrnId !== 'number') {
                    return ptrnId;
            };
            
            var carId = jPw.getIdParm(request, 'carid');
            if (typeof carId !== 'number') {
                    return carId;
            };

            var intColId = jPw.getIdParm(request, 'intcolid');
            if (typeof intColId !== 'number') {
                    return intColId;
            };
            
            return jPw.slctr.ptrnrecsResult(ptrnId, carId, intColId, ctlgs, [new nlobjSearchFilter('custitem_clearance_item', null, 'is', 'F')]);
        };
                
        slctr.ptrnrecsSOResponse = function(request, ctlgs) {
                var ptrnId = jPw.getIdParm(request, 'ptrnid');
                if (typeof ptrnId !== 'number') {
                        return ptrnId;
                };
                
                var carId = jPw.getIdParm(request, 'carid');
                if (typeof carId !== 'number') {
                        return carId;
                };

                var intColId = jPw.getIdParm(request, 'intcolid');
                if (typeof intColId !== 'number') {
                        return intColId;
                };
                
                var custId = jPw.getIdParm(request, 'custid');
                if (typeof custId !== 'number') {
                        return custId;
                };

                return jPw.slctr.ptrnrecsSOResult(ptrnId, carId, intColId, custId, ctlgs);
        };

        slctr.ptrnkitsSOResponse = function(request, ctlgs) {
                var ptrnId = jPw.getIdParm(request, 'ptrnid');
                if (typeof ptrnId !== 'number') {
                        return ptrnId;
                };
                var custId = jPw.getIdParm(request, 'custid');
                if (typeof custId !== 'number') {
                        return custId;
                };
                
                return jPw.slctr.ptrnkitsSOResult(ptrnId, custId, ctlgs);
        };
        
        jPw.slctr.itemqtysResponse = function(request, ctlgs) {
                var itemId = jPw.getIdParm(request, 'itemid');
                if (typeof itemId !== 'number') {
                        return itemId;
                };
                
                var subsId = jPw.getIdParm(request, 'subsid');
                if (typeof subsId !== 'number') {
                        return subsId;
                };
                
                return jPw.slctr.itemqtysResult(itemId, subsId);
        };

        jPw.slctr.trimcolorsResponse = function(request) {
                return jPw.slctr.trimcolorsResult();
        };
        
        jPw.slctr.insertcolorsResponse = function(request) {
                return jPw.slctr.insertcolorsResult();
        };
        
        slctr.selectorType = function(request, response, type, ctlgs) {
        	switch(type){
        		case 'makes': jPw.successRespond(request, response, jPw.slctr.makesResponse(request, ctlgs));break;
                case 'years': jPw.successRespond(request, response, jPw.slctr.yearsResponse(request, ctlgs));break;
                case 'models': jPw.successRespond(request, response, jPw.slctr.modelsResponse(request, ctlgs));break;
                case 'bodies': jPw.successRespond(request, response, jPw.slctr.bodiesResponse(request, ctlgs));break;
                case 'trims': jPw.successRespond(request, response, jPw.slctr.trimsResponse(request, ctlgs));break;
                case 'cars': jPw.successRespond(request, response, jPw.slctr.carsResponse(request, ctlgs));break;
                case 'carptrns': jPw.successRespond(request, response, jPw.slctr.carptrnsResponse(request, ctlgs));break;
                case 'carintcols': jPw.successRespond(request, response, jPw.slctr.carintcolsResponse(request, ctlgs));break;
                case 'ptrnrecs': jPw.successRespond(request, response, jPw.slctr.ptrnrecsResponse(request, ctlgs));break;
                case 'ptrnkits': jPw.successRespond(request, response, jPw.slctr.ptrnkitsResponse(request, ctlgs));break;

                case 'anyyears': jPw.successRespond(request, response, jPw.slctr.yearsResponse(request, ctlgs, true));break;
                case 'anymodels': jPw.successRespond(request, response, jPw.slctr.modelsResponse(request, ctlgs, true));break;
                case 'anybodies': jPw.successRespond(request, response, jPw.slctr.bodiesResponse(request, ctlgs, true));break;
                case 'anytrims': jPw.successRespond(request, response, jPw.slctr.trimsResponse(request, ctlgs, true));break;
                case 'anycars': jPw.successRespond(request, response, jPw.slctr.carsResponse(request, ctlgs, true));break;
                
                case 'ptrnrecsebay': jPw.successRespond(request, response, jPw.slctr.ptrnrecsEbayResponse(request, ctlgs));break;
                case 'ptrnrecscostco': jPw.successRespond(request, response, jPw.slctr.ptrnrecsCostcoResponse(request, ctlgs));break;
                
                case 'carptrnsso': jPw.successRespond(request, response, jPw.slctr.carptrnsSOResponse(request, ctlgs));break;
                case 'ptrnrecsso': jPw.successRespond(request, response, jPw.slctr.ptrnrecsSOResponse(request, ctlgs));break;
                case 'ptrnkitsso': jPw.successRespond(request, response, jPw.slctr.ptrnkitsSOResponse(request, ctlgs));break;
                
                case 'itemqtys': jPw.successRespond(request, response, jPw.slctr.itemqtysResponse(request, ctlgs));break;
                
                case 'makelogos': jPw.successRespond(request, response, jPw.slctr.makeLogosResponse(request, ctlgs));break;

                case 'trimcolors': jPw.successRespond(request, response, jPw.slctr.trimcolorsResponse(request, ctlgs));break;
                case 'insertcolors': jPw.successRespond(request, response, jPw.slctr.insertcolorsResponse(request, ctlgs));break;
                
                default: nlapiLogExecution('ERROR', 'invalid type parameter', type); break;
            };
        };
        
}( this.jPw.slctr = this.jPw.slctr || {}));

(function(slctr) {
        /**
         * @param {nlobjRequest} request Request object
         * @param {nlobjResponse} response Response object
         * @returns {Void} Any output is written via response object
         */
        slctr.select = function (request, response){
                var type = request.getParameter('type');

                var ctlgs = undefined;
                var ctlg = jPw.getIdParm(request, 'ctlg');
                if ((typeof ctlg === 'number') && (ctlg > 0)) {
                        ctlgs = [ctlg];
                };
                
                jPw.slctr.selectorType(request, response, type, ctlgs);
        };
        
        /**
         * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
         * @returns {Void}
         */
        slctr.eBaySelect = function(type) {
                var context = nlapiGetContext();
                var ctlgId = context.getSetting('SCRIPT', 'custscript_ebay_slctr_prod_ctlg');
                
                var type = request.getParameter('type');
                jPw.slctr.selectorType(request, response, type, [ctlgId]);
        };
        
}( this.jPw.slctr = this.jPw.slctr || {}));