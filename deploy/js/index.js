var win = require('nw.gui').Window.get();
$('#display').hide();
document.getElementById('splashScreen').onload = function() {
	document.getElementById('splashScreen').contentWindow.loadPlugins(1);
};

var fs = require('fs');

var Trustee = {
	working:0,
	selected:undefined,
	docs: {},
	click:0,
	cumulative:[],
	last_query:""
};

win.on('close', function() {
	if (Trustee.working) {
		var c = confirm('Trustee is working right now, you might corrupt or lose downloaded docsets - do you really want to quit?');
		if (c) {
			saveWindowState();
			win.close(true);
		}
	}
	else {
		saveWindowState();
		win.close(true);
	}
});

$('#separator').bind('mousedown', function(e) {
	document.body.style.cursor = 'ew-resize';
	$('#displayCover').css('z-index', '2');
	$(window).bind('mousemove', separatorMove);
});

$(window).bind('mouseup', separatorMouseUp);
$(window).resize(windowResize);
$('#rcol').css('width', parseInt($(document).width(), 10) - parseInt($('#lcol').width(), 10) - 6 + 'px'); //set right col relative to left
$('.searchbarCont').css('width', $('#lcol').width() + 'px');

function getDocsList(exemps) {
	var d = fs.readdirSync(process.cwd() + "/trustee_plugins"); //get names of files / directories inside /plugins
	var dirs = []; //array to store all the directories within /plugins
	var currentPath = process.cwd() + "/trustee_plugins/"; //so that we don't have to constantly write the absolute path
	d.forEach(function(o) { //push every directory listed in the names inside of /plugins
		var stat = fs.statSync(currentPath + o);
		if (stat.isDirectory()) dirs.push(o);
	});

	dirs.forEach(function(o) { //go through every directory in /plugins
		if (exemps.indexOf(o) == -1) {
			var info = JSON.parse(fs.readFileSync(process.cwd() + '/trustee_plugins/' + o + "/info.json").toString());
			if (info.active) {
				try {
					var docs = JSON.parse(fs.readFileSync(process.cwd() + '/trustee_plugins/' + o + "/output.json").toString());
					importDocs(docs, o);
				}
				catch (e) {
					throw e;
				}
			}
		}
	});
}

function removeSlashes(str) {
	if (str.charAt(0) == '/'){
		str = str.substr(1);
	}

	if (str.charAt(str.length - 1) == '/'){
		str = str.substr(str.length - 2);
	}

	return str;
}

function removeDocs(dir) {
	dir = removeSlashes(dir);
	for (var i in Trustee.docs) {
		if (Trustee.docs[i][2] == dir) {
			Trustee.docs[i][1][0].remove();
			Trustee.docs[i][1][1].remove();
			delete Trustee.docs[i];
			Trustee.cumulative = [];
			for (var j in Trustee.docs) {
				Trustee.cumulative = Trustee.cumulative.concat(addDocsToIndex(Trustee.docs[j][0], Trustee.docs[j][2]));
			}
			return true;
		}
		return false;
	}
}

function addDocs(dir) {
	dir = removeSlashes(dir);
	if (fs.existsSync(process.cwd() + '/trustee_plugins/' + dir)) {
		var json = JSON.parse(fs.readFileSync(process.cwd() + '/trustee_plugins/' + dir + '/output.json').toString());
		importDocs(json, dir);
	}
	else {
		return false;
	}
}

function importDocs(pd, o) {
	o = removeSlashes(o);
	var items = applyJSON(pd, o);
	Trustee.docs[o] = [pd, items, o]; //JSON, jQuery objects for overall container, then dir 
	Trustee.cumulative = Trustee.cumulative.concat(addDocsToIndex(pd, o));
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

function makeCustomSpinner() {
	var opts = {
		lines: 10, // The number of lines to draw
		length: 5, // The length of each line
		width: 3, // The line thickness
		radius: 3, // The radius of the inner circle
		corners: 2, // Corner roundness (0..1)
		rotate: 0, // The rotation offset
		direction: 1, // 1: clockwise, -1: counterclockwise
		speed: 1, // Rounds per second
		trail: 60, // Afterglow percentage
		shadow: false, // Whether to render a shadow
		hwaccel: false, // Whether to use hardware acceleration
		className: 'spinner', // The CSS class to assign to the spinner
		zIndex: 2e9, // The z-index (defaults to 2000000000)
		top: 'auto', // Top position relative to parent in px
		left: 'auto' // Left position relative to parent in px
	};

	var spinner = new Spinner(opts).spin();
	$(spinner.el).css('right', '17px');
	$(spinner.el).css('bottom', '9px');
	return spinner;
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
	var pages = json.info.pages;
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

function makeItemComplex(json, spinner, src, path, div) {
	if (json.length === 0) {
		spinner.stop();
		return;
	}
	for (var j = 0; j < json.length; j++) {
		var end = j == json.length - 1 ? 1 : 0;
		makeItem(json[j][0], path + json[j][1], src, div, end, spinner);
	}
}

function makeHeterogeneousComplex(items, queryLength) {
	items.sort(function(a,b) {
		if (a[1] === 0) {
			if (b[1] === 0) {
				if (a[0][3] < b[0][3]) return -1;
				if (a[0][3] > b[0][3]) return 1;
				return 0;
			}
			else {
				return -1;
			}
		}
		else {
			if (a[0][3] < b[0][3]) return -1;
			if (a[0][3] > b[0][3]) return 1;
			return 0;
		}
	});
	items = items.slice(0, 50);
	var spinner = makeCustomSpinner();
	$(spinner.el).css('top','18px');
	$(spinner.el).css('right','10px');
	$("#searchResults")[0].appendChild(spinner.el);

	if (items.length === 0) {
		spinner.stop();
		$('#searchResults').empty();
		return;
	}
	var newDiv = $("<div>");
	for (var j = 0; j < items.length; j++) {
		var end = j == items.length - 1 ? 1 : 0;
		makeItem(items[j][0][3], items[j][0][2] ,items[j][0][0], newDiv, end, spinner, -1, items[j][0][1], items[j][1], queryLength);
	}

	$("#searchResults").prepend(newDiv);
	$('#searchResults > div:gt(0)').remove();
}

function makeItem(text, itemURL, imgPath, div, end, spinner, indentationLevel, imgPath2, boldStart, queryLength) {
	setTimeout(function() {
		var innerCont;
		if (indentationLevel == -1) { //make sure we don't get a 0 value
			innerCont = $('<span>', {class: 'itemInner'});
		}
		else if (indentationLevel + 3) { //make sure we don't get a 0 value
			innerCont = $('<span>', {class: 'itemInner i' + indentationLevel});
		}
		else {
			innerCont = $('<span>', {class: 'itemInner i2'});
		}

		var cont = $('<div>', {class:'itemBar selectable'});
		$(cont).bind('click', itemClicked);
		cont[0].itemURL = itemURL;
		cont.bind('click', function () {
			setFrameURL(this.itemURL);
		});

		cont.append(innerCont);

		var desc = $('<span>', {class:'itemTextObject'});
		if (boldStart + 1) {
			desc.html(text.substr(0, boldStart) + "<b>" + text.substr(boldStart, queryLength) + "</b>" + text.substr(boldStart + queryLength));
		}
		else {
			desc.html(text);
		}
		innerCont.append(desc);

		if (imgPath2) {
			var iconImg2 = $('<img>', {class:'iconImgObject2', src:imgPath2});
			innerCont.prepend(iconImg2);
			desc.css('margin-left', '52px');
		}

		var iconImg = $('<img>', {class:'iconImgObject', src:imgPath});
		innerCont.prepend(iconImg);

		div.append(cont);

		if (end) {
			spinner.stop();
		}
	}, 2);
}

function addFolder(name, indentationLevel, elem, imgPath, Docs, child, path, dir) {
	var setDIV = $('<div>');
	var folder = $('<div>', {class:"itemBar folder"});
	var folderImg = $('<img>', {src:"img/folder-closed.png"});
	var folderText = $('<span>', {class: 'itemText', text:name});
	folderImg.css('margin-top', '1px');
	var folderTitle = $('<span>', {class: 'itemInner i1'});
	folderTitle.append(folderText);

	var iconImg = $('<img>', {src:imgPath, class:'iconImg'});

	folderTitle.prepend(iconImg);

	folder[0].setDIV = setDIV;
	folder[0].src = imgPath;
	folder[0].folderImg = folderImg;
	folder[0].path = path;
	folder[0].rendered = 0;
	folder[0].dir = dir;
	folder[0].child = child;
	folder.append(folderTitle);
	folderTitle.prepend(folderImg);
	elem.append(folder);
	elem.append(setDIV);
	folderTitle.prepend(folderImg);

	folder.bind('click', function() {
		this.folderImg.attr('src', this.folderImg.attr('src') == 'img/folder-closed.png' ? 'img/folder-open.png' : 'img/folder-closed.png');
		this.setDIV.toggle();
		if (!this.rendered) {
			var spinner = makeCustomSpinner();
			this.appendChild(spinner.el);
			makeItemComplex(Trustee.docs[this.dir][0].docs[this.child], spinner, this.src, this.path, this.setDIV);
			this.rendered = 1;
		}
	});

	setDIV.hide();

	return folder;
}

function itemClicked() {
	if (Trustee.selected) {
		$(Trustee.selected).css('background-color', 'rgb(230, 233, 240)');
		$(Trustee.selected).css('color', '#232323');
	}
	
	Trustee.selected = this;
	$(this).css('background-color', '#232323');
	$(this).css('color', 'rgb(230, 233, 240)');
}

function windowResize() {
	$('#rcol').css('width', parseInt($(window).width(), 10) - parseInt($('#lcol').width(), 10) - 6 + 'px');
}

function separatorMove(e) {
	if (e.clientX < 150) { //set minimum width of left column to 150px
		$('#lcol').css('width', '140px'); //go to the lowest possible value if it is trying to be dragged smaller
		$('.searchbarCont').css('width' , '140px');
		$('#rcol').css('width', parseInt($(window).width(), 10) - parseInt($('#lcol').width(), 10) - 6 + 'px');
		return;
	}

	if (e.clientX > 625) { //set minimum width of right column to 150px
		$('#rcol').css('width', parseInt($(window).width(), 10) - parseInt($('#lcol').width(), 10) - 6 + 'px');
		return;
	}

	if (parseInt($(window).width(), 10) - e.clientX < 150) { //set minimum width of right column to 150px
		$('#lcol').css('width', parseInt($(window).width(), 10) - 144 + 'px'); //go to the lowest possible value if it is trying to be dragged smallerq
		$('.searchbarCont').css('width', $('#lcol').width() + 'px');
		$('#rcol').css('width', parseInt($(window).width(), 10) - parseInt($('#lcol').width(), 10) - 6 + 'px');
		return;
	}

	$('#lcol').css('width', e.clientX - 3 + 'px');
	$('.searchbarCont').css('width', $('#lcol').width() + 'px');
	$('#rcol').css('width', parseInt($(window).width(), 10) - e.clientX - 3 + 'px');
}

function separatorMouseUp(e) {
	document.body.style.cursor = '';
	$('#displayCover').css('z-index', '-1');
	$(window).unbind('mousemove', separatorMove);
}

function home() {
	var frame = setFrameURL();
	if (Trustee.selected) {
		$(Trustee.selected).css('background-color', 'rgb(230, 233, 240)');
		$(Trustee.selected).css('color', '#232323');
		Trustee.selected = undefined;
	}

	frame.onload = function() {
		frame.contentWindow.loadPlugins(0);
	};
}

function setFrameURL(url) {
	url = url == undefined ? 'splash.html' : url;
	if (url == 'splash.html') {
		document.getElementById('splashScreen').src = url;
		$('#splashScreen').show();
		$('#display').hide();
		return document.getElementById('splashScreen');
	}
	else {
		if (!isURLTheSame(document.getElementById('display').src, url)) { //assumes that the second url is a relative path
			document.getElementById('display').src = url;
		}
		$('#splashScreen').hide();
		$('#display').show();
		return document.getElementById('display');
	}
}

function isURLTheSame(url, relativeURL) {
	var urlRelativePath = getRelativePath(url, 0);
	if (relativeURL.charAt(0) == '/') {
		if ('/' + window.location.origin.split('/')[2] + relativeURL == urlRelativePath) {
			return true;
		}

		return false;
	}
	else {
		//assume that the path is in the same directory
		if (urlRelativePath.split('/')[urlRelativePath.split('/').length - 1] == relativeURL) {
			return true;
		}

		return false;
	}

	//current path is /deploy/index.html
}

function getRelativePath(url, k) {
	if (url.split('/')[url.split('/').length - k] != window.location.origin.split('/')[2]) {
		k++;
		return getRelativePath(url, k) + '/' + url.split('/')[url.split('/').length - k];
	}
	else {
		return '';
	}
}

//search capabilities
function add(candidates, query, results) {
	candidates.forEach(function(c) {
		var i = c[3].toLowerCase().indexOf(query.toLowerCase());
		if (i >= 0) {
			results.push([c, i]);
		}
	});
}

// TODO: sort results by
// 2. if lots of things match because of the same subword, don't show them all
// 3. sort by most likely to be used

function update() {
	var query = document.getElementById("search").value;
	if (query === '') {
		Trustee.last_query = '';
		$('#searchResults').hide();
		$('#tree').show();
		// setFrameURL()
		if (Trustee.selected) {
			$(Trustee.selected).css('background-color', 'rgb(230, 233, 240)');
			$(Trustee.selected).css('color', '#232323');
			Trustee.selected = undefined;
		}
	}
	else if ($("#tree").is(":visible")) {
		$('#searchResults').show();
		$('#tree').hide();
		// setFrameURL();
		if (Trustee.selected) {
			$(Trustee.selected).css('background-color', 'rgb(230, 233, 240)');
			$(Trustee.selected).css('color', '#232323');
			Trustee.selected = undefined;
		}
	}
	var results = [];
	if (query != Trustee.last_query) {
		Trustee.last_query = "";
		if (query.length > 0) {
			add(Trustee.cumulative, query, results);
			makeHeterogeneousComplex(results, query.length);
		}
	}
	Trustee.last_query = query;
	// document.getElementById("output").innerHTML = html;

}

function update_done() {
	Trustee.last_query = document.getElementById("search").value;
	update();
}