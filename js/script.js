
var spriteImageCount = 0;
var animationCount = 0;
var spriteAnimations = {};
var currentAnimation = 0;
var currentAnimationList;
var currentEditFrame;
var loopOnlyUntilCurrentEditFrame = true;
var animationPlaying = true;
var extraMarginTopBottom = 1;
var extraMarginLeftRight = 1;
var currentMaxWidth = 0;
var currentMaxHeight = 0;

var spriteEditor;
var animationsContainer;

function addNewAnimation()
{
	animationCount++;
	animationsContainer.append('<div id="anim_'+animationCount+'" class="dropzone" data-framerate="5">\
		<div class="note">Drag and drop image files</div>\
		<div class="options">\
			<a href="#" class="button action-toggle-body-collider">Enable body collider</a>\
			<a href="#" class="button action-toggle-attack-collider">Enable attack collider</a>\
			<input type="text" class="anim_name" value="anim'+animationCount+'" />\
		</div>\
	</div>');
}
function setCurrentAnimation(i)
{
	currentAnimation = i;
	var selectedLabel = $('#selected-anim-label');
	if(!selectedLabel.length) { // create label
		selectedLabel = $('<div id="selected-anim-label"></div>');
	}
	var selectedAnimDropzone = selectedLabel.parent();
	if(selectedAnimDropzone.length) {
		selectedAnimDropzone.removeClass('selected');
	}
	var currentDropzone = animationsContainer.find('.dropzone').eq(i);
	currentDropzone.addClass('selected').prepend(selectedLabel);
	currentAnimationList = currentDropzone.find('.sprite');
	$('#preview-anim-speed .val').text(getAnimationValue('framerate'));
	updatePreviewTimer();
}
function saveAnimationValue(name, value)
{
	animationsContainer.find('.dropzone').eq(currentAnimation).data(name, value);
}
function getAnimationValue(name)
{
	return animationsContainer.find('.dropzone').eq(currentAnimation).data(name);
}
function saveValueToFrame(frameIndex, name, value)
{
	currentAnimationList.eq(frameIndex).data(name, value);
}
function getValueFromFrame(frameIndex, name)
{
	return currentAnimationList.eq(frameIndex).data(name);
}
var previewTimer;
var previewCurrentFrame = 0;
function updatePreviewTimer()
{
	var rate = $('#preview-anim-speed .val').text();
	if(previewTimer != null) {
		clearInterval(previewTimer);
	}
	previewTimer = setInterval(updatePreview, 1000/rate)
}
function setPreviewFrame(currentAnimFrame)
{
	if(currentEditFrame != null && currentEditFrame[0].id == currentAnimFrame[0].id) {
		$('#anim-preview').addClass('selected');
	} else {
		$('#anim-preview').removeClass('selected');
	}
	currentAnimationList.removeClass('current');
	currentAnimFrame.addClass('current');
	var previewImageCont = $('#anim-preview');
	var oldHeight = previewImageCont.innerHeight();
	$('#anim-preview img').attr('src', currentAnimFrame.find('img').attr('src'));
	$('#anim-preview').css('padding-left', currentAnimFrame.css('padding-left'));
	$('#anim-preview').css('padding-right', currentAnimFrame.css('padding-right'));
	$('#anim-preview').css('padding-top', currentAnimFrame.css('padding-top'));
	$('#anim-preview').css('padding-bottom', currentAnimFrame.css('padding-bottom'));
	var newHeight = previewImageCont.innerHeight();
	if(Math.abs(newHeight - oldHeight) > 5) {
		refreshPreviewScale();
	}
	
	// Check if any colliders are enabled
	if(getAnimationValue('bodyCollider') == 1) {
		// set collider origin and size
		var bodyCollider = currentAnimFrame.data('bodyCollider');
		$('#anim-preview-body-collider').css({top: bodyCollider.origin.y, left:bodyCollider.origin.x, width:bodyCollider.width, height:bodyCollider.height});
		// apply values to editor fields
		//$('#body-collider-width .val').text(bodyCollider.width);
		//$('#body-collider-height .val').text(bodyCollider.height);
		// show collider
		$('#anim-preview').addClass('show-body-collider');
	} else {
		// reset body collider to hidden
		$('#anim-preview').removeClass('show-body-collider');
	}
	
	if(getAnimationValue('attackCollider') == 1) {
		// set collider origin and size
		var attackCollider = currentAnimFrame.data('attackCollider');
		$('#anim-preview-attack-collider').css({top: attackCollider.origin.y, left:attackCollider.origin.x, width:attackCollider.width, height:attackCollider.height});
		// apply values to editor fields
		//$('#attack-collider-width .val').text(attackCollider.width);
		//$('#attack-collider-height .val').text(attackCollider.height);
		// show collider
		$('#anim-preview').addClass('show-attack-collider');
	} else {
		// reset attack collider to hidden
		$('#anim-preview').removeClass('show-attack-collider');
	}
}
function updatePreview()
{
	if(!currentAnimationList.length) {
		return; // no sprite images yet
	}
	if(!animationPlaying) {
		return;
	}
	previewCurrentFrame++;
	if(previewCurrentFrame >= currentAnimationList.length) {
		previewCurrentFrame = 0;
	}
	
	var currentAnimFrame = currentAnimationList.eq(previewCurrentFrame);
	if(loopOnlyUntilCurrentEditFrame && currentEditFrame != null && currentEditFrame[0].id == currentAnimFrame[0].id) {
		previewCurrentFrame = currentAnimationList.length; // will reset to 0 in next round
	}
	setPreviewFrame(currentAnimFrame);
}
function processPaddingOnCurrentAnimation()
{
	processPaddingOnAnimation(currentAnimation);
	refreshPreviewScale();
}
function processPaddingOnAnimation(animationIndex)
{
	var dropzone = animationsContainer.find('.dropzone').eq(animationIndex);
	animationList = dropzone.find('.sprite');
	
	var maxHeight = 0;
	var maxWidth = 0;
	animationList.each(function() {
		var obj = $(this);
		var img = obj.find('img');
		var imgWidth = img.width();
		var imgHeight = img.height();
		var heightShift = 0;
		var widthShift = 0;
		if(obj.data('shiftHorizontal')) {
			widthShift += Math.abs(obj.data('shiftHorizontal'));
		}
		if(typeof obj.data('shiftVertical') != 'undefined') {
			heightShift += Math.abs(obj.data('shiftVertical'));
		}
		
		if(imgWidth + widthShift > maxWidth) {
			maxWidth = imgWidth + widthShift;
		}
		if(imgHeight + heightShift > maxHeight) {
			maxHeight = imgHeight + heightShift;
		}
	});
	
	var needToUpdateAllOtherAnimations = false;

	if(maxHeight > currentMaxHeight) {
		currentMaxHeight = maxHeight;
		needToUpdateAllOtherAnimations = true;
	} else {
		maxHeight = currentMaxHeight;
	}
	if(maxWidth > currentMaxWidth) {
		currentMaxWidth = maxWidth;
		needToUpdateAllOtherAnimations = true;
	} else {
		maxWidth = currentMaxWidth;
	}
	
	var extraHoriSpace = currentMaxHeight - maxHeight;
	var extraVertSpace = currentMaxWidth = maxWidth;

	var extraLeftPadding = Math.floor(extraHoriSpace / 2);
	var extraRightPadding = extraHoriSpace - extraLeftPadding;
	var extraTopPadding = Math.floor(extraVertSpace / 2);
	var extraBottomPadding = extraVertSpace - extraTopPadding;

	saveAnimationValue('frameHeight', maxHeight);
	saveAnimationValue('frameWidth', maxWidth);

	animationList.each(function() {
		var obj = $(this);
		//console.log(obj);
		//console.log(obj.data());
		var img = obj.find('img')[0];
		var imgWidth = img.width;
		var imgHeight = img.height;
		var shiftHori = obj.data('shiftHorizontal');
		if(typeof shiftHori == 'undefined') {
			shiftHori = 0;
		}
		var shiftVert = obj.data('shiftVertical');
		//console.log(shiftVert);
		if(typeof shiftVert == 'undefined') {
			shiftVert = 0;
		}
		
		var bodyCollider = obj.data('bodyCollider');
		var attackCollider = obj.data('attackCollider');

		if(imgWidth < maxWidth) {
			var paddingHori = maxWidth-imgWidth-Math.abs(shiftHori);
			var paddingLeft = Math.floor(paddingHori/2);
			var paddingRight = paddingHori-paddingLeft;

			if(shiftHori < 0) {
				paddingRight += -shiftHori;
			} else if(shiftHori > 0) {
				paddingLeft += shiftHori;
			}
			var oldPaddingLeft = parseInt(obj.css('padding-left'));
			
			// shift body and attack colliders by difference in paddings
			if(typeof bodyCollider != 'undefined') {
				bodyCollider.origin.x += paddingLeft - oldPaddingLeft;
			}
			if(typeof attackCollider != 'undefined') {
				attackCollider.origin.x += paddingLeft - oldPaddingLeft;
			}

			obj.css('padding-left', paddingLeft);
			obj.css('padding-right', paddingRight);
		} else {
			obj.css('padding-left', 0);
			obj.css('padding-right', 0);
		}
		if(imgHeight < maxHeight) {
			var paddingVert = maxHeight-imgHeight-Math.abs(shiftVert);
			var paddingTop = Math.floor(paddingVert/2);
			var paddingBottom = paddingVert-paddingTop;

			//console.log('shiftVert: '+shiftVert);
			if(shiftVert < 0) {
				paddingBottom += -shiftVert;
			} else if(shiftVert > 0) {
				paddingTop += shiftVert;
			}
			var oldPaddingTop = parseInt(obj.css('padding-top'));
			
			// shift body and attack colliders by difference in paddings
			if(typeof bodyCollider != 'undefined') {
				bodyCollider.origin.y += paddingTop - oldPaddingTop;
			}
			if(typeof attackCollider != 'undefined') {
				attackCollider.origin.y += paddingTop - oldPaddingTop;
			}
			
			obj.css('padding-top', paddingTop);
			obj.css('padding-bottom', paddingBottom);
		} else {
			obj.css('padding-top', 0);
			obj.css('padding-bottom', 0);
		}
	});
	
	//console.log('maxHeight: '+maxHeight);
	//console.log('maxWidth: '+maxWidth);
}

function selectFrameToEdit(frame)
{
	if(typeof frame == 'undefined')
	{
		if(currentEditFrame != null) {
			currentEditFrame.removeClass('selected');
		}
		currentEditFrame = null;
		
		$('#collider-edit-controls').hide();
	}
	else
	{
		if(currentEditFrame != null) {
			currentEditFrame.removeClass('selected');
		}
		currentEditFrame = frame;
		//console.log('selected frame data:');
		//console.log(frame.data());
		currentEditFrame.addClass('selected');
		
		// if paused set the currently previewed frame to the selected ond
		if(!animationPlaying) {
			previewCurrentFrame = currentAnimationList.index(frame);
			setPreviewFrame(frame);
			console.log('Setting current frame to: '+previewCurrentFrame);
		}
		if(getAnimationValue('bodyCollider') == 1) {
			var bodyCollider = frame.data('bodyCollider');
			// apply values to editor fields
			$('#body-collider-width .val').text(bodyCollider.width);
			$('#body-collider-height .val').text(bodyCollider.height);
		}
		if(getAnimationValue('attackCollider') == 1) {
			var attackCollider = frame.data('attackCollider');
			// apply values to editor fields
			$('#attack-collider-width .val').text(attackCollider.width);
			$('#attack-collider-height .val').text(attackCollider.height);
		}

		$('#collider-edit-controls').show();
	}
}
function saveFile(saveLink, data, filename, raw)
{
	var writedata;
	if(typeof raw != 'undefined' && raw) {
		writedata = data;
	} else {
		writedata = 'data:text/plain;charset=utf-u,'+encodeURIComponent(data);
	}
	saveLink[0].setAttribute('href', writedata);
	saveLink[0].setAttribute('download', filename);
}
function saveProject()
{
	// dump all data into spriteAnimations
	spriteAnimations = {};
	var yOffset = 0;
	animationsContainer.find('.dropzone').each(function() {
		var obj = $(this);
		var anim = {
			data: $.extend(true, {}, obj.data()),
			sprites: []
		};
		anim.data.frameWidth += extraMarginLeftRight*2;
		anim.data.frameHeight += extraMarginTopBottom*2;
		anim.data.xOffset = 0;
		anim.data.yOffset = yOffset;
		anim.data.marginTopBottom = extraMarginTopBottom;
		anim.data.marginLeftRight = extraMarginLeftRight;
		var animName = $.trim(obj.find('.anim_name').first().val());
		
		// process each sprite
		obj.find('.sprite').each(function() {
			var sprite = $(this);
			/*var spriteShiftVert = sprite.data('shiftVertical');
			if(typeof spriteShiftVert == 'undefined') {
				spriteShiftVert = 0;
			}
			var spriteShiftHori = sprite.data('shiftHorizontal');
			if(typeof spriteShiftHori == 'undefined') {
				spriteShiftHori = 0;
			}
			var spriteData = {shiftVertical: spriteShiftVert, shiftHorizontal: spriteShiftHori};
			*/
			var spriteData = {shiftVertical: 0, shiftHorizontal: 0};
			$.extend(spriteData, sprite.data());
			var spriteData = {
				data: spriteData,
				image: sprite.find('img').attr('src'),
				width: sprite.find('img').width(),
				height: sprite.find('img').height()
			};
			anim.sprites.push(spriteData);
		});
		yOffset += anim.data.frameHeight;
		
		spriteAnimations[animName] = anim;
	});
}
function saveProjectAs(linkElement)
{
	var projectName = $.trim($('#project-name').val());
	if(projectName == '') {
		alert('You must enter a project name');
		$('#project-name').focus();
		return false;
	}
	
	saveProject();

	var project = {
		name: projectName,
		animations: spriteAnimations
	};
	
	saveFile(linkElement, JSON.stringify(project, null, 2), projectName+'.json' );
	
	return true;
}
function exportProject(linkElement)
{
	var projectName = $.trim($('#project-name').val());

	// save the current project data
	saveProject();

	// create files and set download links in export dialog
	generateSpritesheet(true);
	
	// get data from canvas
	var canvas = $('#spritesheet-canvas')[0];
	var png = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
	
	var dataFilename = 'data-file.json';
	var spritesheetFilename = 'spritesheet.png';
	if(projectName != '') {
		dataFilename = projectName+'_'+dataFilename;
		spritesheetFilename = projectName+'_'+spritesheetFilename;
	}
	
	saveFile($('#data-file'), JSON.stringify(spriteAnimations, null, 2), dataFilename);
	saveFile($('#spritesheet-file'), png, spritesheetFilename, true);
	
	$('#export-info-wrapper').show();
}
function generateSpritesheet(doNotSave)
{
	if(typeof doNotSave == undefined || !doNotSave) {
		saveProject();
	}
	var canvas = $('#spritesheet-canvas')[0];
	if(!canvas.getContext) {
		console.log('canvas not supported');
		return; // canvas not supported
	}
	var canvasCtx = canvas.getContext('2d');

	// loop through all animations to calculate the width and height of the generated spritesheet
	var curX = 0;
	var curY = 0;
	var curWidth = 0;
	var curHeight = 0;
	$.each(spriteAnimations, function(key, obj) {
		// get animation info
		var frameWidth = obj.data.frameWidth + extraMarginLeftRight*2;
		var frameHeight = obj.data.frameHeight + extraMarginTopBottom*2;

		// check if we need to grow the canvas
		var newWidth = frameWidth * obj.sprites.length;
		var newHeight = curY + frameHeight;
		if(newWidth > curWidth) {
			curWidth = newWidth;
		}
		if(newHeight > curHeight) {
			curHeight = newHeight;
		}
		curY += frameHeight;
	});
	/*for(var i=0; i<spriteAnimations.length; i++)
	{
		var obj = spriteAnimations[i];
		// get animation info
		var frameWidth = obj.data.frameWidth;
		var frameHeight = obj.data.frameHeight;

		// check if we need to grow the canvas
		var newWidth = frameWidth * obj.sprites.length;
		var newHeight = curY + frameHeight;
		if(newWidth > curWidth) {
			curWidth = newWidth;
		}
		if(newHeight > curHeight) {
			curHeight = newHeight;
		}
		curY += frameHeight;
	}*/
	// resize the canvas
	canvas.width = curWidth;
	canvas.height = curHeight;
	
	// loop through all animations and draw sprites to canvas
	curX = 0;
	curY = 0;
	$.each(spriteAnimations, function(key, obj) {
		console.log('start animation');
		// get animation info
		var framerate = obj.data.framerate;
		var frameWidth = obj.data.frameWidth;// + extraMarginLeftRight*2;;
		var frameHeight = obj.data.frameHeight;// + extraMarginTopBottom*2;;

		// loop through animation frames
		for(var j=0; j<obj.sprites.length; j++)
		{
			console.log('start frame');
			var spriteWidth = obj.sprites[j].width;
			var spriteHeight = obj.sprites[j].height;
			var shiftVertical = obj.sprites[j].data.shiftVertical;
			var shiftHorizontal = obj.sprites[j].data.shiftHorizontal;
			var bodyCollider = obj.sprites[j].data.bodyCollider;
			var attackCollider = obj.sprites[j].data.attackCollider;
			if(typeof shiftVertical == 'undefined') {
				shiftVertical = 0;
			}
			if(typeof shiftHorizontal == 'undefined') {
				shiftHorizontal = 0;
			}
			
			var paddingHori = frameWidth-spriteWidth-Math.abs(shiftHorizontal);
			var paddingLeft = Math.floor(paddingHori/2);
			var paddingVert = frameHeight-spriteHeight-Math.abs(shiftVertical);
			console.log('frameHeight: '+frameHeight+' spriteHeight: '+spriteHeight+' shiftVertical: '+shiftVertical);
			console.log('frameWidth: '+frameWidth+' spriteWidth: '+spriteWidth+' shiftHorizontal: '+shiftHorizontal);
			var paddingTop = Math.floor(paddingVert/2);
			var xOffset = paddingLeft;
			var yOffset = paddingTop;
			if(shiftVertical > 0) {
				yOffset += shiftVertical;
			}
			if(shiftHorizontal > 0) {
				xOffset += shiftHorizontal;
			}

			var image = new Image();
			//image.onload = function() {
			//	canvasCtx.drawImage(image, 0, 0, spriteWidth, spriteHeight);
			//};
			image.src = obj.sprites[j].image;
			console.log('xOffset: '+xOffset+' yOffset: '+yOffset);
			canvasCtx.drawImage(image, 0, 0, spriteWidth, spriteHeight, curX+xOffset, curY+yOffset, spriteWidth, spriteHeight);
			//canvasCtx.drawImage(image, curX+xOffset, curY+yOffset, spriteWidth, spriteHeight, 0, 0, spriteWidth, spriteHeight);
			
			curX += frameWidth;
		}
		curX = 0;
		curY += frameHeight;
	});
	/*for(var i=0; i<spriteAnimations.length; i++)
	{
		console.log('start animation');
		var obj = spriteAnimations[i];
		// get animation info
		var framerate = obj.data.framerate;
		var frameWidth = obj.data.frameWidth;
		var frameHeight = obj.data.frameHeight;

		// loop through animation frames
		for(var j=0; j<obj.sprites.length; j++)
		{
			console.log('start frame');
			var spriteWidth = obj.sprites[j].width;
			var spriteHeight = obj.sprites[j].height;
			var shiftVertical = obj.sprites[j].data.shiftVertical;
			var shiftHorizontal = obj.sprites[j].data.shiftHorizontal;
			var bodyCollider = obj.sprites[j].data.bodyCollider;
			var attackCollider = obj.sprites[j].data.attackCollider;
			if(typeof shiftVertical == 'undefined') {
				shiftVertical = 0;
			}
			if(typeof shiftHorizontal == 'undefined') {
				shiftHorizontal = 0;
			}
			
			var paddingHori = frameWidth-spriteWidth-Math.abs(shiftHorizontal);
			var paddingLeft = Math.floor(paddingHori/2);
			var paddingVert = frameHeight-spriteHeight-Math.abs(shiftVertical);
			var paddingTop = Math.floor(paddingVert/2);
			var xOffset = paddingLeft;
			var yOffset = paddingTop;
			if(shiftVertical > 0) {
				yOffset += shiftVertical;
			}
			if(shiftHorizontal > 0) {
				xOffset += shiftHorizontal;
			}

			var image = new Image();
			//image.onload = function() {
			//	canvasCtx.drawImage(image, 0, 0, spriteWidth, spriteHeight);
			//};
			image.src = obj.sprites[j].image;
			canvasCtx.drawImage(image, 0, 0, spriteWidth, spriteHeight, curX+xOffset, curY+yOffset, spriteWidth, spriteHeight);
			
			curX += frameWidth;
		}
		curX = 0;
		curY += frameHeight;
	}*/
}
function refreshPreviewScale()
{
	var scale = Number($('#preview-anim-zoom .val').text());
	var newHeight = $('#anim-preview').outerHeight() * scale;
	$('#anim-preview').css('transform', 'scale('+scale+', '+scale+')');
	$('#anim-preview-cont').height(newHeight);
}
function loadProjectFile()
{
	var input, file, fr;
	
	console.log('start project load');

	if (typeof window.FileReader !== 'function') {
		alert("File API is not supported on your browser");
		return;
    }

    input = document.getElementById('json-project-file');
    if (!input) {
		alert('fail');
		return;
    }
    else if (!input.files) {
		alert("Action not supported");
    }
    else if (!input.files[0]) {
		alert("You must select a file to import");
    }
    else
	{
		console.log('Found file');
		
		file = input.files[0];
		fr = new FileReader();
		fr.onload = receivedJSONFile;
		fr.readAsText(file);
    }

	function receivedJSONFile(e) {
		console.log('Received File');

		lines = e.target.result;
		var jsonObj = JSON.parse(lines);
		importProjectFile(jsonObj);
	}
}
function importProjectFile(jsonObj)
{
	if(typeof jsonObj == 'undefined') {
		return;
	}
	
	console.log('start project import');
	console.log(jsonObj);
	
	// check if project file
	if(typeof jsonObj.animations != 'undefined') {
		if(typeof jsonObj.name != 'undefined') {
			$('#project-name').val(jsonObj.name);
		}
		jsonObj = jsonObj.animations;
	}
	
	// increment spriteImageCount for each sprite
	// increment animationCount per animati0on
	// add anim div to anims container
	// add sprite divs to anim div
	// set current animation to first. setCurrentAnimation(0);
	// set extraMarginTopBottom
	// set extraMarginLeftRight
	
	var topBottomMargin;
	var leftRightMargin;
	
	var counter = 0;
	
	console.log('looping through animations');
	
	$.each(jsonObj, function(animName, anim) {
		counter++;
		console.log('anim: '+counter);
		if(counter == 1) {
			topBottomMargin = anim.data.marginTopBottom;
			leftRightMargin = anim.data.marginLeftRight;
		}
		else
		{
			// create new blank animation
			addNewAnimation();
		}
		// set animation as current
		setCurrentAnimation(animationCount-1);
		// get newly created animation container
		var animContainer = $('#anim_'+animationCount);
		// hide "drag and drop" note
		animContainer.find('.note').hide();
		// set animation name
		animContainer.find('.anim_name').val(animName);
		var hasBodyCollider = false;
		var hasAttackCollider = false;
		// enable body and attack collider for animation if set
		if(anim.data.bodyCollider == 1) {
			hasBodyCollider = true;
			animContainer.find('.action-toggle-body-collider').click();
		}
		if(anim.data.attackCollider == 1) {
			hasAttackCollider = true;
			animContainer.find('.action-toggle-attack-collider').click();
		}
		console.log('hasBodyCollider: '+hasBodyCollider);
		// set framerate
		var framerate = anim.data.framerate;
		if(typeof framerate == 'undefined') {
			framerate = 1;
		}
		// add each sprite
		for(var i=0; i<anim.sprites.length; i++)
		{
			spriteImageCount++;
					
			var sprite = $('<div id="sprite_'+spriteImageCount+'" class="sprite">\
			</div>');

			var img = document.createElement('img');
			img.src = anim.sprites[i].image;

			// if bodyCollider is enabled add it
			if(hasBodyCollider) {
				//sprite.data('bodyCollider', anim.sprites[i].data.bodyCollider);
			}
			// if attackCollider is enabled add it
			if(hasAttackCollider) {
				//sprite.data('attackCollider', anim.sprites[i].data.attackCollider);
			}
			sprite.data(anim.sprites[i].data);
			// add image to sprite div
			sprite.append(img);
			
			// add sprite div to anim container
			animContainer.append(sprite);
		}
		
		// set this animation as current and process padding on it
		currentAnimationList = animContainer.find('.sprite');
		processPaddingOnCurrentAnimation();
	});
	
	setCurrentAnimation(0);

	// set global spritesheet margins
	extraMarginTopBottom = (typeof topBottomMargin == 'undefined') ? 1 : topBottomMargin;
	extraMarginLeftRight = (typeof leftRightMargin == 'undefined') ? 1 : leftRightMargin;
}

// onload
$(function() {
	
	spriteEditor = $('#sprite-editor');
	animationsContainer = $('#anims');
	
	addNewAnimation();
	setCurrentAnimation(0);
	updatePreviewTimer();

	// set initial zoom
	$('#preview-anim-zoom .val').text(2);
	refreshPreviewScale();

    animationsContainer.on('dragover', '.dropzone', function(e) {
		e = e.originalEvent;
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });

    // Get file data on drop
    animationsContainer.on('drop', '.dropzone', function(e) {
		var obj = this;
		e = e.originalEvent;
        e.stopPropagation();
        e.preventDefault();
        var files = e.dataTransfer.files; // Array of all files
        for (var i=0, file; file=files[i]; i++) {
            if (file.type.match(/image.*/)) {
                var reader = new FileReader();
                reader.onload = function(e2) { // finished reading file data.
                    var img = document.createElement('img');
                    img.src = e2.target.result;
					spriteImageCount++;
					
					// hide "drag and drop" note
					$(obj).find('.note').hide();
					console.log($(obj));
					console.log($(obj).find('.note').length);
					
					var hasBodyCollider = $(obj).data('bodyCollider');
					var hasAttackCollider = $(obj).data('attackCollider');
					
					var sprite = $('<div id="sprite_'+spriteImageCount+'" class="sprite">\
					</div>');
					
					// if bodyCollider is enabled add a new one to this frame
					if(typeof hasBodyCollider != 'undefined' && hasBodyCollider == 1) {
						sprite.data('bodyCollider', {
							origin:{x:0, y:0},
							width:20,
							height:20,
						});
					}
					// if attackCollider is enabled add a new one to this frame
					if(typeof hasAttackCollider != 'undefined' && hasAttackCollider == 1) {
						sprite.data('attackCollider', {
							origin:{x:0, y:0},
							width:10,
							height:10,
						});
					}

					sprite.append(img);
					
					$(obj).append(sprite);
					
					currentAnimationList = $(obj).find('.sprite');
					processPaddingOnCurrentAnimation();
                }
                reader.readAsDataURL(file); // start reading the file data.
			}
		}
		setCurrentAnimation($(obj).index());
	});
    animationsContainer.on('click', '.dropzone', function(e) {
		setCurrentAnimation($(this).index());
	});
	animationsContainer.on('scroll', function() {
		var obj = $(this);
		if(obj.scrollTop() > 0) {
			obj.parent().find('.shadow-top').show();
		} else {
			obj.parent().find('.shadow-top').hide();
		}
		if(obj[0].scrollHeight - obj.scrollTop() == obj.outerHeight()) {
			obj.parent().find('.shadow-bottom').hide();
		} else {
			obj.parent().find('.shadow-bottom').show();
		}
	});
	$('#anims').on('click', '.sprite', function(e) {
		selectFrameToEdit($(this));
	});
	
	/***************************************************************/
	// Action Events
	$('#action-add-anim').click(function() {
		addNewAnimation();
		return false;
	});
	$('#action-process-spacing').click(function() {
		processPaddingOnCurrentAnimation();
		return false;
	});
	$('#action-save-project').click(function() {
		// Save project data
		saveProject();
		
		return false;
	});
	$('#action-save-project-as').click(function() {
		// Create JSON file of all data
		return saveProjectAs($(this));
	});
	$('#action-export').click(function() {
		exportProject();
		return false;
	});
	$('#preview-dec-speed').click(function() {
		var curValue = $('#preview-anim-speed .val').text();
		curValue--;
		if(curValue > 0) {
			$('#preview-anim-speed .val').text(curValue);
			updatePreviewTimer();
		}
		saveAnimationValue('framerate', curValue);
		return false;
	});
	$('#preview-inc-speed').click(function() {
		var curValue = $('#preview-anim-speed .val').text();
		curValue++;
		$('#preview-anim-speed .val').text(curValue);
		updatePreviewTimer();
		saveAnimationValue('framerate', curValue);
		return false;
	});
	$('#preview-dec-zoom').click(function() {
		var curValue = Number($('#preview-anim-zoom .val').text());
		curValue -= 0.1;
		curValue = Number(curValue.toFixed(1));
		if(curValue > 0) {
			$('#preview-anim-zoom .val').text(curValue);
			var newHeight = $('#anim-preview').outerHeight() * curValue;
			$('#anim-preview').css('transform', 'scale('+curValue+', '+curValue+')');
			$('#anim-preview-cont').height(newHeight);
		}
		return false;
	});
	$('#preview-inc-zoom').click(function() {
		var curValue = Number($('#preview-anim-zoom .val').text());
		curValue += 0.1;
		curValue = Number(curValue.toFixed(1));
		$('#preview-anim-zoom .val').text(curValue);
		var newHeight = $('#anim-preview').outerHeight() * curValue;
		$('#anim-preview').css('transform', 'scale('+curValue+', '+curValue+')');
		$('#anim-preview-cont').height(newHeight);
		return false;
	});
	$('#preview-play').click(function() {
		animationPlaying = true;
		return false;
	});
	$('#preview-pause').click(function() {
		animationPlaying = false;
		return false;
	});
	$('#frame-shift-up').click(function() {
		if(currentEditFrame != null)
		{
			var shift = currentEditFrame.data('shiftVertical');
			if(!shift) {
				shift = 0;
			}
			shift--;
			currentEditFrame.data('shiftVertical', shift);
			processPaddingOnCurrentAnimation();
		}
		return false;
	});
	$('#frame-shift-down').click(function() {
		if(currentEditFrame != null)
		{
			var shift = currentEditFrame.data('shiftVertical');
			if(!shift) {
				shift = 0;
			}
			shift++;
			currentEditFrame.data('shiftVertical', shift);
			processPaddingOnCurrentAnimation();
		}
		return false;
	});
	$('#frame-shift-left').click(function() {
		if(currentEditFrame != null)
		{
			var shift = currentEditFrame.data('shiftHorizontal');
			if(!shift) {
				shift = 0;
			}
			shift--;
			currentEditFrame.data('shiftHorizontal', shift);
			processPaddingOnCurrentAnimation();
		}
		return false;
	});
	$('#frame-shift-right').click(function() {
		if(currentEditFrame != null)
		{
			var shift = currentEditFrame.data('shiftHorizontal');
			if(!shift) {
				shift = 0;
			}
			shift++;
			currentEditFrame.data('shiftHorizontal', shift);
			processPaddingOnCurrentAnimation();
		}
		return false;
	});
	$('#anims').on('click', '.action-toggle-body-collider', function() {
		console.log('action-body-toggle');
		var curStatus = getAnimationValue('bodyCollider');
		console.log('status: '+curStatus);
		if(curStatus == 1) { // disable it
			saveAnimationValue('bodyCollider', 0);
			$(this).text('Enable Body Collider');
		} else {
			saveAnimationValue('bodyCollider', 1);
			console.log('saved anim value');
			console.log($(this));
			$(this).text('Disable Body Collider');
			// go through each frame to make sure they all have a collider defined
			currentAnimationList.each(function(index) {
				var curCollider = getValueFromFrame(index, 'bodyCollider');
				if(typeof curCollider == 'undefined') {
					// create collider for this frame
					curCollider = {
						origin:{x:0, y:0},
						width:20,
						height:20,
					};
					saveValueToFrame(index, 'bodyCollider', curCollider);
				}
			});
		}
		return false;
	});
	$('#anims').on('click', '.action-toggle-attack-collider', function() {
		var curStatus = getAnimationValue('attackCollider');
		if(curStatus == 1) { // disable it
			saveAnimationValue('attackCollider', 0);
			$(this).text('Enable Attack Collider');
		} else {
			saveAnimationValue('attackCollider', 1);
			$(this).text('Disable Attack Collider');
			// go through each frame to make sure they all have a collider defined
			currentAnimationList.each(function(index) {
				var curCollider = getValueFromFrame(index, 'attackCollider');
				if(typeof curCollider == 'undefined') {
					// create collider for this frame
					curCollider = {
						origin:{x:0, y:0},
						width:10,
						height:10,
					};
					saveValueToFrame(index, 'attackCollider', curCollider);
				}
			});
		}
		return false;
	});
	
	$('#body-collider-show-options').click(function() {
		$('#attack-collider-show-options').removeClass('selected');
		var obj = $(this);
		obj.addClass('selected');
		$('#attack-collider-options').hide();
		$('#body-collider-options').show();
		return false;
	});
	$('#attack-collider-show-options').click(function() {
		$('#body-collider-show-options').removeClass('selected');
		var obj = $(this);
		obj.addClass('selected');
		$('#body-collider-options').hide();
		$('#attack-collider-options').show();
		return false;
	});
	// body collider options
	$('#body-collider-dec-width').click(function() {
		var curValue = $('#body-collider-width .val').text();
		curValue--;
		if(curValue > 1) { // 2px min
			$('#body-collider-width .val').text(curValue);
			if(getAnimationValue('bodyCollider') == 1) {
				var bodyCollider = currentEditFrame.data('bodyCollider');
				bodyCollider.width = curValue;
				$('#anim-preview-body-collider').css({'top': bodyCollider.origin.y, 'left':bodyCollider.origin.x, 'width':curValue, 'height':bodyCollider.height});
			}
		}
		return false;
	});
	$('#body-collider-inc-width').click(function() {
		var curValue = $('#body-collider-width .val').text();
		curValue++;
		$('#body-collider-width .val').text(curValue);
		if(getAnimationValue('bodyCollider') == 1) {
			var bodyCollider = currentEditFrame.data('bodyCollider');
			bodyCollider.width = curValue;
			$('#anim-preview-body-collider').css({'top': bodyCollider.origin.y, 'left':bodyCollider.origin.x, 'width':curValue, 'height':bodyCollider.height});
		}
		return false;
	});
	$('#body-collider-dec-height').click(function() {
		var curValue = $('#body-collider-height .val').text();
		curValue--;
		if(curValue > 1) { // 2px min
			$('#body-collider-height .val').text(curValue);
			if(getAnimationValue('bodyCollider') == 1) {
				var bodyCollider = currentEditFrame.data('bodyCollider');
				bodyCollider.height = curValue;
				$('#anim-preview-body-collider').css({'top': bodyCollider.origin.y, 'left':bodyCollider.origin.x, 'width':bodyCollider.width, 'height':bodyCollider.height});
			}
		}
		return false;
	});
	$('#body-collider-inc-height').click(function() {
		var curValue = $('#body-collider-height .val').text();
		curValue++;
		$('#body-collider-height .val').text(curValue);
		if(getAnimationValue('bodyCollider') == 1) {
			var bodyCollider = currentEditFrame.data('bodyCollider');
			bodyCollider.height = curValue;
			$('#anim-preview-body-collider').css({'top': bodyCollider.origin.y, 'left':bodyCollider.origin.x, 'width':bodyCollider.width, 'height':bodyCollider.height});
		}
		return false;
	});
	$('#body-collider-shift-up').click(function() {
		if(getAnimationValue('bodyCollider') == 1) {
			var bodyCollider = currentEditFrame.data('bodyCollider');
			bodyCollider.origin.y -= 1;
			$('#anim-preview-body-collider').css({'top': bodyCollider.origin.y, 'left':bodyCollider.origin.x, 'width':bodyCollider.width, 'height':bodyCollider.height});
		}
		return false;
	});
	$('#body-collider-shift-down').click(function() {
		if(getAnimationValue('bodyCollider') == 1) {
			var bodyCollider = currentEditFrame.data('bodyCollider');
			bodyCollider.origin.y += 1;
			$('#anim-preview-body-collider').css({'top': bodyCollider.origin.y, 'left':bodyCollider.origin.x, 'width':bodyCollider.width, 'height':bodyCollider.height});
		}
		return false;
	});
	$('#body-collider-shift-left').click(function() {
		if(getAnimationValue('bodyCollider') == 1) {
			var bodyCollider = currentEditFrame.data('bodyCollider');
			bodyCollider.origin.x -= 1;
			$('#anim-preview-body-collider').css({'top': bodyCollider.origin.y, 'left':bodyCollider.origin.x, 'width':bodyCollider.width, 'height':bodyCollider.height});
		}
		return false;
	});
	$('#body-collider-shift-right').click(function() {
		if(getAnimationValue('bodyCollider') == 1) {
			var bodyCollider = currentEditFrame.data('bodyCollider');
			bodyCollider.origin.x += 1;
			$('#anim-preview-body-collider').css({'top': bodyCollider.origin.y, 'left':bodyCollider.origin.x, 'width':bodyCollider.width, 'height':bodyCollider.height});
		}
		return false;
	});
	$('#body-collider-inherit-height').click(function() {
		if(currentEditFrame != null)
		{
			// get sprite index
			var curIndex = currentAnimationList.index(currentEditFrame);
			if(curIndex > 0) { // can only inherit from previous frame if not first frame
				var bodyCollider = currentEditFrame.data('bodyCollider');
				var prevFrame = currentAnimationList.eq(curIndex-1);
				bodyCollider.height = prevFrame.data().bodyCollider.height;

				selectFrameToEdit(currentEditFrame);
			}
		}
		return false;
	});
	$('#body-collider-inherit-width').click(function() {
		if(currentEditFrame != null)
		{
			// get sprite index
			var curIndex = currentAnimationList.index(currentEditFrame);
			if(curIndex > 0) { // can only inherit from previous frame if not first frame
				var bodyCollider = currentEditFrame.data('bodyCollider');
				var prevFrame = currentAnimationList.eq(curIndex-1);
				bodyCollider.width = prevFrame.data().bodyCollider.width;
				
				selectFrameToEdit(currentEditFrame);
			}
		}
		return false;
	});
	// attack collider options
	$('#attack-collider-dec-width').click(function() {
		var curValue = $('#attack-collider-width .val').text();
		curValue--;
		if(curValue > 1) { // 2px min
			$('#attack-collider-width .val').text(curValue);
			if(getAnimationValue('attackCollider') == 1) {
				var attackCollider = currentEditFrame.data('attackCollider');
				attackCollider.width = curValue;
				$('#anim-preview-attack-collider').css({'top': attackCollider.origin.y, 'left':attackCollider.origin.x, 'width':curValue, 'height':attackCollider.height});
			}
		}
		return false;
	});
	$('#attack-collider-inc-width').click(function() {
		var curValue = $('#attack-collider-width .val').text();
		curValue++;
		$('#attack-collider-width .val').text(curValue);
		if(getAnimationValue('attackCollider') == 1) {
			var attackCollider = currentEditFrame.data('attackCollider');
			attackCollider.width = curValue;
			$('#anim-preview-attack-collider').css({'top': attackCollider.origin.y, 'left':attackCollider.origin.x, 'width':curValue, 'height':attackCollider.height});
		}
		return false;
	});
	$('#attack-collider-dec-height').click(function() {
		var curValue = $('#attack-collider-height .val').text();
		curValue--;
		if(curValue > 1) { // 2px min
			$('#attack-collider-height .val').text(curValue);
			if(getAnimationValue('attackCollider') == 1) {
				var attackCollider = currentEditFrame.data('attackCollider');
				attackCollider.height = curValue;
				$('#anim-preview-attack-collider').css({'top': attackCollider.origin.y, 'left':attackCollider.origin.x, 'width':attackCollider.width, 'height':attackCollider.height});
			}
		}
		return false;
	});
	$('#attack-collider-inc-height').click(function() {
		var curValue = $('#attack-collider-height .val').text();
		curValue++;
		$('#attack-collider-height .val').text(curValue);
		if(getAnimationValue('attackCollider') == 1) {
			var attackCollider = currentEditFrame.data('attackCollider');
			attackCollider.height = curValue;
			$('#anim-preview-attack-collider').css({'top': attackCollider.origin.y, 'left':attackCollider.origin.x, 'width':attackCollider.width, 'height':attackCollider.height});
		}
		return false;
	});
	$('#attack-collider-shift-up').click(function() {
		if(getAnimationValue('attackCollider') == 1) {
			var attackCollider = currentEditFrame.data('attackCollider');
			attackCollider.origin.y -= 1;
			$('#anim-preview-attack-collider').css({'top': attackCollider.origin.y, 'left':attackCollider.origin.x, 'width':attackCollider.width, 'height':attackCollider.height});
		}
		return false;
	});
	$('#attack-collider-shift-down').click(function() {
		if(getAnimationValue('attackCollider') == 1) {
			var attackCollider = currentEditFrame.data('attackCollider');
			attackCollider.origin.y += 1;
			$('#anim-preview-attack-collider').css({'top': attackCollider.origin.y, 'left':attackCollider.origin.x, 'width':attackCollider.width, 'height':attackCollider.height});
		}
		return false;
	});
	$('#attack-collider-shift-left').click(function() {
		if(getAnimationValue('attackCollider') == 1) {
			var attackCollider = currentEditFrame.data('attackCollider');
			attackCollider.origin.x -= 1;
			$('#anim-preview-attack-collider').css({'top': attackCollider.origin.y, 'left':attackCollider.origin.x, 'width':attackCollider.width, 'height':attackCollider.height});
		}
		return false;
	});
	$('#attack-collider-shift-right').click(function() {
		if(getAnimationValue('attackCollider') == 1) {
			var attackCollider = currentEditFrame.data('attackCollider');
			attackCollider.origin.x += 1;
			$('#anim-preview-attack-collider').css({'top': attackCollider.origin.y, 'left':attackCollider.origin.x, 'width':attackCollider.width, 'height':attackCollider.height});
		}
		return false;
	});
	$('#attack-collider-inherit-height').click(function() {
		if(currentEditFrame != null)
		{
			// get sprite index
			var curIndex = currentAnimationList.index(currentEditFrame);
			if(curIndex > 0) { // can only inherit from previous frame if not first frame
				var attackCollider = currentEditFrame.data('attackCollider');
				var prevFrame = currentAnimationList.eq(curIndex-1);
				attackCollider.height = prevFrame.data().attackCollider.height;

				selectFrameToEdit(currentEditFrame);
			}
		}
		return false;
	});
	$('#attack-collider-inherit-width').click(function() {
		if(currentEditFrame != null)
		{
			// get sprite index
			var curIndex = currentAnimationList.index(currentEditFrame);
			if(curIndex > 0) { // can only inherit from previous frame if not first frame
				var attackCollider = currentEditFrame.data('attackCollider');
				var prevFrame = currentAnimationList.eq(curIndex-1);
				attackCollider.width = prevFrame.data().attackCollider.width;
				
				selectFrameToEdit(currentEditFrame);
			}
		}
		return false;
	});
	$('#action-gen-spritesheet').click(function() {
		generateSpritesheet();
		return false;
	});
	$('#import-project-button').click(function() {
		
		loadProjectFile();
		
		return false;
	});

	/***************************************************************/
	
	
	
	
});

// stop accidentally leaving page without saving
window.onbeforeunload = function (e) {      
  return 'Are You Sure?';
};



