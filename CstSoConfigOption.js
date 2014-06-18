/**
 * 
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Nov 2013     james.white
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
/*
	jPw.createListDialogX = function (dlgId) {
		var loadingId = dlgId + 'lst-dlg-loading';
		var headId = dlgId + 'lst-dlg-head';
		var ctrlsId = dlgId + 'lst-dlg-ctrls';
		var listId = dlgId + 'lst-dlg-list';
		var listCls = 'lst-dlg-list';
		var okBtnId = dlgId + 'slct-ok-btn';
		var cancelBtnId = dlgId + 'slct-cancel-btn';
		var listDlgElm;
		var loadingElm;
		var headElm;
		var ctrlsElm;
		var listElm;
		var okClickFcn = null;

		var dlg = {};
		
	    var addToHeadElm = function(elm) {
	    	$(elm).appendTo(headElm);
	    };
	    
		listDlgElm = $("#" + dlgId);
		if (listDlgElm.length < 1) {
	    	listDlgElm = $('<div />').attr('id', dlgId).addClass('ui-ns-custom').appendTo('body').hide();
	    	headElm = $('<div />', {id: headId}).appendTo(listDlgElm);
	    	ctrlsElm = $('<div />', {id: ctrlsId}).addClass('ui-widget-header ui-corner-all');
	    	addToHeadElm( ctrlsElm ); //.appendTo(headElm);
	    	loadingElm = $('<img />', {src: '/c.801095/site/rw-files/ajax-loader-follower.gif', alt: 'Please wait...', id: loadingId}).appendTo(listDlgElm).hide();
	    	//listElm = $('<ul />', {id: listId}).appendTo(listDlgElm);
	    	listElm = $('<table />', {id: listId}).addClass(listCls).appendTo(listDlgElm);
	    } else {
	    	loadingElm = listDlgElm.find("#" + loadingId);
	    	headElm = listDlgElm.find("#" + headId);
	    	ctrlsElm = listDlgElm.find("#" + ctrlsId);
	    	listElm = listDlgElm.find("#" + listId);
	    };

	    var exst = listDlgElm.is(':data(dialog)');
	    if (exst == false) {
		    listDlgElm.dialog({
		    	title: 'Select',
	            autoOpen: false,
			    resizable: true,
			    draggable: false,
			    height:450,
	            width:700,
			    modal: true,
	            buttons :  { 
	                'select' : {
	                    text: 'OK',
	                    id: okBtnId,
	                    icons: { primary: 'ui-icon-circle-check' }, 
	                    click: function(){ 
	                    	$( this ).dialog( "close" ); 
	                    	if (okClickFcn) {
	                    		okClickFcn(dlg);
	                    	}
	                    }   
	                },
	                "cancel" : {
	                    text: "Cancel",
	                    id: cancelBtnId,
	                    icons: { primary: 'ui-icon-circle-close' },
	                    click: function() { 
	                    	$( this ).dialog( "close" ); 
	                    }
	                } 
	            }
	        });
	    };

	    var addListTtl = function(headVal) {
	    	if (!headVal) {return;};
	    	var headerArr;
    		if (Array.isArray(headVal)) {
    			headerArr = headVal;
    		} else {
    			headerArr = [headVal];
    		};
    		var headRow = $('<tr />').appendTo( $('<thead />').appendTo(listElm) );

    		$.each(headerArr, function( index, value ) {
    			headRow.append( $('<th />').append(value) );
    		});
	    };
	    
	    var addListRow = function (colVal) {
	    	if (!colVal) {return;};
	    	var colValArr;
    		if (Array.isArray(colVal)) {
    			colValArr = colVal;
    		} else {
    			colValArr = [colVal];
    		};
    		var row = $('<tr />').appendTo(listElm);
    		
    		$.each(colValArr, function( index, value ) {
    			row.append($('<td />').append(value));
    		});
    	};
	    
    	var getOkBtn = function () {
    		return $("#" + okBtnId);
    	};
    	
    	var ableOk = function (enable) {
    		if (enable) {
    			getOkBtn().show();
    		} else  {
    			getOkBtn().hide();
    		}
    	};
    	
	    dlg = {
			loadingId: loadingId,
			ctrlsId: ctrlsId,
			listId: listId,
			okBtnId: okBtnId,
			cancelBtnId: cancelBtnId,
			listDlgElm: listDlgElm,
			loadingElm: loadingElm,
			listElm: listElm,
			ctrlsElm: ctrlsElm,
			open: function () { openDlg(listDlgElm); },
	    	setTitle: function (title) { listDlgElm.dialog('option', 'title', title); },
	    	clearList: function () {listElm.empty();},
	    	clearListRows: function () {listElm.find('tbody').html('');},
	    	addToHeadElm: addToHeadElm,
	    	addListTtl: addListTtl,
	    	addListRow: addListRow,
	    	addCtrl: function (ctrl) { ctrlsElm.append(ctrl); },
	    	startLoading: function () {loadingElm.show();},
	    	endLoading: function () {loadingElm.hide();},
	    	ableOk: ableOk, 
	    	enableOk: function () {ableOk(true);},
	    	disableOk: function () {ableOk(false);},
	    	setOkClick: function(fcn) {
	    		okClickFcn = fcn;
	    		}
	    };
	    
	    return dlg;
	};
	

	var kitType = slctr.results.kit.kittypeid;
	if (udfColorType(kitType)) {
		
		var dlg = jPw.createClrsDialog(colSlctrDlgId);
		dlg.setOkClick(function(dlg) {
			jPw.leaSlctrClrClick(slctr, dlg);
		});
		
		if (kitType == jPw.TypeTwoTone) {
			dlg.twoColor();
		} else if (kitType == jPw.TypeThreeTone) {
			dlg.threeColor(); 
		} else {
			dlg.oneColor();
		};
		
		dlg.open();
		
	} else {
		var dlg = jPw.createLocDecorDialog(locDecorSlctrDlgId);
		dlg.setOkClick(function(dlg) {
			jPw.leaSlctrOptClick(slctr, dlg);
		});

		dlg.open();
		dlg.loadOptions( slctr.results.itemid, slctr.results.ptrnid, null, slctr.results.carid); 

		//alert('pick loc or decorate '				+'itm '+slctr.results.itemid				+'ptrn '+slctr.results.ptrnid				+'car '+slctr.results.carid );
	};		

	jPw.leaSlctrClrClick = function(slctr, clrDlg) {
		estShipDate = nlapiDateToString( getEstShipDate() );
		nlapiSetCurrentLineItemValue('item', 'item', slctr.results.itemid, true, true);
		nlapiSetCurrentLineItemValue('item', 'quantity', 1, true, true);
		nlapiSetCurrentLineItemValue('item', 'custcol_est_shipdate', estShipDate, true, true);
	};
	
	jPw.leaSlctrOptClick = function(slctr, optDlg) {
		estShipDate = nlapiDateToString( getEstShipDate() );
		nlapiSetCurrentLineItemValue('item', 'item', slctr.results.itemid, true, true);
		nlapiSetCurrentLineItemValue('item', 'quantity', 1, true, true);
		var locId = optDlg.srcLoc();
		nlapiSetCurrentLineItemValue('item', 'location', locId, true, true);	
		nlapiSetCurrentLineItemValue('item', 'custcol_est_shipdate', estShipDate, true, true);
	};


*/
