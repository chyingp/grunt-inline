'use strict';

module.exports = function(grunt) {
	grunt.initConfig({
		inline: {
			dist: {
				src: ['test/dist/css.html', 'test/dist/img.html', 'test/dist/html.html'],
				dest: ['tmp/']
			}
		},

		clean: {
			tests: ['tmp/']
		},

		htmlmin: {
			dist: {
				options: {
					removeComments: true,
					collapseWhitespace: true
				},
				files: {
					'tmp/css.min.html': 'tmp/css.html',
					'tmp/img.min.html': 'tmp/img.html',
					'tmp/html.min.html': 'tmp/html.html'
				}
			}
		},

		// Unit tests
		nodeunit: {
			tests: ['test/*_test.js']
		}
	});

	grunt.loadTasks('tasks');

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');

	grunt.registerTask('test', ['clean', 'inline', 'htmlmin', 'nodeunit']);
	// By default, run all tests
	grunt.registerTask('default', ['test']);
};