/*
 * casper-inline
 * https://github.com/tactivos/casper-inline
 *
 * Copyright (c) 2013 Auguest G. casper & IMWEB TEAM
 */

'use strict';

module.exports = function(grunt) {
	
	var path = require('path');
	var datauri = require('datauri');
	var UglifyJS = require("uglify-js");
	var CleanCSS = require('clean-css');

	grunt.registerMultiTask('inline', "Replaces <link>, <script> and <img> tags to their inline contents", function() {
		var files = this.filesSrc,
			options = this.options({tag: '__inline'}),
			uglify = !!options.uglify,
			cssmin = !!options.cssmin,
		    	relativeTo = this.options().relativeTo,
			dest = this.data.dest;

		files.forEach(function(filepath){
			var fileType = path.extname(filepath).replace(/^\./, '');
			var fileContent = grunt.file.read(filepath);

			grunt.log.write('Processing ' + filepath + '...')

			if(fileType==='html'){
				fileContent = html(filepath, fileContent, relativeTo, options);
			}else if(fileType==='css'){
			}

			var destFile = getPathToDestination(filepath, dest);
			grunt.file.write(destFile,fileContent);
			grunt.log.ok()
		});
	});

	function isRemotePath( url ){
		return url.match(/^'?https?:\/\//);
	}

	function isBase64Path( url ){
		return url.match(/^'?data.*base64/);
	}

	// from grunt-text-replace.js in grunt-text-replace
	function getPathToDestination(pathToSource, pathToDestinationFile) {
		var isDestinationDirectory = (/\/$/).test(pathToDestinationFile);
		var fileName = path.basename(pathToSource);
		var newPathToDestination;
		if (typeof pathToDestinationFile === 'undefined') {
			newPathToDestination = pathToSource;
		} else {
			newPathToDestination = pathToDestinationFile + (isDestinationDirectory ? fileName : '');
		}
		return newPathToDestination;
	}

	function html(filepath, fileContent, relativeTo, options){

        if(relativeTo){
            filepath = filepath.replace(/[^\/]+\//g, relativeTo);
        }

		fileContent = fileContent.replace(/<inline.+?src=["']([^"']+?)["']\s*?\/>/g, function(matchedWord, src){
			var ret = matchedWord;

			if(isRemotePath(src) || !grunt.file.isPathAbsolute(src)){

				var inlineFilePath = path.resolve( path.dirname(filepath), src );
				if( grunt.file.exists(inlineFilePath) ){
					ret = grunt.file.read( inlineFilePath );
				}else{
					grunt.log.error("Couldn't find " + inlineFilePath + '!');
				}
			}

			return ret;
		}).replace(/<script.+?src=["']([^"']+?)["'].*?><\/script>/g, function(matchedWord, src){
			var ret = matchedWord;

			if(!isRemotePath(src) && src.indexOf(options.tag)!=-1){
				var inlineFilePath = path.resolve( path.dirname(filepath), src ).replace(/\?.*$/, '');	// 将参数去掉
				var c = options.uglify ? UglifyJS.minify(inlineFilePath).code : grunt.file.read( inlineFilePath );
				if( grunt.file.exists(inlineFilePath) ){
					ret = '<script>\n' + c + '\n</script>';
				}else{
					grunt.log.error("Couldn't find " + inlineFilePath + '!');
				}
			}					
			grunt.log.debug('ret = : ' + ret +'\n');
			
			return ret;

		}).replace(/<link.+?href=["']([^"']+?)["'].*?\/?>/g, function(matchedWord, src){
			var ret = matchedWord;
			
			if(!isRemotePath(src) && src.indexOf(options.tag)!=-1){

				var inlineFilePath = path.resolve( path.dirname(filepath), src ).replace(/\?.*$/, '');	// 将参数去掉	

				if( grunt.file.exists(inlineFilePath) ){
					var styleSheetContent = grunt.file.read( inlineFilePath );
					
					styleSheetContent = styleSheetContent.replace(/url\(["']*([^)'"]+)["']*\)/g, function(matchedWord, imgUrl){
						var newUrl = imgUrl
						if(isBase64Path(imgUrl) || isRemotePath(imgUrl)){
							return matchedWord;
						}
						grunt.log.debug( 'filepath: '+ filepath);
						grunt.log.debug( 'imgUrl: '+imgUrl);
						grunt.log.debug( 'inlineFilePath: '+inlineFilePath);
						var absoluteImgurl = path.resolve( path.dirname(inlineFilePath),imgUrl );
						grunt.log.debug( 'absoluteImgurl: '+absoluteImgurl);
						newUrl = path.relative( path.dirname(filepath), absoluteImgurl );
						grunt.log.debug( 'newUrl: '+newUrl);

						if(grunt.file.exists(absoluteImgurl))
							newUrl = datauri(absoluteImgurl);

						return matchedWord.replace(imgUrl, newUrl);
					});
					styleSheetContent = options.cssmin ? CleanCSS.process(styleSheetContent) : styleSheetContent;
					ret = '<style>\n' + styleSheetContent + '\n</style>';

				}else{
					grunt.log.error("Couldn't find " + inlineFilePath + '!');
				}
			}
			grunt.log.debug('ret = : ' + ret +'\n');
			
			return ret;	
		}).replace(/<img.+?src=["']([^"']+?)["'].*?\/?\s*?>/g, function(matchedWord, src){
			var	ret = matchedWord;
			
			if(!grunt.file.isPathAbsolute(src) && src.indexOf(options.tag)!=-1){

				var inlineFilePath = path.resolve( path.dirname(filepath), src ).replace(/\?.*$/, '');	// 将参数去掉	

				if( grunt.file.exists(inlineFilePath) ){
					ret = matchedWord.replace(src, 'data:image/png;base64'+(new datauri(inlineFilePath)).content);
				}else{
					grunt.log.error("Couldn't find " + inlineFilePath + '!');
				}
			}					
			grunt.log.debug('ret = : ' + ret +'\n');
			
			return ret;	
		});

		return fileContent;
	}
};
