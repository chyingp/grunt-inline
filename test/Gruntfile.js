module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({

		inline: {
			dist: {
				src: ['dist/index.html'],
				dest: ['dev/']
			}
		}

	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-inline');

	// Default task(s).
	grunt.registerTask('default', ['inline']);

};