/**
 * Module Description
 * jPwSelectorUI.js
 * 
 * Version    Date            Author           Remarks
 * 1.00       26 Aug 2013     james.white
 *
 * jQuery
 * jPwClientUtils.js
 *
 */

/**
 * routine to call selector suitelet via http 
 */

(function(jPw, $, undefined) {
	/**
	 * slctrResult - call selector backen suitelet 
	 */
	jPw.suiteletResult = function(url, parmObj, successProp, resultfcn, errFcn) {
		
		if (parmObj) {
			for (var name in parmObj) {
				url = url + '&' + name + '=' + parmObj[name];  
			};
		}
		
		var a = new Array();
		a['User-Agent-x'] = 'SuiteScript-Call';
	
		try {
			nlapiRequestURL( url, null, a, 
				function ( response )
				{
					if (resultfcn) {
						var body = response.getBody();
						var result = JSON.parse(body);

						if (result) {
							if (result[successProp]) {
								resultfcn(result);
							} else {
								if (errFcn) { errFcn(result.message); }
							};
						} else {
							if (errFcn) { errFcn('No result body'); }
						};
					};
				}			
			);
		} catch (e) {
			if (errFcn) { errFcn(e); }
		}		
	};
	
	jPw.slctrResult = function(type, parmObj, resultfcn, errFcn) {
		var url = nlapiResolveURL('SUITELET', 'customscript_leather_selector','customdeploy_leather_selector', null);  
		url = url + '&type=' + type;
		jPw.suiteletResult(url, parmObj, 'success', resultfcn, errFcn);
	};

	jPw.lscCfgrResult = function(stage, parmObj, resultfcn, errFcn) {
		var url = nlapiResolveURL('SUITELET', 'customscript_seatconfigurator', 'customdeploy_seatconfigurator', null);  
		url = url + '&stage=' + stage;
		jPw.suiteletResult(url, parmObj, 'isSuccess', resultfcn, errFcn);
	};
	
}( this.jPw = this.jPw || {}, jQuery ));


/**
 * make a selector object that works with the 
 */
(function(jPw, $, undefined) {
	/**
	 * 
	 */
	jPw.makeColsDfn = function (defnObj) {
		var defn = {
			isArray: false,
			isFunction: false,
			isDefnObj: false,
			propsArr: undefined,
			colsFcn: undefined, 
			titlesFcn: undefined,
			xtraFcn: undefined 
		};

		if (!defnObj) {
			defn.isArray = true;
			defn.propsArr = ['name'];
		} else if (typeof defnObj == 'string' || defnObj instanceof String)	{		
			defn.isArray = true;
			defn.propsArr = [defnObj];
		} else if (Array.isArray(defnObj)) {
			defn.isArray = true;
			defn.propsArr = defnObj;
		} else if (defnObj instanceof Function) {
			defn.isFunction = true;
			defn.colsFcn = defnObj;
		} else {
			defn.isDefnObj = true;
			defn.colsFcn = defnObj.colsFcn;
			defn.titlesFcn = defnObj.titlesFcn;
			defn.xtraFcn = defnObj.xtraFcn; 
		};

		defn.itemDisp = function(item, slctr) {
			var display;
			if (defn.isArray) {
				var prop = defn.propsArr[0];
				display = item[prop];
			} else if ((defn.isFunction) || (defn.isDefnObj)) {
				var fcnResult = defn.colsFcn(item, defn, slctr);
				if (Array.isArray(fcnResult)) {
					display = fcnResult[0];
				} else {
					display = fcnResult;
				}
    		} else {
    			display = item.name;
    		};
    		return display;
		};
		
		defn.cols1Plus = function(item, slctr) {
			var cols = [];
			if (defn.isArray) {
				cols = $.map( defn.propsArr.slice(1), function( prop ) {
					return item[prop];
				});
			} else if ((defn.isFunction) || (defn.isDefnObj)) {
				var fcnResult = defn.colsFcn(item, defn, slctr);
				if (Array.isArray(fcnResult)) {
					cols = fcnResult.slice(1); 
				}
			};
			
			return cols;
		};

		return defn;
	};
	
	jPw.makeSlctLvl = function (defnObj) {
		var defn = {
			type: defnObj.type, 
			listName: defnObj.listName,
			title: defnObj.title,
			objName: defnObj.objName,
			idName: defnObj.idName, 
			valName: defnObj.valName, 

			parms: defnObj.parms,
			loadFcn: defnObj.loadFcn,
			
			colsDfn: jPw.makeColsDfn(defnObj.colsDefn),
			textFcn: defnObj.textFcn,
			
			filtDefns: defnObj.filtDefns,
			
			okFcn: defnObj.okFcn,
			dcsnFcn: undefined
		};

		defn.itemDisp = function(item, slctr) {
			return defn.colsDfn.itemDisp(item, slctr);
		};
		
		defn.slctdDisp = function(item, defn, slctr) {
			if (defnObj.textFcn) {
				return defnObj.textFcn(item, defn, slctr);
			} else {			
				return defn.itemDisp(item, slctr);
			};
		};
		
		defn.cols1Plus = function(item, slctr){
			return defn.colsDfn.cols1Plus(item, slctr);
		};
		
		defn.getListName = function() {
			return defn.listName || defn.type;
		};
		
		defn.isDcsnPoint = function () {
			return (defn.dcsnFcn instanceof Function);
		};
		
		return defn;
	};
	
	jPw.makeSlctList = function(defnArr, dcsnFcn) {
		var levels = [];
		
		if (defnArr) {
			levels = $.map( defnArr, function( defnObj ) {
				return jPw.makeSlctLvl(defnObj);
			});
			
			levels[levels.length-1].dcsnFcn = dcsnFcn;
		};
	
		return {levels: levels, dcsnFcn: dcsnFcn};
	};
	
	jPw.makeSelector = function () {

		var levels = [];
		var baseList = jPw.makeSlctList();
		var altLists = {};
		
		var slctr = {
			listDlg: null,
			curLevel: -1,
			results: {},
			tltPrfx: 'Select',
			levelBtns: [],
			onOkClick: undefined
		};
		
		slctr.setBaseList = function(defnArr, dcsnFcn) {
			baseList = jPw.makeSlctList(defnArr, dcsnFcn);
			levels = baseList.levels;
			return slctr;
		};

		slctr.setAltList = function(altToken, defnArr, dcsnFcn) {
			altLists[altToken] = jPw.makeSlctList(defnArr, dcsnFcn);
			levels = baseList.levels;
			return slctr;
		};
		
		slctr.clearLevels = function(level) {
			var dcsnIdx;
			for(var i = level; i < levels.length; i++){
				var defn = levels[i];
				delete slctr.results[defn.getListName()];
				delete slctr.results[defn.objName];
				delete slctr.results[defn.idName]; 
				delete slctr.results[defn.valName];
				slctr.clearLevelBtn(i);
				if ((!dcsnIdx) && (defn.isDcsnPoint())) {
					dcsnIdx = i;
				};
			};
			if (dcsnIdx) {
				levels = levels.slice(0, dcsnIdx+1);
			};
		};
		
		slctr.loadLevel= function(level) {
			var defn = levels[level];
			
			slctr.curLevel = level;
			if (slctr.curLevel < (levels.length-1)) {
				slctr.listDlg.disableOk();
			};
			
			slctr.listDlg.clearList();
			slctr.listDlg.startLoading();
			
			slctr.clearLevels(slctr.curLevel);
			
			if (defn.loadFcn) {
				var obj = defn.loadFcn(defn, level);
				$.extend(slctr.results, obj);
				slctr.updateDlg();
			} else {
				slctr.slctrLoadLevel(defn);
			};
			
			slctr.levelOkCheck(level);
		};

		slctr.levelOkCheck = function(level) {
			var enable = false;
			for(var i = level; i > -1; i--) {
				var defn = levels[i];
				if (defn.okFcn) {
					enable = defn.okFcn(slctr, defn, level);
					if (!enable) {break;};
				};
			};
			slctr.listDlg.ableOk(enable);
		};
		
		slctr.slctrLoadLevel= function(defn) {
			var parmObj = null;
			var parnName;
			if (defn.parms) {
				parmObj = {};
				for(var i = 0; i<defn.parms.length; i++){
					parnName = defn.parms[i];
					parmObj[parnName] = slctr.results[parnName];
				};
			};
			
			jPw.slctrResult(defn.type, parmObj, 
				function(result) {
					$.extend(slctr.results, result);
					slctr.updateDlg();
				},
				function(e) {
					slctr.listDlg.endLoading();
					if ( e instanceof nlobjError ) {
						var msg = e.getCode() + '\n' + e.getDetails() + '\n' + e.getStackTrace();
						nlapiLogExecution( 'DEBUG', 'system error', msg);
						alert(msg);
					} else {
						nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString());
						alert('unexpected error: ' + e);
					}
				}
			);
			
		};
		
		slctr.ensureLoaded = function (defLvl) {
			if (slctr.curLevel < 0) {
				slctr.loadLevel(0);
			}
		};
		
		slctr.selectForLevel = function (curLevel, idx) {
			if (curLevel < 0) {
				return;
			};
			var defn = levels[curLevel];
			var list = slctr.results[defn.getListName()];
			slctr.results[defn.objName] = list[idx];
			slctr.results[defn.idName] = list[idx].id;
			slctr.results[defn.valName] = list[idx].name;
			slctr.setBtnForLevel(curLevel, defn.slctdDisp(list[idx], defn, slctr));
		};
		
		slctr.setBtnForLevel = function (level, name) {
			while (slctr.levelBtns.length < level+1) {
				slctr.levelBtns.push(undefined);
			}
			var curBtn = slctr.levelBtns[level];
			if (!curBtn) {
				curBtn = $('<button />').append(name).button({ text: true })
					.data('level', level)
					.click(slctr.levelBtnClick);
				slctr.listDlg.addCtrl(curBtn);
				slctr.levelBtns[level] = curBtn;
			}
			$(curBtn).text(name).button('refresh');
		};
		
		slctr.clearLevelBtn = function (level) {
			if (level < slctr.levelBtns.length) {
				var curBtn = slctr.levelBtns[level];
				if (curBtn) {
					$(curBtn).remove();
				};
				slctr.levelBtns[level] = undefined;
			}
		};
		
		slctr.levelBtnClick = function() {
			var level = $(this).data('level');
			slctr.loadLevel(level);
			return false;
		};
		
		slctr.loadNextLevel = function (curLevel) {
			var nextLevel = curLevel +1;
			if (nextLevel < levels.length) {
				slctr.loadLevel(nextLevel);
			}
		};
		slctr.loadPrevLevel = function (curLevel) {
			var prevLevel = curLevel - 1;
			if (prevLevel > -1) {
				slctr.loadLevel(prevLevel);
			}
		};
		
		slctr.updateDlg = function() {
			var item;
			var anch;

			var defn = levels[slctr.curLevel];
			
			slctr.listDlg.setTitle(slctr.tltPrfx +' - '+ defn.title);	

			slctr.listDlg.addListFilt(defn.filtDefns,function() {
				slctr.listDlg.clearListRows();
				slctr.loadDlgList(defn);
			});
			
			if ((defn.colsDfn.isDefnObj) && (defn.colsDfn.titlesFcn)) {
	    		slctr.listDlg.addListTtl( defn.colsDfn.titlesFcn(defn, slctr) );
			};
			
			slctr.loadDlgList(defn, true);
		};
		
		slctr.loadDlgList = function(defn, setupFilters) {
			var hasFilts = Array.isArray(defn.filtDefns); 

			if (setupFilters && hasFilts) {
				$.each(defn.filtDefns, function( index, filtOpt ) {
					filtOpt.include(false);
				});
			};

			var eval;
			function evalFilts(item) {
				var result = true;
	    		$.each(defn.filtDefns, function( index, filtOpt ) {
	    			eval = filtOpt.evalFcn(item);
	    			if (setupFilters) {
		    			if ((eval === true) && (!filtOpt.include())) {
		    				filtOpt.include(true);
		    			};
	    			};
	    			if ((eval === true) && (filtOpt.include())) {
		    			if (!filtOpt.checked()) {
		    				result = false;
		    			};
	    			};
	    		});
				return result;
			};

			var list = slctr.results[defn.getListName()];
			var colsArr;
			var col1;
			for(var i = 0; i<list.length; i++){
				item = list[i];
				if ((!hasFilts) || (evalFilts(item))) { // if it has filter conditions, evaluate each, only add if it passes
					
					col1 = defn.itemDisp(item, slctr);
					anch = $('<a />').attr("href", "#").append(col1)
					.data('level', slctr.curLevel).data('idx', i)
					.click(function() {
						slctr.dlgItemClick( this );
						return false;
					});
				
					colsArr = [anch].concat(defn.cols1Plus(item, slctr));
			
					if ((defn.colsDfn.isDefnObj) && (defn.colsDfn.xtraFcn)) {
						var tip = defn.colsDfn.xtraFcn(item, defn, slctr) ;
						if (tip) {
							var xtra = $('<span class="ui-icon ui-icon-info"></span>').attr('title', tip);
							xtra.tooltip({content: tip});
							colsArr.push(xtra);
						};
					};
				
					slctr.listDlg.addListRow(colsArr);
				};
	    	};
			slctr.listDlg.endLoading();		
		};
		
		slctr.dlgItemClick = function(elm) {
			var item = $(elm);
			var level = item.data('level'); 
			var idx = item.data('idx');
			
			slctr.selectForLevel(level, idx);
			
			slctr.checkDcsnPoint(level);
			
			if ((level+1) < levels.length) {
				slctr.loadNextLevel(level);
			} if (level == (levels.length-1)) {
				slctr.listDlg.enableOk();
			}
		};
		
		slctr.checkDcsnPoint = function(level) {
			var defn = levels[level];
			if (defn.isDcsnPoint()) {
				var token = defn.dcsnFcn(slctr);
				if (token) {
					var altList = altLists[token];
					if (altList) {
						levels = levels.slice(0, level+1);
						levels = levels.concat(altList.levels);
					}
				};
			};
		};
		
		slctr.resetClick = function() {
			slctr.loadLevel(0);
			return false;
		};
		slctr.previousClick = function() {
			slctr.loadPrevLevel(slctr.curLevel);
			return false;
		};

		slctr.assignDlg = function (dlg) {
			slctr.listDlg = dlg;
			slctr.listDlg.resetBtn.click(slctr.resetClick); 
			slctr.listDlg.prevBtn.click(slctr.previousClick); 
			/*
			function scrollIntoView(element, container) {
			  var containerTop = $(container).scrollTop(); 
			  var containerBottom = containerTop + $(container).height(); 
			  var elemTop = element.offsetTop;
			  var elemBottom = elemTop + $(element).height(); 
			  if (elemTop < containerTop) {
			    $(container).scrollTop(elemTop);
			  } else if (elemBottom > containerBottom) {
			    $(container).scrollTop(elemBottom - $(container).height() + $(element).height());
			  }
			};
				
			slctr.listDlg.addCtrl(
				$('<button />').text('Test').button({ icons: { primary: 'ui-icon-arrowthick-1-w' }, text: false }).click(function(){
					
					var found = $('#car-slctr-dlglst-dlg-list tr:contains("IS")');
					found.addClass('jpw-found');
					
					scrollIntoView(
						found.get(0),
						$('#car-slctr-dlg').get(0));
					
					//$("tr:contains('TOYOTA')").get(0).scrollIntoView();
				}) 
			);			
			*/
			slctr.listDlg.setOkClick(slctr.okClick); 
		};

		slctr.okClick = function (dlg) {
			if (slctr.onOkClick) {
				slctr.onOkClick(dlg, slctr);
			}
		};
		
		slctr.openDlg = function (level) {
			if ((level === 0) || (level)) {
				slctr.loadLevel(level);
			} else {
				slctr.ensureLoaded();
			};
			
			slctr.listDlg.open();
			return false;
		};
		
		
		return slctr;
	};
	
}( this.jPw = this.jPw || {}, jQuery ));

/**
 * make car selector  
 */
(function(jPw, $, undefined) {
	jPw.createSlctrDialog = function(dlgId) {
		var filtId = dlgId + 'sel-dlg-filts';
		
		var dlg = jPw.createListDialog(dlgId);

		dlg.resetBtn = dlg.addCtrl($('<button />').text('Reset').button({ icons: { primary: 'ui-icon-refresh' }, text: false }));
		dlg.prevBtn = dlg.addCtrl($('<button />').text('Previous').button({ icons: { primary: 'ui-icon-arrowthick-1-w' }, text: false }));
		
		dlg.filtElm = $('<div />', {id: filtId}).addClass('ui-widget-header ui-corner-all');
		dlg.addToHeadElm( dlg.filtElm );
		dlg.filtElm.hide();
			
		dlg.clearList = function () {
			dlg.filtElm.empty();
			dlg.filtElm.hide();
			dlg.listElm.empty();
		};
		
		dlg.makeFiltOpt = function(lbl, evalFcn) {
			
			var filtOpt = {
				lbl: lbl, 
				evalFcn: evalFcn,
				chxElm: undefined,
				lblElm: undefined
			};
			
			var incld = false;
			filtOpt.include = function(fnd) {
				if (fnd !== undefined) {					
					incld = fnd;
					if ((filtOpt.lblElm) && (filtOpt.chxElm.length>0)) {
						if (incld) {
							filtOpt.lblElm.show();
						} else {
							filtOpt.lblElm.hide();
						}
					};					
				};
				return incld;
			};
			
			filtOpt.checked = function(checked) {
				if ((filtOpt.chxElm) && (filtOpt.chxElm.length>0)) {
					if (checked !== undefined) {					
						filtOpt.chxElm[0].checked = checked;
					};
					return filtOpt.chxElm[0].checked;
				} else {
					return undefined;
				};
			};
			
			filtOpt.makeElm = function(parentElm, reloadFcn) {
				if (!filtOpt.chxElm) {
					filtOpt.chxElm = $('<input />', { type: 'checkbox', value: false });
					filtOpt.checked(true);
				};
				filtOpt.chxElm.change(function() {
					reloadFcn();}
				);
				
				if (!filtOpt.lblElm) {
					filtOpt.lblElm = $('<label />');
					filtOpt.lblElm.append( filtOpt.chxElm );
					filtOpt.lblElm.append( filtOpt.lbl );
				};
					
				filtOpt.lblElm.appendTo(parentElm);
			};
			
			return filtOpt;
		};
		
		dlg.addListFilt = function(filtVal, reloadFcn) {
			if (!filtVal) {return;};
	    	var filtArr;
    		if (Array.isArray(filtVal)) {
    			filtArr = filtVal;
    		} else {
    			filtArr = [filtVal];
    		};
    		$.each(filtArr, function( index, filtOpt ) {
    			dlg.addFiltOpt(filtOpt, reloadFcn) ;
    		});
		};
		
		dlg.addFiltOpt = function(filtOpt, reloadFcn) {
			filtOpt.makeElm(dlg.filtElm, reloadFcn);
			dlg.filtElm.show();
		};
		//<label><input type="checkbox" />Option 3</label>
		
		return dlg;
	};
	
	jPw.makeCarSelector = function (dlgId) {
		var carSlctr = jPw.makeSelector(dlgId); 

		carSlctr.assignDlg( jPw.createSlctrDialog(dlgId) );
		carSlctr.setBaseList([
  			{type: 'makes', title: 'Makes', objName: 'make', idName: 'makeid', valName: 'makeName'},
			{type: 'years', title: 'Years', objName: 'yr', idName: 'yearid', valName: 'year', parms: ['makeid']},
			{type: 'models', title: 'Models', objName: 'model;', idName: 'modelid', valName: 'modelName', parms: ['makeid', 'year']},
			{type: 'bodies', title: 'Bodies', objName: 'body', idName: 'bodyid', valName: 'bodyName', parms: ['makeid', 'year', 'modelid']},
			{type: 'trims', title: 'Trim Levels', objName: 'trim', idName: 'trimid', valName: 'trimName', parms: ['makeid', 'year', 'modelid', 'bodyid']},
			{type: 'cars', title: 'Cars', objName: 'car', idName: 'carid', valName: 'carName', parms: ['makeid', 'year', 'modelid', 'bodyid', 'trimid']}	
		 ]);
		
		carSlctr.tltPrfx = 'Select Vehicle';

		return carSlctr;
	};
}( this.jPw = this.jPw || {}, jQuery ));
