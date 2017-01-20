var g_ptsMainMenu = null
,	g_ptsFileFrame = null	// File frame for wp media uploader
,	g_ptsEdit = true
,	g_ptsTopBarH = 32		// Height of the Top Editor Bar
,	g_ptsSortInProgress = false
,	g_ptsEditMode = true	// If this script is loaded - this mean that we in edit mode
,	g_ptsColorPickerOptions = {
		size: 2
	,	mode: 'hsv-h'
	,	actionCallback: function (eventObject, eventName, colorPicker) {
			if (! eventObject || ! eventName) return;
			else if ((eventName == 'keyup' || eventName == 'paste') & ! eventObject.hasOwnProperty('HEXModified')) return;
			else if (eventName != 'keyup' && eventName != 'paste' && eventName != 'keypress') return;

			var self = this
			,	colorValidation = /(^[0-9A-F]{6}$)|(^[0-9A-F]{3}$)/i
			,	HEX_INGORED_HANDLER = 'ColorPicker-Hex-Ingnored'
			,	sourceElement = eventObject.srcElement
			,	$sourceElement = jQuery(sourceElement)
			,	isHEXDisp = sourceElement.classList.contains('HEX-disp')
			,	colorValue = null
			,	setColorByHEX = function (colorValue) {
					var color = new Colors();

					color.setColor('#' + colorValue, 'hex', 1);
					color.colors.rgbaMixCustom = {luminance: 1};

					if (self.hasOwnProperty('renderCallback'))
						self.renderCallback(color.colors, color.options);

					if (self.hasOwnProperty('convertCallback'))
						self.convertCallback(color.colors);
				};

			colorValue = sourceElement.innerText;

			if (! colorValue.length) return;

			if (colorValidation.test(colorValue)) {
				colorPicker.setColor('#' + colorValue, 'hex', 1);

				colorPicker.startRender();
				colorPicker.stopRender();

				setColorByHEX(colorValue);
			}

			$sourceElement.html(colorValue);

			// set cursor to end of text
			setTimeout(function () {
				$sourceElement.focus();

				var node = sourceElement
				,	textNode = node.firstChild
				,	caret = textNode.nodeValue.length
				,	range = document.createRange()
				,	sel = window.getSelection();

				range.setStart(textNode, caret);
				range.setEnd(textNode, caret);
				
				sel.removeAllRanges();
				sel.addRange(range);
			});
		}
};
jQuery(document).ready(function(){
	_ptsInitTwig();
	// Prevent all default browser event - such as links redirecting, forms submit, etc.
	jQuery('#ptsCanvas').on('click', 'a', function(event){
		event.preventDefault();
	});
	jQuery('.ptsMainSaveBtn').click(function(){
		_ptsSaveCanvas();
		return false;
	});
});
function _ptsSaveCanvasDelay(delay) {
	delay = delay ? delay : 200;
	setTimeout(_ptsSaveCanvas, delay);
}
function _ptsSaveCanvas(params, byHands) {
	if(!!parseInt(toeOptionPts('disable_autosave')) && 'undefined' == typeof byHands) {
		return;	// Autosave disabled in admin area
	}

	if(typeof(ptsTables) === 'undefined' || !ptsTables || !ptsTables.length || (typeof(g_ptsIsTableBuilder) !== 'undefined' && g_ptsIsTableBuilder)) {
		return;
	}
	params = params || {};
	var dataForSave = {
		mod: 'tables'
	,	action: 'save'
	,	data: ptsGetFabric().getDataForSave()[0]	//[0] - is because only one block (table) is in this plugin saved
	};
	if(params.sendData) {
		for(var key in params.sendData) {
			dataForSave.data[ key ] = params.sendData[ key ];
		}
	}
	jQuery.sendFormPts({
		btn: jQuery('.ptsTableSaveBtn')
	,	data: dataForSave
	,	onSuccess: function(res){
			if(!res.error) {
				
			}
		}
	});
}
function _ptsSortInProgress() {
	return g_ptsSortInProgress;
}
function _ptsSetSortInProgress(state) {
	g_ptsSortInProgress = state;
}
function _ptsInitTwig() {
	Twig.extendFunction('adjBs', function(hex, steps) {
		if(!hex)
			return hex;
		var isRgb = hex.indexOf('rgb') !== -1;
		if(isRgb) {
			var colorObj = tinycolor( hex );
			hex = colorObj.toHex();
		}
		// Steps should be between -255 and 255. Negative = darker, positive = lighter
		steps = Math.max(-255, Math.min(255, steps));
		// Normalize into a six character long hex string
		hex = str_replace(hex, '#', '');
		if (hex.length == 3) {
			hex = str_repeat(hex.substr(0, 1), 2)+ str_repeat(hex.substr(1, 1), 2)+ str_repeat(hex.substr(2, 1), 2);
		}
		// Split into three parts: R, G and B
		var color_parts = str_split(hex, 2);
		var res = '#';
		for(var i in color_parts) {
			var color = color_parts[ i ];
			color   = hexdec(color); // Convert to decimal
			color   = Math.max(0, Math.min(255, color + steps)); // Adjust color
			res += str_pad(dechex(color), 2, '0', 'STR_PAD_LEFT'); // Make two char hex code
		}
		if(isRgb) {
			return tinycolor( res ).setAlpha( colorObj.getAlpha() );
		}
		return res;
	});
}