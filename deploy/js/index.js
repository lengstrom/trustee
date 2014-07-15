// keep
setTimeout(function(){
	require('nw.gui').Window.get().showDevTools();
	// window.JSFinder = new JSFind(document.getElementById('display'), document.getElementById('contentSearcher'));
	$('.finder').css('z-index',1);
}, 1);


var win = require('nw.gui').Window.get();

$('#display').hide();
document.getElementById('splashScreen').onload = initSplashScreen;

var fs = require('fs');

var Trustee = {
	working:0,
	selected:[],
	docs: {},
	click:0,
	cumulative:[],
	last_query:""
};

$('#pageList').hide();

$('.searchbarCont').css('width', $('#lcol').width() + 'px');

function initSplashScreen() {
	try {
		document.getElementById('splashScreen').contentWindow.init();
	}
	catch (err) {

	}
}


// redo
function removeDocs(dir) {
	
}

function addDocs(dir) {
	
}

function removeAllPlugins() {
	for (var i in Trustee.docs) {
		removeDocs(i);
	}
}

function addDocsToIndex(pd, o) {
	var mainIcon = '/trustee_plugins/' + o + pd.info.icons.path + pd.info.icons.mainIcon;
	var path;
	if (pd.info.source.charAt(0) != '/') {
		path = '/trustee_plugins/' + o + '/' + pd.info.source;
	}
	else {
		path = '/trustee_plugins/' + o + pd.info.source;
	}

	var cumulative = [];
	var types = [];
	for (var i in pd.docs) {
		types.push(i);
	}

	types.forEach(function(type) {
		var secondaryIcon = pd.info.icons.docsIcons[type].search('/') == -1 ? 'img/objects/' + pd.info.icons.docsIcons[type] : '/trustee_plugins/' + pd.info.icons.path + pd.info.icons[type];
		Object.keys(pd.pages).forEach(function(p) {
			pd.pages[p][type].forEach(function(p) {
				var sPath = path + p[1]; //specific path to the file
				var name = p[0];
				cumulative.push([mainIcon, secondaryIcon, sPath, name]);
			});
		});
	});
	return cumulative;
}

function applyJSON(json, dir) {
	//import docs from json
	if (json.info.source.charAt(0) != '/') {
		json.info.source = '/' + json.info.source;
	}

	if (json.info.icons.path.charAt(0) != '/') {
		json.info.icons.path = '/' + json.info.icons.path;
	}

	var path = '/trustee_plugins/' + dir + json.info.source;
	var items = [];
	var docsHeader = $('<div>', {class:'itemBar folder'});
	var folderImg = $('<img>', {src:"img/folder-open.png"});
	var mainIconSRC = '/trustee_plugins/' + dir + json.info.icons.path + json.info.icons.mainIcon;
	var iconImg = $('<img>', {src:mainIconSRC, class:'iconImg'});
	var folderTitle = $('<span>', {class: 'itemInner i0'});
	var folderText = $('<span>', {class: 'itemText', text:json.info.name});
	docsHeader.append(folderTitle);
	docsHeader[0].folderImg = folderImg;
	folderTitle.prepend(iconImg);
	folderTitle.prepend(folderImg);
	folderTitle.append(folderText);
	var setDIV = $('<div>');
	$('#tree').append(docsHeader);
	$('#tree').append(setDIV);
	for (var i in json.docs) {
		// addFolder(name, indentationLevel, elem, imgPath, inner, ct, spinner);
		var src = json.info.icons.docsIcons[i].search('/') == -1 ? 'img/objects/' + json.info.icons.docsIcons[i] : '/trustee_plugins/' + json.info.icons.path + json.info.icons[i];
		addFolder(i, 1, setDIV, src, json.info.name, i, path, dir);
	}

	docsHeader[0].setDIV = setDIV;
	docsHeader.bind('click', function() {
		this.folderImg.attr('src', this.folderImg.attr('src') == 'img/folder-closed.png' ? 'img/folder-open.png' : 'img/folder-closed.png');
		this.setDIV.toggle();
	});

	return [docsHeader, setDIV];
}