


//Global Variables
var TARGET_HEIGHT = 1016;
var TARGET_WIDTH = 495;
var SHOT_DATA = {};
var FILENAME = "";

const SIL = {
  "height":1016,
  "yBuffer":44,
  "width":495,
  "xOffset":100,
  "yOffset":100,
  "radialError":19.0
};

//Inital Canvas Setup
setupCanvas();
window.addEventListener('resize', setupCanvas);

// File Manipulation ---------------------
function getDir(){
    var loc = window.location.pathname;
    var dir = loc.substring(0, loc.lastIndexOf('/'));
    return dir;
}

function importCSV() {

    destroyRowData();

    // Get the selected file input element
    var fileInput = document.getElementById('fileInput');

    if (fileInput.files.length > 0) {
        var selectedFilePath = fileInput.files[0];
        FILENAME = selectedFilePath.name;

        var shotInput = readCSV(selectedFilePath.name);

        shotInput.then((dataArray) => {
          const resultDictionary = {};
          dataArray.forEach((data, index) => {
          resultDictionary[`Shot${index + 1}`] = data;
          });

          SHOT_DATA = resultDictionary;
          createRowData(resultDictionary);
          showLomahShots();

          // console.log('Result Dictionary:', resultDictionary);
          })
          .catch((error) => {
          console.error('Error:', error);
        });
    
    } else {
      console.error('No file selected.');
    }
    
}

function exportCSV(){

  // Need to see if they want me to destroy the Row data after each submit. 
  // destroyRowData(); 

  targetDataDictionary = SHOT_DATA;
  spfile = FILENAME.split(".");
  var fileName;
  
  // Check whether it was already Measured or not.
  if (spfile[0].charAt(spfile[0].length-1) === "M"){
    fileName = FILENAME
  } 
  else {
    fileName = spfile[0]+" M."+spfile[1]
  }
  // console.log("FileName: ", fileName)

  // Extract properties and shots
  const properties = Object.keys(targetDataDictionary[Object.keys(targetDataDictionary)[0]]);
  const shots = Object.keys(targetDataDictionary);

  // Create header row & data rows
  const headerRow = properties.join(',');

  const dataRows = shots.map((shot) => {
      const shotData = Object.values(targetDataDictionary[shot]);
      return shotData.join(',');
  });

  // Combine header and data rows
  const csvContent = [headerRow, ...dataRows].join('\n');

  // Create a Blob and generate a download link
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  // Create a download link
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName || 'output.csv';
  a.textContent = 'Download CSV';

  // Append the link to the document body, initiate, then delete element
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);


}

async function readCSV(filePath) {
    var directory = getDir();
    var csvFilePath = filePath;

    try {
      const response = await fetch(directory+"/Recorded/"+csvFilePath);
      const data = await response.text();
      // Remember Regex can be written directly in JS
      const normalizedData = data.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      
      // Parse the CSV data
      const rows = normalizedData.split('\n');
      const headers = rows[0].split(',');
      const csvData = [];

      // Loop through each row and create an object with column headers as keys
      for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(',');
        const rowData = {};
        
        for (let j = 0; j < headers.length; j++) {
          rowData[headers[j]] = values[j];
        };
        csvData.push(rowData);
      }
      return csvData;

    } catch (error) {
      console.error('Error reading CSV:', error);
    }
}

// Calculations ---------------------
function radial(actualX, predictX, actualY, predictY){

    xErr = actualX-predictX
    yErr = actualY-predictY
    radialErr = Math.sqrt(Math.pow(xErr, 2) + Math.pow(yErr, 2))
    // returns an object and can access it as one
    // const result = radial(3,1,4,2)
    // console.log(result.xErr)
    return { xErr, yErr, radialErr}
}

function calcCoordinates(shotNumber) {
  

  var actualX = parseFloat(document.getElementById('measuredX'+shotNumber).value) || 0;
  var predictX = parseFloat(document.getElementById('lomahX'+shotNumber).innerText) || 0;
  var actualY = parseFloat(document.getElementById('measuredY'+shotNumber).value) || 0;
  var predictY = parseFloat(document.getElementById('lomahY'+shotNumber).innerText) || 0;
  var radialErr = radial(actualX, predictX, actualY, predictY);
  
  
  // console.log("SHOT", SHOT_DATA);
  if (!SHOT_DATA["Shot"+shotNumber]) {
    SHOT_DATA["Shot"+shotNumber] = {};
  }
  SHOT_DATA["Shot"+shotNumber]["Xm"] = actualX
  SHOT_DATA["Shot"+shotNumber]["Ym"] = actualY
  SHOT_DATA["Shot"+shotNumber]["Xerr"] = radialErr["xErr"];
  SHOT_DATA["Shot"+shotNumber]["Yerr"] = radialErr["yErr"];
  SHOT_DATA["Shot"+shotNumber]["Radial err"] = radialErr["radialErr"].toFixed(2);

  // console.log(radialErr);
  // console.log(radialErr["radialErr"].toFixed(2));
  document.getElementById('radial'+shotNumber).value = radialErr["radialErr"].toFixed(2);
  updateTextColor('radial' + shotNumber);
  setupCanvas();
}

function calcPic(){
    measureH = 697;

    pix_width = 350;
    pix_height = 600;

    var pinH = (measureH/TARGET_HEIGHT) * pix_height
    var pinW = ((measureW - (495/2))/TARGET_HEIGHT) * pix_width ;

}

// HTML Element Handling ---------------------
function createSingleRow(shotNumValue,lx,ly){
    var table = document.getElementById('tableBody');
    var newRow = document.createElement('tr');
    
    // column 1 Shot Number
    var shotNumber = document.createElement('th');
    shotNumber.setAttribute('scope', "row");
    shotNumber.textContent = shotNumValue.toString();
    shotNumber.id = "shotNumber"+shotNumValue;
    shotNumber.classList.add("text-center");
    shotNumber.style["background-color"] = '#F9F6F6';
    newRow.appendChild(shotNumber);

    // column 2 Lomah X
    var lomX = document.createElement('td');
    lomX.id = "lomahX"+shotNumValue;
    lomX.textContent = lx;
    newRow.appendChild(lomX);

    // column 3 Lomah Y
    var lomY = document.createElement('td');
    lomY.id = "lomahY"+shotNumValue;
    lomY.style["background-color"] = '#F9F6F6';
    lomY.textContent = ly;
    newRow.appendChild(lomY);

    // column 4 Measured X
    var MesX = document.createElement('input');
    MesX.id = "measuredX"+shotNumValue;
    MesX.type = "text"
    MesX.setAttribute('oninput', 'calcCoordinates(' + shotNumValue + ')');
    MesX.setAttribute('inputmode', 'decimal');
    MesX.classList.add('input-group', 'input-group-sm');
    MesX.setAttribute('pattern', '\\d+(\\.\\d+)?');
    newRow.appendChild(document.createElement('td')).appendChild(MesX);

    // column 5: Measured Y
    var MesY = document.createElement('input');
    MesY.id = "measuredY"+shotNumValue;
    MesY.type = "text"
    MesY.setAttribute('oninput', 'calcCoordinates(' + shotNumValue + ')');
    MesY.style["background-color"] = '#F9F6F6';
    MesY.setAttribute('inputmode', 'decimal');
    MesY.classList.add('input-group', 'input-group-sm');
    MesY.setAttribute('pattern', '\\d+(\\.\\d+)?');
    newRow.appendChild(document.createElement('td')).appendChild(MesY);

    // column 6: Radial
    var rad = document.createElement('input');
    rad.type = 'text';
    rad.id = 'radial'+shotNumValue;
    rad.classList.add('input-group', 'input-group-sm');
    rad.disabled = true;
    newRow.appendChild(document.createElement('td')).appendChild(rad);


    table.appendChild(newRow);
}

function createRowData(resultDict){
    var count = 1;

    for (const shotData in resultDict){
        // console.log(shotData);
        const x = resultDict[shotData]['X:'];
        const y = resultDict[shotData]['Y:'];
        const shot = count;

        createSingleRow(shot,x,y);
        count += 1;
    }
}

function destroyRowData(){
    var tableBody = document.getElementById('tableBody');
    

    // Remove all child nodes (rows) from the tbody
    while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.firstChild);
    }
}

function updateTextColor(inputId) {
    var inputElement = document.getElementById(inputId);
  
    if (inputElement) {
      var numericValue = parseFloat(inputElement.value);
      if (numericValue > SIL.radialError) {
        inputElement.style.color = 'white';
        inputElement.style["background-color"] = '#CB3C1D';
      } else {
        inputElement.style.color = 'inherit';
        inputElement.style["background-color"] = '#13bf41';
      }
    } else {
      console.error('Input element not found.');
    }
}

function showErrorText(){
  document.getElementById("errorAlert").style.display = "block";
}

function hideErrorText(){
  document.getElementById("errorAlert").style.display = "none";
}


// Canvas 
function setupCanvas(){
  // Get the image element
  var image = document.getElementById('targetImage');
  var canvas = document.getElementById('targetCanvas');
  createLegend()

  var targetWidthRatio = (SIL.width+((SIL.xOffset)*2))/SIL.width;
  var targetHeightRatio = ((SIL.height)+SIL.yOffset)/(SIL.height);

  var marginPercentX = (100*(SIL.xOffset/SIL.width)).toFixed(2)+"%";
  var marginPercentY = (100*(SIL.yOffset/SIL.height)).toFixed(2)+"%";


  image.style.marginLeft = marginPercentX;
  image.style.marginRight = marginPercentX;
  image.style.marginTop = marginPercentY;

  // Set canvas size based on image dimensions
  canvas.width = image.width*targetWidthRatio;
  canvas.height = image.height*(targetHeightRatio-(SIL.yBuffer/SIL.height));

  // Common way to center containers
  canvas.style.left = "50%";
  canvas.style.transform = 'translateX(-50%)';
  // canvas.style.top = 100*(((image.height-canvas.height))/(image.height*2)).toFixed(2) + "%";
  
  //----------------------------------------------
  // Get the Measured Shot Canvas
  var canvas2 = document.getElementById('targetCanvas2');
  
  canvas2.width = image.width*targetWidthRatio;
  canvas2.height = image.height*(targetHeightRatio-(SIL.yBuffer/SIL.height));

  canvas2.style.left = "50%";
  canvas2.style.transform = 'translateX(-50%)';
  // canvas2.style.top = 100*(((image.height-canvas2.height))/(image.height*2)).toFixed(2) + "%";
  
  try{
    showLomahShots();
    showMeasuredShots();
  } catch(err){
    console.log(err);
  }

}

function calcPixelX(measuredX,maxPixelX){
  return ((measuredX+247.5)/495)*maxPixelX;
}

function calcPixelY(measuredY,maxPixelY){
  return ((measuredY)/972)*maxPixelY;
}

function showLomahShots(){
  var canvas = document.getElementById('targetCanvas');
  var c = canvas.getContext('2d');
  c.clearRect(0, 0, canvas.width, canvas.height); // clears entire canvas
  
  c.setTransform(1, 0, 0, 1, 0, 0); // resets to standard
  c.translate(0, canvas.height); // inverses canvas
  c.scale(1, -1); 

  var numOfShots = Object.keys(SHOT_DATA).length;
  for (let i = 1; i <= numOfShots; i++){
    var posX = parseFloat(document.getElementById("lomahX"+i).textContent);
    var posY = parseFloat(document.getElementById("lomahY"+i).textContent);

    var ratioWidth = (SIL.width-(SIL.xOffset*2))/SIL.width;
    var ratioHeight = ((SIL.height-SIL.yBuffer)-SIL.yOffset)/SIL.height;
    
    posX = calcPixelX((posX)*ratioWidth*((SIL.width+SIL.xOffset)/SIL.width),canvas.width);
    posY = calcPixelY(posY,canvas.height)*ratioHeight*(((SIL.height-SIL.yBuffer)+SIL.yOffset)/(SIL.height))+((11.65)*ratioHeight);

    // Drawing blue dot
    c.fillStyle = "#4f81c2";
    c.beginPath();
    c.arc(posX, posY, 5, 0, 2 * Math.PI);
    c.fill();

    // Draw mirrored and upside-down number next to the dot
    c.save(); // Save the current state of the context
    c.scale(1, -1); // Apply horizontal and vertical scaling to mirror and rotate upside down
    c.fillStyle = "#4f81c2"; // Set text color
    c.font = "20px Arial"; // Set font size and family
    c["font-weight"] = "bold";
    c.fillText(i, posX - 5, -posY - 10); // Draw the mirrored and upside-down number next to the dot
    c.restore(); // Restore the original state of the context
  }

  
}

function showMeasuredShots(){
  var canvas = document.getElementById('targetCanvas2');
  var c = canvas.getContext('2d');
  c.clearRect(0, 0, canvas.width, canvas.height); // clears entire canvas
  
  c.setTransform(1, 0, 0, 1, 0, 0); // resets to standard
  c.translate(0, canvas.height); // inverses canvas
  c.scale(1, -1); 

  var numOfShots = Object.keys(SHOT_DATA).length;
  for (let i = 1; i <= numOfShots; i++){
    var posX = parseFloat(document.getElementById("measuredX"+i).value);
    var posY = parseFloat(document.getElementById("measuredY"+i).value);
    
    var ratioWidth = (SIL.width-(SIL.xOffset*2))/SIL.width;
    var ratioHeight = ((SIL.height-SIL.yBuffer)-SIL.yOffset)/SIL.height;
    
    posX = calcPixelX((posX)*ratioWidth*((SIL.width+SIL.xOffset)/SIL.width),canvas.width);
    posY = calcPixelY(posY,canvas.height)*ratioHeight*(((SIL.height-SIL.yBuffer)+SIL.yOffset)/(SIL.height))+((11.65)*ratioHeight);

    var radialC = document.getElementById("radial"+i);
    console.log(radialC.value)
    
    if (radialC.value > SIL.radialError){
      // Red
      c.fillStyle = "#CB3C1D";
    } else {
      // Green
      c.fillStyle = '#13bf41';
    }
    // Drawing red dot
    
    c.beginPath();
    c.arc(posX, posY, 5, 0, 2 * Math.PI);
    c.fill();

    // // Draw mirrored and upside-down number next to the dot
    // c.save(); // Save the current state of the context
    // c.scale(1, -1); // Apply horizontal and vertical scaling to mirror and rotate upside down
    // c.fillStyle = "#CB3C1D"; // Set text color
    // c.font = "12px Arial"; // Set font size and family
    // c.fillText(i, posX - 5, -posY - 10); // Draw the mirrored and upside-down number next to the dot
    // c.restore(); // Restore the original state of the context
  }

  
}

function createLegend(){
  RED = "#CB3C1D";
  GREEN = '#13bf41';
  BLUE = "#4f81c2";

  lomahText = " Recorded Shots";
  measuredErr = "> 19mm Radial";
  measuredGood = "< 19mm Radial";

  alignX = 20;
  alignY = 30

  var image2 = document.getElementById('targetImage');
  var canvasLegend = document.getElementById('legendCanvas');
  
  // Set canvas size based on image dimensions
  canvasLegend.width = image2.width*0.60;
  canvasLegend.height = image2.height*0.35;
  var c2 = canvasLegend.getContext('2d');

  c2.fillStyle = BLUE;
  c2.beginPath();
  c2.arc(alignX, alignY, 5, 0, 2 * Math.PI);
  c2.fill();

  c2.font = "13px Arial";
  c2["font-weight"] = "bold";

  c2.fillText(lomahText, alignX+10, alignY+5);

  c2.fillStyle = RED;
  c2.beginPath();
  c2.arc(alignX, alignY+25, 5, 0, 2 * Math.PI);
  c2.fill();
  
  c2.fillText(measuredErr, alignX+10, alignY+30);

  c2.fillStyle = GREEN;
  c2.beginPath();
  c2.arc(alignX, alignY+50, 5, 0, 2 * Math.PI);
  c2.fill();

  c2.fillText(measuredGood, alignX+10, alignY+55);


}



// Web Page Functions
async function getScreenShot() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    const track = stream.getVideoTracks()[0];
    const imageCapture = new ImageCapture(track);

    const bitmap = await imageCapture.grabFrame();

    // Create a canvas element to draw the bitmap
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext('2d');
    context.drawImage(bitmap, 0, 0);

    // Convert the canvas content to a data URL
    const dataUrl = canvas.toDataURL('image/png');

    // Create a download link for the image
    const downloadLink = document.createElement('a');
    downloadLink.href = dataUrl;
    downloadLink.download = 'screenshot.png';

    // Trigger a click on the download link to initiate the download
    downloadLink.click();
  } catch (error) {
    console.error('Error capturing screenshot:', error);
  }
}

function submitData(){

  var elementX;
  var elementY;
  var radialValue;
  var radialError = false;
  // console.log(Object.keys(SHOT_DATA));
  for (let i = 1; i <= Object.keys(SHOT_DATA).length;i++){
    elementX = document.getElementById("measuredX"+i).value;
    elementY = document.getElementById("measuredY"+i).value;
    console.log(elementX);
    console.log(elementY);

    if (elementX == "" || elementY == ""){
      showErrorText();
      return;
    }
    else {
      hideErrorText();
    }
    radialValue = parseFloat(document.getElementById("radial"+i).value);
    if (radialValue >= 20.0){
      radialError = true;
    }
  }

  if (radialError){
    $('#popUpRadial').modal('show');
  } else {
    exportCSV();
  }
  

}
