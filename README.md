# Shot Tracking Interface 

## Requirements
- Only tested on Windows
- Make sure Python3 is installed on the PC first. 
    -This can be done by typing python into the cmd terminal.
- Run .bat file as Administrator if you're running into issues.
- Reccommended to use on Chrome.

## Run Program
1. Double click Run_Program.bat
2. A page will open in Chrome 
3. A command line window should remain open while the program is running. To stop the program, close the cmd window.

## Use Program:
1. Insert .csv files into the Recorded Folder from the Lomah
2. Click the gray "Select CSV File" Button and select the file you would like to edit.
3. Measure the actual shots and insert the coordinates for the Measured X and Measured Y
4. Save the CSV file using the Blue Save sheet button

### TroubleShooting
- If window does not open, Navigate to: 'http://localhost:8000/index.html'
- Default browser behavior usually downloads directly to the Downloads folder. If you want to change that you can either change your browser to ask you when downloading files, or change the default file location:
    > 1. Click the Chrome menu on the top right hand corner of the browser next to the URL bar (3 dots)
    > 2. Click Settings
    > 3. Click Show advanced settings and scroll down to the Downloads section
    > 4. Do one of the following steps:
    > 5. Click the Change button to set a new default location
    > 6. Click Ask where to save each file before downloading to manually select the location each time you download a file
    > 7. Close the Settings tab
- If the shot visual is not updating when updating MeasuredX or MeasuredY, clear your cache in your browser.