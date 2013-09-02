# grunt-inline

> 将html页面里的外链资源，比如js、css、img，变成内联资源。比如：

带有`__inline`标记的`link`标签，会变成内联样式

	<link href="css/style.css?__inline=true" rel="stylesheet" />

带有`__inline`标记的`img`标签，会变成内联base64字符串

	<img src="img/icon.png?__inline=true" />

带有`__inline`标记的`script`标签，会变成内联脚本
			
	<script src="js/erport.js?__inline=true"></script> 
## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

	npm install grunt-inline --save-dev

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

	grunt.loadNpmTasks('grunt-inline');

## The "grunt-inline" task

### Overview
In your project's Gruntfile, add a section named `inline` to the data object passed into `grunt.initConfig()`.

	grunt.initConfig({
	  inline: {
	    dist: {
	      src: [ 'dist/index.html' ]
	    },
	  },
	})
### Options

#### dest
If dest is assigned, the the source file will be copied to the destination path. eg:
`dist/index.html` will be processed and then copied to `dest/index.html`

```
grunt.initConfig({
	inline: {
		dist: {
			src: ['dist/index.html'],
			dest: ['dest/']
		}
	}
});
```

### Usage Examples

> config

	grunt.initConfig({
	  inline: {
	    dist: {
	      src: [ 'dist/index.html' ],
	      dest: [ 'dev/' ]
	    }
	  }
	})

> src/index.html

	<html>
		<head>
			<title>demo</title>
			<link href="css/style.css?__inline=true" rel="stylesheet" />
		</head>
		<body>
			<img src="img/icon.png?__inline=true" />
			
			<script src="js/erport.js?__inline=true"></script> 
		</body>
	</html>

> after `grunt inline` was run, it will be something like

	<html>
		<head>
			<title>demo</title>
			<style>
				.container{
					padding: 0;
				}
			</style>
		</head>
		<body>
			<! -- base64, a terrible mass you know…so just show a little bit ...-->
			<img src="idata:image/png;base64data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEMAAAAYCAYAAAChg0BHAA..." />
			
			<script>
				var Report = (function(){
					return {
						init: function(){
						}
					};
				})();
			</script>
		</body>
	</html>

#### inline tag
Suppose there is an `<inline>` tag in `index.html` like bellow

```
<!-- inline tag -->
<inline src="test.html" />
```

The content of `test.html` is

```
<p>I'm inline html</p>
<span>hello world!</span>
```

Then, after the `inline` task is run, the original content in `index.html` will be replaced with

```
<p>I'm inline html</p>
<span>hello world!</span>
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
* 2013-08-30  v0.1.6 bug fix: stylesheets ended with ">" cannot be inlined
* 2013-09-02  v0.1.7 add feature: add options.dest to assign a destination path where the source file will be copied
* 2013-09-02  v0.1.8 add feature: support for `<inline>` tag
