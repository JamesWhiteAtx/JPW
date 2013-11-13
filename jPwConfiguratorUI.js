/**
 * Module Description
 * jPwConfiguratorUI.js
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 Oct 2013     james.white
 *
 * jQuery
 * jPwClientUtils.js
 *
 */
 
(function(jPw, $, undefined) {
	jPw.clrsDialog = undefined;
	
	jPw.createClrsDialog = function(dlgId) {
		if (!jPw.clrsDialog) {
			var dlg = jPw.createDialog(dlgId);

			function loadColors(elm, type) {
				dlg.startLoading();
				jPw.slctrResult(type, null, 
					function(result) {
						elm.append($('<option selected></option>').text(' '));
						
						for(var i = 0; i < result.colors.length; i++){
							color = result.colors[i];
							elm.append($('<option></option>').attr('value', color.id).text(color.name));
						};
					
						dlg.endLoading();
					},
					function(e) {
						dlg.endLoading();
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
			
			dlg.setTitle('Define Colors');
			
			dlg.addToBodyElm('<div id="clr-dlg-clr1"><label class="color-lbl">Color: </label><select id="clr-dlg-clr-sel1"></select></div>');
			
			dlg.addToBodyElm('<div id="clr-dlg-clr2"><div id="clr-dlg-clr2-opts"><label class="color-lbl">1st Insert Color: </label><select id="clr-dlg-clr-sel2"></select></div>'+
				'<div id="clr-dlg-clr2-place"><label class="place-lbl">1st Insert Placement: </label>'+
				'<select name="custcol_perf_placement" id="custcol_perf_placement">'+
					'<option value="1" selected>A. Inserts</option>'+
					'<option value="2">B. Combo</option>'+
					'<option value="3">C. Body</option>'+
					'<option value="4">D. Centers</option>'+
				'</select></div></div>');

			dlg.addToBodyElm('<div id="clr-dlg-clr3"><div id="clr-dlg-clr3-opts"><label class="color-lbl">2nd Insert Color: </label><select id="clr-dlg-clr-sel3"></select></div>'+
				'<div id="clr-dlg-clr3-place"><label class="place-lbl">2nd Insert Placement: </label>'+
				'<select name="custcol_perf_placement" id="custcol_perf_placement">'+
					'<option value="1" selected>A. Inserts</option>'+
					'<option value="2">B. Combo</option>'+
					'<option value="3">C. Body</option>'+
					'<option value="4">D. Centers</option>'+
				'</select></div></div>');

			
			function loadColor1() {
				if (!$('select#clr-dlg-clr-sel1 option').length) {
					loadColors($('#clr-dlg-clr-sel1'), 'trimcolors');
				};
			};
			
			function loadColor2() {
				if (!$('select#clr-dlg-clr-sel2 option').length) {
					loadColors($('#clr-dlg-clr-sel2'), 'insertcolors');
				};
			};
			
			function loadColor3() {
				if (!$('select#clr-dlg-clr-sel3 option').length) {
	
					if (!$('select#clr-dlg-clr-sel2 option').length) {
						loadColors($('#clr-dlg-clr-sel3'), 'insertcolors');
					} else {
						$('#clr-dlg-clr-sel1').find('option').clone().appendTo('#clr-dlg-clr-sel3');
					};
				};
			};
			
			dlg.oneColor = function(hide) {
				if (!hide) {
					dlg.setTitle('Select Color');
					$('#clr-dlg-clr1 label.color-lbl').text('Color: ');
					$('#clr-dlg-clr1').show();
					$('#clr-dlg-clr2').hide();
					$('#clr-dlg-clr3').hide();
				};
				loadColor1();
			};
			dlg.twoColor = function(hide) {
				if (!hide) {
					dlg.setTitle('Define 2 Tone Colors');					
					$('#clr-dlg-clr1 label.color-lbl').text('Trim Color: ');
					$('#clr-dlg-clr2 label.color-lbl').text('Insert Color: ');
					$('#clr-dlg-clr2 label.place-lbl').text('Insert Placement: ');
					$('#clr-dlg-clr1').show();
					$('#clr-dlg-clr2').show();
					$('#clr-dlg-clr3').hide();
				};
				dlg.oneColor(true);
				loadColor2();
			};
			dlg.threeColor = function(hide) {
				if (!hide) {
					dlg.setTitle('Define 3 Tone Colors');
					$('#clr-dlg-clr1 label.color-lbl').text('Trim Color');
					$('#clr-dlg-clr2 label.color-lbl').text('1st Insert Color');
					$('#clr-dlg-clr2 label.place-lbl').text('1st Insert Placement');
					$('#clr-dlg-clr3 label.color-lbl').text('2nd Insert Color');
					$('#clr-dlg-clr3 label.place-lbl').text('2nd Insert Placement');
					$('#clr-dlg-clr1').show();
					$('#clr-dlg-clr2').show();
					$('#clr-dlg-clr3').show();
				};
				dlg.twoColor(true);
				loadColor3();
			};
			
			jPw.clrsDialog = dlg;
		};
		
		return jPw.clrsDialog;
	};
	
}( this.jPw = this.jPw || {}, jQuery ));


console.log('jPw.locDecorDialog');
(function(jPw, $, undefined) {
	jPw.locDecorDialog = undefined;
	
	jPw.createLocDecorDialog = function(dlgId) {
		var locsSecId = 'locs-sec';
		var locsSecObj;
		var ordSecId = 'ord-sec';
		var ordSecObj;
		var decSecId = 'dec-sec';
		var decSecObj;
		var csDecorOptId ='custcol_con_stitch';
		var csDecorOptObj;
		var embDecorOptId ='custcol_emb_yn';
		var embDecorOptObj;
		var hsDecorOptId ='custcol_heat_seal';
		var hsDecorOptObj;
		var perfDecorOptId ='custcol_peforation_option'; 
		var perfDecorOptObj; 
		var pipDecorOptId ='custcol_piping';
		var pipDecorOptObj;
		var holderElm;
		var stocklocName = 'stock-loc-rdo';

		if (!jPw.locDecorDialog) {
			var dlg = jPw.createDialog(dlgId);
			
			dlg.setTitle('Item Options');
	
			function isSourced() {
				return ($('input[type="radio"][name="'+stocklocName+'"]').is(':checked'));
			};
			
			function sourceLoc() {
				var selected = $('input[type="radio"][name="'+stocklocName+'"]:checked');
				if (selected.length > 0) {
				    var loc = selected.val();
				    if (loc) {
				    	return loc;
				    };
				};				
			};
						
			function setEnableOk() {
				var s = isSourced();
				var c = decSecObj.isComplete();
				dlg.ableOk( s && c );
			};
			
			function addLocRadio(elm, value, text) {
				var rdo = $('<input />', {type:"radio", name: stocklocName, value: value});
				elm.append( rdo );
				elm.append($('<span />').text(text));
				
				rdo.click(function() {
					setEnableOk();
				});
				
				return rdo;
			};
			
			function thisHost(url) {
				return url.replace("http://shopping.netsuite.com", document.location.protocol + "//" + document.location.hostname);
			};
			
			function displayLocs(result) {
				var locDiv;
				
				locsSecObj.body.empty();
				
				var locList = [];
				if ((result.stockLevels) && (result.stockLevels.length > 0)) {
					
					locList = $.map( result.stockLevels, function( loc ) {
						if (loc.qty) {
							locDiv = $('<div class="stock-loc" />');
							addLocRadio(locDiv, loc.id, "Ship from: " + loc.name + ". " + loc.qty + " available.");
							return locDiv;
						};
					});
				};
				
				if (locList.length > 0) {
					$.each(locList, function( index, loc ) {
						locsSecObj.body.append(loc);
					});
					ordFromCent(false);
				} else {
					ordFromCent(true);
				};
			};
			
			function ordFromCent(order) {
				if (order || (!locsSecObj.hasLocs())) {
					locsSecObj.sect.hide();
					ordSecObj.sect.show();
					ordSecObj.rdo.prop( "checked", true );
				} else {
					locsSecObj.sect.show();
					ordSecObj.sect.hide();
					ordSecObj.rdo.prop( "checked", false );
				};
			};

			function loadFragURL(fragmentURL, succFcn, loadSctr) {

				function complete(resultTxt, textStatus, xhr) {
					if(textStatus != "success") {
						return;
					};
					if (succFcn) {
						succFcn.call(this, xhr);
					};
					holderElm.empty();
				};
				
				holderElm.empty();

				if (!fragmentURL) {
					return ;
				};
				
				var url = thisHost(fragmentURL);
				if (loadSctr) {
					url = url + ' ' + loadSctr; 
				}
				
				holderElm.load(url, complete);
			};
			
			function clearChange(elms) {
				elms.each(function() {
					this.onchange = '';
				});
			};
			
			function addClone(elm, lbl, slctr) {
				var div = $('<div />').append('<label>'+lbl+': </label>').appendTo(elm); 
				var clone = holderElm.find(slctr).appendTo(div);
				clearChange(clone);
				return {div: div, elm: clone};
			};
			
			function loadLogos(list, type, makeId, disp, img, threads) {
				if (disp) {dlg.startLoading();}
				list.empty();
				var custId = "0";
				var custEmail = "";
				var custCred = custId + ":" + custEmail.replace("@", "^");
				
				function clearLogo() {
					if (img) {
						img.attr('src', "").hide();
					};
					if (threads) {
						for(var i = 1; i < threads.length; i++){
							threads[i].hide();
						};
					};
				};
				function endLoad() {
					if (disp) {dlg.endLoading();}
				};
				
				if (!makeId) {
					clearLogo();
					endLoad();
					return;
				};
				
				jPw.lscCfgrResult('getlogos', {logoTypes : type, makeId : makeId, custCred : custCred}, 
					function(result) {
						var opt;
						if ((result.logos) && (result.logos.length > 0)) {
							
							list.append($('<option selected></option>').text(' '));
							
							$.each(result.logos, function( index, logo ) {
								opt = $('<option></option>').attr('value', logo.id).text(logo.label);
								opt.data('count', logo.colorCount);
								opt.data('image', logo.image);
								list.append(opt);
							});
						} else {
							clearLogo();
						};
						
						endLoad();
					},
					function(e) {
						endLoad();
						if ( e instanceof nlobjError ) {
							var msg = e.getCode() + '\n' + e.getDetails() + '\n' + e.getStackTrace();
							nlapiLogExecution( 'DEBUG', 'system error', msg);
							clearLogo();
							alert(msg);
						} else {
							nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString());
							clearLogo();
							alert('unexpected error: ' + e);
						}
					}
				);				
			};
			
			function setupMakes(makes, logos, type, img, noImg, threads) {
				if (dlg.makeId) {
					makes.val(dlg.makeId);
				};
				makes.on('change', function() {
				  loadLogos(logos, type, $(this).val(), true, img, noImg, threads);
				});
				if (dlg.makeId) {
					loadLogos(logos, type, dlg.makeId, false);
				};
			};

			function setupEmbLogos(logos, img, noImg, threads) {
				for(var i = 1; i < threads.length; i++){
					threads[i].hide();
				};
				
				logos.on('change', function() {
					var opt = $(this).find("option:selected");
					
					var count = parseInt(opt.data('count'));
					if ((!count) || isNaN(count)) {
						count = 1;
					};
					
					for(var i = 0; i < threads.length; i++){
						if (i < count) {
							threads[i].show();
						} else {
							threads[i].hide();
						};
					};
					
					var url = opt.data('image');
					if (url) {
						noImg.hide();
						img.attr('src', url).show();
					} else {
						noImg.show();
						img.attr('src', "").hide();
					};
				});
			};
			
			function setupPlace(places) {
				places.on('change', function() {
					var thisSel = $(this);
					var val = thisSel.val();
					$('select#[id^="custcol_placement"]').each(function(idx, sel) {
						if ($(thisSel).get(0) !== $(sel).get(0)) {
							$(sel).find('option').each(function(idx, opt) {
								$(opt).attr('disabled', ((!!val) && (val == $(opt).val())));
							});
						};
					});
				});
			};
			
			function setUpEmb() {
				var obj = embDecorOptObj;
				obj.body.empty();
				obj.dtlSect = $('<div></div>').addClass('flt-lft').appendTo(obj.body); 
				obj.imgSect = $('<div></div>').addClass('flt-lft').appendTo(obj.body);
				obj.sect.show();
				
				
				var makes = addClone(obj.dtlSect, 'Car Make', 'select#custcol_car_make_option').elm;
				var logos = addClone(obj.dtlSect, 'Logo', 'select#custcol_non_restrict_logo').elm;
				
				var img = $('<img width="320" id="emb-img" class="logoImage" src=""/>').appendTo(obj.imgSect);
				var noImg = $('<div>No Image Available</div>').appendTo(obj.imgSect).hide();
				
				var threads = [addClone(obj.dtlSect, 'Thread Color 1', 'select#custcol_emb_color_1').div,
					addClone(obj.dtlSect, 'Thread Color 2', 'select#custcol_emb_color_2').div,
					addClone(obj.dtlSect, 'Thread Color 3', 'select#custcol_emb_color_3').div,
					addClone(obj.dtlSect, 'Thread Color 4', 'select#custcol_emb_color_4').div,
					addClone(obj.dtlSect, 'Thread Color 5', 'select#custcol_emb_color_5').div,
					addClone(obj.dtlSect, 'Thread Color 6', 'select#custcol_emb_color_6').div,
					addClone(obj.dtlSect, 'Thread Color 7', 'select#custcol_emb_color_7').div];

				setupMakes(makes, logos, 'emb', img, noImg, threads);
				setupEmbLogos(logos, img, noImg, threads);
				
				setupPlace( addClone(obj.dtlSect, 'Placement', 'select#[id^="custcol_placement"]').elm );

				holderElm.find('div.internalId').appendTo(obj.dtlSect);//.hide();
				
				//obj.detailsFcn = function(obj) {alert('emb details'); return false;};
			};

			function setUpCs() {
				var obj = csDecorOptObj;
				obj.body.empty();
				obj.sect.show();
				
				addClone(obj.body, 'Thread Color', 'select#custcol_contrast_color');
				$('<div class="price">$25.00</div>').appendTo(obj.body);
				holderElm.find('div.internalId').appendTo(obj.body);//.hide();
			};

			function setupHsLogos(logos, img, noImg) {
				logos.on('change', function() {
					var opt = $(this).find("option:selected");
					
					var url = opt.data('image');
					if (url) {
						noImg.hide();
						img.attr('src', url).show();
					} else {
						noImg.show();
						img.attr('src', "").hide();
					};
				});
			};

			function setUpHs() {
				var obj = hsDecorOptObj;
				obj.body.empty();
				obj.dtlSect = $('<div></div>').addClass('flt-lft').appendTo(obj.body); 
				obj.imgSect = $('<div></div>').addClass('flt-lft').appendTo(obj.body);
				obj.sect.show();

				var makes = addClone(obj.dtlSect, 'Car Make', 'select#custcol_car_make_option').elm;
				var logos = addClone(obj.dtlSect, 'Logo', 'select#custcol_hs_logo').elm;
				var img = $('<img width="320" id="emb-img" class="logoImage" src=""/>').appendTo(obj.imgSect);
				var noImg = $('<div>No Image Available</div>').appendTo(obj.imgSect).hide();
				
				setupMakes(makes, logos, 'hs', img, noImg);
				setupHsLogos(logos, img, noImg);
				
				setupPlace( addClone(obj.dtlSect, 'Placement', 'select#[id^="custcol_placement"]').elm );
				
				holderElm.find('div.internalId').appendTo(obj.dtlSect);//.hide();
			};
			
			function setUpPerf() {
				var obj = perfDecorOptObj;
				obj.body.empty();
				obj.sect.show();
				
				addClone(obj.body, 'Placement', 'select#custcol_perf_placement');
				addClone(obj.body, 'Style', 'select#custcol47');
				
				$('<div class="price">$25.00</div>').appendTo(obj.body);
				holderElm.find('div.internalId').appendTo(obj.body);//.hide();
			};
			
			function setUpPip() {
				var obj = pipDecorOptObj;
				obj.body.empty();
				obj.sect.show();
				
				addClone(obj.body, 'Piping Color', 'select#custcol_piping_color');
				
				$('<div class="price">$50.00</div>').appendTo(obj.body);
				holderElm.find('div.internalId').appendTo(obj.body);//.hide();
			};
			
			function clearDecors() {
				$.each(decSecObj.optObjs, function( index, obj) {
					obj.sect.hide();
					obj.body.empty();
				});
			};
			
			function setupDecors(result) {
				clearDecors();
				
				if ((result.options) && (result.options.length > 0)) {
					$.each(result.options, function( index, opt ) {
						switch (opt.optName.toLowerCase()) {
						case 'custcol_con_stitch' :
							loadFragURL(opt.fragmentURL, setUpCs, 'div#optionBlock_336690');
							break;
						case 'custcol_emb_yn' :
							loadFragURL(opt.fragmentURL, setUpEmb);
							break;
						case 'custcol_heat_seal':
							loadFragURL(opt.fragmentURL, setUpHs);
							break;
						case 'custcol_peforation_option' :
							loadFragURL(opt.fragmentURL, setUpPerf, 'div#optionBlock_336692');
							break;
						case 'custcol_piping' :
							loadFragURL(opt.fragmentURL, setUpPip);
							break;
						};						
					});
					
					decSecObj.sect.find('select').each(function(idx, sel) {
						$(this).change(function() {
							dlg.setEnableOk();
						});
					});
					
					decSecObj.sect.show();
				} else {
					decSecObj.sect.hide();
				};
				
			};
			
			function loadOptions(itemId, patternId, makeId) {
				dlg.startLoading();
				dlg.makeId = makeId;
				
				jPw.lscCfgrResult('getoptions', {itemId: itemId, patternId: patternId}, 
					function(result) {
						displayLocs(result);
						
						setupDecors(result);
						
						//isSpecial
						
						setEnableOk();
						
						dlg.endLoading();
					},
					function(e) {
						dlg.endLoading();
						if ( e instanceof nlobjError ) {
							var msg = e.getCode() + '\n' + e.getDetails() + '\n' + e.getStackTrace();
							nlapiLogExecution( 'DEBUG', 'system error', msg);
							dlg.disableOk();
							alert(msg);
						} else {
							nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString());
							dlg.disableOk();
							alert('unexpected error: ' + e);
						}
					}
				);
			};
					
			function sectElm(parm) {
				// parm = {id, elm, label, chx, chxFcn, detailsFcn}
				var sect = $('<div />', {id: parm.id}).addClass('loc-dlg-sect');
				var label = $('<label/>').text(parm.label).appendTo(sect);
				var body = $('<div></div>').addClass('ui-helper-clearfix').appendTo(sect).hide();
				var chx = undefined;
				
				sect.appendTo(parm.elm);
				
				if (parm.chx) {
					chx = $('<input />', {type: "checkbox", name: id, "checked": false});
					chx.prependTo(label);
					chx.change(function() {
				        var chkd = $(this).is(":checked"); 
						if(chkd) {
				        	body.show();
				        } else {
				        	body.hide();
				        };
				        if (parm.chxFcn) {
				        	parm.chxFcn(chkd, obj);
				        };
				        setEnableOk();
				    });
				} else {
					body.show();
				};

				var obj = {sect: sect, body: body, chx: chx, detailsFcn: parm.detailsFcn};
				
				obj.isChecked = function() {
					return (chx) ? chx.is(":checked") : true;
				};
				obj.isVisible = function() {
					return sect.is(':visible');
				};
				//obj.isSelected = function() {					return (!obj.isVisible()) || obj.isChecked() ;				};
				obj.subComplete = function() {
					if (obj.detailsFcn) {
						return obj.detailsFcn(obj);
					} else {	
						return true;
					};
				};
				obj.isComplete = function() {
					if (!obj.isVisible()) {
						return true;
					} else if (!obj.isChecked()) {
						return true;
					} else {
						return obj.subComplete();
					}
				};
				
				return obj;
			};
			
			$('<style type="text/css"> '+
					'#loc-decor-slctr-dlg div {margin: 1px 1px 1px 1px;} '+ 
					'#loc-decor-slctr-dlg div.loc-dlg-sect {border: 1px solid #cccccc;} '+
					'#loc-decor-slctr-dlg div.flt-lft {float: left;} '+
			'</style>').appendTo('head');
			
			locsSecObj = sectElm({id:locsSecId, elm:dlg.bodyElm, label:'Stock Locations', chx:false});
			
			locsSecObj.hasLocs = function() {return (!!locsSecObj.body.html());};

			ordSecObj = {sect: dlg.addToBodyElm( $('<div />', {id: ordSecId}) ).addClass('loc-dlg-sect') };
			
			ordSecObj.rdo = addLocRadio(ordSecObj.sect, '0', 'Order From Central');
			
			decSecObj = sectElm({id:decSecId, elm:dlg.bodyElm, label:'Decorate Item', chx:true, 
				chxFcn: function(chkd, obj){
					ordFromCent(chkd);
				},
				detailsFcn: function(obj) {
					var noneChecked = true;
					var optsComplete = true;
					$.each(decSecObj.optObjs, function( index, optObj ) {
						var chkd = optObj.isChecked(); 
						if (chkd) {
							noneChecked = false;
							if (!optObj.isComplete()) {
								optsComplete = false;
								return false;
							}
						};
					});
					if (noneChecked) {
						return false;
					} else {
						return optsComplete;
					};
				}
			});
			
			decSecObj.optObjs = [];
			
			decSecObj.addOptObj = function(optObj) {
				decSecObj.optObjs.push(optObj);
				return optObj;
			};
			

			csDecorOptObj = decSecObj.addOptObj( sectElm({id:csDecorOptId, elm:decSecObj.body, label:'Contrast Stitch', chx:true}) );
			embDecorOptObj = decSecObj.addOptObj( sectElm({id:embDecorOptId, elm:decSecObj.body, label:'Embroidery', chx:true}) );
			hsDecorOptObj = decSecObj.addOptObj( sectElm({id:hsDecorOptId, elm:decSecObj.body, label:'Heat Seal', chx:true}) );
			perfDecorOptObj = decSecObj.addOptObj( sectElm({id:perfDecorOptId, elm:decSecObj.body, label:'Perforated Insert', chx:true}) );
			pipDecorOptObj = decSecObj.addOptObj( sectElm({id:pipDecorOptId, elm:decSecObj.body, label:'Piping', chx:true}) );
			
			holderElm = dlg.addToBodyElm($('<div id="temp-holder"></div>')).hide();

			////////
			
			dlg.loadOptions = function(itemId, patternId, makeId, carId) {
				locsSecObj.sect.hide();
				locsSecObj.body.empty();
				
				ordSecObj.sect.hide();
				
				decSecObj.sect.hide();
				clearDecors();
				
				dlg.startLoading();
				
				dlg.open();
				
				if ((!makeId) && (carId)) {
					var car = nlapiSearchRecord('customrecord_current_classic_car', null, 
							[new nlobjSearchFilter('internalid', null, 'is', carId)],
							[new nlobjSearchColumn('custrecord_make')]);
					if ((car) && (car.length > 0)) {
						makeId = car[0].getValue('custrecord_make');
					};
				};

				loadOptions(itemId, patternId, makeId);
			};
			
			dlg.srcLoc = function() {
				return sourceLoc();
			};
			
			jPw.locDecorDialog = dlg;
		};

				
		return jPw.locDecorDialog;
		
	};
	
}( this.jPw = this.jPw || {}, jQuery ));

/*
 
				alert('Configurator!');
				jPw.lscCfgrResult('getoptions', {itemId: 332211, patternId: 3920}, 
					function(result) {
						alert('ok '+result);
					},
					function(e) {
						alert('eer '+e);
					}				
				);				
				return;
 
 
var itemId = 332211;
var patternId = 3920;

var pattHSEmbPlacement = nlapiLookupField('customrecord_leather_pattern', patternId, 'custrecordemb_hs_placement');


var optionResults = nlapiSearchRecord('customrecord_lsc_option_fragment', null,
[
new nlobjSearchFilter('custrecord_lsc_option_placement_selector', null, 'is', pattHSEmbPlacement),
], 
[
new nlobjSearchColumn('custrecord_lsc_frag_option'),
new nlobjSearchColumn('custrecord_patt_option_id', 'custrecord_lsc_frag_option'),
new nlobjSearchColumn('custrecord_lsc_option_implementation'),
new nlobjSearchColumn('custrecord_lsc_option_placement_selector'),
new nlobjSearchColumn('custrecord_lsc_option_fragment_url'),
new nlobjSearchColumn('custrecord_lsc_option_is_custom_fragment')
]
);


			var locs = nlapiSearchRecord('item', null, 
			[
				new nlobjSearchFilter('internalid', null, 'is', itemId),
				new nlobjSearchFilter('makeinventoryavailablestore', 'inventorylocation', 'is', 'T'),
				new nlobjSearchFilter('isinactive', 'inventorylocation', 'is', 'F'),
				new nlobjSearchFilter('isinactive', null, 'is', 'F')],
			[
				new nlobjSearchColumn('inventorylocation'),
				new nlobjSearchColumn('locationquantityavailable')
]);
var itemRec = nlapiLoadRecord(locs[0].getRecordType(), locs[0].getId());
var decSummary = itemRec.getFieldValue('custitem_decoration_summary');
var decs = nlapiLookupField(itemRec.getRecordType(), itemRec.getId(), 'custitem_customizations.custrecord_patt_option_id', true);
var opts = itemRec.getFieldValues('itemoptions');



var q=1;
*/