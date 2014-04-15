var fs = require('fs');
var https = require('https');
var path = require('path');
var unzip = require('decompress-zip');
var rimraf = require('rimraf');
var dns = require('dns');
parent.Trustee.working = 0;

$('#reloadDocs').bind('click', reloadDocs);
$('#reloadAvailDocs').bind('click', reloadAvailDocs);

function reloadDocs() {
	$('.alertCont').remove();
	$('.downloaded').remove();
	parent.removeAllPlugins();
	getPlugins(1);
}

function reloadAvailDocs() {
	$('.alertCont').remove();
	$('.available').remove();
	getDownloadableDocs();
}

$('#dledDocsHeader').bind('click', function() {
	$('#dlDocsTable').toggle();
});

$('#availDocs').bind('click', function() {
	$('#availDocsTable').toggle();
});

function getDownloadableDocs() {
	var spinner = makeCustomSpinner();
	$(spinner.el).css('left', "170px");
	$(spinner.el).css('margin-top', "-11px");
	$('#availDocs').append(spinner.el);
	try {
	dns.resolve('www.github.com', function(err){
			if (err) {
				setAvailableDocs(spinner.el);
			}
			else {
				var re = https.get('https://raw.githubusercontent.com/trusteedocs/trustee-docs-channel/master/docList.json', docListDownloaded);
				re.spinner = spinner.el;
			}
		});
	}
	catch(err) {
		setAvailableDocs(spinner.el);
	}
}

function docListDownloaded(response) {
	if (String(response.statusCode).charAt(0) != 2 && String(response.statusCode).charAt(0) != 3) {
		$(this.spinner).remove();
		showAlert("Error getting list of docs");
		return;
	}
    //create trustee_plugins folder if it doesn't exist already
    fs.mkdir(process.cwd() + '/trustee_plugins', function(e) {
        if(!e || e && e.code == 'EEXISTS') {
            //folder already existing
        } else {
            //folder just created
        }
    });
	var file = fs.createWriteStream(process.cwd() + '/trustee_plugins/docList.json');
	response.pipe(file);
	file.spinner = this.spinner;
	file.on('finish', function() { //callback for when the file is finished being downloaded
		this.close();
		setAvailableDocs(this.spinner);
	});
}

function setAvailableDocs(spinner) {
	if (fs.existsSync(process.cwd() + '/trustee_plugins/docList.json')) {
		var dirs = getDirs();
		var info = JSON.parse(fs.readFileSync(process.cwd() + '/trustee_plugins/docList.json').toString());
		info.forEach(function(o) {
			var repoName = o.repoURL.split('/')[4] + '-master';
			if (dirs.indexOf(repoName) == -1) {
				addAvailableDoc(o.name, o.repoURL);
			}
		});
	}
	else {
		showAlert("No internet and no archived copy of the documentation - could not fetch docs.");
	}
	if (spinner) {
		$(spinner).remove();
	}
}

function highlightDl() {
	$('#availDocs').css('background-color','#2ecc71');
	$('#availDocs').animate({'background-color': '#FFF'}, {duration:600});
}

function loadPlugins(reload) {
	$('.row').remove();
	if (reload) {
		parent.removeAllPlugins();
		getPlugins(1);
	}
	else {
		getPlugins(0);
	}

	getDownloadableDocs(); //fine
}

function addAvailableDoc(name, url) {
	var row = $("<div>", {class:'row available'});
	var title = $("<div>", {class:'docTitle', text:name});
	var download = $("<div>", {class:'btn updateBtn downloadBtn'});
	download[0].row = row;
	download[0].url = url;
	var downloadText = $("<div>", {class:'downloadText',text:'Download'});
	download.bind('click', clickUpdateDocs);
	row.append(title);
	download.append(downloadText);
	row.append(download);
	$('#availDocsTable').append(row);

}

function addDocsToTable(name, active, dir, notFoundPath, reason) {
	if ($('#noDocs').length) {
		$('#noDocs').hide();
	}

	var row = $("<div>", {class:'row downloaded'});
	var input = $("<input>", {class:'docCheckbox', type:'checkbox'});
	if (active) {
		input.prop('checked', true);
	}
	else {
		input.prop('checked', false);
	}

	input.bind('click', function() {
		if ($(this).prop('checked')) {
			setActive(this.dir, 1);
		}
		else if ($(this).prop('checked') === false) {
			setActive(this.dir, 0);
		}
	});

	var title = $("<div>", {class:'docTitle', text:name});
	var update = $("<div>", {class:'btn updateBtn'});
	var updateText = $("<div>", {class:'updateText',text:'Update'});
	update.append(updateText);
	var remove = $("<div>", {class:'btn removeBtn'});
	var removeText = $("<div>", {class:'removeText',text:'Remove'});
	remove.append(removeText);

	row.append(input);
	row.append(title);
	row.append(update);
	row.append(remove);
	$('#dlDocsTable').append(row);
	//apply handlers if its found

	if (notFoundPath) {
		$(row).css("background-color", "#c0392b");
		remove.remove();
		update.remove();
		title.html(title.html() + ' - ' + reason + ': ' + notFoundPath + ". <b>Click to reload.</b>");
		row.css('cursor', 'pointer');
		row[0].dir = dir;
		row.bind('click', function() {
			$('.alertCont').remove();
			var docList = JSON.parse(fs.readFileSync(process.cwd() + '/trustee_plugins/docList.json').toString());
			var found;
			var dir = this.dir;
			var row = this;
			docList.forEach(function(o) {
				if (o.repoURL.split('/')[4] + '-master' == dir) {
					found = 1;
					var spinner = makeCustomSpinner();
					$('#dledDocsHeader').append(spinner.el);
					row.spinner = spinner.el;
					$(row.spinner).css('left', "200px");
					$(row.spinner).css('margin-top', "-11px");
					$(row).css('background-color', '#f1c40f');
					updatePlugin(o.repoURL, 1, row, dir);
				}
			});

			if (!found) {
				showAlert('Documentation repository not found!');
			}
		});

		input.remove();
	}
	else {
		title.addClass('titleNoError');
		update[0].name = name;
		update[0].row = row;
		update[0].dir = dir;

		remove[0].name = name;
		remove[0].row = row;
		remove[0].dir = dir;

		input[0].dir = dir;

		update.bind('click', clickUpdateDocs);
		remove.bind('click', clickRemoveDocs);
	}

	return row;
}

function clickRemoveDocs() {
	rimraf.sync(process.cwd() + '/trustee_plugins' + this.dir);
	this.row.remove();
	if (!$('.downloaded').length) {
		$('#noDocs').show();
	}

	var dir = this.dir;
	var name = this.name;
	parent.removeDocs(dir);
	if (fs.existsSync(process.cwd() + '/trustee_plugins/docList.json')) {
		var docList = JSON.parse(fs.readFileSync(process.cwd() + '/trustee_plugins/docList.json').toString());
		var found;
		docList.forEach(function(o) {
			if (o.repoURL.split('/')[4] + '-master' == dir) {
				found = 1;
				addAvailableDoc(name, o.repoURL);
				parent.removeDocs(o);
			}
		});

		if (!found) {
			setAvailableDocs();
		}
	}
	else {
		setAvailableDocs();
	}
	//Remove docs
}

function differenceBetweenDays(day1, day2) {
	return Math.abs((day1 - day2)/(86400000)); //(1000 * 60 * 60 * 24));
}

function getPlugins(make) {
	var dirs = getDirs();
	var exemp = [];
	dirs.forEach(function(o) { //go through every directory in /trustee_plugins
		var w = checkAndAddDocs(o);
		if (!w || !make) {
			exemp.push(o);
		}
	});

	parent.getDocsList(exemp);
}

function getDirs() {
	var d = fs.readdirSync(process.cwd() + "/trustee_plugins"); //get names of files / directories inside /trustee_plugins
	var dirs = []; //array to store all the directories within /trustee_plugins
	var currentPath = process.cwd() + "/trustee_plugins/"; //so that we don't have to constantly write the absolute path
	d.forEach(function(o) { //push every directory listed in the names inside of /trustee_plugins
		var stat = fs.statSync(currentPath + o);
		if (stat.isDirectory()) dirs.push(o);
	});

	return dirs;
}

function setActive(dir, state) {
	if (dir.charAt(0) != '/') {
		dir = '/' + dir;
	}
	var info = JSON.parse(fs.readFileSync(process.cwd() + '/trustee_plugins' + dir + "/info.json").toString());
	info.active = state;
	fs.writeFileSync(process.cwd() + '/trustee_plugins/' + dir + "/info.json", JSON.stringify(info));
	if (state === 0) {
		parent.removeDocs(dir);
	}
	else {
		parent.addDocs(dir);
	}
}

function verifyDocset(currentPath, dir) {
	var info = JSON.parse(fs.readFileSync(currentPath + dir + "/info.json").toString()); //get info file
	if (typeof(info.name) != 'string') return false;
	if (typeof(info.repoURL) != 'string') return false;

	if (!fs.existsSync(currentPath + dir + '/output.json')) return false;
	//  var info = JSON.parse(fs.readFileSync(currentPath + dir + '/output.json').toString());
	//go into more detail about this later on to verify docs
	return true;
}

function checkAndAddDocs(dir, active) {
	if (active) {
		setActive(dir, 1);
	}
	else if (active === 0) {
		setActive(dir, 0);
	}

	var currentPath = process.cwd() + "/trustee_plugins";
	if (dir.charAt(0) != '/') {
		dir = '/' + dir;
	}

	if (fs.existsSync(currentPath + dir + "/info.json")) { //if the info file exists, proceed
		try {
			var info = JSON.parse(fs.readFileSync(currentPath + dir + "/info.json").toString()); //get info file
		}
		catch (err) {
			parent.Trustee.working--;
			showAlert('Bad info file.')
			addDocsToTable(dir, 0, dir.substr(1), dir, "info.json formatted incorrectly");
			return false;
		}
		if (info.active === undefined) {
			info.active = 1;
			fs.writeFileSync(process.cwd() + '/trustee_plugins/' + dirName + '/info.json', JSON.stringify(info));
		}
		if (verifyDocset(currentPath, dir)) {
			if (differenceBetweenDays(new Date(), new Date(info.lastUpdated)) > 25) { //if it has been 30 days since the plugin has last been updated, update the plugin
				updatePlugin(info.repoURL, info.active, dir);
			}
		}
		else {
			//err
			addDocsToTable(info.name, 0, dir.substr(1), dir, "info.json formatted incorrectly");
			return false;
		}

		addDocsToTable(info.name, info.active, dir);
	}
	else {
		//if err, make row showing that the path is invalid in the list of plugins
		//add in reload thing later
		addDocsToTable(dir.substr(1), 0, dir.substr(1), dir, "No info.json file found");
		return false;
	}

	return true;
}

function showAlert(text) {
	var alertCont = $('<div>', {class:'alertCont'});
	var alertTextCont = $('<div>', {class:'alertTextCont', text:text});
	var closeBtn = $('<i>', {class:'fa fa-times alertCloseBtn'});
	closeBtn[0].div = alertCont;
	closeBtn.bind('click', function(e) {
		this.div.remove();
	});
	alertCont.append(closeBtn);
	alertCont.append(alertTextCont);
	$('body').append(alertCont);
}

function updatePlugin(repoURL, active, div, dir) { //repoURL - string containing url :: info - dict containing the info.json file of the plugin to update. div - the div that the update button is in
	try {
		dns.resolve('www.github.com', function(err){
			if (err) {
				showAlert("Can't access internet!");
				$(div.spinner).remove();
			}
			else {
				if (dir) {
					parent.removeDocs(dir);
				}
				parent.Trustee.working++;
				downloadRepo("https://codeload.github.com/" + repoURL.split('/')[3] + "/" + repoURL.split('/')[4] + "/zip/master", active, div);
			}
		});
	}
	catch (err) {
		showAlert("Can't access internet!");
		$(div.spinner).remove();
	}
}

function downloadRepo(url, active, div) {
	var filename = url.split('/')[4] + '.zip';
	var file = fs.createWriteStream(process.cwd() + '/trustee_plugins/' + filename);
	file.active = active;
	file.filename = filename;
	file.div = div;
	request = https.get(url, endDownloadingRepo);
	request.file = file;
}

function endDownloadingRepo(response) {
	if (String(response.statusCode).charAt(0) != 2 && String(response.statusCode).charAt(0) != 3) {
		showAlert("Error getting url " + url);
		rimraf.sync(process.cwd() + '/trustee_plugins/'  + this.filename); //delete zip file
		parent.Trustee.working--;
		return;
	}
	response.pipe(this.file);
	this.file.on('finish', function() { //callback for when the file is finished being downloaded
		this.close();
		// var extractor = unzip.Extract({ path: process.cwd() + '/trustee_plugins/'});
		var extractor = new unzip(process.cwd() + '/trustee_plugins/'  + this.filename);
		extractor.__filename = this.filename;
		extractor.__div = this.div;
		extractor.__active = this.active;
		extractor.on('error', function(err) {
			parent.Trustee.working--;
			throw err;
		});

		extractor.on('extract', function(log) {
			rimraf.sync(this.filename); //delete zip file
			var dirName = this.__filename.substr(0, this.__filename.length - 4) + '-master';
			if (fs.existsSync(process.cwd() + '/trustee_plugins/' + dirName + '/info.json')) {
				var info = JSON.parse(fs.readFileSync(process.cwd() + '/trustee_plugins/' + dirName + '/info.json').toString());
				info.lastUpdated = JSON.stringify(new Date());
				if (info.active == undefined) {
					this.__active = 1;
					info.active = 1;
				}
				fs.writeFileSync(process.cwd() + '/trustee_plugins/' + dirName + '/info.json', JSON.stringify(info));
				parent.Trustee.working--;
				if (this.__div) {
					if ($(this.__div).html() == '<div class="downloadText">Download</div>') {
						this.__div.row.remove();
					}
					else if (this.__div.className.substring(0, 3) == 'row') {
						$(this.__div).remove();
					}
				}

				checkAndAddDocs(dirName, this.__active);
				$(this.__div.row).remove();
				$(this.__div.spinner).remove();
			}
		});

		extractor.extract({
			path: process.cwd() + '/trustee_plugins/',
			filter: function (file) {
				return file.type !== "SymbolicLink";
			}
		});
	});
}

function getExtension(filename) {
	var ext = path.extname(filename||'').split('.');
	return ext[ext.length - 1];
}

function isFileInDirectory(a, b) { //directory, file 
	if (!fs.existsSync(a)) {
		return false;
	}
	var previouslyExisted = 1;
	if (!fs.existsSync(b)) { //if it didn't previously exist
		try {
			fs.writeFileSync(b, ''); //make a few file
			previouslyExisted = 0;
		}
		catch (err) {
			throw err;
		}
	}
	if (b.indexOf(a) === 0) {
		var ap = fs.realpathSync(a); //get true paths
		var bp = fs.realpathSync(b);
		if (!previouslyExisted) {
			rimraf.sync(b); //if it didn't previously exist, delete it
		}
		if (bp.indexOf(ap) === 0) {
			return true;
		}
		else {
			return false ;
		}
	}
	if (!previouslyExisted) {
		rimraf.sync(b); //if it didn't previously exist, delete it
	}
	return false;
}

function getExtension(filename) {
	var ext = path.extname(filename||'').split('.');
	return ext[ext.length - 1];
}

function clickUpdateDocs() {
	$('.alertCont').remove();
	var spinner = makeCustomSpinner();
	this.row.append(spinner.el);
	this.spinner = spinner.el;
	var url;
	if (this.url) {
		$(spinner.el).css('right', '112px');
		url = this.url;
	}
	else {
		url = JSON.parse(fs.readFileSync(process.cwd() + '/trustee_plugins/' + this.dir + "/info.json").toString()).repoURL;
	}

	updatePlugin(url, 1, this, this.dir);
	//
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
	// $(spinner.el).css('position', 'abso');
	$(spinner.el).css('right', '175px');
	$(spinner.el).css('margin-top', '12px');
	$(spinner.el).css('background-color', '#FFFFFF');
	// $(spinner.el).css('bottom', '9px');
	return spinner;
}
