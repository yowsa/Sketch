// lista med alla ritade linjer

var prevDrawnLines;

// en function som skickar data till python
function sendLineData() {
	$.ajax({
		type: "POST",
		dataType: "json",
		contentType: "application/json",
		url: "/convert",
		data: collectLineData.lineData(),
		success: function(x){
			alert(JSON.stringify(x))
		}
	})

}

// en function som tar emot data fran python

function getLineData() {
	$.ajax({
		datatype: "json",
		url: "/hello",
		success: function(x){
			prevDrawnLines = x;
			alert("Previously drawn lines: " + JSON.stringify(prevDrawnLines))
			return prevDrawnLines
			//alert(prevDrawnLines[0].length + "hejsan")
			//hej.drawLinePositions()

		}
	})

}



// vissa saker ska laddas efter att html ar laddad

$(function(){



});
getLineData();
console.log(prevDrawnLines);
//alert("outside of function" + JSON.stringify(prevDrawnLines));
// class som sköter line features? typ farg och tjocklek

class LineFeatures {

	constructor(){
		this.strokeStyle = "#ffff00";
		this.lineWidth = 5;
	}

	setStrokeStyle(strokeStyle){
		this.strokeStyle = strokeStyle;
	}

	getStrokeStyle(){
		return this.strokeStyle;
	}

	increaseLineWidth(){
		if (this.lineWidth < 20){
			this.lineWidth += 1;
		}
	}

	decreaseLineWidth(){
		if (this.lineWidth > 1){
			this.lineWidth -= 1;
		}
	}

	getLineWidth() {
		return this.lineWidth;
	}

}



// class som skapar nya ritade linjer nar du trycker

class DrawNewLines {

	constructor(canvasID){
		this.pos = {x: 0, y:0};
		this.canvasID = canvasID;
		this.canvas = document.getElementById(this.canvasID);
		this.line = this.canvas.getContext("2d");
		this.line.lineWidth = lineFeatures.getLineWidth();
		this.line.strokeStyle = lineFeatures.getStrokeStyle();
		//this.linePositions = []
		
		this.canvas.addEventListener("mousedown", this.getCurrentLineFeatures.bind(this));
		document.addEventListener("mousemove", this.currentCursorPosition.bind(this));
		this.canvas.addEventListener("mousedown", this.setBeginLinePosition.bind(this));
		this.canvas.addEventListener("mousedown", this.startDrawing.bind(this));
		document.addEventListener("mouseup", this.finishDrawing.bind(this));
	}

	currentCursorPosition(e){
		this.pos.x = e.clientX;
		this.pos.y = e.clientY;
	}

	setBeginLinePosition() {
		this.line.beginPath();
		this.line.moveTo(this.pos.x, this.pos.y);
	}

	getCurrentLineFeatures(){
		this.line.strokeStyle = lineFeatures.getStrokeStyle();
		this.line.lineWidth = lineFeatures.getLineWidth();
		
	}

	startDrawing(){
		this.drawingLines = setInterval(this.drawAllPositions.bind(this), 1000);
	}

	drawAllPositions(){
		this.line.lineTo(this.pos.x, this.pos.y);
		this.line.stroke();
	}

	finishDrawing(){
		clearInterval(this.drawingLines);

	}

}

// class som samlar lineData

class CollectLineData {

	constructor(canvasID){
		this.pos= {x: 0 , y: 0 }
		this.canvasID = canvasID;
		this.canvas = document.getElementById(this.canvasID);

		this.lineWidth = lineFeatures.getLineWidth();
		this.strokeStyle = lineFeatures.getStrokeStyle();
		this.linePositions = [];
		var that = this;


		document.addEventListener("mousemove", this.currentCursorPosition.bind(this));
		this.canvas.addEventListener("mousedown", this.getCurrentLineFeatures.bind(this));
		this.canvas.addEventListener("mousedown", this.addBeginLinePosition.bind(this));
		this.canvas.addEventListener("mousedown", this.addAllPositions.bind(this));

		document.addEventListener("mouseup", this.stopAddingPositions.bind(this));
		document.addEventListener("mouseup", this.lineData.bind(this));
		//////////////////////////////////////////////////////////////
		//TODO: Update the below event sendlinedata to seperate function/class ass this is a colleclinedata class, be aware of the clearLinePositions function
		document.addEventListener("mouseup", function(){
			if (that.linePositions.length >= 4){
				sendLineData();
			}
		}); 
		
		//////////////////////////////////////////////////////////////
		document.addEventListener("mouseup", this.clearLinePositions.bind(this));


	}

	currentCursorPosition(e){
		this.pos.x = e.clientX;
		this.pos.y = e.clientY;

	}

	getCurrentLineFeatures(){
		this.strokeStyle = lineFeatures.getStrokeStyle();
		this.lineWidth = lineFeatures.getLineWidth();
		
	}


	addBeginLinePosition(){
		this.linePositions.push(this.pos.x, this.pos.y);

	}

	addAllPositions(){
		this.allPositions = setInterval(this.pushLinePositions.bind(this), 1000)


	}

	pushLinePositions(){
		this.linePositions.push(this.pos.x, this.pos.y);
	}

	stopAddingPositions(){
		clearInterval(this.allPositions);
	}

	lineData() {
		var lineData = JSON.stringify({"strokeStyle" : this.strokeStyle, "lineWidth" : this.lineWidth, 'positions' : this.linePositions})
		return lineData
	}

	clearLinePositions(){
		this.linePositions = []
	}

}



//////////////////////////////////////////////////////////////////////////


$(function(){


	function showStrokeSize() {

		document.getElementById("lineWidth").innerText = lineFeatures.getLineWidth();

	}
// class som ritar ut tidigare ritade linjer
class DrawExistingLines {

	constructor(canvasID, strokeStyle, width, pos){
		this.pos = pos;

		this.canvasID = canvasID;
		this.canvas = document.getElementById(this.canvasID);
		this.line = this.canvas.getContext("2d");
		this.line.lineWidth = width
		this.line.strokeStyle = strokeStyle

		this.myTestLine = [{"lineWidth":5,"positions":[116,340,273,152,289,182],"strokeStyle":"#ffff00"},{"lineWidth":7,"positions":[93,56,263,309,304,79,118,288],"strokeStyle":"#ffff00"}];
		
	}


	start(lineData){
		var lineData = this.myTestLine[0];
		//alert(lineData["positions"][0]);
		this.line.beginPath();
		this.line.moveTo(lineData["positions"][0], lineData["positions"][1]);

	}

	aLine(){
		this.line.lineTo((this.pos[0]+50), (this.pos[1]+50));
		this.line.stroke();

	}


	getLineFeatures(lineData){
		var lineData = this.myTestLine[0];
		this.line.lineWidth = lineData["lineWidth"];
		this.line.strokeStyle = lineData["strokeStyle"];

	}

	drawLinePositions(lineData){
		var lineData = this.myTestLine[0];
		for (var pos = 2 ; pos < lineData["positions"].length ; pos += 2){
			this.line.lineTo(lineData["positions"][pos], lineData["positions"][pos+1]);
			this.line.stroke();
			//alert(lineData["positions"][pos] + ", " + lineData["positions"][pos+1]);
		}

/*
		var that = this;
		this.myTestLine.forEach(function(x){
			for (var i in x){
				that.line.lineWidth = x["lineWidth"]
				that.line.strokeStyle = x["strokeStyle"]
				//alert(i + x["lineWidth"])
			}
		})
*/

/*
			for(var i = 0 ; i < 6 ; i += 2) {
				alert(i)
			}
			
			*/		



		}




		drawAllLines(){
		// for each dict/line in the total list of lines
			// set line features to the line
			// start() line with first two pos
			// lineTo each position pars (iterate over array) and set stroke.
		}

	}


	var hej = new DrawExistingLines("mycanvas", "green", 5, [200, 300, 400, 500])
	hej.start()

	hej.aLine()
	hej.drawLinePositions()


/*
	$.ajax({
		datatype: "json",
		url: "/hello",
		success: function(x){
			prevDrawnLines.push(x)
			//alert(JSON.stringify(prevDrawnLines))
			//alert(prevDrawnLines[0].length + "hejsan")
			//hej.drawLinePositions()
		}
	})
	*/

	lineFeatures = new LineFeatures();
	drawNewLines = new DrawNewLines('mycanvas');
	collectLineData = new CollectLineData('mycanvas');



	showStrokeSize();


///////////////////////////////////////////////////////////////////
/// Button functionality in HTML
/// ///////////////////////////////////////////////////////////////

$("#setColor-Black").click(function(){
	lineFeatures.setStrokeStyle('black');
});

$("#setColor-Red").click(function(){
	lineFeatures.setStrokeStyle('red');
});

$("#setColor-Green").click(function(){
	lineFeatures.setStrokeStyle('green');
});


$("#increaseLineWidth").click(function(){
	lineFeatures.increaseLineWidth();
	showStrokeSize();
});

$("#decreaseLineWidth").click(function(){
	lineFeatures.decreaseLineWidth();
	showStrokeSize();
});


});






