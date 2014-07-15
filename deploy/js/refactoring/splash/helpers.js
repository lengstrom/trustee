function differenceBetweenDays(day1, day2) {
	return Math.abs((day1 - day2)/(86400000)); //(1000 * 60 * 60 * 24));
}

function getDirs() {
	var d = fs.readdirSync(process.cwd() + "/trustee_plugins"); //get names of files / directories inside /trustee_plugins
	var dirs = []; //array to store all the directories within /trustee_plugins
	var currentPath = process.cwd() + "/trustee_plugins/"; //so that we don't have to constantly write the absolute path
	d.forEach(function(o) { //push every directory listed in the names inside of /trustee_plugins
		var stat = fs.statSync(currentPath + o);
		if (stat.isDirectory()) dirs.push(currentPath + o);
	});

	return dirs;
}

function getExtension(filename) {
	var ext = path.extname(filename||'').split('.');
	return ext[ext.length - 1];
}

function downloadFile(url, cb, dir, name, t) {
	var out = name;
	if (out === undefined) {
		out = url;
	}
	while (out.indexOf('/') > -1) {
		out = out.substr(out.indexOf("/") + 1);
	}

	var file = fs.createWriteStream(dir + '/' + out);

	var request = http.get(url, function(response) {
		response.pipe(file).on('finish', function(){
			cb(dir + '/' + out, t);
		});
	});
}

function stripXMLAndPath(s) {
	if (s.indexOf('/') > -1) {
		s = s.substr(s.indexOf('/') + 1);
	}

	if (s.indexOf('.xml') > -1) {
		s = s.substring(0, s.indexOf('.xml'));
	}

	return s.replace(/\s+/g, "_");
}

function removeUnderscores(n) {
	return n.replace(/_/g," ");
}