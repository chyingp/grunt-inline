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

	grunt.registerMultiTask('inline', "将标记为inline的<script>、<link>、<img>等资源进行内嵌", function() {
		// grunt.log.writeln( typeof this.options('copy') );
		// grunt.log.writeln( JSON.stringify(this.options('copy')) );
		grunt.log.subhead('inline任务开始！！\n');
		var files = this.filesSrc;

		files.forEach(function(filepath){
			var fileType = path.extname(filepath).replace(/^\./, '');
			var fileContent = grunt.file.read(filepath);

			grunt.log.writeln('inline > 处理文件开始：'+ filepath);
			
			if(fileType==='html'){
				fileContent = html(filepath, fileContent);
			}else if(fileType==='css'){
				//fileContent = html(filepath, fileContent);
			}
			
			grunt.file.write(filepath,fileContent);
			grunt.log.subhead('inline > 处理文件结束：'+ filepath);	
		});
		grunt.log.subhead('inline任务结束！！');

	});

	function html(filepath, fileContent){

		return fileContent.replace(/<script.+src=["']([^"']+)["'].*><\/script>/g, function(matchedWord, src){
			var ret = matchedWord;
			
			if(!grunt.file.isPathAbsolute(src) && src.indexOf('__inline')!=-1){

				var inlineFilePath = path.resolve( path.dirname(filepath), src ).replace(/\?.*$/, '');	// 将参数去掉
				grunt.log.writeln('inline >inline script，src = ' + src + ', 实际路径：'+inlineFilePath);

				if( grunt.file.exists(inlineFilePath) ){
					ret = '<script>\n' +grunt.file.read( inlineFilePath ) + '\n</script>';
				}else{
					grunt.log.error('inline > '+inlineFilePath + ' 不存在！');
					// ret = matchedWord;
				}
			}					
			grunt.log.debug('ret = : ' + ret +'\n');
			
			return ret;

		}).replace(/<link.+href=["']([^"']+)["'].*\/>/g, function(matchedWord, src){
			var ret = matchedWord;
			
			if(!grunt.file.isPathAbsolute(src) && src.indexOf('__inline')!=-1){

				var inlineFilePath = path.resolve( path.dirname(filepath), src ).replace(/\?.*$/, '');	// 将参数去掉	

				grunt.log.writeln('inline > inline stylesheet，href = ' + src, ', 实际路径： ' + inlineFilePath);

				if( grunt.file.exists(inlineFilePath) ){
					ret = '<style>\n' +grunt.file.read( inlineFilePath ) + '\n</style>';
				}else{
					grunt.log.error('inline > '+inlineFilePath + ' 不存在！');
				}
			}
			grunt.log.debug('ret = : ' + ret +'\n');
			
			return ret;	
		}).replace(/<img.+src=["']([^"']+)["'].*\/?\s*>/g, function(matchedWord, src){
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
	}
};