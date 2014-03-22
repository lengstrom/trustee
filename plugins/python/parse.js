var pyDocs = {
	info: {
		pages:'pages',
		infoFile:'info.json',
		source:'python-2.7.5-docs-html/', //this is relative from the folder that the documentation is located in 
		icons: { //if left empty, then use default ones
			path:'python/resources/',
			mainIcon:'python-logo.png',
			docsIcons: {
				//if it is blank, assume that it is from one of the defaults ie modules ""
				Modules: 'Module.png',
				Classes: 'Class.png',
				Exceptions: 'Exception.png',
				Methods: 'ClassMethod.png',
				Functions: 'Function.png',
				Attributes: 'Attribute.png',
				Constants: 'Const.png'
			}
		}
	},
	pages: {}, //store each url's objects
	docs: { //every object, docsly
		Modules: [],
		Classes: [],
		Exceptions: [],
		Methods: [],
		Functions: [],
		Attributes: [],
		Constants: []
	}
};

function parseException(bhref, href, tempData) {
	if (tempData.class === undefined) tempData.class = '';
	pyDocs.pages[bhref].Exceptions.push([tempData.class + tempData.desc, bhref + href]);
	return true;
}

function parseClass(bhref, href, tempData) {
	if (tempData.class === undefined) tempData.class = '';
	pyDocs.pages[bhref].Classes.push([tempData.class + tempData.desc, bhref + href]);
	return true;
}

function parseFunction(bhref, href, tempData) {
	if (tempData.class === undefined) tempData.class = '';
	pyDocs.pages[bhref].Functions.push([tempData.class + tempData.desc, bhref + href]);
	return true;
}

function parseMethod(bhref, href, tempData) {
	if (tempData.class === undefined) tempData.class = '';
	pyDocs.pages[bhref].Methods.push([tempData.class + tempData.desc, bhref + href]);
	return true;
}

function parseConstant(bhref, href, tempData) {
	if (tempData.class === undefined) tempData.class = '';
	pyDocs.pages[bhref].Constants.push([tempData.class + tempData.desc, bhref + href]);
	return true;
}

function parseAttribute(bhref, href, tempData) {
	if (tempData.class === undefined) tempData.class = '';
	pyDocs.pages[bhref].Attributes.push([tempData.class + tempData.desc, bhref + href]);
	return true;
}

function parseModule(bhref, href, name) {
	pyDocs.pages[bhref].Modules.push([name, bhref + href]);
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
				if (text == this.module[0]) {
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

var files = fs.readdirSync(__dirname + '/python-2.7.5-docs-html/library/');

pyDocs.pages['distutils/apiref.html'] = {
	Exceptions:[],
	Classes:[],
	Functions:[],
	Methods:[],
	Constants:[],
	Attributes:[],
	Modules:[]
}; //disutils are irregular

for (var i in files) {
	pyDocs.pages['library/' + files[i]] = {
		Exceptions:[],
		Classes:[],
		Functions:[],
		Methods:[],
		Constants:[],
		Attributes:[],
		Modules:[]
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
	pyDocs.pages[i].Exceptions.sort(alphabeticallySort);

	for (j in pyDocs.pages[i].Exceptions) {
		pyDocs.docs.Exceptions.push([pyDocs.pages[i].Exceptions[j][0], pyDocs.pages[i].Exceptions[j][1]]);
	}

	pyDocs.pages[i].Classes.sort(alphabeticallySort);

	for (j in pyDocs.pages[i].Classes) {
		pyDocs.docs.Classes.push([pyDocs.pages[i].Classes[j][0], pyDocs.pages[i].Classes[j][1]]);
	}
	
	pyDocs.pages[i].Functions.sort(alphabeticallySort);

	for (j in pyDocs.pages[i].Functions) {
		pyDocs.docs.Functions.push([pyDocs.pages[i].Functions[j][0], pyDocs.pages[i].Functions[j][1]]);
	}
	
	pyDocs.pages[i].Methods.sort(alphabeticallySort);

	for (j in pyDocs.pages[i].Methods) {
		pyDocs.docs.Methods.push([pyDocs.pages[i].Methods[j][0], pyDocs.pages[i].Methods[j][1]]);
	}
	
	pyDocs.pages[i].Constants.sort(alphabeticallySort);

	for (j in pyDocs.pages[i].Constants) {
		pyDocs.docs.Constants.push([pyDocs.pages[i].Constants[j][0], pyDocs.pages[i].Constants[j][1]]);
	}
	
	pyDocs.pages[i].Attributes.sort(alphabeticallySort);

	for (j in pyDocs.pages[i].Attributes) {
		pyDocs.docs.Attributes.push([pyDocs.pages[i].Attributes[j][0], pyDocs.pages[i].Attributes[j][1]]);
	}
	
	pyDocs.pages[i].Modules.sort(alphabeticallySort);

	for (j in pyDocs.pages[i].Modules) {
		pyDocs.docs.Modules.push([pyDocs.pages[i].Modules[j][0], pyDocs.pages[i].Modules[j][1]]);
	}
}

pyDocs.docs.Exceptions.sort(alphabeticallySort);

pyDocs.docs.Classes.sort(alphabeticallySort);

pyDocs.docs.Functions.sort(alphabeticallySort);

pyDocs.docs.Methods.sort(alphabeticallySort);

pyDocs.docs.Constants.sort(alphabeticallySort);

pyDocs.docs.Attributes.sort(alphabeticallySort);

fs.readFileSync(__dirname + "/python-2.7.5-docs-html/_static/sidebar.js").toString().split('\n').forEach(function (line) {
	if (line.toString() == '  set_position_from_cookie();') {
		fs.appendFileSync(__dirname + "/python-2.7.5-docs-html/_static/temp.js", line.toString() + "\n  collapse_sidebar();" + "\n");
	}
	else {
		if (line.toString() !== '  collapse_sidebar();') {
			fs.appendFileSync(__dirname + "/python-2.7.5-docs-html/_static/temp.js", line.toString() + "\n");
		}
	}
});

fs.renameSync(__dirname + "/python-2.7.5-docs-html/_static/temp.js", __dirname + "/python-2.7.5-docs-html/_static/sidebar.js");
fs.writeFileSync(__dirname + '/output/output.json', JSON.stringify(pyDocs));
finished = 1;

function alphabeticallySort(a,b){
	if (a[0] < b[0]) return -1;
	if (a[0] > b[0]) return 1;
	return 0;
}