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

	grunt.registerMultiTask('inline', "将标记为inline的<script>、<link>、<img>等资源进行内嵌", function() {
		// grunt.log.writeln( typeof this.options('copy') );
		// grunt.log.writeln( JSON.stringify(this.options('copy')) );

		grunt.log.subhead('inline任务开始！！\n');
		var files = this.filesSrc,
			options = this.options(),
			uglify = !!options.uglify,
			cssmin = !!options.cssmin,
		    	relativeTo = this.options().relativeTo,
			dest = this.data.dest;

		files.forEach(function(filepath){
			var fileType = path.extname(filepath).replace(/^\./, '');
			var fileContent = grunt.file.read(filepath);

			grunt.log.writeln('inline > 处理文件开始：'+ filepath);
			
			if(fileType==='html'){
				fileContent = html(filepath, fileContent, relativeTo, {
					uglify: uglify,
					cssmin: cssmin
				});
			}else if(fileType==='css'){
				//fileContent = html(filepath, fileContent);
			}

			var destFile = getPathToDestination(filepath, dest);
			grunt.log.writeln('inline > 目标路径：'+ destFile);
			grunt.file.write(destFile,fileContent);
			grunt.log.subhead('inline > 处理文件结束：'+ filepath);
		});
		grunt.log.subhead('inline任务结束！！');

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
				grunt.log.writeln('inline >inline file，src = ' + src + ', 实际路径：'+inlineFilePath);

				if( grunt.file.exists(inlineFilePath) ){
					ret = grunt.file.read( inlineFilePath );
				}else{
					grunt.log.error('inline > '+inlineFilePath + ' 不存在！');
				}
			}
			grunt.log.debug('ret = : ' + ret +'\n');

			return ret;
		}).replace(/<script.+?src=["']([^"']+?)["'].*?><\/script>/g, function(matchedWord, src){
			var ret = matchedWord;
			
			if(!isRemotePath(src) && src.indexOf('__inline')!=-1){

				var inlineFilePath = path.resolve( path.dirname(filepath), src ).replace(/\?.*$/, '');	// 将参数去掉
				grunt.log.writeln('inline >inline script，src = ' + src + ', 实际路径：'+inlineFilePath);

				var c = options.uglify ? UglifyJS.minify(inlineFilePath).code : grunt.file.read( inlineFilePath );
				if( grunt.file.exists(inlineFilePath) ){
					ret = '<script>\n' + c + '\n</script>';
				}else{
					grunt.log.error('inline > '+inlineFilePath + ' 不存在！');
				}
			}					
			grunt.log.debug('ret = : ' + ret +'\n');
			
			return ret;

		}).replace(/<link.+?href=["']([^"']+?)["'].*?\/?>/g, function(matchedWord, src){
			var ret = matchedWord;
			
			if(!isRemotePath(src) && src.indexOf('__inline')!=-1){

				var inlineFilePath = path.resolve( path.dirname(filepath), src ).replace(/\?.*$/, '');	// 将参数去掉	

				grunt.log.writeln('inline > inline stylesheet，href = ' + src, ', 实际路径： ' + inlineFilePath);

				if( grunt.file.exists(inlineFilePath) ){
					var styleSheetContent = grunt.file.read( inlineFilePath );
					
					styleSheetContent = styleSheetContent.replace(/url\(([^)]+)\)/g, function(matchedWord, imgUrl){
						var imgUrlRelativeToParentFile = imgUrl;
						if(isBase64Path(imgUrl)){
							return matchedWord;
						}
						if(isRemotePath(imgUrl)){
							// return matchedWord;
						}else{
							console.log( 'filepath: '+ filepath);
							console.log( 'imgUrl: '+imgUrl);
							console.log( 'inlineFilePath: '+inlineFilePath);
							var absoluteImgurl = path.resolve( path.dirname(inlineFilePath),imgUrl );
							console.log( 'absoluteImgurl: '+absoluteImgurl);
							imgUrlRelativeToParentFile = path.relative( path.dirname(filepath), absoluteImgurl );
							console.log( 'imgUrlRelativeToParentFile: '+imgUrlRelativeToParentFile);
						}
						// console.log('imgUrlRelativeToParentFile: '+imgUrlRelativeToParentFile);
						return matchedWord.replace(imgUrl, imgUrlRelativeToParentFile);
					});
					styleSheetContent = options.cssmin ? CleanCSS.process(styleSheetContent) : styleSheetContent;
					ret = '<style>\n' + styleSheetContent + '\n</style>';

				}else{
					grunt.log.error('inline > '+inlineFilePath + ' 不存在！');
				}
			}
			grunt.log.debug('ret = : ' + ret +'\n');
			
			return ret;	
		}).replace(/<img.+?src=["']([^"']+?)["'].*?\/?\s*?>/g, function(matchedWord, src){
			var	ret = matchedWord;
			
			if(!grunt.file.isPathAbsolute(src) && src.indexOf('__inline')!=-1){

				var inlineFilePath = path.resolve( path.dirname(filepath), src ).replace(/\?.*$/, '');	// 将参数去掉	

				grunt.log.writeln('inline > inline img，src = ' + src, ', 实际路径： ' + inlineFilePath);

				if( grunt.file.exists(inlineFilePath) ){
					ret = matchedWord.replace(src, 'data:image/png;base64'+(new datauri(inlineFilePath)).content);
				}else{
					grunt.log.error('inline > '+inlineFilePath + ' 不存在！');
				}
			}					
			grunt.log.debug('ret = : ' + ret +'\n');
			
			return ret;	
		});

		return fileContent;
	}
};
