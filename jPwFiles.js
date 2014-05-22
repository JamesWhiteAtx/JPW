/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       01 April 2013     james.white
 *
 * * Required
 * jPwJsUtils.js
 */

this.jPw = this.jPw || {};

(function(files) {
	
	files.getFileUrl = function(id, path, ext) {
		var external = (!!ext); 
		
		var url = nlapiResolveURL('SUITELET', 'customscript_file_utils', 'customdeploy_file_utils', (!!external));  
		//if (!external) {			 url = jPw.getSysUrlDomain()  + url;		};

		url = url + '&type=file';
		
		if (id) {
			url = url + '&id='+id;
		};
		if (path) {
			url = url + '&path='+path;
		};
		
		return url;
	};
	
	files.fileUrl = function(request, response) {
		response.setContentType('PLAINTEXT', 'url.txt', 'inline');
		response.write( 'url: '+ files.getFileUrl(request.getParameter('id'), request.getParameter('path'), request.getParameter('external')) );
	};
	
	files.file = function (request, response) {
		var fileid = request.getParameter('id');
		var filepath = request.getParameter('path');
		if (fileid) {
			files.writeFile(response, fileid);
		} else if (filepath) {
			files.writeFile(response, filepath);
		} else {
			response.setContentType('PLAINTEXT', 'fileErr.txt', 'inline');
			response.write( 'missing "id", or "path" parameters' );
		};
	};

	files.writeFile = function(response, id) {
		var file = nlapiLoadFile(id);
		if (file) { 
			response.setContentType(file.getType(), file.getName(), 'inline');
			response.write( file.getValue() ); 
		} else {
			response.setContentType('PLAINTEXT', 'err.txt', 'inline');
			response.write( 'no file returned for id "'+id+'"' );
		};
	};
	
	files.attachment = function (request, response) {
		function errHtml(msg) {
			nlapiLogExecution('ERROR', msg, msg);
			response.setContentType('PLAINTEXT', 'attachErr.txt', 'inline');
			response.write( msg );
		};

		var record = request.getParameter('record');
		var id = request.getParameter('id');
		var name = request.getParameter('name');
		var folder = request.getParameter('folder');
		var filename = request.getParameter('filename');
		var filetype = request.getParameter('filetype');
		
		var attach;		

		if (record) {
			var attachs = files.recordAttchs(record, id, name, folder, filename, filetype);
			if (Array.isArray(attachs)) {
				attach = attachs[0];
			} else {
				errHtml(attachs);
				return;
			};
		} else {
			errHtml('missing "record" parameters');
			return;
		};
		
		files.writeFile(response, attach.id);
	};

	files.recordAttchs = function(record, id, name, folder, filename, filetype) {
		var recordId; 
		
		switch(record){
		case 'pattern': recordId = 'customrecord_leather_pattern'; break;
		default: 
			return 'invalid record parameter "'+ record +'"';
			break;
		};
		
		if ((!id) && (!name)){
			return 'missing "id" and "name" parameter';
		}
		
		var key;
		var filts = [];
		if (id) {
			key = id;
			filts.push( new nlobjSearchFilter('internalid', null, 'is', id) );
		} else if (name) {
			key = name;
			filts.push( new nlobjSearchFilter('name', null, 'is', name) );
		};

		var records = nlapiSearchRecord(recordId, null, filts,
		[	 new nlobjSearchColumn('internalid', 'file'),
		 	new nlobjSearchColumn('name', 'file'),
		 	new nlobjSearchColumn('folder', 'file'),
		 	new nlobjSearchColumn('filetype', 'file'),
		]);	
		
		if ((!records) || (records.length < 1)) {
			return 'no attachemnts for "' + record + '" "' + key +'"' ;
		};

		var attachs = jPw.map(records, function () {
			var attch = {
					id: this.getValue('internalid', 'file'),
					folder: this.getText('folder', 'file'),
					filename: this.getValue('name', 'file'),
					filetype: this.getValue('filetype', 'file')
			};
			
			if ( ((!folder) || (folder == attch.folder))
			&& ((!filename) || (filename == attch.filename))
			&& ((!filetype) || (filetype == attch.filetype)) ) {
				return attch;
			}
		});
		
		if (attachs.length < 1) {
			return 'no attachemnts for folder "' + folder + '" ", filename "' + filename + '" ", filetype "' + filetype +'"' ;
		};
		
		return attachs;
	};

}( this.jPw.files = this.jPw.files || {}));

(function(files) {
	/**
	 * @param {nlobjRequest} request Request object
	 * @param {nlobjResponse} response Response object
	 * @returns {Void} Any output is written via response object
	 */
	files.suitelet = function(request, response){
		var type = request.getParameter('type');
		switch(type){
			case 'fileurl': files.fileUrl(request, response); break;
			case 'attachment': files.attachment(request, response); break;
			case 'file': files.file(request, response); break;
			default: 
				nlapiLogExecution('ERROR', 'invalid type parameter', type);
				response.setContentType('PLAINTEXT', 'fileErr.txt', 'inline');
				response.write( "invalid type parameter: '" + type +"'" );
			break;
		};
	};
}( this.jPw.files = this.jPw.files || {}));

