/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Nov 2013     james.white
 *
 */
(function(jPw) {
	jPw.isisMkits = [
		'M587633',
		'M535610',
		'M599697',
		'M603266',
		'M611576',
		'M595823',
		'M595848',
		'M612925',
		'M545865',
		'M595843',
		'M598968',
		'M587639',
		'M595816',
		'M603560',
		'M603564',
		'M603285',
		'M598954',
		'M611584',
		'M592688',
		'M610231',
		'M602135',
		'M610413',
		'M610196',
		'M569560',
		'M599614',
		'M521062',
		'M535618',
		'M592687',
		'M612895',
		'M602133',
		'M618328',
		'M618926',
		'M613301',
		'M613276'];

	jPw.CopyMKit = function(mpartno) {
		var itemname = mpartno.substring(1,10);

		var items = nlapiSearchRecord('item', null, 
			[new nlobjSearchFilter('itemid', null, 'is', itemname)],
			[new nlobjSearchColumn('custitem_leather_pattern'), 
			new nlobjSearchColumn('custitem_leather_color'),
			new nlobjSearchColumn('custitem_carpet')]);

		if ((!items) || (items.length < 1)) {return null;}

		var regItem = items[0];
		var ptrnId = regItem.getValue('custitem_leather_pattern');
		var colorId = regItem.getValue('custitem_leather_color');
		var carpetId = regItem.getValue('custitem_carpet');


		items = nlapiSearchRecord('item', null, 
		[
		new nlobjSearchFilter('custitem_leather_pattern', null, 'is', ptrnId),
		new nlobjSearchFilter('custitem_parent_item', null, 'is', 'F'),
		new nlobjSearchFilter('matrixchild', null, 'is', 'F')
		],
		[new nlobjSearchColumn('custitem_leather_kit_type')]);

		if ((!items) || (items.length < 1)) {return null;}

		var srcItem = items[0];
		var srcId = srcItem.getId();

		var record = nlapiCopyRecord('serializedinventoryitem', srcId);

		record.setFieldValue('itemid', mpartno);
		record.setFieldValue('custitem_leather_color', colorId);
		record.setFieldValue('custitem_carpet', carpetId);

		var salesdescription = record.getFieldValue('salesdescription');
		record.setFieldValue('salesdescription', 'DIFFERENT GRADE - '+salesdescription);

		var purchasedescription = record.getFieldValue('purchasedescription');
		var idx = purchasedescription.indexOf('(Q');
		if (idx > -1) {
			purchasedescription = purchasedescription.substring(0, idx) + '(M-Kit)';
		};
		record.setFieldValue('purchasedescription', purchasedescription );
		record.setFieldValue('custitem_leather_kit_type', 1);
		record.setFieldValue('custitem_product_note', 'M-Kit');

		record.setFieldValue('isonline', 'T');
		record.setFieldValue('custitem_import_source', 'ISIS M Kits');

		var storedescription = record.getFieldValue('storedescription').replace('All Leather', 'M-Kit').replace('All Vinyl', 'M-Kit').replace('2 Tone', 'M-Kit').replace('3 Tone', 'M-Kit');
		record.setFieldValue('storedescription', storedescription);

		var storedetaileddescription = record.getFieldValue('storedetaileddescription').replace('All Leather', 'M-Kit').replace('All Vinyl', 'M-Kit').replace('2 Tone', 'M-Kit').replace('3 Tone', 'M-Kit');
		record.setFieldValue('storedetaileddescription', storedetaileddescription);

		return nlapiSubmitRecord(record, true);
	};
	
	
}( this.jPw = this.jPw || {}));


/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	var mpartno;
	var id;
	var results = 'ISIS M Kit Import Results';
	for (var i = 0; i < jPw.isisMkits.length; i++) {
		mpartno = jPw.isisMkits[i];
		try {
			id = jPw.CopyMKit(mpartno);
			if (id) {
				results = results + '\n' + mpartno +' new item id: '+id;
			} else {
				results = results + '\n' + mpartno +' Failed' ;
			}
		} catch (e) {
			results = results + '\n' +mpartno +' Failed - '+ e + '\n';
		}
		
	};
	response.setContentType('PLAINTEXT', 'results.txt', 'inline');
	response.write( results );
};
