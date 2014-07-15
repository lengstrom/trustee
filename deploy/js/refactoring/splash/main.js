var fs = require('fs');
var path = require('path');
var unzip = require('decompress-zip');
var rimraf = require('rimraf');
var dns = require('dns');
var http = require('http');
var sqlite3 = require('sqlite3');
var plist = require('plist');
var xml2js = require('xml2js');
var tarball = require('tarball-extract');

var XMLParser = new xml2js.Parser();
var docSets = {"ActionScript.xml":{icon:"actionscript",search:"actionscript"},"Akka.xml":{icon:"akka",search:"akka"},"Android.xml":{icon:"android",search:"android"},"Angular.dart.xml":{icon:"angulardart",search:"angulardart"},"AngularJS.xml":{icon:"angularjs",search:"angular"},"Ansible.xml":{icon:"ansible",search:"ansible"},"Apache_HTTP_Server.xml":{icon:"apache",search:"apache"},"Appcelerator_Titanium.xml":{icon:"titanium",search:"titanium"},"AppleScript.xml":{icon:"applescript",search:"applescript"},"Arduino.xml":{icon:"arduino",search:"arduino"},"AWS_JavaScript.xml":{icon:"awsjs",search:"aws"},"BackboneJS.xml":{icon:"backbone",search:"backbone"},"Bash.xml":{icon:"bash",search:"bash"},"Boost.xml":{icon:"boost",search:"boost"},"Bootstrap_2.xml":{icon:"bootstrap",search:"bootstrap2"},"Bootstrap_3.xml":{icon:"bootstrap",search:"bootstrap3"},"Bourbon.xml":{icon:"bourbon",search:"bourbon"},"C.xml":{icon:"c",search:"c"},"C++.xml":{icon:"cpp",search:"c++"},"CakePHP.xml":{icon:"cakephp",search:"cakephp"},"Cappuccino.xml":{icon:"cappuccino",search:"cappuccino"},"Chai.xml":{icon:"chai",search:"chai"},"Chef.xml":{icon:"chef",search:"chef"},"Clojure.xml":{icon:"clojure",search:"clojure"},"CMake.xml":{icon:"cmake",search:"cmake"},"Cocos2D.xml":{icon:"cocos2d",search:"cocos2d"},"Cocos2D-X.xml":{icon:"cocos2dx",search:"cocos2dx"},"Cocos3D.xml":{icon:"cocos2d",search:"cocos3d"},"CodeIgniter.xml":{icon:"codeigniter",search:"codeigniter"},"CoffeeScript.xml":{icon:"coffee",search:"coffee"},"Common_Lisp.xml":{icon:"lisp",search:"lisp"},"ColdFusion.xml":{icon:"cf",search:"cf"},"Compass.xml":{icon:"compass",search:"compass"},"Cordova.xml":{icon:"cordova",search:"cordova"},"Corona.xml":{icon:"corona",search:"corona"},"CSS.xml":{icon:"css",search:"css"},"D3JS.xml":{icon:"d3",search:"d3"},"Dart.xml":{icon:"dartlang",search:"dart"},"Django.xml":{icon:"django",search:"django"},"Dojo.xml":{icon:"dojo",search:"dojo"},"DOM.xml":{icon:"dom",search:"dom"},"Drupal_7.xml":{icon:"drupal",search:"drupal7"},"Drupal_8.xml":{icon:"drupal",search:"drupal7"},"ElasticSearch.xml":{icon:"elasticsearch",search:"elastic"},"Elixir.xml":{icon:"elixir",search:"elixir"},"Emacs_Lisp.xml":{icon:"elisp",search:"elisp"},"EmberJS.xml":{icon:"ember",search:"ember"},"Emmet.xml":{icon:"emmet",search:"emmet"},"Erlang.xml":{icon:"erlang",search:"erlang"},"Express.xml":{icon:"express",search:"express"},"ExpressionEngine.xml":{icon:"ee",search:"ee"},"ExtJS.xml":{icon:"extjs",search:"extjs"},"Flask.xml":{icon:"flask",search:"flask"},"Font_Awesome.xml":{icon:"awesome",search:"awesome"},"Foundation.xml":{icon:"foundation",search:"foundation"},"Git.xml":{icon:"git",search:"git"},"GLib.xml":{icon:"glib",search:"glib"},"Go.xml":{icon:"go",search:"go"},"Grails.xml":{icon:"grails",search:"grails"},"Groovy.xml":{icon:"groovy",search:"groovy"},"Groovy_JDK.xml":{icon:"groovy",search:"groovyJDK"},"Grunt.xml":{icon:"grunt",search:"grunt"},"Haml.xml":{icon:"haml",search:"haml"},"Haskell.xml":{icon:"haskell",search:"haskell"},"HTML.xml":{icon:"html",search:"html"},"iOS.xml":{icon:"iphone",search:"iphone"},"Jade.xml":{icon:"jade",search:"jade"},"Jasmine.xml":{icon:"jasmine",search:"jasmine"},"Java_EE6.xml":{icon:"jee6",search:"jee6"},"Java_EE7.xml":{icon:"jee7",search:"jee7"},"Java_SE6.xml":{icon:"java",search:"jse6"},"Java_SE7.xml":{icon:"java",search:"jse7"},"Java_SE8.xml":{icon:"java",search:"jse8"},"JavaFX.xml":{icon:"javafx",search:"jfx"},"JavaScript.xml":{icon:"javascript",search:"js"},"Joomla.xml":{icon:"joomla",search:"joomla"},"jQuery.xml":{icon:"jQuery",search:"jQ"},"jQuery_Mobile.xml":{icon:"jquerym",search:"jqm"},"jQuery_UI.xml":{icon:"jqueryui",search:"jqui"},"KnockoutJS.xml":{icon:"knockout",search:"knockout"},"Kobold2D.xml":{icon:"kobold2d",search:"kobold2d"},"LaTeX.xml":{icon:"latex",search:"latex"},"Laravel.xml":{icon:"laravel",search:"laravel"},"Less.xml":{icon:"less",search:"less"},"Linux_Man_Pages.xml":{icon:"linux",search:"linux"},"Lo-Dash.xml":{icon:"lodash",search:"lodash"},"Lua_5.1.xml":{icon:"lua",search:"lua5.1"},"Lua_5.2.xml":{icon:"lua",search:"lua5.2"},"Mac_OS_X.xml":{icon:"Mac",search:"mac"},"Man_Pages.xml":{icon:"manPages",search:"manPages"},"MarionetteJS.xml":{icon:"marionette",search:"marionette"},"Markdown.xml":{icon:"markdown",search:"markdown"},"MATLAB.xml":{icon:"matlab",search:"matlab"},"Meteor.xml":{icon:"meteor",search:"meteor"},"MomentJS.xml":{icon:"moment",search:"moment"},"MongoDB.xml":{icon:"mongodb",search:"mongodb"},"Mongoose.xml":{icon:"mongoose",search:"mongoose"},"Mono.xml":{icon:"mono",search:"mono"},"MooTools.xml":{icon:"moo",search:"moo"},"MySQL.xml":{icon:"mysql",search:"mysql"},"Neat.xml":{icon:"neat",search:"neat"},"NET_Framework.xml":{icon:"net",search:".NET"},"Nginx.xml":{icon:"nginx",search:"nginx"},"NodeJS.xml":{icon:"nodejs",search:"nodejs"},"NumPy.xml":{icon:"numpy",search:"numpy"},"OCaml.xml":{icon:"ocaml",search:"ocaml"},"OpenCV_C.xml":{icon:"cvc",search:"cvc"},"OpenCV_C++.xml":{icon:"cvcpp",search:"cvc++"},"OpenCV_Java.xml":{icon:"cvj",search:"cvj"},"OpenCV_Python.xml":{icon:"cvp",search:"cvp"},"OpenGL_2.xml":{icon:"gl2",search:"gl2"},"OpenGL_3.xml":{icon:"gl3",search:"gl3"},"OpenGL_4.xml":{icon:"gl4",search:"gl4"},"Perl.xml":{icon:"perl",search:"perl"},"PhoneGap.xml":{icon:"phonegap",search:"phonegap"},"PHP.xml":{icon:"php",search:"php"},"PHPUnit.xml":{icon:"phpunit",search:"phpunit"},"Play_Java.xml":{icon:"playjava",search:"playjava"},"Play_Scala.xml":{icon:"playscala",search:"playscala"},"Polymer.dart.xml":{icon:"polymerdart",search:"polymerdart"},"PostgreSQL.xml":{icon:"psql",search:"psql"},"Processing.xml":{icon:"processing",search:"processing"},"PrototypeJS.xml":{icon:"prototype",search:"prototype"},"Puppet.xml":{icon:"puppet",search:"puppet"},"Python_2.xml":{icon:"python",search:"python2"},"Python_3.xml":{icon:"python",search:"python3"},"Qt_4.xml":{icon:"qt",search:"qt4"},"Qt_5.xml":{icon:"qt",search:"qt5"},"R.xml":{icon:"r",searchr:"r"},"Redis.xml":{icon:"redis",search:"redis"},"RequireJS.xml":{icon:"require",search:"require"},"Ruby.xml":{icon:"ruby",search:"ruby"},"Ruby_2.xml":{icon:"ruby",search:"ruby2"},"Ruby_on_Rails_3.xml":{icon:"rails",search:"rails3"},"Ruby_on_Rails_4.xml":{icon:"rails",search:"rails4"},"RubyMotion.xml":{icon:"rubymotion",search:"rubymotion"},"Rust.xml":{icon:"rust",search:"rust"},"SaltStack.xml":{icon:"salt",search:"salt"},"Sass.xml":{icon:"sass",search:"sass"},"Scala.xml":{icon:"scala",search:"scala"},"SciPy.xml":{icon:"scipy",search:"scipy"},"Sencha_Touch.xml":{icon:"sencha",search:"sencha"},"Sinon.xml":{icon:"sinon",search:"sinon"},"Smarty.xml":{icon:"smarty",search:"smarty"},"Sparrow.xml":{icon:"sparrow",search:"sparrow"},"Spring_Framework.xml":{icon:"spring",search:"spring"},"SproutCore.xml":{icon:"SproutCore",search:"SproutCore"},"SQLAlchemy.xml":{icon:"sqlalchemy",search:"sqlalchemy"},"SQLite.xml":{icon:"sqlite",search:"sqlite"},"Statamic.xml":{icon:"statamic",search:"statamic"},"Stylus.xml":{icon:"stylus",search:"stylus"},"SVG.xml":{icon:"svg",search:"svg"},"Swift.xml":{icon:"swift",search:"swift"},"Symfony.xml":{icon:"symfony",search:"symfony"},"Tcl.xml":{icon:"tcl",search:"tcl"},"Tornado.xml":{icon:"tornado",search:"tornado"},"Twig.xml":{icon:"twig",search:"twig"},"Twisted.xml":{icon:"twisted",search:"twisted"},"TYPO3.xml":{icon:"typo3",search:"typo3"},"UnderscoreJS.xml":{icon:"underscore",search:"underscore"},"Unity_3D.xml":{icon:"unity3d",search:"unity3d"},"Vagrant.xml":{icon:"vagrant",search:"vagrant"},"Vim.xml":{icon:"vim",search:"vim"},"VMware_vSphere.xml":{icon:"vsphere",search:"vsphere"},"WordPress.xml":{icon:"wordpress",search:"wordpress"},"Xamarin.xml":{icon:"xamarin",search:"xamarin"},"Xojo.xml":{icon:"xojo",search:"xojo"},"XSLT.xml":{icon:"xslt",search:"xslt"},"XUL.xml":{icon:"xul",search:"xul"},"Yii.xml":{icon:"yii",search:"yii"},"YUI.xml":{icon:"yui",search:"yui"},"Zend_Framework_1.xml":{icon:"zend",search:"zend1"},"Zend_Framework_2.xml":{icon:"zend",search:"zend2"},"ZeptoJS.xml":{icon:"zepto",search:"zepto"}};

// parent.Trustee.working = 0;

function init() {
	setTimeout(displayDownloadedDocs, 1000);
}

//redo
function displayDownloadedDocs() {
	$('.alertCont').remove();
	$('.downloaded').remove();
	// parent.removeAllPlugins();
	var dirs = getDirs();
	var exemps = [];
	for (var i = 0; i < dirs.length; i++) {
		var baseName = dirs[i].substr(dirs[i].lastIndexOf('/') + 1);
		if (docSets[baseName + '.xml'] === undefined) {
			rimraf.sync(dirs[i]);
			continue;
		}

		parent.Trustee.docs[baseName] = new DocSet(dirs[i]);
		if (dirs[i].charAt(dirs[i].length - 1) == '/') {
			dirs[i] = dirs[i].substring(0, dirs[i].length - 1);
		}

		exemps.push(baseName + '.xml');
	}

	getDownloadableDocs(exemps);
}

//redo
function getDownloadableDocs(exemps) {
	for (var i in docSets) {
		var testIndex = exemps.indexOf(i);
		if (testIndex > -1) {
			continue;
		}

		addAvailableDoc(stripXMLAndPath(i));
	}

	var s = new Searcher(document.getElementById('searchDocsets'), [document.getElementById('dlDocsTable'), document.getElementById('availDocsTable')], 'row');
}

//redo
function highlightDl() {
	$('#availDocs').css('background-color','#2ecc71');
	$('#availDocs').animate({'background-color': '#FFF'}, {duration:600});
}