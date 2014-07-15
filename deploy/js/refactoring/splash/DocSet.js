var updatePeriod = 7; // # days between looking for updates
function DocSet(dsPath, cb, name) {
	this.checkUpgrade = function(oldDocset, t, skip) {
		t.state = 'checking';
		if (oldDocset) {
			var lastPath = t.dsPath + t.dsFilePath + '/Contents/Resources/LAST';
			if (!fs.existsSync() || differenceBetweenDays(parseInt(fs.readFileSync(lastPath).toString(), 10), new Date().getTime()) > updatePeriod) {
				t.state = 'downloading';
				downloadFile('http://newyork2.kapeli.com/feeds/' + t.name + '.xml', t.readFile, t.dsPath + t.dsFilePath + '/Contents/Resources/', t.name + '.xml', t);
			}
		} else {
			t.state = 'downloading';
			downloadFile('http://newyork2.kapeli.com/feeds/' + t.name + '.xml', t.readFile, t.dsPath, t.name + '.xml', t);
		}

		if (skip === true || skip === 1) {
			t.state = 'resting';
			t.div = addDocsToTable(t.name);
			if (cb) {
				cb();
			}
			
			fs.writeFile(t.dsPath + t.dsFilePath + '/Contents/Resources/LAST', String(new Date().getTime()));
			if (t.tempRow) {
				t.tempRow.remove();
			}

			if (t.spinner) {
				t.spinner.remove();
			}
		}
	};

	this.readFile = function(fp, t) {
		t.state = 'reading';
		var contents = fs.readFileSync(fp);
		XMLParser.parseString(contents, function(err, res){
			var version = res.entry.version[0];
			var versionfp = fp.substring(0, fp.lastIndexOf('/')) + '/VERSION';
			t.versionfp = versionfp;
			if (!fs.existsSync(versionfp) || fs.readFileSync(versionfp).toString() != version) {
				rimraf.sync(fp);
				fs.writeFileSync(versionfp, version);
				t.version = version;
				t.upgrade(res.entry.url[0], t);
			}
			else {
				t.state = 'resting';
				rimraf.sync(fp);
				t.div = addDocsToTable(t.name);

				if (cb) {
					cb();
				}

				fs.writeFile(t.dsPath + t.dsFilePath + '/Contents/Resources/LAST', String(new Date().getTime()));

				if (t.tempRow) {
					t.tempRow.remove();
				}

				if (t.spinner) {
					t.spinner.remove();
				}
			}
		});
	};

	this.upgrade = function(url, t) {
		t.state = 'downloading update';
		downloadFile(url, t.unpackUpgrade, t.dsPath.substring(0, t.dsPath.lastIndexOf('/')), undefined, t);
	};

	this.unpackUpgrade = function(tarPath, t) {
		t.state = 'decompressing update';
		rimraf.sync(t.dsPath);
		var newDir = tarPath.substring(0, tarPath.lastIndexOf('/')) + '/' + t.name;
		fs.mkdirSync(newDir);
		tarball.extractTarball(tarPath, newDir, function(err) {
			if (err) throw err;
			fs.writeFileSync(t.versionfp, t.version);
			t.locked = 0;
			rimraf.sync(tarPath);
			t.init(t, 1);
		});
	};

	this.finddsFilePath = function(t) {
		if (!t) {
			t = this;
		}

		var files = fs.readdirSync(t.dsPath);
		for (var i = 0; i < files.length; i++) {
			if (fs.lstatSync(t.dsPath + '/' + files[i]).isDirectory()) {
				return '/' + files[i];
			}
		}
	};

	this.removeSelf = function() {
		this.div.remove();
		rimraf(this.dsPath, function(){});
	};

	this.init = function(t, skip) {
		if (!t) {
			t = this;
			t.dsPath = dsPath;
		}

		t.state = 'initializing';

		if (name) { // means that we have to download a docset
			t.name = name;
			t.name = stripXMLAndPath(t.name);
			t.dsPath = process.cwd() + "/trustee_plugins/" + t.name;
			
			if (fs.existsSync(t.dsPath)) {
				rimraf.sync(t.dsPath);
			}

			fs.mkdirSync(t.dsPath);

			name = false;
			t.checkUpgrade(false, t);
		} else {
			t.dsFilePath = t.finddsFilePath(t);
			t.importPlist(t);
			t.db = new sqlite3.Database(t.dsPath + t.dsFilePath + '/Contents/Resources/docSet.dsidx');
			t.types = [];
			t.getTypes();
			t.checkUpgrade(true, t, skip);
		}
		
	};

	this.importPlist = function(t) {
		if (!t) t = this;
		var pFile = plist.parse(fs.readFileSync(t.dsPath + t.dsFilePath + "/Contents/Info.plist", 'utf8'));
		t.index = pFile['dashIndexFilePath'];
		t.isDashDocset = pFile['isDashDocset'];
		t.name = pFile['CFBundleName'].replace(/\s+/g, "_");
	};

	this.getTypes = function() {
		var t = this;
		if (!this.isDashDocset) return;
		var query = "SELECT DISTINCT type FROM searchIndex;";
		this.db.all(query, function (err, rows) {
			for (var i = 0; i < rows.length; i++) {
				t.types.push(rows[i].type);
			}
		});
	};

	this.getRowsInHTMLFile = function(file, cb) {
		file = file.substring(0, file.indexOf('#'));
		var query = "SELECT name, type, path FROM searchIndex WHERE path LIKE \"" + file + "%\";";
		this.db.all(query, function(err, rows) {
			if (err) {
				throw err;
			}
			
			cb(rows, 'getRowsInHTMLFile');
		});
	};

	this.getRowsOfType = function(type, cb) {
		var query = "SELECT name, path FROM searchIndex WHERE type=\"" + type + "\";";
		this.db.all(query, function(err, rows) {
			if (err) {
				throw err;
			}

			cb(rows, 'getAllRowsOfType');
		});
	};

	this.getAllRows = function(cb) {
		var query = "SELECT name, type, path FROM searchIndex";
		this.db.all(query, function(err, rows) {
			if (err) {
				throw err;
			}

			cb(rows, 'getAllRows');
		});
	};

	this.searchRows = function(cb, searchTerm, termLimit) {
		var query = "SELECT name, type, path FROM searchIndex WHERE NAME LIKE \"%" + searchTerm + "%\" ORDER BY LOWER(name) LIMIT " + termLimit + ";";
		this.db.all(query, function(err, rows) {
			if (err) {
				throw err;
			}

			cb(rows, 'searchRows');
		});
	};

	this.init();
}