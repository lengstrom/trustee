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
	return spinner;
}

function addDocsToTable(name, notFoundPath, reason) {
	if ($('#noDocs').length) {
		$('#noDocs').hide();
	}

	var row = $("<div>", {class:'row downloaded'});
	var input = $("<input>", {class:'docCheckbox', type:'checkbox'});
	// if (active) {
		input.prop('checked', true);
	// }
	// else {
	// 	input.prop('checked', false);
	// }

	// input.bind('click', function() {
	// 	if ($(this).prop('checked')) {
	// 		setActive(this.dir, 1);
	// 	}
	// 	else if ($(this).prop('checked') === false) {
	// 		setActive(this.dir, 0);
	// 	}
	// });

	var title = $("<div>", {class:'docTitle', text:removeUnderscores(name)});
	// var update = $("<div>", {class:'btn updateBtn'});
	// var updateText = $("<div>", {class:'updateText',text:'Update'});
	// update.append(updateText);
	var remove = $("<div>", {class:'btn removeBtn'});
	var removeText = $("<div>", {class:'removeText',text:'Remove'});
	remove.append(removeText);
	var icon = $("<img>", {src:'img/Dash/' + docSets[name + '.xml'].icon + '.png', class:'icon'})

	row.append(input);
	row.append(icon);
	row.append(title);
	// row.append(update);
	row.append(remove);
	$('#dlDocsTable').append(row);
	//apply handlers if its found

	if (notFoundPath) {
		$(row).css("background-color", "#c0392b");
		remove.remove();
		// update.remove();
		title.html(title.html() + ' - ' + reason + ': ' + notFoundPath + ". <b>Click to reload.</b>");
		row.css('cursor', 'pointer');
		row.bind('click', clickBrokenRow);

		input.remove();
	}
	else {
		row[0].tTitle = title;

		title.addClass('titleNoError');
		// update[0].name = name;
		// update[0].row = row;

		remove[0].name = name;
		remove[0].row = row;

		input[0].name = name;

		// update.bind('click', clickUpdateDocs);
		remove.bind('click', clickRemoveDocs);
	}

	return row;
}

function addAvailableDoc(name) {
	//todo: add 
	var row = $("<div>", {class:'row available'});
	var title = $("<div>", {class:'docTitle', text:removeUnderscores(name)});
	var download = $("<div>", {class:'btn updateBtn downloadBtn'});
	download[0].row = row;
	download[0].name = name;
	var downloadText = $("<div>", {class:'downloadText',text:'Download'});
	var icon = $("<img>", {src:'img/Dash/' + docSets[name + '.xml'].icon + '.png', class:'icon'})
	row.append(icon);
	download.bind('click', clickUpdateDocs);
	row.append(title);
	download.append(downloadText);
	row.append(download);
	$('#availDocsTable').append(row);
}