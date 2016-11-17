//-------------- Globals variables --------------
var selectedImageInput = 1;
var sup1;
var rangeSlider;

// -------------- Functions --------------
window.onload = function(){
	showLoadingSpinner(false);
}

sup1 = new SuperGif({ gif: document.getElementById('canvas_libgif') } );
sup1.load(function hola() { 
	createSlider(sup1.get_length());
	var canvas = document.getElementById('cabesa');
	drawImageInCanvas(sup1.get_canvas());
	canvas.addEventListener("mousedown", function(evt) {
		getPosition(evt, 'cabesa') },false); 
	var canvasPreview = document.getElementById('myCanvas');
	canvasPreview.addEventListener("mousedown", function(evt) {
		getPosition(evt, 'myCanvas') },false);
	document.getElementById("cabesa").style.display = "none"
	});

document.getElementById("cabesa").style.display = "none"

var recordedSteps = [];
var isRecording = true;

function createGif(){

	var c=document.getElementById("myCanvas");
	var ctx=c.getContext("2d");
	var img = document.getElementById('cabesa');

	var encoder = new GIFEncoder();
	encoder.setRepeat(0); //auto-loop
	encoder.setDelay(10);
	console.log(encoder.start());

	var data = [];
	var len = sup1.get_length();

	showLoadingSpinner(true);

	function addImageToGif(i) {
		sup1.move_to(i);
		data.push(sup1.get_canvas());
		ctx.drawImage(sup1.get_canvas(),0,0);
		if (i < recordedSteps.length) 
		{
			var img = document.getElementById(recordedSteps[i].image);
			ctx.drawImage(img, recordedSteps[i].pos.x, recordedSteps[i].pos.y, 
							   recordedSteps[i].width, recordedSteps[i].height);
		}    					
		encoder.addFrame(ctx);
	}

	function gifCreated() {
		console.log("se acaboooooo");
    	encoder.finish();
		document.getElementById('image').src = 'data:image/gif;base64,'+ encode64(encoder.stream().getData());
		showLoadingSpinner(false);
	}

	var i = 0;
	// Reference: http://blog.jeremyaldrich.net/en/latest/nonblocking_forloop_javascript.html
	function loopCreateGifWithoutBlocking(i) {
	    addImageToGif(i);
	    if (i < len) {
	        setTimeout(function() { loopCreateGifWithoutBlocking( i + 1); }, 5);
	    } else {
	    	gifCreated();
	    }
	};
	loopCreateGifWithoutBlocking(i);
	
}

function getPosition(evt, canvasId)
{
	var canvas = document.getElementById(canvasId);
	var mousePos = getMousePos(canvas, evt);

	var position = {};
	var img = document.getElementById(selectedImageInput);
	if (img === null) {
		alert('No input images selected');
		return;
	}

	position.x = mousePos.x - (img.width / 2);
	position.y= mousePos.y - (img.height / 2);

	overlap(position);


	if (!isRecording)
	{
		alert("NOT RECORDING!");
		overlap(position);
		return;
	}

		// 25 = 50 / 2; 50 is the hardcoded value when we draw
		var step =  {  pos: position , image: selectedImageInput, width: img.width , height : img.height }
	//recordedSteps.push( step );
	recordedSteps[sup1.get_current_frame()] = step;
	sup1.move_relative(1);

	rangeSlider.noUiSlider.set(sup1.get_current_frame());
}

function overlap(position)
{
	var c=document.getElementById("myCanvas");
	var ctx=c.getContext("2d");
	var img = document.getElementById(selectedImageInput);

	if (img === null) {
		alert("img is null. Select one image");
		return;
	}

	ctx.drawImage(sup1.get_canvas(),0,0);
	ctx.drawImage(img, position.x, position.y, img.width, img.width);  
}

function drawImageInCanvas(canvas)
{
	var c=document.getElementById("myCanvas");
	var ctx=c.getContext("2d");
	ctx.drawImage(canvas,0,0);
}

function recording()
{
	sup1.move_to(0); 
	isRecording = true;

	return false;
}

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

function addBorderToSelectedInput(selectedImageInput) {
	var childs = document.getElementById("listInputImg").childNodes;
	if (childs !== null) {
		for (var i = 0; i < childs.length; ++i) {
			var tempId = childs[i].childNodes[0].id;
			if (tempId === selectedImageInput) {
				childs[i].childNodes[0].style.border = "solid #0000FF 10px";
			} else{
				childs[i].childNodes[0].style.border = "none";
			}
		}
	}
}

// Function to select the input image that will be overwrite
function selectInput(e)
{
	debugger
	var newInput = e.target ? e.target.id : e.srcElement.id;

	if (newInput === selectedImageInput){
		return;
	}
	selectedImageInput = newInput;

	addBorderToSelectedInput(selectedImageInput);
}

// ------------ INPUT
function handleFileSelect(evt) {
	var files = evt.target.files; // FileList object

	// files is a FileList of File objects. List some properties.
  	var num = 0;

	var output = [];
	for (var i = 0, f; f = files[i]; i++) {
	  // Only process image files.
      if (!f.type.match('image.*')) {
        continue;
      }

      var reader = new FileReader();
        num += 1;

      // Closure to capture the file information.
      reader.onload = (function(theFile, num) {
        return function(e) {
          var span = document.createElement('span');
          var id = "inputImg_" + num.toString();
          span.innerHTML = ['<img class="thumb" src="', e.target.result,
                            '" title="', escape(theFile.name), 
                            '" style=" max-height: 200px; max-width: 200px;',
                            'margin: 50px',
                            '" id="', id,'"/>' 
                            ].join('');
          span.addEventListener('mousedown', selectInput, false);
          document.getElementById('listInputImg').insertBefore(span, null);
          if (num === 1) {
          	// Select the fir st element automatically
			selectedImageInput = id;
          	addBorderToSelectedInput(selectedImageInput);
          }
        };
        console.log('a');
      })(f, num);

      // Read in the image file as a data URL.
      reader.readAsDataURL(f);
	}
	//document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
}

function resize(mode) {
	var img = document.getElementById(selectedImageInput);
	if (img === null || img === undefined) {
		alert("Select any image input");
		return
	}

	if (mode) {
		img.width += 10;
	}
	else {
		if (img.width > 10) {
			img.width -= 10;							
		}
	}
}

function showLoadingSpinner(value) {
	document.getElementById("loading").style.display = value ? "block": "none" ;
}

function createSlider(maxSteps) {
	rangeSlider = document.getElementById('slider');
	noUiSlider.create(rangeSlider, {
		start: [ 0 ],
		step: 1,
		connect : 'lower',
		range: {
		  'min': 0,
		  'max': maxSteps
		}
	});

	var rangeSliderValueElement = document.getElementById('slider-range-value');

	rangeSlider.noUiSlider.on('update', function( values, handle ) {
		rangeSliderValueElement.innerHTML = parseInt(values[handle]);
	});

	rangeSlider.noUiSlider.on('change', function( values, handle){
		var valueSelected = parseInt(values[handle]);
		sup1.move_to(valueSelected);
		drawImageInCanvas(sup1.get_canvas());

		if (recordedSteps[sup1.get_current_frame()] !== undefined) {
			overlap(recordedSteps[sup1.get_current_frame()].pos);
		}
		return false;
	});
}

document.getElementById('files').addEventListener('change', handleFileSelect, false);