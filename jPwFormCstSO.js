/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       26 Aug 2013     james.white
 *
 * Requires
 * jQuery
 * jPwClientUtils.js
 * jPwSelectorUI.js
 * 
 */

/**
 * make leather selector  
 */
(function(jPw, $, undefined) {
	var recKitToken = 'recKitToken';  
	var recKitId = 1;  
	var allKitToken = 'allKitToken';
	var allKitId = 2;
	var kitDetailsToken = 'kitDetailsToken';
	jPw.TypeBestSeller = 6;	 
	jPw.TypeOneTone = 1;
	jPw.TypeSpecialEd = 7;	
	jPw.TypeAllLeather = 4;
	jPw.TypeAllVinyl = 5;
	jPw.TypeTwoTone = 2;
	jPw.TypeThreeTone = 3;

	function getKitTypeFilts(leaSlctr) {
		return [
			leaSlctr.listDlg.makeFiltOpt('Best Seller', function(rowObj){return (rowObj.kittypeid == jPw.TypeBestSeller);}),	 
			leaSlctr.listDlg.makeFiltOpt('Custom Single Tone', function(rowObj){return (rowObj.kittypeid == jPw.TypeOneTone);}),
			leaSlctr.listDlg.makeFiltOpt('Special Edition', function(rowObj){return (rowObj.kittypeid == jPw.TypeSpecialEd);}),	
			leaSlctr.listDlg.makeFiltOpt('All Leather', function(rowObj){return (rowObj.kittypeid == jPw.TypeAllLeather);}),
			leaSlctr.listDlg.makeFiltOpt('All Vinyl', function(rowObj){return (rowObj.kittypeid == jPw.TypeAllVinyl);}),
			leaSlctr.listDlg.makeFiltOpt('Custom 2 Tone', function(rowObj){return (rowObj.kittypeid == jPw.TypeTwoTone);}),
			leaSlctr.listDlg.makeFiltOpt('Custom 3 Tone', function(rowObj){return (rowObj.kittypeid == jPw.TypeThreeTone);}),
		];};
		
	function getPtrnFilts(leaSlctr) {
		return [
		  leaSlctr.listDlg.makeFiltOpt('Fits Fact', function(rowObj){return ((rowObj.fitsfactid == 1) || ((rowObj.fitsfactid == 3)));}),	 
		  leaSlctr.listDlg.makeFiltOpt('Standard', function(rowObj){return (rowObj.leacontid == 1);}),
		  leaSlctr.listDlg.makeFiltOpt('Premium', function(rowObj){return (rowObj.leacontid == 2);}),
		  leaSlctr.listDlg.makeFiltOpt('Pleated', function(rowObj){return (rowObj.insertstyleid == 3);}),
		  leaSlctr.listDlg.makeFiltOpt('Smooth', function(rowObj){return (rowObj.insertstyleid == 4);}),
		  leaSlctr.listDlg.makeFiltOpt('Special', function(rowObj){return (rowObj.specialedition === true);}),
		];}		
	
	function getImgUrl(path) {return jPw.getSysUrlDomain() + path; };
	function getImgElm(path) {return $('<img />', {src: getImgUrl(path), height:'30', width:'30'}); };
	
	function kitsColrTxt(item) {return item.leacolorname ? item.leacolorname : item.kittypename;};
	
	var kitsColsDefn = {
		colsFcn: function (item, defn, slctr) {
			var colrImg = item.swatchimgurl ? getImgElm(item.swatchimgurl) : '';
			var colTxt = kitsColrTxt(item); 
			var colrElm = $('<span />').append(colrImg).append(colTxt);
			return [colrElm, item.name, item.kittypename, item.unitprice, item.decorations];}
		,titlesFcn: function(defn, slctr) {return ['Color','Part#','Type','Price','Decorations']; }
		//,xtraFcn: function (item, defn, slctr) {if (item.decorations) {return '<p>'+item.decorations+'</p>';};}
	};
	
	function kitsTextFcn(item, defn, slctr) {return kitsColrTxt(item)+' '+item.name;};
	
	jPw.makeLeatherSelector = function (dlgId) {
		var leaSlctr = jPw.makeSelector(dlgId); 
		
		leaSlctr.assignDlg( jPw.createSlctrDialog(dlgId) );
	
		leaSlctr.setBaseList([
			{type: 'carptrnsso', listName: 'patterns', title: 'Patterns', objName: 'ptrn', idName: 'ptrnid', valName: 'ptrnName', parms: ['carid'] 
				,colsDefn: {
					colsFcn: function (item, defn, slctr) {
						var schmtc = item.schematic ? $('<a />', {'href': item.schematic, target: '_blank'}).append(
								'<img src="/images/nav/mediatypes/pdf.gif?v=2013.2.0" alt="" width="20px" height="15px" border="0px" style="margin-bottom:-2px;" title="View Schematic Drawing">'
						) : '';
						var spcl = item.specialedition ? $( "<span />" ).addClass( "ui-icon ui-icon-check" ) : '';
						//var dtls = '<p>'+item.descr+'<br>Notes: '+item.specialnotes+'<br>Content: '+item.leacontname +'<br>Insert: '+item.insertstylename+'<br>Fits Factory: '+item.fitsfactname+'</p>';
						return [item.name, item.seldescr, item.rowsname, item.airbagname, schmtc, spcl, 
						        item.leacontname, item.insertstylename, item.fitsfactname, item.specialnotes];
					}
					,titlesFcn: function(defn, slctr) {	return ['Pattern','Description','Rows','Airbags', 
					                                   	        $('<img src="/images/nav/mediatypes/pdf.gif?v=2013.2.0" alt="" width="20px" height="15px" border="0px" style="margin-bottom:-2px;" title="Schematic Drawing">'), 
					                                   	        'Special', 'Content', 'Insert', 'Fits Fact', 'Notes']; }  			
					//,xtraFcn: function (item, defn, slctr) {return '<p>'+item.descr+'<br>Notes: '+item.specialnotes+'<br>Content: '+item.leacontname +'<br>Insert: '+item.insertstylename+'<br>Fits Factory: '+item.fitsfactname+'</p>';}
				}
				,textFcn: function(item, defn, slctr) {return item.name+' '+item.seldescr;}
				,filtDefns: getPtrnFilts(leaSlctr) 
			},
		    {type: 'pickoptions', title: 'Option', objName: 'pickedopt', idName: 'pickoptionid', valName: 'pickoptionName', 
				loadFcn: function(defn, level) {
					return {pickoptions: [{id:recKitId, name:'Recomendations'}, {id:allKitId, name:'All Kits'}]};
				}
		    }],
		    function (slctr) {
				if (slctr.results.pickoptionid == recKitId) {return recKitToken;}
				else if (slctr.results.pickoptionid == allKitId) {return allKitToken;}
			} 
		)
		.setAltList(recKitToken, [
		 	{type: 'carintcols', listName: 'intColors', title: 'Interior Colors', objName: 'intcol', idName: 'intcolid', valName: 'intColName', parms: ['carid', 'ptrnid']},
		 	{type: 'ptrnrecsso', listName: 'kits', title: 'Recommended Kits', objName: 'kit', idName: 'itemid', valName: 'itemName', parms: ['carid', 'ptrnid', 'intcolid', 'custid']
				,colsDefn: kitsColsDefn
				,textFcn: kitsTextFcn
				,filtDefns: getKitTypeFilts(leaSlctr)
				,okClickFcn: function(slctr, defn, level){return (!!slctr.results.itemid);}
		 	}]
			,function (slctr) {return kitDetailsToken;}
			
		)
		.setAltList(allKitToken, [
		 	{type: 'ptrnkitsso', listName: 'kits', title: 'All Kits', objName: 'kit', idName: 'itemid', valName: 'itemName', parms: ['ptrnid', 'custid']
		 		,colsDefn: kitsColsDefn
				,textFcn: kitsTextFcn
				,filtDefns: getKitTypeFilts(leaSlctr)
				,okClickFcn: function(slctr, defn, level){return (!!slctr.results.itemid);}
		 	}]
			, function (slctr) {return kitDetailsToken;}
		)
		.setAltList(kitDetailsToken, [
		 	{type: 'itemqtys', listName: 'qtys', title: 'Warehouse', objName: '', idName: 'locid', valName: 'locName', parms: ['itemid', 'subsid']
			 	,colsDefn: {
			 		colsFcn: function (item, defn, slctr) {return [item.name, item.qty, item.subs];}
			 		,titlesFcn: function(defn, slctr) {	return ['Warehouse','Qty Available','Subsidiary']; }  			
			 	}
				,okFcn: function(slctr, defn, level){return (!!slctr.results.itemid);}
		 	}]
		)
		;		
		
		leaSlctr.tltPrfx = 'Find Leather';

		return leaSlctr;
	};
}( this.jPw = this.jPw || {}, jQuery ));


(function(jPw, $, undefined) {
	jPw.makeCustomPopMenuItem = function (newMenuID, oldMenuID, title, clickFcn, imgUrl) {
		var mnuObj = null;
	
		var newPopMnu = function() {
			var tipMenu = $('#' + newMenuID);
			if (tipMenu.length > 0) {
				mnuObj = {};
				
				var mnuItmImg = $('<img/>')
					.attr({
						src: imgUrl, 
						border: '0', 
						align: 'absmiddle'
					});
				
				mnuObj.mnuItm = $('<a />')
					.attr({
						id: 'jpwpop_' + newMenuID, 
						tabindex: '-1', 
						title: title,
						href: 'javascript:void("'+newMenuID+'")'
					})
					.data('helperbuttontype', 'list')
					.addClass('smalltextnolink uir-field-widget')
					.append(mnuItmImg)
					.append('&nbsp;' + title)
					.on( "click", clickFcn )
					;
				
				tipMenu.append(mnuObj.mnuItm);
			};
		};
		
		var oldPopMnu = function() {
			var mnuContElm = $('#' + oldMenuID);
			if (mnuContElm.length > 0) {
				var mnuElm = mnuContElm.find('.ddmInnerTable');
				if (mnuElm.length > 0) {
					mnuObj = {};
					mnuObj.mnuContElm = mnuContElm;
					mnuObj.mnuElm = mnuElm;

					mnuObj.mnuItm = $('<div />').attr('id', itmMnuSlctrId).addClass('dropdownNotSelected')
						.mouseover(function() {NLAccelMenuButton_onMouseOver(this);})
						.mouseout(function() {NLAccelMenuButton_onMouseOut(this);}) 
						.click(function() {$(this).trigger('mouseout');})
					;
					mnuObj.wdgBoxSpan = $('<span />').css('left', '0px').addClass('field_widget_boxpos')
						.appendTo(mnuObj.mnuItm);
					;
					mnuObj.mnuItmImg = $('<img/>')
						.attr({
							src: imgUrl, 
							border: '0', 
							align: 'absmiddle'
						})
					;
					
					itmMnuSlctrAnch = $('<a />')
						.attr({
							id: 'item_popup_selector', 
							tabindex: '-1', 
							title: title,
							href: '#'
						})
						.addClass('smalltextnolink')
						.append(mnuObj.mnuItmImg)
						.append('&nbsp;' + title)
						.appendTo(mnuObj.wdgBoxSpan)
						.on( "click", clickFcn )
					;
					
					mnuObj.mnuItm.appendTo(mnuObj.mnuElm);
				};
			};
		};
		
		if (newMenuID) {
			newPopMnu();
		};
		
		if ((!mnuObj) && (oldMenuID)) {
			oldPopMnu();
		};

		if (mnuObj && mnuObj.mnuItm) {
			mnuObj.showMnuItm = function() {
				mnuObj.mnuItm.show();	
			};
			mnuObj.hideMnuItm = function() {
				mnuObj.mnuItm.hide();
			};
		};
		
		return mnuObj;
	};
}( this.jPw = this.jPw || {}, jQuery ));


(function(jPw, $, undefined) {
	carSlctrDlgId = 'car-slctr-dlg';
	leaSlctrDlgId = 'lea-slctr-dlg';
	colSlctrDlgId = 'col-slctr-dlg';
	locDecorSlctrDlgId = 'loc-decor-slctr-dlg';
	itmMnuSlctrId = 'item_menu_selector';
	vhclFldId = 'custbody_sales_order_vehicle';
	vhclYrFldId = 'custbody_sales_order_vehicle_yr'; 
	var vhclMenuID_old = 'actionbuttons_'+vhclFldId+'_fs';
	var itmItmMenuID_old = 'actionbuttons_item_item_fs';
	
	var vhclMenuID_new = vhclFldId+'_fs_tooltipMenu';
	var itmItmMenuID_new = 'item_item_fs_tooltipMenu';
	
	jPw.carSlctrMnuItm = undefined;
	jPw.leaSlctrMnuItm = undefined;
	
	jPw.carSlctrOkClick = function(dlg, slctr) {
		nlapiSetFieldValue(vhclFldId, slctr.results.carid);
		nlapiSetFieldValue(vhclYrFldId, slctr.results.yearid);
	};
	
	
	function getEstShipDate(){
		var day = new Date();
		var oneDay = 86400000;
		day = new Date(day.getTime() + oneDay);
		while(day.getDay() == 0 || day.getDay() > 5){
			day = new Date(day.getTime() + oneDay);
		};
		return day;
	};
	
	function udfColorType(type) {
		return (type == jPw.TypeAllLeather) || (type == jPw.TypeAllVinyl) || (type == jPw.TypeTwoTone) || (type == jPw.TypeThreeTone);
	};
	
	jPw.leaSlctrOkClick = function(leaDlg, slctr) {
		
		var dlgOk = function(dlg) {
			//alert('picked'+dlg.locId);
			if (slctr.results.itemid) {
				dlg.startLoading();
				dlg.close();
				
				estShipDate = nlapiDateToString( getEstShipDate() );
				nlapiSetCurrentLineItemValue('item', 'item', slctr.results.itemid, true, true);
				nlapiSetCurrentLineItemValue('item', 'quantity', 1, true, true);
				nlapiSetCurrentLineItemValue('item', 'custcol_est_shipdate', estShipDate, true, true);

				//nlapiSetCurrentLineItemValue('item', 'location', slctr.results.locid, true, true);
				var locId;
				if (slctr.results.locid) { 				// (dlg.locId) {
					locId = slctr.results.locid; 		// dlg.locId;
				} else {
					locId = nlapiGetFieldValue('location');
				};
				if (locId) {
					nlapiSetCurrentLineItemValue('item', 'location', locId, true, true);
				};

			};
			return false;
		};
		
		dlgOk(leaDlg);
		
		//var dlg = jPw.createQtysDialog('inv-qty');
		//dlg.setOkClick(dlgOk);
		//dlg.setTitle('Available Qtys for '+slctr.results.kit.leacolorname+' '+slctr.results.ptrn.seldescr+' '+slctr.results.kit.name);
		//dlg.open();
		//var itemid = slctr.results.itemid;
		//var subsid = nlapiGetFieldValue('subsidiary');
		//dlg.loadQtys(itemid, subsid, dlgOk);
	};
	
	jPw.displayLeaSlctrMnuItm = function(carid) {
		if (jPw.leaSlctrMnuItm) {
			
			jPw.leaSlctrMnuItm.hideMnuItm();
			
			carid = carid || nlapiGetFieldValue(vhclFldId);
			if (carid) {
				
				jPw.slctrResult('carptrnsso', {carid: carid}, 
					function(result) {
						jPw.leaSlctrMnuItm.showMnuItm();
					},
					function(e, successProp) {
						jPw.leaSlctrMnuItm.hideMnuItm();
					}
				);
				
				//jPw.leaSlctrMnuItm.showMnuItm();
			} else {
				jPw.leaSlctrMnuItm.hideMnuItm();
			}
		};
	};
	
	jPw.formPageInit = function(type){
		
		jPw.loadjQueryUi( function(script, textStatus) {
			console.log('Load was performed jquery-ui.');
			
			$('<style type="text/css"> '+
					'div.ui-dialog {font-size: 11px;} div.ui-dialog table {font-size: 11px;} '+ 
					'table.lst-dlg-list {border-collapse: collapse; width:100%;} '+
					'table.lst-dlg-list td, table.lst-dlg-list th {border: 1px solid #a0a0a0; padding: 3px;} '+
					'table.lst-dlg-list th {font-weight:bold;} '+
					'table.lst-dlg-list .highlight {color: blue; font-weight:bold;} '+
					'table.lst-dlg-list tr:nth-child(even) {background-color: #deedf7; } '+
					
					'tr.jpw-found td {background-color: #CC9999;} '+
			'</style>').appendTo('head');
			
			jPw.carSlctrMnuItm = jPw.makeCustomPopMenuItem (vhclMenuID_new, vhclMenuID_old, 'Vehicle Selector',
					function(e) {
						jPw.carSlctr.openDlg();
						return false;
					}, 
					'/c.801095/site/images/check_out_icon.png');
			
			if (jPw.carSlctrMnuItm) {
				jPw.carSlctr = jPw.makeCarSelector(carSlctrDlgId);
				jPw.carSlctr.onOkClick = jPw.carSlctrOkClick;
			};
			
			jPw.leaSlctrMnuItm = jPw.makeCustomPopMenuItem (itmItmMenuID_new, itmItmMenuID_old, 'Leather Selector', 
					function(e) {
						var custid = nlapiGetFieldValue('entity');
						if (!custid) {
							alert('Please select a customer');
							return false;
						};
		
						var subsid = nlapiGetFieldValue('subsidiary');
						
						var carid = nlapiGetFieldValue(vhclFldId);
						if (!carid) {
							alert('Please select a car');
							return false;
						};
						
						jPw.leaSlctr.results.carid = carid;
						jPw.leaSlctr.results.custid = custid;
						jPw.leaSlctr.results.subsid = subsid;
						jPw.leaSlctr.openDlg(0);
		
						return false;
					}, 
					'/c.801095/site/images/check_out_icon.png');
			if (jPw.leaSlctrMnuItm) {
				jPw.displayLeaSlctrMnuItm();

				jPw.leaSlctr = jPw.makeLeatherSelector(leaSlctrDlgId);
				jPw.leaSlctr.onOkClick = jPw.leaSlctrOkClick;
			};
			
		});
	};
	
	/**
	 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
	 * @appliedtorecord recordType
	 *   
	 * @param {String} type Sublist internal id
	 * @param {String} name Field internal id
	 * @param {Number} linenum Optional line item number, starts from 1
	 * @returns {Boolean} True to continue changing field value, false to abort value change
	 */
	jPw.formFieldChange = function (type, name, linenum){
		if (name == vhclFldId) {
			jPw.displayLeaSlctrMnuItm( nlapiGetFieldValue(vhclFldId) );
		}
	};

	
}( this.jPw = this.jPw || {}, jQuery ));
//SO-40015
//SO-36691