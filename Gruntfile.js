/*
 * iceCoffee UI
 * http://yisiqi.github.io/icecoffee-ui/
 *
 * Copyright (c) 2013 "yisiqi" Siqi Yi
 * Licensed under the MIT license.
 * https://github.com/yisiqi/icecoffee-ui/blob/master/LICENSE-MIT
 */

'use strict';

module.exports = function(grunt) {

	grunt.initConfig({
		  pkg		: grunt.file.readJSON('package.json')
		/*
		, 'build'		:{
			  'all'		: {
			  	  'src'	: {}
			  	, 'dest'	: {}
			  }
			, 'core'		: {}
			, 'bootstrap'	: {}
		  }
		//*/

		, connect		: {
			  server	: {
			  	  options	: {
			  	  	  port	: 8099
			  	  	, base	: './test'
			  	  }
			  }
		}

		, qunit		: {
			   bootstrap_extend	: {
				  files : [
				  	  {src	: 'test/**/*.html'}
				  ]
			   }

		  }

		, jshint	: {
			  options				: { 
											  "validthis"	: true
											, "curly"		: false
											, 'evil'		: true
											, "laxcomma"	: true
											, "laxbreak"	: true
											, "browser"		: true
											, "eqnull"		: true
											, "debug"		: true
											, "devel"		: true
											, "boss"		: true
											, "expr"		: true
											, "asi"			: true
									  }
			, 'bootstrap'			: ['lib/bootstrap/js/*.js']
			, 'jquery'				: ['lib/jquery/src/*.js']

			, 'bootstrap-extend'	: ['src/bootstrap-extend/*.js']
		  }
		/*
		, uglify	: {
			  options: {
				mangle: false
			  }
			, build: {
				files: {
					'assets/config.min.js': ['js/config.js'],
					'assets/smeite.min.js': ['js/smeite.js'],
					'assets/index.min.js': ['js/index.js']
				}
			  }
		  }
		//*/
	});

	grunt.registerTask('default', ['qunit']);
	grunt.registerTask('test', ['qunit']);

	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks("grunt-contrib-qunit");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-uglify");

}