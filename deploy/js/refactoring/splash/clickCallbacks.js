// $('#reloadDocs').bind('click', reloadDocs);
// $('#reloadAvailDocs').bind('click', reloadAvailDocs);

// setTimeout(reloadDocs, 1);

//keep
function clickRemoveDocs() {
	parent.Trustee.docs[this.name].removeSelf();
}

function clickUpdateDocs() {
	$('.alertCont').remove();
	var ds = parent.Trustee.docs[this.name];
	var spinner = makeCustomSpinner();
	this.row.append(spinner.el);
	this.name = stripXMLAndPath(this.name);
	this.spinner = spinner.el;
	if (ds !== undefined) {
		if (ds.state != 'resting') return;
		ds.spinner = this.spinner;
		this.spinner.className = 'spinner spinner-left';
		ds.checkUpgrade(true, ds);
	} else {
		ds = new DocSet(false, false, this.name);
		parent.Trustee.docs[this.name] = ds;
		ds.tempRow = this.row;
		ds.spinner = this.spinner;
		this.spinner.className = 'spinner spinner-right';
	}
}