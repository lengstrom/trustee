var fs = require('fs');
var htmlparser = require('htmlparser2');

var pyDocs = {
	pages: {}, //store each url's objects
	cumulative: { //every object, cumulatively
		modules: [],
		classes: [],
		exceptions: [],
		methods: [],
		functions: [],
		attributes: [],
		constants: []
	}
};

function parseException(bhref, href, tempData) {
	if (tempData.class === undefined) tempData.class = '';
	pyDocs.pages[bhref].exceptions.push({name:tempData.class + tempData.desc, href:bhref + href});
	return true;
}

function parseClass(bhref, href, tempData) {
	if (tempData.class === undefined) tempData.class = '';
	pyDocs.pages[bhref].classes.push({name:tempData.class + tempData.desc, href:bhref + href});
	return true;
}

function parseFunction(bhref, href, tempData) {
	if (tempData.class === undefined) tempData.class = '';
	pyDocs.pages[bhref].functions.push({name:tempData.class + tempData.desc, href:bhref + href});
	return true;
}

function parseMethod(bhref, href, tempData) {
	if (tempData.class === undefined) tempData.class = '';
	pyDocs.pages[bhref].methods.push({name:tempData.class + tempData.desc, href:bhref + href});
	return true;
}

function parseConstant(bhref, href, tempData) {
	if (tempData.class === undefined) tempData.class = '';
	pyDocs.pages[bhref].constants.push({name:tempData.class + tempData.desc, href:bhref + href});
	return true;
}

function parseAttribute(bhref, href, tempData) {
	if (tempData.class === undefined) tempData.class = '';
	pyDocs.pages[bhref].attributes.push({name:tempData.class + tempData.desc, href:bhref + href});
	return true;
}

function parseModule(bhref, href, name) {
	pyDocs.pages[bhref].modules.push({name:name, href:bhref + href});
	return true;
}

var namesParser = new htmlparser.Parser({
	bhref:0,
	cType:-1,
	depth:undefined,
	getText: 0,
	textReason: 0,
	tempData:{},
	onopentag: function(name, attribs) {
		if (name == 'dl' && (attribs.class == "exception" || attribs.class == "class" || attribs.class == "function" || attribs.class == "method" || attribs.class == "data" || attribs.class == "attribute")) {
			this.cType = attribs.class;
			this.depth = 0;
		}
		else if (name == 'a' && attribs.class == 'headerlink' && attribs.href.substring(0,7) == '#module') {
			parseModule(this.bhref, attribs.href, attribs.href.substring(8,attribs.href.length));
			console.log(attribs.href.substring(8,attribs.href.length));
		}
		else {
			if (this.depth !== undefined) {
				this.depth++;
				if (this.depth == 2) {
					if (name == 'a' && attribs.class == 'headerlink') {
						switch (this.cType) {
							case "exception":
								//exception
								if (parseException(this.bhref, attribs.href, this.tempData)) {
									this.depth = undefined;
									this.tempData = {};
									this.cType = -1;
								}
								break;

							case "class":
								//class
								if (parseClass(this.bhref, attribs.href, this.tempData)) {
									this.depth = undefined;
									this.tempData = {};
									this.cType = -1;
								}
								break;

							case "function":
								//function
								if (parseFunction(this.bhref, attribs.href, this.tempData)) {
									this.depth = undefined;
									this.tempData = {};
									this.cType = -1;
								}
								break;

							case "method":
								//method
								if (parseMethod(this.bhref, attribs.href, this.tempData)) {
									this.depth = undefined;
									this.tempData = {};
									this.cType = -1;
								}
								break;

							case "data":
								//constants
								if (parseConstant(this.bhref, attribs.href, this.tempData)) {
									this.depth = undefined;
									this.tempData = {};
									this.cType = -1;
								}
								break;

							case "attribute":
								//attribute
								if (parseAttribute(this.bhref, attribs.href, this.tempData)) {
									this.depth = undefined;
									this.tempData = {};
									this.cType = -1;
								}
								break;
						}
					}
					else if (name == 'tt') {
						if (attribs.class == 'descclassname') {
							this.getText = 1;
							this.textReason = 'class';
						}
						else if (attribs.class == 'descname' ) {
							this.getText = 1;
							this.textReason = 'desc';
						}
					}
				}
				else if (this.depth == 1) {
					if (name == 'span' && attribs.class == 'pre' && this.cType == 'xref py py-mod docutils literal') {
						this.getText = 1;
						this.textReason = 'module';
					}
				}
			}
		}
	},
	ontext: function(text){
		if (this.getText) {
			if (this.textReason == 'class') {
				this.tempData.class = text;
			}
			else if (this.textReason == 'desc') {
				this.tempData.desc = text;
			}
			else if (this.textReason == 'module') {
				if (text == this.module.name) {
					this.depth = undefined;
					this.tempData = {};
					this.cType = -1;
				}
			}
			this.getText = 0;
		}
	},
	onclosetag: function(tagname){
		if (this.depth !== undefined) this.depth--;
		if (this.depth === 0) {
			this.depth = undefined;
			this.tempData = {};
			this.cType = -1;
		}
	}
});

fs.readdir(__dirname + '/python-2.7.5-docs-html/library/', docIndexRead);

function docIndexRead(err, files) {
	if (err) {
		throw err;
	}

	pyDocs.pages['distutils/apiref.html'] = {
		exceptions:[],
		classes:[],
		functions:[],
		methods:[],
		constants:[],
		attributes:[],
		modules:[]
	}; //disutils are irregular
	
	for (var i in files) {
		pyDocs.pages['library/' + files[i]] = {
			exceptions:[],
			classes:[],
			functions:[],
			methods:[],
			constants:[],
			attributes:[],
			modules:[]
		};
	}

	// indexParser.write(data);
	// indexParser.end();

	for (var i in pyDocs.pages) {
		var data = fs.readFileSync(__dirname + "/python-2.7.5-docs-html/" + i);
		namesParser._cbs.bhref = i;
		namesParser.write(data);
	}

	var j;
	for (var i in pyDocs.pages) {
		pyDocs.pages[i].exceptions.sort(alphabeticallySort);

		for (j in pyDocs.pages[i].exceptions) {
			pyDocs.cumulative.exceptions.push({name:pyDocs.pages[i].exceptions[j].name, href:pyDocs.pages[i].exceptions[j].href});
		}

		pyDocs.pages[i].classes.sort(alphabeticallySort);

		for (j in pyDocs.pages[i].classes) {
			pyDocs.cumulative.classes.push({name:pyDocs.pages[i].classes[j].name, href:pyDocs.pages[i].classes[j].href});
		}
		
		pyDocs.pages[i].functions.sort(alphabeticallySort);

		for (j in pyDocs.pages[i].functions) {
			pyDocs.cumulative.functions.push({name:pyDocs.pages[i].functions[j].name, href:pyDocs.pages[i].functions[j].href});
		}
		
		pyDocs.pages[i].methods.sort(alphabeticallySort);

		for (j in pyDocs.pages[i].methods) {
			pyDocs.cumulative.methods.push({name:pyDocs.pages[i].methods[j].name, href:pyDocs.pages[i].methods[j].href});
		}
		
		pyDocs.pages[i].constants.sort(alphabeticallySort);

		for (j in pyDocs.pages[i].constants) {
			pyDocs.cumulative.constants.push({name:pyDocs.pages[i].constants[j].name, href:pyDocs.pages[i].constants[j].href});
		}
		
		pyDocs.pages[i].attributes.sort(alphabeticallySort);

		for (j in pyDocs.pages[i].attributes) {
			pyDocs.cumulative.attributes.push({name:pyDocs.pages[i].attributes[j].name, href:pyDocs.pages[i].attributes[j].href});
		}
		
		pyDocs.pages[i].modules.sort(alphabeticallySort);

		for (j in pyDocs.pages[i].modules) {
			pyDocs.cumulative.modules.push({name:pyDocs.pages[i].modules[j].name, href:pyDocs.pages[i].modules[j].href});
		}
	}

	pyDocs.cumulative.exceptions.sort(alphabeticallySort);

	pyDocs.cumulative.classes.sort(alphabeticallySort);

	pyDocs.cumulative.functions.sort(alphabeticallySort);

	pyDocs.cumulative.methods.sort(alphabeticallySort);

	pyDocs.cumulative.constants.sort(alphabeticallySort);

	pyDocs.cumulative.attributes.sort(alphabeticallySort);

	fs.writeFileSync(__dirname + '/output/pyDocs.json', JSON.stringify(pyDocs));
}

function alphabeticallySort(a,b){
	if (a.name < b.name) return -1;
	if (a.name > b.name) return 1;
	return 0;
}



