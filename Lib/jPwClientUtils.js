/**
 * Module Description
 * jPwClientUtils.js  
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Nov 2013     james.white
 *
 * required 
 * jQuery
 * 
 */

/**
 * routines to load javascript and css on the client 
 */
(function(jPw, $, undefined) {
	jPw.loadCss = function (url) {
	    var link = document.createElement("link");
	    link.type = "text/css";
	    link.rel = "stylesheet";
	    link.href = url;
	    document.getElementsByTagName("head")[0].appendChild(link);
	};

	jPw.cachedScript = function(url, options) {
	  // allow user to set any option except for dataType, cache, and url
	  options = $.extend(options || {}, {
	    dataType: "script",
	    cache: true,
	    url: url
	  });
	  // Use $.ajax() since it is more flexible than $.getScript
	  // Return the jqXHR object so we can chain callbacks
	  return $.ajax(options);
	};
	
	jPw.loadjQueryUi = function(fcn) {
		if ($.ui) {
			fcn();
		} else {
			jPw.loadCss('https://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/themes/cupertino/jquery-ui.css');
			jPw.cachedScript('https://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.js').done(fcn);			
		}
	};
}( this.jPw = this.jPw || {}, jQuery ));


/**
 * routines to display jQuery UI dialog
 */
(function(jPw, $, undefined) {
	
	function openDlg(dlgElm) {
    	var isOpn = dlgElm.dialog("isOpen");
    	if (isOpn == false) {
    		dlgElm.dialog("open");
    	};
	};
	
	jPw.slctOnly = function (slctr, ancst) {
		var jqo = $(slctr, ancst);
		if (jqo.length < 1) {
			jqo = undefined;
		};
		return jqo;
	};

	jPw.getJqId = function (id, ancst) {
		return jPw.slctOnly('#'+id, ancst);
	};

	
console.log('jPw.createDialog');
	jPw.createDialog = function (dlgId) {
		var loadingId = dlgId + 'dlg-load';
		var headId = dlgId + 'dlg-head';
		var ctrlsId = dlgId + 'dlg-ctrl';
		var bodyId = dlgId + 'dlg-bdy';
		var okBtnId = dlgId + 'ok-btn';
		var cancelBtnId = dlgId + 'cncl-btn';
		var mainDlgElm;
		var loadingElm;
		var headElm;
		var ctrlsElm;
		var bodyElm;
		var okClickFcn = null;
	    
	    var addToHeadElm = function(elm) {
	    	headElm.show();
	    	return $(elm).appendTo(headElm);
	    };
	    var addToBodyElm = function(elm) {
	    	return $(elm).appendTo(bodyElm);
	    };
	    var addCtrl = function (ctrl) { 
	    	if (!ctrlsElm) {
	    		ctrlsElm = addToHeadElm( $('<div />', {id: ctrlsId}).addClass('ui-widget-header ui-corner-all') );
	    	};
	    	return $(ctrl).appendTo(ctrlsElm);
	    };
		
		var dlg = {};
		
		mainDlgElm = jPw.getJqId(dlgId);
		if (!mainDlgElm) {
	    	mainDlgElm = $('<div />').attr('id', dlgId).addClass('ui-ns-custom').appendTo('body').hide();
		};

	    var exst = mainDlgElm.hasClass('ui-dialog-content');
	    if (exst == true) { 
	    	var prnt = mainDlgElm.parent();
	    	loadingElm = jPw.getJqId("#" + loadingId, prnt);
	    	bodyElm = jPw.getJqId("#" + bodyId, prnt);
	    	headElm = jPw.getJqId("#" + headId, prnt);
	    	ctrlsElm = jPw.getJqId("#" + ctrlsId, prnt);
	    } else {
		    mainDlgElm.dialog({
		    	title: 'Dialog',
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
	            , create: function( event, ui ) {
	            	mainDlgElm = $(event.target);
	    	    	loadingElm = $('<img />', {src: '/c.801095/site/rw-files/ajax-loader-follower.gif', alt: 'Please wait...', id: loadingId}).appendTo(mainDlgElm).hide();
	    	    	bodyElm = $('<div />', {id: bodyId}).appendTo(mainDlgElm);
	    	    	headElm = $('<div />', {id: headId}).hide();
	    	    	mainDlgElm.parent().find('div.ui-dialog-titlebar').after( headElm );
	            }
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
			bodyId: bodyId,
			okBtnId: okBtnId,
			cancelBtnId: cancelBtnId,
			mainDlgElm: mainDlgElm,
			loadingElm: loadingElm,
			bodyElm: bodyElm,
			ctrlsElm: ctrlsElm,
			open: function () { openDlg(mainDlgElm); },
	    	setTitle: function (title) { mainDlgElm.dialog('option', 'title', title); },
	    	clearBody: function () {bodyElm.empty();},
	    	addToHeadElm: addToHeadElm,
	    	addToBodyElm: addToBodyElm,
	    	addCtrl: addCtrl,
	    	startLoading: function () {loadingElm.show();},
	    	endLoading: function () {loadingElm.hide();},
	    	ableOk: ableOk, 
	    	enableOk: function () {ableOk(true);},
	    	disableOk: function () {ableOk(false);},
	    	setOkClick: function(fcn) { okClickFcn = fcn;}
	    };
	    
	    return dlg;
	};
	
	jPw.createListDialog = function (dlgId) {
		var listId = dlgId + 'dlg-list';
		var listCls = 'lst-dlg-list';
		
		var dlg = jPw.createDialog(dlgId);
		
		dlg.listElm = dlg.addToBodyElm( $('<table />', {id: listId}).addClass(listCls) );

		dlg.addListTtl = function(headVal) {
	    	if (!headVal) {return;};
	    	var headerArr;
    		if (Array.isArray(headVal)) {
    			headerArr = headVal;
    		} else {
    			headerArr = [headVal];
    		};
    		var headRow = $('<tr />').appendTo( $('<thead />').appendTo(dlg.listElm) );

    		$.each(headerArr, function( index, value ) {
    			headRow.append( $('<th />').append(value) );
    		});
	    };
	    
	    dlg.addListRow = function (colVal) {
	    	if (!colVal) {return;};
	    	var colValArr;
    		if (Array.isArray(colVal)) {
    			colValArr = colVal;
    		} else {
    			colValArr = [colVal];
    		};
    		var row = $('<tr />').appendTo(dlg.listElm);
    		
    		$.each(colValArr, function( index, value ) {
    			row.append($('<td />').append(value));
    		});
    	};
    	
    	dlg.clearList = function () {dlg.listElm.empty();};
    	
    	dlg.clearListRows = function () {dlg.listElm.find('tbody').html('');};

    	return dlg;
	};

	
}( this.jPw = this.jPw || {}, jQuery ));
