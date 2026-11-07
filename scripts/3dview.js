/* Data from php: JSONdata, name, environmentID */

/* Data Class */
class data {
    static data = JSONdata;

    static changesMade = false;

    static getJSON() {
        return JSON.parse(this.data);
    }

    static setJSON(updatedData) {
        this.changesMade = true;
        saveTextObject.textContent = "Changes not saved";
        this.data = JSON.stringify(updatedData);
    }
    
    static ObjectIDs = 9;

    static incrementObjectIDs() {
        this.ObjectIDs += 1;
        return this.ObjectIDs;
    }

    static CalculationIDs = 0;

    static incrementCalculationIDs() {
        this.CalculationIDs += 1;
        return this.CalculationIDs;
    }

    static save() {
        // Update Save Text
        saveTextObject.textContent = "Saving changes";

        // Data to be sent
        const dataToSend = {
            data: JSON.parse(data.data),
            id: environmentID
        };

        // Using Fetch API to make a POST request to the server
        fetch('./scripts/saveAPI.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        }).then(function(response) {
            // Update Save Text once the server has confirmed the save
            if (response.ok && saveTextObject.textContent != "Changes not saved") {
                saveTextObject.textContent = "Changes saved";
            }
        });

        data.saveTitle();
    }

    static saveTitle() {
        // Data to be sent
        const dataToSend = {
            name: environmentName,
            id: environmentID
        };

        // Using Fetch API to make a POST request to the server
        fetch('./scripts/saveTitleAPI.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        });
    }

    static autoSave() {
        if(saveTextObject.textContent == "Changes not saved") {
            data.save();
        }
    }

    static delete() {
        // Data to be sent
        const dataToSend = {
            id: environmentID
        };

        // Using Fetch API to make a POST request to the server
        fetch('./scripts/deleteEnvironment.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        }).then(function() {
            // Redirect to home page once the environment has been deleted
            window.location.href = "./home.php";
        });
    }

    static typeOfObject(id) {
        // Get Object from ID by iteration
        var objectJsonData = "";
        var jsonData = data.getJSON();
        var jsonObjectsData = jsonData.objects;
        for (var i = 0; i < jsonObjectsData.length; i++) {
            if (jsonObjectsData[i].id == id) {
                objectJsonData = jsonObjectsData[i];
            }
        }
        
        // Return corresponding object type
        var objectType = objectJsonData.type;
        return data.typeNames[objectType].toLowerCase();
    }

    static getObjectFormattedInfo(id) {
        // Get Object from ID by iteration
        var objectJsonData = "";
        var jsonData = data.getJSON();
        var jsonObjectsData = jsonData.objects;
        for (var i = 0; i < jsonObjectsData.length; i++) {
            if (jsonObjectsData[i].id == id) {
                objectJsonData = jsonObjectsData[i];
            }
        }

        // Return corresponding object info
        var objectInfo = objectJsonData.info;
        return objectInfo;
    }

    static isArrayFullOfNumbers(array) {
        var valid = true;
        for (var i = 0; i < array.length; i++) {
            try {
                new Decimal(array[i]);
            } catch(error) {
                valid = false;
            }
        }
        if (valid) {
            return true;
        }
        return false;
    }

    static images = {
        'point1':'pointEquation1',
        'line1':'lineEquation1',
        'line2':'lineEquation2',
        'plane1':'planeEquation1',
        'plane2':'planeEquation2',
        'plane3':'planeEquation3'
    }

    static imageHeights = {
        'point1':20,
        'line1':15,
        'line2':35,
        'plane1':17,
        'plane2':20,
        'plane3': 18
    }

    static typeNames = {
        'point1':'Point',
        'line1':'Line',
        'line2':'Line',
        'plane1':'Plane',
        'plane2':'Plane',
        'plane3':'Plane'
    }
    
    static numberOfParameters = {
        'point1':3,
        'line1':6,
        'line2':6,
        'plane1':9,
        'plane2':4,
        'plane3':4
    }
}

/* Expression Functions Class */
class expressionFunctions {
    static newObject(type, formattedInfo, id, red, green, blue) {
        var object;
        if (type == 'point1') {
            object = new point(formattedInfo, [red,green,blue,1]);
        }
        if (type == 'line1' || type == 'line2') {
            object = new line(formattedInfo, [red,green,blue,1]);
        }
        if (type == 'plane1' || type == 'plane2' || type == 'plane3') {
            object = new plane(formattedInfo, [red,green,blue,1]);
        }
        var expression = new expressionItem(id, false);
        expression.setObject(object);
        expressions.addsetExpression(expression);
    }

    static newExpressionDiv(id, type, colour, info, isVisible = false) {
        var newHTMLText =`
            <div class="expression" id="${id}">
                <div class="colourBar" style="background-color: rgb(${colour[0]*255}, ${colour[1]*255}, ${colour[2]*255});"></div>
                <p>#${id-9} ${data.typeNames[type]}</p>
                <div style="margin-left: 10px;">
                    <button id="${id}-visibleBtn" class="textBtn" style="margin-top: 0; margin-bottom: 0; padding: 0;">${isVisible ? "Hide" : "Show"}</button>
                    <button id="${id}-deleteBtn" class="textBtn red" style="margin-top: 0; margin-bottom: 0; padding: 0;">Delete</button>
                </div>
                <img src="./images/${data.images[type]}.jpg" height="${data.imageHeights[type]}px">
                ${
                    (type == 'point1') ? 
                    `<div>
                        ( &alpha;: <input size="2" type="text" id="${id}-0" value="${info[0]}">
                        &beta;: <input size="2" type="text" id="${id}-1" value="${info[1]}">
                        &gamma;: <input size="2" type="text" id="${id}-2" value="${info[2]}"> )
                    </div>` : ''
                }
                ${
                    (type == 'line1' || type == 'line2') ?
                    `<div>
                        ( a&#8321;: <input size="2" type="text" id="${id}-0" value="${info[0]}">
                        a&#8322;: <input size="2" type="text" id="${id}-1" value="${info[1]}">
                        a&#8323;: <input size="2" type="text" id="${id}-2" value="${info[2]}"> )
                    </div>
                    <div>
                        ( b&#8321;: <input size="2" type="text" id="${id}-3" value="${info[3]}">
                        b&#8322;: <input size="2" type="text" id="${id}-4" value="${info[4]}">
                        b&#8323;: <input size="2" type="text" id="${id}-5" value="${info[5]}"> )
                    </div>` : ''
                }
                ${
                    (type == 'plane1') ?
                    `<div>
                        ( a&#8321;: <input size="2" type="text" id="${id}-0"  value="${info[0]}">
                        a&#8322;: <input size="2" type="text" id="${id}-1" value="${info[1]}">
                        a&#8323;: <input size="2" type="text" id="${id}-2" value="${info[2]}"> )
                    </div>
                    <div>
                        ( b&#8321;: <input size="2" type="text" id="${id}-3" value="${info[3]}">
                        b&#8322;: <input size="2" type="text" id="${id}-4" value="${info[4]}">
                        b&#8323;: <input size="2" type="text" id="${id}-5" value="${info[5]}"> )
                    </div>
                    <div>
                        ( c&#8321;: <input size="2" type="text" id="${id}-6" value="${info[6]}">
                        c&#8322;: <input size="2" type="text" id="${id}-7" value="${info[7]}">
                        c&#8323;: <input size="2" type="text" id="${id}-8" value="${info[8]}"> )
                    </div>` : ''
                }
                ${
                    (type == 'plane2') ?
                    `<div>
                        ( a: <input size="2" type="text" id="${id}-0" value="${info[0]}">
                        b: <input size="2" type="text" id="${id}-1" value="${info[1]}">
                        c: <input size="2" type="text" id="${id}-2" value="${info[2]}">
                        d: <input size="2" type="text" id="${id}-3" value="${info[3]}"> )
                    </div>` : ''
                }
                ${
                    (type == 'plane3') ?
                    `<div>
                        ( n&#8321;: <input size="2" type="text" id="${id}-0" value="${info[0]}">
                        n&#8322;: <input size="2" type="text" id="${id}-1" value="${info[1]}">
                        n&#8323;: <input size="2" type="text" id="${id}-2" value="${info[2]}">
                        k: <input size="2" type="text" id="${id}-3" value="${info[3]}"> )
                    </div>` : ''
                }
            </div>
        `;
        
        var parser = new DOMParser();
        var newHTMLObject = parser.parseFromString(newHTMLText, 'text/html');
        var divObject = newHTMLObject.body.firstChild;
        var expressionsSidebar = document.getElementById('expressionSidebar');
        expressionsSidebar.appendChild(divObject);
    
        for (var i = 0; i < data.numberOfParameters[type]; i++) {
            document.getElementById(id+"-"+i).addEventListener('input', function(e) {
                expressionFunctions.expressionInputChanged(e);
            });
        }
    
        for (var i = 0; i < info.length; i++) {
            (function(index) {
                document.getElementById(id + "-" + index).addEventListener('input', function (e) {
                    expressionFunctions.expressionInputChanged(e);
                });
            })(i);
        }
    
        document.getElementById(id + "-visibleBtn").addEventListener('click', function (e) {
            expressionFunctions.toggleVisibility(e);
        });
    
        document.getElementById(id + "-deleteBtn").addEventListener('click', function (e) {
            expressionFunctions.deleteExpression(e);
        });
        
    }

    static newExpression(type) {
        // Get id
        var foundID = false;
        var id;
        var jsonData = data.getJSON();
        while (foundID == false) {
            var id = data.incrementObjectIDs();
            // Check if ID already exists
            var exists = false;
            for (var i = 0; i < jsonData.objects.length; i++) {
                if (jsonData.objects[i].id == id) {
                    exists = true;
                }
            }
            if (exists == false) {
                foundID = true;
            }
        }
    
        // Create JSON
        var infoText = "[";
        for (var i = 0; i < data.numberOfParameters[type]; i++) {
            infoText += "\"\"";
            if(i != data.numberOfParameters[type]-1) {
                infoText += ",";
            }
        }
        infoText += "]";
        var info = [];
        for (var i = 0; i < data.numberOfParameters[type]; i++) {
            info.push("");
        }
        var formattedInfo = [];
        for (var i = 0; i < data.numberOfParameters[type]; i++) {
            formattedInfo.push('');
        }
        // Generate Random Colour
        var red = Math.random();
        var green = Math.random();
        var blue = Math.random();
        var newJSON = `
        {
            "id":"${id}",
            "type":"${type}",
            "isVisible":false,
            "isExpressionInputHidden":false,
            "info":${infoText},
            "colour":[${red},${green},${blue},1]
        }`
        //console.log(type);
        newJSON = JSON.parse(newJSON);
        var jsonObjectsData = jsonData.objects;
        jsonObjectsData.push(newJSON);
        jsonData.objects = jsonObjectsData;
        data.setJSON(jsonData);
        
        // Create object
        expressionFunctions.newObject(type, formattedInfo, id, red, green, blue);
    
        // Create Expression Div
        expressionFunctions.newExpressionDiv(id, type, [red,green,blue,1], info);
    
        // Add option to calculations
        calculationsFunctions.addObjectDropdownChoice(id, type);
    
        // Hide Pop Up
        expressionFunctions.hideExpressionsPopup();
    }

    static expressionInputChanged(event) {
        var inputFieldId = event.target.id.split('-');
        var id = inputFieldId[0];
        var infoIndex = inputFieldId[1];
    
        var jsonData = data.getJSON();
        var jsonObjectsData = jsonData.objects;
        var specificJsonData = "";
        var specificJsonDataIndex;
        for (var i = 0; i < jsonObjectsData.length; i++) {
            if (jsonObjectsData[i].id == id) {
                jsonObjectsData[i].info[infoIndex] = event.target.value;
                specificJsonData = jsonObjectsData[i];
                specificJsonDataIndex = i;
            }
        }
    
        if (specificJsonData != "") {
            calculationsFunctions.updateCalculations();
            var visibleBtn = document.getElementById(`${id}-visibleBtn`);
            // show & update expression formattedInfo if valid info, else simply hide
            if (data.isArrayFullOfNumbers(specificJsonData.info) == true) {
                // Show if valid now that input changed, even if hidden beforehand
                // Update formattedInfo
                expressions.updateFormattedInfo(id, specificJsonData.info);
                // Show object/Re-calculate object (update button text, data, update expression, drawScene)
                jsonObjectsData[specificJsonDataIndex].isVisible = true;
                visibleBtn.textContent = "Hide";
                expressions.showObject(id);
                renderer.drawScene();
            } else {
                // Hide if not valid now that input changed
                // Hide object (update button text, data, update expression, drawScene)
                if (jsonObjectsData[specificJsonDataIndex].isVisible == true) {
                    visibleBtn.textContent = "Show";
                    jsonObjectsData[specificJsonDataIndex].isVisible = false;
                    expressions.hideObject(id);
                    renderer.drawScene();
                }
            }
        }
    
        jsonData.objects = jsonObjectsData;
        data.setJSON(jsonData);
    }

    static toggleVisibility(event) {
        var inputFieldId = event.target.id.split('-');
        var id = inputFieldId[0];
    
        var jsonData = data.getJSON();
        var jsonObjectsData = jsonData.objects;
        for (var i = 0; i < jsonObjectsData.length; i++) {
            if (jsonObjectsData[i].id == id) {
                if (event.target.textContent == "Hide") {
                    jsonObjectsData[i].isVisible = false;
                    expressions.hideObject(id);
                    event.target.textContent = "Show";
                } else {
                    if (data.isArrayFullOfNumbers(jsonObjectsData[i].info) == true) {
                        jsonObjectsData[i].isVisible = true;
                        expressions.showObject(id);
                        event.target.textContent = "Hide";
                    }
                }
                renderer.drawScene();
            }
        }
        
        jsonData.objects = jsonObjectsData;
        data.setJSON(jsonData);
    }
    
    static deleteExpression(event) {
        var inputFieldId = event.target.id.split('-');
        var id = inputFieldId[0];
    
        var jsonData = data.getJSON();
        var jsonObjectsData = jsonData.objects;
        for (var i = 0; i < jsonObjectsData.length; i++) {
            if (jsonObjectsData[i].id == id) {
                event.target.parentElement.parentElement.remove();
                calculationsFunctions.deleteObjectDropdownChoice(id);
                jsonObjectsData.splice(i, 1);
                jsonData.objects = jsonObjectsData;
                data.setJSON(jsonData);
                expressions.removeExpression(id);
                renderer.drawScene();
            }
        }
    }

    static showExpressionsPopup() {
        expressionsPopup.style.display = "block";
    }

    static hideExpressionsPopup() {
        expressionsPopup.style.display = "none";
    }

    static loadExpressions() {
        var jsonData = data.getJSON();
        var jsonObjectsData = jsonData.objects;
        data.ObjectIDs = jsonObjectsData.length + 9;
        for (var i = 0; i < jsonObjectsData.length; i++) {
            expressionFunctions.newExpressionDiv(jsonObjectsData[i].id, jsonObjectsData[i].type, jsonObjectsData[i].colour, jsonObjectsData[i].info, jsonObjectsData[i].isVisible);
            expressionFunctions.newObject(jsonObjectsData[i].type, jsonObjectsData[i].info, jsonObjectsData[i].id, jsonObjectsData[i].colour[0], jsonObjectsData[i].colour[1], jsonObjectsData[i].colour[2]);
            if (jsonObjectsData[i].isVisible) {
                expressions.showObject(jsonObjectsData[i].id);
            } else {
                expressions.hideObject(jsonObjectsData[i].id);
            }
        }
        expressions.recalcVertices();
    }
}

/* Calculations Functions Class */
class calculationsFunctions {
    static newCalculationDiv(id, colour, type, objectOneID, objectTwoID, output) {
        // Generate Object Dropdown Options
        var jsonData = data.getJSON();
        var jsonObjectsData = jsonData.objects;
        var objectDropdownOptions1 = "";
        for (var i = 0; i < jsonObjectsData.length; i++) {
            objectDropdownOptions1 += `<option ${(objectOneID == jsonObjectsData[i].id) ? "selected" : ""} value="${jsonObjectsData[i].id}">#${jsonObjectsData[i].id-9} ${data.typeNames[jsonObjectsData[i].type]}</option>`;
        }
        var objectDropdownOptions2 = "";
        for (var i = 0; i < jsonObjectsData.length; i++) {
            objectDropdownOptions2 += `<option ${(objectTwoID == jsonObjectsData[i].id) ? "selected" : ""} value="${jsonObjectsData[i].id}">#${jsonObjectsData[i].id-9} ${data.typeNames[jsonObjectsData[i].type]}</option>`;
        }
    
        var newHTMLText = `
            <div class="expression" id="c-${id}">
            <div class="colourBar" style="background-color: rgb(${colour[0]*255}, ${colour[1]*255}, ${colour[2]*255});"></div>
                <div style="margin-left: 10px; align-items: center;">
                    <button id="c-${id}-showStepsBtn" class="textBtn" style="margin-top: 0; margin-bottom: 0; padding: 0;
                    background: linear-gradient(90deg, rgba(38,130,245,1) 0%, rgba(25,49,173,1) 100%);
                    background-clip: text;
                    -webkit-text-fill-color: transparent;">Show Steps</button>
                    <font color="#e3e3e3">&#8403;</font>
                    <button id="c-${id}-deleteBtn" class="textBtn red" style="margin-top: 0; margin-bottom: 0; padding: 0;">Delete</button>
                </div>
                <p>
                    The
                    <select style="font-size: 20px;" name="calculation" id="c-${id}-0">
                        <option id="${id}-ignore">-</option>
                        <option ${(type == "Intersection") ? "selected" : ""} value="Intersection">Intersection</option>
                        <option ${(type == "Angle") ? "selected" : ""} value="Angle">Angle</option>
                        <option ${(type == "Distance") ? "selected" : ""} value="Distance">Distance</option>
                    </select>
                    between
                    <select style="font-size: 20px;" name="object1" id="c-${id}-1">
                        <option id="${id}-ignore">-</option>
                        ${objectDropdownOptions1}
                    </select>
                    and
                    <select style="font-size: 20px;" name="object2" id="c-${id}-2">
                        <option id="${id}-ignore">-</option>
                        ${objectDropdownOptions2}
                    </select> is
                    <span id="c-${id}-output" style="background-color: #eceefc; border-radius: 5px; padding: 3px;">${output}</span>
                </p>
            </div>`;
        
        var parser = new DOMParser();
        var newHTMLObject = parser.parseFromString(newHTMLText, 'text/html');
        var divObject = newHTMLObject.body.firstChild;
        var calculationsSidebar = document.getElementById('calculationsSidebar');
        calculationsSidebar.appendChild(divObject);
    
        for (var i = 0; i < 3; i++) {
            document.getElementById("c-"+id+"-"+i).addEventListener('input', function(e) {
                calculationsFunctions.calculationInputChanged(e);
            });
        }
    
        document.getElementById("c-" + id + "-deleteBtn").addEventListener('click', function (e) {
            calculationsFunctions.deleteCalculation(e);
        });
    
        document.getElementById("c-" + id + "-showStepsBtn").addEventListener('click', function () {
            launchShowStepsFor.id(id);
        });
    
        calculationsFunctions.updateCalculation(id);
    }

    static newCalculation() {
        // Generate ID
        var foundID = false;
        var id = 0;
        var jsonData = data.getJSON();
        while (foundID == false ) {
            var id = data.incrementCalculationIDs();
            // Check if ID already exists
            var exists = false;
            for (var i = 0; i < jsonData.calculations.length; i++) {
                if (jsonData.calculations[i].id == id) {
                    exists = true;
                }
            }
            if (exists == false) {
                foundID = true;
            }
        }
    
        // Generate Random Colour
        var red = Math.random();
        var green = Math.random();
        var blue = Math.random();
        // Update JSON
        var newJSON = `
        {
            "id":"${id}",
            "colour":[${red},${green},${blue},1]
        }`
        newJSON = JSON.parse(newJSON);
        jsonData = data.getJSON();
        var jsonCalculationsData = jsonData.calculations;
        jsonCalculationsData.push(newJSON);
        jsonData.calculations = jsonCalculationsData;
        data.setJSON(jsonData);
    
        // Create Div
        calculationsFunctions.newCalculationDiv(id, [red,green,blue,1], "", "", "", "No Calculation");
    }

    static calculationInputChanged(event) {
        // Get ID, Which Dropdown, and HTML Object to output to
        var inputFieldId = event.target.id.split('-');
        var id = inputFieldId[1];
        var dropdown = inputFieldId[2];
        var outputObject = document.getElementById("c-" + id + "-output");
    
        // Get Specific JSON Data of calculation by iteration
        var jsonData = data.getJSON();
        var jsonCalculationsData = jsonData.calculations;
        var specificJsonData = "";
        var j = 0;
        for (var i = 0; i < jsonCalculationsData.length; i++) {
            if (jsonCalculationsData[i].id == id) {
                specificJsonData = jsonCalculationsData[i];
                j = i;
            }
        }
    
        // Update JSON data to new dropdown value
        if (specificJsonData != "")  {
            if (dropdown == "0") {
                specificJsonData.type = event.target.value;
            }
            if (dropdown == "1") {
                specificJsonData.objectOneID = event.target.value;
            }
            if (dropdown == "2") {
                specificJsonData.objectTwoID = event.target.value;
            }
        }
        jsonData.calculations[j] = specificJsonData;
        data.setJSON(jsonData);

        // Check no dropdowns are set to "-"
        for (var i = 0; i < 3; i++) {
            var dropdowni = document.getElementById("c-" + id + "-" + i);
            if (dropdowni.value == "-") {
                outputObject.innerHTML = "No Calculation";
                return;
            }
        }
    
        // Check objects exist
        var info1;
        var info2;
        try {
            info1 = data.getObjectFormattedInfo(specificJsonData.objectOneID);
            info2 = data.getObjectFormattedInfo(specificJsonData.objectTwoID);
        } catch {
            outputObject.innerHTML = "No Calculation";
            return;
        }

        /* The Actual Calculation */
        // Check if calculation supported && Do calculation if supported
        var calcResult = false;
        // Check info isn't missing
        try {
            if (data.isArrayFullOfNumbers(info1) != true || data.isArrayFullOfNumbers(info2) != true) {
                outputObject.innerHTML = "Object data incomplete";
                return;
            }
            if (info1 === undefined || info2 === undefined) {
                outputObject.innerHTML = "Object data incomplete";
                return;
            }
        } catch {
            outputObject.innerHTML = "No Calculation";
            return;
        }
        if (specificJsonData.type == "Intersection") {
            if (data.typeOfObject(specificJsonData.objectOneID) == "line" && data.typeOfObject(specificJsonData.objectTwoID) == "line") {
                calcResult = (objectCalculations.intersectionLineLine(info1, info2)).toString();
            }
            if (data.typeOfObject(specificJsonData.objectOneID) == "line" && data.typeOfObject(specificJsonData.objectTwoID) == "plane") {
                calcResult = (objectCalculations.intersectionPlaneLine(info2, info1)).toString();
            }
            if (data.typeOfObject(specificJsonData.objectOneID) == "plane" && data.typeOfObject(specificJsonData.objectTwoID) == "line") {
                calcResult = (objectCalculations.intersectionPlaneLine(info1, info2)).toString();
            }
            // Clip Intersection to 4dp
            if (calcResult != false && calcResult != "parallel" && calcResult != "skew") {
                var newCalcResult = "(";
                var splitByCommas = calcResult.split(',');
                for (var i = 0; i < 3; i++) {
                    var splitByDecimals = splitByCommas[i].split('.');
                    newCalcResult += splitByDecimals[0];
                    if (splitByDecimals.length == 2) {
                        newCalcResult += ".";
                        newCalcResult += splitByDecimals[1].substring(0, 4);
                    }
                    if (i < 2) {
                        newCalcResult += ", ";
                    }
                }
                calcResult = newCalcResult+")";
            }
        }
        if (specificJsonData.type == "Distance") {
            //console.log("distance")
            if (data.typeOfObject(specificJsonData.objectOneID) == "line" && data.typeOfObject(specificJsonData.objectTwoID) == "line") {
                calcResult = parseFloat(objectCalculations.distanceLineLine(info1, info2).toFixed(4));
            }
            if (data.typeOfObject(specificJsonData.objectOneID) == "line" && data.typeOfObject(specificJsonData.objectTwoID) == "point") {
                calcResult = parseFloat(objectCalculations.distanceLinePoint(info1, info2)[0].toFixed(4));
            }
            if (data.typeOfObject(specificJsonData.objectOneID) == "point" && data.typeOfObject(specificJsonData.objectTwoID) == "line") {
                calcResult = parseFloat(objectCalculations.distanceLinePoint(info2, info1)[0].toFixed(4));
            }
            if (data.typeOfObject(specificJsonData.objectOneID) == "point" && data.typeOfObject(specificJsonData.objectTwoID) == "plane") {
                calcResult = parseFloat(objectCalculations.distancePlanePoint(info2, info1)[0].toFixed(4));
            }
            if (data.typeOfObject(specificJsonData.objectOneID) == "plane" && data.typeOfObject(specificJsonData.objectTwoID) == "point") {
                calcResult = parseFloat(objectCalculations.distancePlanePoint(info1, info2)[0].toFixed(4));
            }
        }
        if (specificJsonData.type == "Angle") {
            if (data.typeOfObject(specificJsonData.objectOneID) == "line" && data.typeOfObject(specificJsonData.objectTwoID) == "line") {
                calcResult = parseFloat(objectCalculations.angleBetweenLineLine(info1, info2).toFixed(4));
            }
            if (data.typeOfObject(specificJsonData.objectOneID) == "line" && data.typeOfObject(specificJsonData.objectTwoID) == "plane") {
                calcResult = parseFloat(objectCalculations.angleBetweenPlaneLine(info2, info1).toFixed(4));
            }
            if (data.typeOfObject(specificJsonData.objectOneID) == "plane" && data.typeOfObject(specificJsonData.objectTwoID) == "line") {
                calcResult = parseFloat(objectCalculations.angleBetweenPlaneLine(info1, info2).toFixed(4));
            }
            if (data.typeOfObject(specificJsonData.objectOneID) == "plane" && data.typeOfObject(specificJsonData.objectTwoID) == "plane") {
                calcResult = parseFloat(objectCalculations.angleBetweenPlanePlane(info1, info2).toFixed(4));
            }
        }
        // Output if not supported
        if (calcResult === false) {
            // Update output text
            outputObject.innerHTML = "Calculation not supported";
        } else {
            outputObject.innerHTML = calcResult;
        }
    }

    static updateCalculation(id) {
        var firstDropdown = document.getElementById(`c-${id}-0`);
        var event = {"target":firstDropdown};
        calculationsFunctions.calculationInputChanged(event);
    }

    static updateCalculations() {
        // For each calculation (id)
        var jsonData = data.getJSON();
        var jsonCalculationsData = jsonData.calculations;
        for (var i = 0; i < jsonCalculationsData.length; i++) {
            // Call function with calculation id
            calculationsFunctions.updateCalculation(jsonCalculationsData[i].id);
        }
    }

    static addObjectDropdownChoice(id, rawType) {
        // For each calculation (id)
        var jsonData = data.getJSON();
        var jsonCalculationsData = jsonData.calculations;
        for (var i = 0; i < jsonCalculationsData.length; i++) {
            // For each object dropdown, where HTML ID = c-${id}-1 and c-${id}-2
            var calculationID = jsonCalculationsData[i].id;
            for (var j = 1; j < 3; j++) {
                var dropdownObject = document.getElementById(`c-${calculationID}-${j}`);
                // Add option
                var dropdownOptionHTML = `<option value="${id}">#${id-9} ${data.typeNames[rawType]}</option>`;
                var parser = new DOMParser();
                var newHTMLObject = parser.parseFromString(dropdownOptionHTML, 'text/html');
                dropdownObject.appendChild(newHTMLObject.body.firstChild);
            }
        }
    }
    
    static deleteObjectDropdownChoice(id) {
        // For each calculation (id)
        var jsonData = data.getJSON();
        var jsonCalculationsData = jsonData.calculations;
        for (var i = 0; i < jsonCalculationsData.length; i++) {
            // For each object dropdown, where HTML ID = c-${id}-1 and c-${id}-2
            var calculationID = jsonCalculationsData[i].id;
            for (var j = 1; j < 3; j++) {
                var dropdownObject = document.getElementById(`c-${calculationID}-${j}`);
                var dropdownOptions = dropdownObject.children;
                // Iterate through children, delete when value = id
                for (var k = 0; k < dropdownOptions.length; k++) {
                    if (dropdownOptions[k].value == id) {
                        dropdownOptions[k].remove();
                    }
                }
            }
        }
    }

    static deleteCalculation(event) {
        // Get ID
        var inputFieldId = event.target.id.split('-');
        var id = inputFieldId[1];
    
        // Update JSON
        var jsonData = data.getJSON();
        var jsonCalculationsData = jsonData.calculations;
        for (var i = 0; i < jsonCalculationsData.length; i++) {
            var calculationID = jsonCalculationsData[i].id;
            if (calculationID == id) {
                jsonCalculationsData.splice(i, 1);
                jsonData.calculations = jsonCalculationsData;
                data.setJSON(jsonData);
            }
        }
    
        // Delete Div
        event.target.parentElement.parentElement.remove();
    }

    static showSupportedCalculationsPopup() {
        supportedCalculationsPopup.style.display = "block";
    }

    static hideSupportedCalculationsPopup() {
        supportedCalculationsPopup.style.display = "none";
    }

    static loadCalculations() {
        var jsonData = data.getJSON();
        var jsonCalculationsData = jsonData.calculations;
        data.CalculationIDs = jsonCalculationsData.length;
        for (var i = 0; i < jsonCalculationsData.length; i++) {
            var calculationData = jsonCalculationsData[i];
            //console.log(calculationData);
            calculationsFunctions.newCalculationDiv(calculationData.id, calculationData.colour, calculationData.type, calculationData.objectOneID, calculationData.objectTwoID, calculationData.output);
        }
    }
}

/* Show Steps Class */
class launchShowStepsFor {
    static clearShowStepsPopup() {
        // Loop through elements under the pop up
        var children = showStepsPopup.firstElementChild.children;
        while (children.length != 1) {
            // Remove all but close button
            if (children[0].tagName != "BUTTON") {
                children[0].remove();
            }
            if (children.length > 1) {
                if (children[1].tagName != "BUTTON") {
                    children[1].remove();
                }
            }
        }
    }

    static insertIntoShowStepsPopup(rawHTML) {
        var parser = new DOMParser();
        var newHTMLObjects = parser.parseFromString(rawHTML, 'text/html').body.children;
        var length = newHTMLObjects.length;
        for (var i = 0; i < length; i++) {
            showStepsPopup.firstElementChild.appendChild(newHTMLObjects[0]);
        }
    }

    static intersectionParallelLines(lineFormattedInfo1, lineFormattedInfo2) {
        // Generate HTML
        var rawHTML = `
            <h4>Intersection between two lines</h4>
            <p>Let line 1 be: (${lineFormattedInfo1[0]}, ${lineFormattedInfo1[1]}, ${lineFormattedInfo1[2]}) + &lambda;(${lineFormattedInfo1[3]}, ${lineFormattedInfo1[4]}, ${lineFormattedInfo1[5]})</p>
            <p>Let line 2 be: (${lineFormattedInfo2[0]}, ${lineFormattedInfo2[1]}, ${lineFormattedInfo2[2]}) + &mu;(${lineFormattedInfo2[3]}, ${lineFormattedInfo2[4]}, ${lineFormattedInfo2[5]})</p>
            <p>By observation, the direction vectors of the lines are multiples of each other. Therefore, the lines are parallel.</p>
        `;
        launchShowStepsFor.clearShowStepsPopup();
        launchShowStepsFor.insertIntoShowStepsPopup(rawHTML);
        showStepsPopup.style.display = "block";
    }

    static intersectionSkewLines(lineFormattedInfo1, lineFormattedInfo2) {
        /* Generate additional needed variables */
        // Solve simultaneous equations
        var [lambda, mu] = solveSimulEq_2Unknowns([lineFormattedInfo1[3], lineFormattedInfo2[3]*-1, lineFormattedInfo2[0]-lineFormattedInfo1[0], lineFormattedInfo1[4], lineFormattedInfo2[4]*-1, lineFormattedInfo2[1]-lineFormattedInfo1[1]])

        // 4d.p. the simulataneous equations:
        var lambda = parseFloat(lambda.toFixed(4));
        var mu = parseFloat(mu.toFixed(4));

        // Generate HTML
        var rawHTML = `
            <h4>Intersection between two lines</h4>
            <p>Let line 1 be: (${lineFormattedInfo1[0]}, ${lineFormattedInfo1[1]}, ${lineFormattedInfo1[2]}) + &lambda;(${lineFormattedInfo1[3]}, ${lineFormattedInfo1[4]}, ${lineFormattedInfo1[5]})</p>
            <p>Let line 2 be: (${lineFormattedInfo2[0]}, ${lineFormattedInfo2[1]}, ${lineFormattedInfo2[2]}) + &mu;(${lineFormattedInfo2[3]}, ${lineFormattedInfo2[4]}, ${lineFormattedInfo2[5]})</p>
            <p>Form simulataneous equations by equating the two lines:</p>
            <div class="centerHorizontal">
                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                    <p>${lineFormattedInfo1[0]} ${lineFormattedInfo1[3] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[3])}&lambda;</p>
                    <p>${lineFormattedInfo1[1]} ${lineFormattedInfo1[4] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[4])}&lambda;</p>
                    <p>${lineFormattedInfo1[2]} ${lineFormattedInfo1[5] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[5])}&lambda;</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">
                
                <div style="padding: 10px;" class="centerVertical">
                    <p>=</p>
                </div>

                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                <p>${lineFormattedInfo2[0]} ${lineFormattedInfo2[3] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[3])}&mu;</p>
                <p>${lineFormattedInfo2[1]} ${lineFormattedInfo2[4] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[4])}&mu;</p>
                <p>${lineFormattedInfo2[2]} ${lineFormattedInfo2[5] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[5])}&mu;</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">
            </div>
            <div class="centerHorizontal">
                <div class="centerVertical">
                    <p>${lineFormattedInfo1[3]}&lambda; ${lineFormattedInfo2[3]*-1 >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[3])}&mu; = ${lineFormattedInfo2[0] - lineFormattedInfo1[0]} --- (1)</p>
                    <p>${lineFormattedInfo1[4]}&lambda; ${lineFormattedInfo2[4]*-1 >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[4])}&mu; = ${lineFormattedInfo2[1] - lineFormattedInfo1[1]} --- (2)</p>
                    <p>${lineFormattedInfo1[5]}&lambda; ${lineFormattedInfo2[5]*-1 >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[5])}&mu; = ${lineFormattedInfo2[2] - lineFormattedInfo1[2]} --- (3)</p>
                </div>
            </div>
            <p>Solve the first two equations simultaneously:</p>
            <div class="centerHorizontal">
                <p>&lambda; = ${lambda}, &mu; = ${mu}</p>
            </div>
            <p>Subsitute these into equation 3:</p>
            <div class="centerHorizontal">
                <p>${lineFormattedInfo1[5]}(${lambda}) ${lineFormattedInfo2[5]*-1 >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[5])}(${mu}) = ${parseFloat(((lineFormattedInfo1[5]*lambda) - (lineFormattedInfo2[5]*mu)).toFixed(4))} ≠ ${lineFormattedInfo2[2] - lineFormattedInfo1[2]}</p>
            </div>
            <p>The third equation is not fullfilled or the equations have no solution, therefore the equations are not consistent. Therefore the lines are skew, they do not intersect.</p>
        `;
        launchShowStepsFor.clearShowStepsPopup();
        launchShowStepsFor.insertIntoShowStepsPopup(rawHTML);
        showStepsPopup.style.display = "block";
    }

    static intersectionTwoLines(lineFormattedInfo1, lineFormattedInfo2) {
        /* Generate additional needed variables */
        // Solve simultaneous equations
        var [lambda, mu] = solveSimulEq_2Unknowns([lineFormattedInfo1[3], lineFormattedInfo2[3]*-1, lineFormattedInfo2[0]-lineFormattedInfo1[0], lineFormattedInfo1[4], lineFormattedInfo2[4]*-1, lineFormattedInfo2[1]-lineFormattedInfo1[1]]);

        // 4d.p. the simulataneous equations:
        var lambda = parseFloat(lambda.toFixed(4));
        var mu = parseFloat(mu.toFixed(4));

        // Generate HTML
        var rawHTML = `
            <h4>Intersection between two lines</h4>
            <p>Let line 1 be: (${lineFormattedInfo1[0]}, ${lineFormattedInfo1[1]}, ${lineFormattedInfo1[2]}) + &lambda;(${lineFormattedInfo1[3]}, ${lineFormattedInfo1[4]}, ${lineFormattedInfo1[5]})</p>
            <p>Let line 2 be: (${lineFormattedInfo2[0]}, ${lineFormattedInfo2[1]}, ${lineFormattedInfo2[2]}) + &mu;(${lineFormattedInfo2[3]}, ${lineFormattedInfo2[4]}, ${lineFormattedInfo2[5]})</p>
            <p>Form simulataneous equations by equating the two lines:</p>
            <div class="centerHorizontal">
                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                    <p>${lineFormattedInfo1[0]} ${lineFormattedInfo1[3] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[3])}&lambda;</p>
                    <p>${lineFormattedInfo1[1]} ${lineFormattedInfo1[4] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[4])}&lambda;</p>
                    <p>${lineFormattedInfo1[2]} ${lineFormattedInfo1[5] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[5])}&lambda;</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">
                
                <div style="padding: 10px;" class="centerVertical">
                    <p>=</p>
                </div>

                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                <p>${lineFormattedInfo2[0]} ${lineFormattedInfo2[3] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[3])}&mu;</p>
                <p>${lineFormattedInfo2[1]} ${lineFormattedInfo2[4] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[4])}&mu;</p>
                <p>${lineFormattedInfo2[2]} ${lineFormattedInfo2[5] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[5])}&mu;</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">
            </div>
            <div class="centerHorizontal">
                <div class="centerVertical">
                    <p>${lineFormattedInfo1[3]}&lambda; ${lineFormattedInfo2[3]*-1 >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[3])}&mu; = ${lineFormattedInfo2[0] - lineFormattedInfo1[0]} --- (1)</p>
                    <p>${lineFormattedInfo1[4]}&lambda; ${lineFormattedInfo2[4]*-1 >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[4])}&mu; = ${lineFormattedInfo2[1] - lineFormattedInfo1[1]} --- (2)</p>
                    <p>${lineFormattedInfo1[5]}&lambda; ${lineFormattedInfo2[5]*-1 >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[5])}&mu; = ${lineFormattedInfo2[2] - lineFormattedInfo1[2]} --- (3)</p>
                </div>
            </div>
            <p>Solve the first two equations simultaneously:</p>
            <div class="centerHorizontal">
                <p>&lambda; = ${lambda}, &mu; = ${mu}</p>
            </div>
            <p>Subsitute these into equation 3:</p>
            <div class="centerHorizontal">
                <p>${lineFormattedInfo1[5]}(${lambda}) ${lineFormattedInfo2[5]*-1 >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[5])}(${mu}) = ${lineFormattedInfo1[5]*lambda + lineFormattedInfo2[5]*mu} = ${lineFormattedInfo2[2] - lineFormattedInfo1[2]}</p>
            </div>
            <p>This equation is fullfilled, therefore the equations are consistent. Therefore the lines do intersect. Substitute these values into the general equation of either line to get this intersection point:</p>
            <div class="centerHorizontal">
                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                    <p>${lineFormattedInfo1[0]} ${lineFormattedInfo1[3] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[3])}(${lambda})</p>
                    <p>${lineFormattedInfo1[1]} ${lineFormattedInfo1[4] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[4])}(${lambda})</p>
                    <p>${lineFormattedInfo1[2]} ${lineFormattedInfo1[5] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[5])}(${lambda})</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">
            
                <div style="padding: 10px;" class="centerVertical">
                    <p>=</p>
                </div>

                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                    <p>${parseFloat((parseFloat( lineFormattedInfo1[0] + (lineFormattedInfo1[3]*lambda) )).toFixed(4))}</p>
                    <p>${parseFloat((parseFloat( lineFormattedInfo1[1] + (lineFormattedInfo1[4]*lambda) )).toFixed(4))}</p>
                    <p>${parseFloat((parseFloat( lineFormattedInfo1[2] + (lineFormattedInfo1[5]*lambda) )).toFixed(4))}</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">
            
                <div style="padding: 10px;" class="centerVertical">
                    <p>= (${parseFloat(( parseFloat(lineFormattedInfo1[0] + (lineFormattedInfo1[3]*lambda)) ).toFixed(4))}, ${parseFloat((parseFloat( lineFormattedInfo1[1] + (lineFormattedInfo1[4]*lambda) ).toFixed(4)))}, ${parseFloat((parseFloat( lineFormattedInfo1[2] + (lineFormattedInfo1[5]*lambda) )).toFixed(4))})</p>
                </div>
            </div>
        `;
        launchShowStepsFor.clearShowStepsPopup();
        launchShowStepsFor.insertIntoShowStepsPopup(rawHTML);
        showStepsPopup.style.display = "block";
    }

    static intersectionParallelPlaneLine(planeFormattedInfo, lineFormattedInfo) {
        if (planeFormattedInfo.length == 9) {
            planeFormattedInfo = objectCalculations.parametricPlaneToCartesian(planeFormattedInfo);
        }

        // Generate HTML
        var rawHTML = `
            <h4>Intersection between a line and a plane</h4>
            <p>Line: (${lineFormattedInfo[0]}, ${lineFormattedInfo[1]}, ${lineFormattedInfo[2]}) + &lambda;(${lineFormattedInfo[3]}, ${lineFormattedInfo[4]}, ${lineFormattedInfo[5]})</p>
            <p>Plane: ${planeFormattedInfo[0]}x ${planeFormattedInfo[1] >= 0 ? "+" : "-"} ${Math.abs(planeFormattedInfo[1])}y ${planeFormattedInfo[2] >= 0 ? "+" : "-"} ${Math.abs(planeFormattedInfo[2])}z = ${planeFormattedInfo[3]}</p>
            <p>Calculating the dot product of the normal of the plane and the direction vector of the line we get:</p>
            <div class="centerHorizontal">
                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                    <p>${lineFormattedInfo[3]}</p>
                    <p>${lineFormattedInfo[4]}</p>
                    <p>${lineFormattedInfo[5]}</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">
                <p> . </p>
                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                <p>${planeFormattedInfo[0]}</p>
                <p>${planeFormattedInfo[1]}</p>
                <p>${planeFormattedInfo[2]}</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">
                
                <div style="padding: 10px;" class="centerVertical">
                    <p>= (${lineFormattedInfo[3]})(${planeFormattedInfo[0]}) + (${lineFormattedInfo[4]})(${planeFormattedInfo[1]}) + (${lineFormattedInfo[5]})(${planeFormattedInfo[2]}) = ${(lineFormattedInfo[3]*planeFormattedInfo[0]) + (lineFormattedInfo[4]*planeFormattedInfo[1]) + (lineFormattedInfo[5]*planeFormattedInfo[2])}</p>
                </div>
            </div>
            <p>Therefore they are parallel, and either do not intersect or overlap completely</p>
        `;
        launchShowStepsFor.clearShowStepsPopup();
        launchShowStepsFor.insertIntoShowStepsPopup(rawHTML);
        showStepsPopup.style.display = "block";
    }

    static intersectionPlaneLine(planeFormattedInfo, lineFormattedInfo) {
        if (planeFormattedInfo.length == 9) {
            planeFormattedInfo = objectCalculations.parametricPlaneToCartesian(planeFormattedInfo);
        }
        /* Generate additional needed variables */
        // Code from classes.js calculation:
        var a = new Decimal(planeFormattedInfo[0]);
        var b = new Decimal(planeFormattedInfo[1]);
        var c = new Decimal(planeFormattedInfo[2]);
        var d = new Decimal(planeFormattedInfo[3]);
        var a1 = new Decimal(lineFormattedInfo[0]);
        var a2 = new Decimal(lineFormattedInfo[1]);
        var a3 = new Decimal(lineFormattedInfo[2]);
        var b1 = new Decimal(lineFormattedInfo[3]);
        var b2 = new Decimal(lineFormattedInfo[4]);
        var b3 = new Decimal(lineFormattedInfo[5]);

        var tCoefficient = (b1.times(a)).add(b2.times(b)).add(b3.times(c));
        var cValue = (a1.times(a)).add(a2.times(b)).add(a3.times(c)).minus(d).times(-1);
        var tValue = cValue.dividedBy(tCoefficient);

        var intersectionPoint = [];
        intersectionPoint[0] = a1.add(tValue.times(b1));
        intersectionPoint[1] = a2.add(tValue.times(b2));
        intersectionPoint[2] = a3.add(tValue.times(b3));

        // Variables to use
        var lambda = parseFloat(tValue.toFixed(4));
        var intersection1 = parseFloat(intersectionPoint[0].toFixed(4))
        var intersection2 = parseFloat(intersectionPoint[1].toFixed(4))
        var intersection3 = parseFloat(intersectionPoint[2].toFixed(4))

        // Generate HTML
        var rawHTML = `
            <h4>Intersection between a line and a plane</h4>
            <p>Line: (${lineFormattedInfo[0]}, ${lineFormattedInfo[1]}, ${lineFormattedInfo[2]}) + &lambda;(${lineFormattedInfo[3]}, ${lineFormattedInfo[4]}, ${lineFormattedInfo[5]})</p>
            <p>Plane: ${planeFormattedInfo[0]}x ${planeFormattedInfo[1] >= 0 ? "+" : "-"} ${Math.abs(planeFormattedInfo[1])}y ${planeFormattedInfo[2] >= 0 ? "+" : "-"} ${Math.abs(planeFormattedInfo[2])}z = ${planeFormattedInfo[3]}</p>
            <p>(To check if they intersect, use the dot product of the direction vectors, if it equals 0, they are parallel and either don't intersect or overlap completly)</p>
            <p>Express the plane in the form r.n = k:</p>
            <div class="centerHorizontal">
                <p>r . </p>
                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                    <p>${planeFormattedInfo[0]}</p>
                    <p>${planeFormattedInfo[1]}</p>
                    <p>${planeFormattedInfo[2]}</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">
                
                <div style="padding: 10px;" class="centerVertical">
                    <p>= ${planeFormattedInfo[3]}</p>
                </div>
            </div>
            <p>Substitute in the general equation of the line and solve for &lambda;:</p>
            <div class="centerHorizontal">
                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                    <p>${lineFormattedInfo[0]} ${lineFormattedInfo[3] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo[3])}&lambda;</p>
                    <p>${lineFormattedInfo[1]} ${lineFormattedInfo[4] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo[4])}&lambda;</p>
                    <p>${lineFormattedInfo[2]} ${lineFormattedInfo[5] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo[5])}&lambda;</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">
                <p> . </p>
                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                    <p>${planeFormattedInfo[0]}</p>
                    <p>${planeFormattedInfo[1]}</p>
                    <p>${planeFormattedInfo[2]}</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">
                
                <div style="padding: 10px;" class="centerVertical">
                    <p>= ${planeFormattedInfo[3]}</p>
                </div>
            </div>
            <div class="centerHorizontal">
                <p>${planeFormattedInfo[0]}(${lineFormattedInfo[0]} ${lineFormattedInfo[3] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo[3])}&lambda;) ${planeFormattedInfo[1] >= 0 ? "+" : "-"} ${Math.abs(planeFormattedInfo[1])}(${lineFormattedInfo[1]} ${lineFormattedInfo[4] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo[4])}&lambda;) ${planeFormattedInfo[2] >= 0 ? "+" : "-"} ${Math.abs(planeFormattedInfo[2])}(${lineFormattedInfo[2]} ${lineFormattedInfo[5] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo[5])}&lambda;) = ${planeFormattedInfo[3]}</p>
            </div>
            <div class="centerHorizontal">
                <p>&lambda; = ${lambda}</p>
            </div>
            <p>Substitute this into the general equation of the line to get the intersection point:</p>
            <div class="centerHorizontal">
                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                <p>${lineFormattedInfo[0]} ${lineFormattedInfo[3] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo[3])}(${lambda})</p>
                <p>${lineFormattedInfo[1]} ${lineFormattedInfo[4] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo[4])}(${lambda})</p>
                <p>${lineFormattedInfo[2]} ${lineFormattedInfo[5] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo[5])}(${lambda})</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">
            
                <div style="padding: 10px;" class="centerVertical">
                    <p>=</p>
                </div>

                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                    <p>${intersection1}</p>
                    <p>${intersection2}</p>
                    <p>${intersection2}</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">
            
                <div style="padding: 10px;" class="centerVertical">
                    <p>= (${intersection1}, ${intersection2}, ${intersection3})</p>
                </div>
            </div>

        `;
        launchShowStepsFor.clearShowStepsPopup();
        launchShowStepsFor.insertIntoShowStepsPopup(rawHTML);
        showStepsPopup.style.display = "block";
    }

    static distanceParallelLines(lineFormattedInfo1, lineFormattedInfo2) {
        /* Generate additional needed variables */
        var ABVector = [lineFormattedInfo2[0]-lineFormattedInfo1[0],lineFormattedInfo2[1]-lineFormattedInfo1[1],lineFormattedInfo2[2]-lineFormattedInfo1[2], lineFormattedInfo1[3], lineFormattedInfo1[4], lineFormattedInfo1[5]];

        var t = -((ABVector[0]*ABVector[3])+(ABVector[1]*ABVector[4])+(ABVector[2]*ABVector[5]))/((ABVector[3]*ABVector[3])+(ABVector[4]*ABVector[4])+(ABVector[5]*ABVector[5]));
        //console.log(((ABVector[0]*ABVector[3])+(ABVector[1]*ABVector[4])+(ABVector[2]*ABVector[5])));
        //console.log(((ABVector[3]*ABVector[3])+(ABVector[4]*ABVector[4])+(ABVector[5]*ABVector[5])));
        t = parseFloat(t.toFixed(4));

        var AB = [parseFloat((lineFormattedInfo2[0]-lineFormattedInfo1[0] + (lineFormattedInfo1[3]*t)).toFixed(4)), parseFloat((lineFormattedInfo2[1]-lineFormattedInfo1[1] + (lineFormattedInfo1[4]*t)).toFixed(4)), parseFloat((lineFormattedInfo2[2]-lineFormattedInfo1[2] + (lineFormattedInfo1[5]*t)).toFixed(4))];

        var distance = parseFloat(Math.sqrt((AB[0]*AB[0]) + (AB[1]*AB[1]) + (AB[2]*AB[2])).toFixed(4));

        // Generate HTML
        var rawHTML = `
            <h4>Distance between two parallel lines</h4>
            <p>Let line 1 be: (${lineFormattedInfo1[0]}, ${lineFormattedInfo1[1]}, ${lineFormattedInfo1[2]}) + &lambda;(${lineFormattedInfo1[3]}, ${lineFormattedInfo1[4]}, ${lineFormattedInfo1[5]})</p>
            <p>Let line 2 be: (${lineFormattedInfo2[0]}, ${lineFormattedInfo2[1]}, ${lineFormattedInfo2[2]}) + &mu;(${lineFormattedInfo2[3]}, ${lineFormattedInfo2[4]}, ${lineFormattedInfo2[5]})</p>
            <p>From observation, the direction vectors are multiples of each other, the lines are parallel.</p>
            <p>Adjust line 2 to have a matching direction vector: (${lineFormattedInfo2[0]}, ${lineFormattedInfo2[1]}, ${lineFormattedInfo2[2]}) + &mu;(${lineFormattedInfo1[3]}, ${lineFormattedInfo1[4]}, ${lineFormattedInfo1[5]})</p>
            <p>Let A be a general point on line 1, and B a general point on line 2. Now, get the direction vector AB by:</p>

            
            <div class="centerHorizontal">
                <p>AB = B - A = </p>

                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                    <p>${lineFormattedInfo2[0]} ${lineFormattedInfo1[3] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[3])}&mu;</p>
                    <p>${lineFormattedInfo2[1]} ${lineFormattedInfo1[4] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[4])}&mu;</p>
                    <p>${lineFormattedInfo2[2]} ${lineFormattedInfo1[5] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[5])}&mu;</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">

                <p> - </p>

                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                <p>${lineFormattedInfo1[0]} ${lineFormattedInfo1[3] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[3])}&lambda;</p>
                <p>${lineFormattedInfo1[1]} ${lineFormattedInfo1[4] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[4])}&lambda;</p>
                <p>${lineFormattedInfo1[2]} ${lineFormattedInfo1[5] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[5])}&lambda;</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">

                <p> = </p>

                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                    <p>${lineFormattedInfo2[0]-lineFormattedInfo1[0]} ${lineFormattedInfo1[3] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[3])}&mu; ${(lineFormattedInfo1[3]*-1) >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[3])}&lambda;</p>
                    <p>${lineFormattedInfo2[1]-lineFormattedInfo1[1]} ${lineFormattedInfo1[4] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[4])}&mu; ${(lineFormattedInfo1[4]*-1) >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[4])}&lambda;</p>
                    <p>${lineFormattedInfo2[2]-lineFormattedInfo1[2]} ${lineFormattedInfo1[5] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[5])}&mu; ${(lineFormattedInfo1[5]*-1) >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[5])}&lambda;</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">
            </div>

            <p>Let t = &mu; - &lambda;:</p>
            <div class="centerHorizontal">
                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                    <p>${lineFormattedInfo2[0]-lineFormattedInfo1[0]} ${lineFormattedInfo1[3] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[3])}t</p>
                    <p>${lineFormattedInfo2[1]-lineFormattedInfo1[1]} ${lineFormattedInfo1[4] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[4])}t</p>
                    <p>${lineFormattedInfo2[2]-lineFormattedInfo1[2]} ${lineFormattedInfo1[5] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[5])}t</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">
            </div>

            <p>AB is perpendicular to both lines, so the dot product of AB with any of the line's direction vector will equal 0:</p>
            <div class="centerHorizontal">
                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                    <p>${lineFormattedInfo2[0]-lineFormattedInfo1[0]} ${lineFormattedInfo1[3] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[3])}t</p>
                    <p>${lineFormattedInfo2[1]-lineFormattedInfo1[1]} ${lineFormattedInfo1[4] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[4])}t</p>
                    <p>${lineFormattedInfo2[2]-lineFormattedInfo1[2]} ${lineFormattedInfo1[5] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[5])}t</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">

                <p> . </p>

                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                    <p>${lineFormattedInfo1[3]}</p>
                    <p>${lineFormattedInfo1[4]}</p>
                    <p>${lineFormattedInfo1[5]}</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">

                <p> = 0</p>
            </div>
            <div class="centerHorizontal">
                <p>(${lineFormattedInfo1[3]})(${lineFormattedInfo2[0]-lineFormattedInfo1[0]} ${lineFormattedInfo1[3] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[3])}t) + (${lineFormattedInfo1[4]})(${lineFormattedInfo2[1]-lineFormattedInfo1[1]} ${lineFormattedInfo1[4] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[4])}t) + (${lineFormattedInfo1[5]})(${lineFormattedInfo2[2]-lineFormattedInfo1[2]} ${lineFormattedInfo1[5] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[5])}t) = 0</p>
            </div>
            <div class="centerHorizontal">
                <p>t = ${t}</p>
            </div>

            <p>Now we can substitute t back into AB:</p>
            <div class="centerHorizontal">
                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                    <p>${lineFormattedInfo2[0]-lineFormattedInfo1[0]} ${lineFormattedInfo1[3] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[3])}(${t})</p>
                    <p>${lineFormattedInfo2[1]-lineFormattedInfo1[1]} ${lineFormattedInfo1[4] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[4])}(${t})</p>
                    <p>${lineFormattedInfo2[2]-lineFormattedInfo1[2]} ${lineFormattedInfo1[5] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[5])}(${t})</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">

                <p>=</p>

                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                    <p>${AB[0]}</p>
                    <p>${AB[1]}</p>
                    <p>${AB[2]}</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">
            </div>

            <p>Now we can calculate the magnitude of AB to get the distance, using pythagoras:</p>
            <div class="centerHorizontal">
                <p>&Sqrt;( (${AB[0]})&sup2; + (${AB[1]})&sup2; + (${AB[2]})&sup2; ) = ${distance}</p>
        `;
        launchShowStepsFor.clearShowStepsPopup();
        launchShowStepsFor.insertIntoShowStepsPopup(rawHTML);
        showStepsPopup.style.display = "block";
    }

    static distanceTwoLines(lineFormattedInfo1, lineFormattedInfo2) {
        /* Generate additional needed variables */
        var [sizeAB, AB, [lambda, mu], simulEqs] = objectCalculations.distanceLineLine(lineFormattedInfo1, lineFormattedInfo2, true);
        sizeAB = parseFloat(sizeAB.toFixed(4));
        for (var i = 0; i < AB.length; i++) {
            AB[i] = parseFloat(AB[i].toFixed(4));
        }
        lambda = parseFloat(lambda.toFixed(4));
        mu = parseFloat(mu.toFixed(4));
        for (var i = 0; i < simulEqs.length; i++) {
            simulEqs[i] = parseFloat(simulEqs[i].toFixed(4));
        }
        //console.log(simulEqs);

        // Generate HTML
        var rawHTML = `
            <h4>Distance between two non-parallel lines</h4>
            <p>Let line 1 be: (${lineFormattedInfo1[0]}, ${lineFormattedInfo1[1]}, ${lineFormattedInfo1[2]}) + &lambda;(${lineFormattedInfo1[3]}, ${lineFormattedInfo1[4]}, ${lineFormattedInfo1[5]})</p>
            <p>Let line 2 be: (${lineFormattedInfo2[0]}, ${lineFormattedInfo2[1]}, ${lineFormattedInfo2[2]}) + &mu;(${lineFormattedInfo2[3]}, ${lineFormattedInfo2[4]}, ${lineFormattedInfo2[5]})</p>
            <p>Let A be a general point on line 1, and B a general point on line 2. Now, get the direction vector AB by:</p>

            
            <div class="centerHorizontal">
                <p>AB = B - A = </p>

                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                    <p>${lineFormattedInfo2[0]} ${lineFormattedInfo2[3] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[3])}&mu;</p>
                    <p>${lineFormattedInfo2[1]} ${lineFormattedInfo2[4] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[4])}&mu;</p>
                    <p>${lineFormattedInfo2[2]} ${lineFormattedInfo2[5] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[5])}&mu;</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">

                <p> - </p>

                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                    <p>${lineFormattedInfo1[0]} ${lineFormattedInfo1[3] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[3])}&lambda;</p>
                    <p>${lineFormattedInfo1[1]} ${lineFormattedInfo1[4] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[4])}&lambda;</p>
                    <p>${lineFormattedInfo1[2]} ${lineFormattedInfo1[5] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[5])}&lambda;</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">

                <p> = </p>

                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                    <p>${lineFormattedInfo2[0]-lineFormattedInfo1[0]} ${lineFormattedInfo2[3] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[3])}&mu; ${(lineFormattedInfo1[3]*-1) >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[3])}&lambda;</p>
                    <p>${lineFormattedInfo2[1]-lineFormattedInfo1[1]} ${lineFormattedInfo2[4] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[4])}&mu; ${(lineFormattedInfo1[4]*-1) >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[4])}&lambda;</p>
                    <p>${lineFormattedInfo2[2]-lineFormattedInfo1[2]} ${lineFormattedInfo2[5] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[5])}&mu; ${(lineFormattedInfo1[5]*-1) >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[5])}&lambda;</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">
            </div>

            <p>AB is perpendicular to both lines, so the dot product of AB with both of the line's direction vector will equal 0. So we will calculate the dot product with both direction vectors and solve these two equations simultaneously for &lambda; and &mu;:</p>
            <div class="centerHorizontal">
                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                    <p>${lineFormattedInfo2[0]-lineFormattedInfo1[0]} ${lineFormattedInfo2[3] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[3])}&mu; ${(lineFormattedInfo1[3]*-1) >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[3])}&lambda;</p>
                    <p>${lineFormattedInfo2[1]-lineFormattedInfo1[1]} ${lineFormattedInfo2[4] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[4])}&mu; ${(lineFormattedInfo1[4]*-1) >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[4])}&lambda;</p>
                    <p>${lineFormattedInfo2[2]-lineFormattedInfo1[2]} ${lineFormattedInfo2[5] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[5])}&mu; ${(lineFormattedInfo1[5]*-1) >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[5])}&lambda;</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">

                <p> . </p>

                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                    <p>${lineFormattedInfo1[3]}</p>
                    <p>${lineFormattedInfo1[4]}</p>
                    <p>${lineFormattedInfo1[5]}</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">

                <p> = 0</p>
            </div>
            <div class="centerHorizontal">
                <p>(${lineFormattedInfo1[3]})(${lineFormattedInfo2[0]-lineFormattedInfo1[0]} ${lineFormattedInfo2[3] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[3])}&mu; ${(lineFormattedInfo1[3]*-1) >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[3])}&lambda;) + (${lineFormattedInfo1[4]})(${lineFormattedInfo2[1]-lineFormattedInfo1[1]} ${lineFormattedInfo2[4] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[4])}&mu; ${(lineFormattedInfo1[4]*-1) >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[4])}&lambda;) + (${lineFormattedInfo1[5]})(${lineFormattedInfo2[2]-lineFormattedInfo1[2]} ${lineFormattedInfo2[5] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[5])}&mu; ${(lineFormattedInfo1[5]*-1) >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[5])}&lambda;) = 0</p>
            </div>
            <div class="centerHorizontal">
                <p>${simulEqs[0]}&lambda; ${simulEqs[1] >= 0 ? "+" : "-"} ${Math.abs(simulEqs[1])}&mu; = ${simulEqs[2]} --- (1)</p>
            </div>
            <div class="centerHorizontal">
                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                    <p>${lineFormattedInfo2[0]-lineFormattedInfo1[0]} ${lineFormattedInfo2[3] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[3])}&mu; ${(lineFormattedInfo1[3]*-1) >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[3])}&lambda;</p>
                    <p>${lineFormattedInfo2[1]-lineFormattedInfo1[1]} ${lineFormattedInfo2[4] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[4])}&mu; ${(lineFormattedInfo1[4]*-1) >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[4])}&lambda;</p>
                    <p>${lineFormattedInfo2[2]-lineFormattedInfo1[2]} ${lineFormattedInfo2[5] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[5])}&mu; ${(lineFormattedInfo1[5]*-1) >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[5])}&lambda;</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">

                <p> . </p>

                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                    <p>${lineFormattedInfo2[3]}</p>
                    <p>${lineFormattedInfo2[4]}</p>
                    <p>${lineFormattedInfo2[5]}</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">

                <p> = 0</p>
            </div>
            <div class="centerHorizontal">
                <p>(${lineFormattedInfo2[3]})(${lineFormattedInfo2[0]-lineFormattedInfo1[0]} ${lineFormattedInfo2[3] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[3])}&mu; ${(lineFormattedInfo1[3]*-1) >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[3])}&lambda;) + (${lineFormattedInfo2[4]})(${lineFormattedInfo2[1]-lineFormattedInfo1[1]} ${lineFormattedInfo2[4] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[4])}&mu; ${(lineFormattedInfo1[4]*-1) >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[4])}&lambda;) + (${lineFormattedInfo2[5]})(${lineFormattedInfo2[2]-lineFormattedInfo1[2]} ${lineFormattedInfo2[5] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[5])}&mu; ${(lineFormattedInfo1[5]*-1) >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[5])}&lambda;) = 0</p>
            </div>
            <div class="centerHorizontal">
                <p>${simulEqs[3]}&lambda; ${simulEqs[4] >= 0 ? "+" : "-"} ${Math.abs(simulEqs[4])}&mu; = ${simulEqs[5]}  --- (2)</p>
            </div>
            <div class="centerHorizontal">
                <p>From (1) and (2): &mu; = ${mu}, &lambda; = ${lambda}</p>
            </div>

            <p>Now we can substitute &lambda; and &mu; back into AB:</p>
            <div class="centerHorizontal">
                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                <p>${lineFormattedInfo2[0]-lineFormattedInfo1[0]} ${lineFormattedInfo2[3] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[3])}(${mu}) ${(lineFormattedInfo1[3]*-1) >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[3])}(${lambda})</p>
                <p>${lineFormattedInfo2[1]-lineFormattedInfo1[1]} ${lineFormattedInfo2[4] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[4])}(${mu}) ${(lineFormattedInfo1[4]*-1) >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[4])}(${lambda})</p>
                <p>${lineFormattedInfo2[2]-lineFormattedInfo1[2]} ${lineFormattedInfo2[5] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo2[5])}(${mu}) ${(lineFormattedInfo1[5]*-1) >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo1[5])}(${lambda})</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">

                <p> = </p>

                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                    <p>${AB[0]}</p>
                    <p>${AB[1]}</p>
                    <p>${AB[2]}</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">
            </div>

            <p>Now we can calculate the magnitude of this to get the distance, using pythagoras:</p>
            <div class="centerHorizontal">
                <p>&Sqrt;( (${AB[0]})&sup2; + (${AB[1]})&sup2; + (${AB[2]})&sup2; ) = ${sizeAB}</p>
            </div>
        `;
        launchShowStepsFor.clearShowStepsPopup();
        launchShowStepsFor.insertIntoShowStepsPopup(rawHTML);
        showStepsPopup.style.display = "block";
    }

    static distanceLinePoint(lineFormattedInfo, pointFormattedInfo) {
        /* Generate additional needed variables */
        var [distance, AG, lambda] = objectCalculations.distanceLinePoint(lineFormattedInfo, pointFormattedInfo, true);
        distance = parseFloat(distance.toFixed(4));
        for (var i = 0; i < AG.length; i++) {
            AG[i] = parseFloat(AG[i].toFixed(4));
        }
        //console.log(lambda);
        lambda = parseFloat(lambda.toFixed(4));

        // Generate HTML
        var rawHTML = `
            <h4>Distance between a point and a line</h4>
            <p>Let A be the point: (${pointFormattedInfo[0]}, ${pointFormattedInfo[1]}, ${pointFormattedInfo[2]})</p>
            <p>Let G be a general point on the line:</p>
            <div class="centerHorizontal">
                <p>G = </p>

                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                    <p>${lineFormattedInfo[0]} ${lineFormattedInfo[3] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo[3])}&lambda;</p>
                    <p>${lineFormattedInfo[1]} ${lineFormattedInfo[4] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo[4])}&lambda;</p>
                    <p>${lineFormattedInfo[2]} ${lineFormattedInfo[5] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo[5])}&lambda;</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">
            </div>

            <p>Get the direction vector AG:</p>
            <div class="centerHorizontal">
                <p>G - A = </p>

                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                <p>${lineFormattedInfo[0]} ${lineFormattedInfo[3] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo[3])}&lambda;</p>
                <p>${lineFormattedInfo[1]} ${lineFormattedInfo[4] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo[4])}&lambda;</p>
                <p>${lineFormattedInfo[2]} ${lineFormattedInfo[5] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo[5])}&lambda;</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">

                <p>-</p>

                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                    <p>${pointFormattedInfo[0]}</p>
                    <p>${pointFormattedInfo[1]}</p>
                    <p>${pointFormattedInfo[2]}</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">

                <p>=</p>

                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                    <p>${lineFormattedInfo[0]-pointFormattedInfo[0]} ${lineFormattedInfo[3] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo[3])}&lambda;</p>
                    <p>${lineFormattedInfo[1]-pointFormattedInfo[1]} ${lineFormattedInfo[4] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo[4])}&lambda;</p>
                    <p>${lineFormattedInfo[2]-pointFormattedInfo[2]} ${lineFormattedInfo[5] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo[5])}&lambda;</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">
            </div>

            <p>AG is perpendicular to the line, therefore we calculate the dot product between AG and the direction vector of the line, equate to 0, and solve for &lambda;:</p>
            <div class="centerHorizontal">
                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                    <p>${lineFormattedInfo[0]-pointFormattedInfo[0]} ${lineFormattedInfo[3] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo[3])}&lambda;</p>
                    <p>${lineFormattedInfo[1]-pointFormattedInfo[1]} ${lineFormattedInfo[4] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo[4])}&lambda;</p>
                    <p>${lineFormattedInfo[2]-pointFormattedInfo[2]} ${lineFormattedInfo[5] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo[5])}&lambda;</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">

                <p>.</p>

                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                    <p>${lineFormattedInfo[3]}</p>
                    <p>${lineFormattedInfo[4]}</p>
                    <p>${lineFormattedInfo[5]}</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">

                <p>= 0</p>
            </div>
            <div class="centerHorizontal">
                <p>(${lineFormattedInfo[3]})(${lineFormattedInfo[0]-pointFormattedInfo[0]} ${lineFormattedInfo[3] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo[3])}&lambda;) + (${lineFormattedInfo[4]})(${lineFormattedInfo[1]-pointFormattedInfo[1]} ${lineFormattedInfo[4] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo[4])}&lambda;) + (${lineFormattedInfo[5]})(${lineFormattedInfo[2]-pointFormattedInfo[2]} ${lineFormattedInfo[5] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo[5])}&lambda;) = 0</p>
            </div>
            <div class="centerHorizontal">
                <p>&lambda; = ${lambda}</p>
            </div>

            <p>Now we substitute this value back into the general equation of the line:</p>
            <div class="centerHorizontal">
                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                    <p>${lineFormattedInfo[0]-pointFormattedInfo[0]} ${lineFormattedInfo[3] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo[3])}${lambda}</p>
                    <p>${lineFormattedInfo[1]-pointFormattedInfo[1]} ${lineFormattedInfo[4] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo[4])}${lambda}</p>
                    <p>${lineFormattedInfo[2]-pointFormattedInfo[2]} ${lineFormattedInfo[5] >= 0 ? "+" : "-"} ${Math.abs(lineFormattedInfo[5])}${lambda}</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">

                <p>=</p>

                <img src="./images/leftBracket.jpg" height="80px">
                <div class="centerVertical">
                    <p>${AG[0]}</p>
                    <p>${AG[1]}</p>
                    <p>${AG[2]}</p>
                </div>
                <img src="./images/rightBracket.jpg" height="80px">
            </div>

            <p>Now we can calculate the magnitude of this to get the distance, using pythagoras:</p>
            <div class="centerHorizontal">
                <p>&Sqrt;( (${AG[0]})&sup2; + (${AG[1]})&sup2; + (${AG[2]})&sup2; ) = ${distance}</p>
            </div>
        `;
        launchShowStepsFor.clearShowStepsPopup();
        launchShowStepsFor.insertIntoShowStepsPopup(rawHTML);
        showStepsPopup.style.display = "block";
    }

    static distancePlanePoint(planeFormattedInfo, pointFormattedInfo) {
        if (planeFormattedInfo.length == 9) {
            planeFormattedInfo = objectCalculations.parametricPlaneToCartesian(planeFormattedInfo);
        }

        /* Generate additional needed variables */
        var distance = objectCalculations.distancePlanePoint(planeFormattedInfo, pointFormattedInfo)[0];
        distance = parseFloat(distance.toFixed(4));

        // Generate HTML
        var rawHTML = `
            <h4>Distance between a point and a plane</h4>
            <p>Point: (${pointFormattedInfo[0]}, ${pointFormattedInfo[1]}, ${pointFormattedInfo[2]})</p>
            <p>Plane: ${planeFormattedInfo[0]}x ${planeFormattedInfo[1] >= 0 ? "+" : "-"} ${Math.abs(planeFormattedInfo[1])}y ${planeFormattedInfo[2] >= 0 ? "+" : "-"} ${Math.abs(planeFormattedInfo[2])}z = ${planeFormattedInfo[3]}</p>
            <p>We can calculate the distance by substituting into the equation:</p>
            <div class="centerHorizontal">
                <div class="centerVertical">
                    <p>| n&#8321;&alpha; + n&#8322;&beta; + n&#8323;&gamma; - d |</p>
                    <hr style="border-top: 1px solid black;">
                    <p>&Sqrt;(n&#8321;&sup2; + n&#8322;&sup2; + n&#8323;&sup2;)</p>
                </div>
            </div>
            <div class="centerHorizontal">
                <div class="centerVertical">
                    <p>| (${planeFormattedInfo[0]})(${pointFormattedInfo[0]}) + (${planeFormattedInfo[1]})(${pointFormattedInfo[1]}) + (${planeFormattedInfo[2]})(${pointFormattedInfo[2]}) - (${planeFormattedInfo[3]}) |</p>
                    <hr style="border-top: 1px solid black;">
                    <p>&Sqrt;((${planeFormattedInfo[0]})&sup2; + (${planeFormattedInfo[1]})&sup2; + (${planeFormattedInfo[2]})&sup2;)</p>
                </div>
                <p> = ${distance}</p>
            </div>
        `;
        launchShowStepsFor.clearShowStepsPopup();
        launchShowStepsFor.insertIntoShowStepsPopup(rawHTML);
        showStepsPopup.style.display = "block";
    }

    static angleTwoLines(lineFormattedInfo1, lineFormattedInfo2) {
        /* Generate additional needed variables */
        var angle = objectCalculations.angleBetweenLineLine(lineFormattedInfo1, lineFormattedInfo2);
        angle = parseFloat(angle.toFixed(4));

        // Generate HTML
        var rawHTML = `
            <h4>Angle between two lines:</h4>
            <p>Let line 1 be: (${lineFormattedInfo1[0]}, ${lineFormattedInfo1[1]}, ${lineFormattedInfo1[2]}) + &lambda;(${lineFormattedInfo1[3]}, ${lineFormattedInfo1[4]}, ${lineFormattedInfo1[5]})</p>
            <p>Let line 2 be: (${lineFormattedInfo2[0]}, ${lineFormattedInfo2[1]}, ${lineFormattedInfo2[2]}) + &mu;(${lineFormattedInfo2[3]}, ${lineFormattedInfo2[4]}, ${lineFormattedInfo2[5]})</p>
            <p>We can calculate the angle by substituting the direction vectors into the equation:</p>
            <div class="centerHorizontal">
                <p>cos<sup>-1</sup>(|</p>
                <div class="centerVertical">
                    <p>a.b</p>
                    <hr style="border-top: 1px solid black;">
                    <p>|a||b|</p>
                </div>
                <p>|)</p>
            </div>
            <div class="centerHorizontal">
                <p>cos<sup>-1</sup>(|</p>
                <div class="centerVertical">
                    <p>(${lineFormattedInfo1[3]}, ${lineFormattedInfo1[4]}, ${lineFormattedInfo1[5]}).(${lineFormattedInfo2[3]}, ${lineFormattedInfo2[4]}, ${lineFormattedInfo2[5]})</p>
                    <hr style="border-top: 1px solid black;">
                    <p>|(${lineFormattedInfo1[3]}, ${lineFormattedInfo1[4]}, ${lineFormattedInfo1[5]})||(${lineFormattedInfo2[3]}, ${lineFormattedInfo2[4]}, ${lineFormattedInfo2[5]})|</p>
                </div>
                <p>|)</p>
            </div>
            <div class="centerHorizontal">
                <p>= cos<sup>-1</sup>(|</p>
                <div class="centerVertical">
                    <p>(${lineFormattedInfo1[3]})(${lineFormattedInfo2[3]}) + (${lineFormattedInfo1[4]})(${lineFormattedInfo2[4]}) + (${lineFormattedInfo1[5]})(${lineFormattedInfo2[5]})</p>
                    <hr style="border-top: 1px solid black;">
                    <p>&Sqrt;((${lineFormattedInfo1[3]})<sup>2</sup> + (${lineFormattedInfo1[4]})<sup>2</sup> + (${lineFormattedInfo1[5]})<sup>2</sup>)&Sqrt;((${lineFormattedInfo2[3]})<sup>2</sup> + (${lineFormattedInfo2[4]})<sup>2</sup> + (${lineFormattedInfo2[5]})<sup>2</sup>)</p>
                </div>
                <p>|)</p>
            </div>
            <div class="centerHorizontal">
                <p>= ${angle}°</p>
            </div>
        `;
        launchShowStepsFor.clearShowStepsPopup();
        launchShowStepsFor.insertIntoShowStepsPopup(rawHTML);
        showStepsPopup.style.display = "block";
    }

    static anglePlaneLine(planeFormattedInfo, lineFormattedInfo) {
        if (planeFormattedInfo.length == 9) {
            planeFormattedInfo = objectCalculations.parametricPlaneToCartesian(planeFormattedInfo);
        }

        /* Generate additional needed variables */
        var angle = objectCalculations.angleBetweenPlaneLine(planeFormattedInfo, lineFormattedInfo);
        angle = parseFloat(angle.toFixed(4));

        // Generate HTML
        var rawHTML = `
            <h4>Angle between a line and a plane:</h4>
            <p>Let the line be: (${lineFormattedInfo[0]}, ${lineFormattedInfo[1]}, ${lineFormattedInfo[2]}) + &lambda;(${lineFormattedInfo[3]}, ${lineFormattedInfo[4]}, ${lineFormattedInfo[5]})</p>
            <p>Plane: ${planeFormattedInfo[0]}x ${planeFormattedInfo[1] >= 0 ? "+" : "-"} ${Math.abs(planeFormattedInfo[1])}y ${planeFormattedInfo[2] >= 0 ? "+" : "-"} ${Math.abs(planeFormattedInfo[2])}z = ${planeFormattedInfo[3]}</p>
            <p>We can calculate the angle by substituting the direction vector and plane normal into the equation:</p>
            <div class="centerHorizontal">
                <p>sin<sup>-1</sup>(|</p>
                <div class="centerVertical">
                    <p>b.n</p>
                    <hr style="border-top: 1px solid black;">
                    <p>|b||n|</p>
                </div>
                <p>|)</p>
            </div>
            <div class="centerHorizontal">
                <p>sin<sup>-1</sup>(|</p>
                <div class="centerVertical">
                    <p>(${lineFormattedInfo[3]}, ${lineFormattedInfo[4]}, ${lineFormattedInfo[5]}).(${planeFormattedInfo[0]}, ${planeFormattedInfo[1]}, ${planeFormattedInfo[2]})</p>
                    <hr style="border-top: 1px solid black;">
                    <p>|(${lineFormattedInfo[3]}, ${lineFormattedInfo[4]}, ${lineFormattedInfo[5]})||(${planeFormattedInfo[0]}, ${planeFormattedInfo[1]}, ${planeFormattedInfo[2]})|</p>
                </div>
                <p>|)</p>
            </div>
            <div class="centerHorizontal">
                <p>= sin<sup>-1</sup>(|</p>
                <div class="centerVertical">
                    <p>(${lineFormattedInfo[3]})(${planeFormattedInfo[0]}) + (${lineFormattedInfo[4]})(${planeFormattedInfo[1]}) + (${lineFormattedInfo[5]})(${planeFormattedInfo[2]})</p>
                    <hr style="border-top: 1px solid black;">
                    <p>&Sqrt;((${lineFormattedInfo[3]})<sup>2</sup> + (${lineFormattedInfo[4]})<sup>2</sup> + (${lineFormattedInfo[5]})<sup>2</sup>)&Sqrt;((${planeFormattedInfo[0]})<sup>2</sup> + (${planeFormattedInfo[1]})<sup>2</sup> + (${planeFormattedInfo[2]})<sup>2</sup>)</p>
                </div>
                <p>|)</p>
            </div>
            <div class="centerHorizontal">
                <p>= ${angle}°</p>
            </div>
        `;
        launchShowStepsFor.clearShowStepsPopup();
        launchShowStepsFor.insertIntoShowStepsPopup(rawHTML);
        showStepsPopup.style.display = "block";
    }

    static angleTwoPlanes(planeFormattedInfo1, planeFormattedInfo2) {
        if (planeFormattedInfo1.length == 9) {
            planeFormattedInfo1 = objectCalculations.parametricPlaneToCartesian(planeFormattedInfo1);
        }
        if (planeFormattedInfo2.length == 9) {
            planeFormattedInfo2 = objectCalculations.parametricPlaneToCartesian(planeFormattedInfo2);
        }

        /* Generate additional needed variables */
        var angle = objectCalculations.angleBetweenPlanePlane(planeFormattedInfo1, planeFormattedInfo2);
        angle = parseFloat(angle.toFixed(4));

        // Generate HTML
        var rawHTML = `
            <h4>Angle between two planes:</h4>
            <p>Plane 1: ${planeFormattedInfo1[0]}x ${planeFormattedInfo1[1] >= 0 ? "+" : "-"} ${Math.abs(planeFormattedInfo1[1])}y ${planeFormattedInfo1[2] >= 0 ? "+" : "-"} ${Math.abs(planeFormattedInfo1[2])}z = ${planeFormattedInfo1[3]}</p>
            <p>Plane 2: ${planeFormattedInfo2[0]}x ${planeFormattedInfo2[1] >= 0 ? "+" : "-"} ${Math.abs(planeFormattedInfo2[1])}y ${planeFormattedInfo2[2] >= 0 ? "+" : "-"} ${Math.abs(planeFormattedInfo2[2])}z = ${planeFormattedInfo2[3]}</p>
            <p>We can calculate the angle by substituting the plane normals into the equation:</p>
            <div class="centerHorizontal">
                <p>cos<sup>-1</sup>(|</p>
                <div class="centerVertical">
                    <p>n<sub>1</sub>.n<sub>2</sub></p>
                    <hr style="border-top: 1px solid black;">
                    <p>|n<sub>1</sub>||n<sub>2</sub>|</p>
                </div>
                <p>|)</p>
            </div>
            <div class="centerHorizontal">
                <p>cos<sup>-1</sup>(|</p>
                <div class="centerVertical">
                    <p>(${planeFormattedInfo1[0]}, ${planeFormattedInfo1[1]}, ${planeFormattedInfo1[2]}).(${planeFormattedInfo2[0]}, ${planeFormattedInfo2[1]}, ${planeFormattedInfo2[2]})</p>
                    <hr style="border-top: 1px solid black;">
                    <p>|(${planeFormattedInfo1[0]}, ${planeFormattedInfo1[1]}, ${planeFormattedInfo1[2]})||(${planeFormattedInfo2[0]}, ${planeFormattedInfo2[1]}, ${planeFormattedInfo2[2]})|</p>
                </div>
                <p>|)</p>
            </div>
            <div class="centerHorizontal">
                <p>= cos<sup>-1</sup>(|</p>
                <div class="centerVertical">
                    <p>(${planeFormattedInfo1[0]})(${planeFormattedInfo2[0]}) + (${planeFormattedInfo1[1]})(${planeFormattedInfo2[1]}) + (${planeFormattedInfo1[2]})(${planeFormattedInfo2[2]})</p>
                    <hr style="border-top: 1px solid black;">
                    <p>&Sqrt;((${planeFormattedInfo1[0]})<sup>2</sup> + (${planeFormattedInfo1[1]})<sup>2</sup> + (${planeFormattedInfo1[2]})<sup>2</sup>)&Sqrt;((${planeFormattedInfo1[0]})<sup>2</sup> + (${planeFormattedInfo1[1]})<sup>2</sup> + (${planeFormattedInfo1[2]})<sup>2</sup>)</p>
                </div>
                <p>|)</p>
            </div>
            <div class="centerHorizontal">
                <p>= ${angle}°</p>
            </div>
        `;
        launchShowStepsFor.clearShowStepsPopup();
        launchShowStepsFor.insertIntoShowStepsPopup(rawHTML);
        showStepsPopup.style.display = "block";
    }

    static id(id) {
        // Get Specific JSON Data of calculation by iteration
        var jsonData = data.getJSON();
        var jsonCalculationsData = jsonData.calculations;
        var specificJsonData = "";
        for (var i = 0; i < jsonCalculationsData.length; i++) {
            if (jsonCalculationsData[i].id == id) {
                specificJsonData = jsonCalculationsData[i];
            }
        }
    
        var objectOneType = data.typeOfObject(specificJsonData.objectOneID);
        var objectTwoType = data.typeOfObject(specificJsonData.objectTwoID);
        var objectOneFormattedInfo = data.getObjectFormattedInfo(specificJsonData.objectOneID);
        var objectTwoFormattedInfo = data.getObjectFormattedInfo(specificJsonData.objectTwoID);
        var calculationType = specificJsonData.type;
        var result = document.getElementById(`c-${id}-output`).innerHTML;
    
        if (result == "Object data incomplete" || result == "Calculation not supported") {
            return;
        }
    
        if (calculationType == "Intersection") {
            if (objectOneType == "line" && objectTwoType == "line") {
                if (result == "parallel") {
                    launchShowStepsFor.intersectionParallelLines(objectOneFormattedInfo, objectTwoFormattedInfo);
                } else if (result == "skew") {
                    launchShowStepsFor.intersectionSkewLines(objectOneFormattedInfo, objectTwoFormattedInfo);
                } else {
                    launchShowStepsFor.intersectionTwoLines(objectOneFormattedInfo, objectTwoFormattedInfo);
                }
            }
            if (objectOneType == "line" && objectTwoType == "plane") {
                if (result == "parallel") {
                    launchShowStepsFor.intersectionParallelPlaneLine(objectTwoFormattedInfo, objectOneFormattedInfo);
                } else {
                    launchShowStepsFor.intersectionPlaneLine(objectTwoFormattedInfo, objectOneFormattedInfo);
                }
            }
            if (objectOneType == "plane" && objectTwoType == "line") {
                if (result == "parallel") {
                    launchShowStepsFor.intersectionParallelPlaneLine(objectOneFormattedInfo, objectTwoFormattedInfo);
                } else {
                    launchShowStepsFor.intersectionPlaneLine(objectOneFormattedInfo, objectTwoFormattedInfo);
                }
            }
        }
        if (calculationType == "Distance") {
            if (objectOneType == "line" && objectTwoType == "line") {
                // Figure out if parallel lines
                if ((new Decimal(objectOneFormattedInfo[3]).dividedBy(objectTwoFormattedInfo[3])).equals((new Decimal(objectOneFormattedInfo[4]).dividedBy(objectTwoFormattedInfo[4]))) && (new Decimal(objectOneFormattedInfo[3]).dividedBy(objectTwoFormattedInfo[3])).equals((new Decimal(objectOneFormattedInfo[5]).dividedBy(objectTwoFormattedInfo[5])))) {
                    launchShowStepsFor.distanceParallelLines(objectOneFormattedInfo, objectTwoFormattedInfo);
                } else {
                    launchShowStepsFor.distanceTwoLines(objectOneFormattedInfo, objectTwoFormattedInfo);
                }
            }
            if (objectOneType == "point" && objectTwoType == "line") {
                launchShowStepsFor.distanceLinePoint(objectTwoFormattedInfo, objectOneFormattedInfo);
            }
            if (objectOneType == "line" && objectTwoType == "point") {
                launchShowStepsFor.distanceLinePoint(objectOneFormattedInfo, objectTwoFormattedInfo);
            }
            if (objectOneType == "point" && objectTwoType == "plane") {
                launchShowStepsFor.distancePlanePoint(objectTwoFormattedInfo, objectOneFormattedInfo);
            }
            if (objectOneType == "plane" && objectTwoType == "point") {
                launchShowStepsFor.distancePlanePoint(objectOneFormattedInfo, objectTwoFormattedInfo);
            }
        }
        if (calculationType == "Angle") {
            if (objectOneType == "line" && objectTwoType == "line") {
                launchShowStepsFor.angleTwoLines(objectOneFormattedInfo, objectTwoFormattedInfo);
            }
            if (objectOneType == "plane" && objectTwoType == "line") {
                launchShowStepsFor.anglePlaneLine(objectOneFormattedInfo, objectTwoFormattedInfo);
            }
            if (objectOneType == "line" && objectTwoType == "plane") {
                launchShowStepsFor.anglePlaneLine(objectTwoFormattedInfo, objectOneFormattedInfo);
            }
            if (objectOneType == "plane" && objectTwoType == "plane") {
                launchShowStepsFor.angleTwoPlanes(objectOneFormattedInfo, objectTwoFormattedInfo);
            }
        }
    }

    static hide() {
        showStepsPopup.style.display = "none";
    }
}

/* Intitialisers */
function initialise() {
    // Handle New Expression Buttons
    // (Make expressionButton choices in expressions popup work):
    expressionButtons = document.getElementsByClassName('expressionBtn');
    for (var i = 0; i < expressionButtons.length; i++) {
        expressionButtons[i].addEventListener('click', function(e) {
            expressionFunctions.newExpression(e.target.id);
        });
    }

    // Handle New Calculation Button
    document.getElementById("new-calculation").addEventListener("click", calculationsFunctions.newCalculation);

    // Define Popups
    expressionsPopup = document.getElementById("expression-popup");
    supportedCalculationsPopup = document.getElementById("supported-calculations-popup");
    showStepsPopup = document.getElementById("show-steps-popup");

    // Inititalise buttons for the expressionsPopup
    document.getElementById("new-expression").addEventListener("click", expressionFunctions.showExpressionsPopup);
    document.getElementById("close-new-expression").addEventListener("click", expressionFunctions.hideExpressionsPopup);

    // Inititalise buttons for the supportedCalculationsPopup
    document.getElementById("supported-calculations").addEventListener("click", calculationsFunctions.showSupportedCalculationsPopup);
    document.getElementById("close-supported-calculations").addEventListener("click", calculationsFunctions.hideSupportedCalculationsPopup);

    // Inititialise close button for the Show Steps Popup
    document.getElementById("close-show-steps").addEventListener("click", launchShowStepsFor.hide);

    // Define saveTextObject (this is the text beside the save button in the nav bar)
    saveTextObject = document.getElementById("save-data-text");

    // Handle Environment Save Button (in the nav bar)
    document.getElementById("save-data").addEventListener("click", data.save);

    // Handle Environment Delete Button (in the nav bar)
    document.getElementById("delete-environment").addEventListener("click", data.delete);

    // Handle Auto Savings every 15s
    setInterval(data.autoSave, 5000);

    // Handle unsaved changes alert
    window.onbeforeunload = function(e) {
        if(saveTextObject.textContent == "Changes not saved"){
        var msg = "You have unsaved changed. Are you sure you want to leave?";
        e.returnValue = msg;
        return msg;
        }
    }

    // Handle Environment Title Textfield Changes and Initialise Title Text
    titleInput = document.getElementById("title-input");
    titleInput.value = environmentName;
    titleInput.addEventListener("input", function() {
        environmentName = titleInput.value.replace(/[^a-zA-Z0-9\s]/g, '');
        titleInput.value = environmentName;
        //console.log(environmentName);
        data.changesMade = true;
        saveTextObject.textContent = "Changes not saved";
    });

    // Read JSON file and load in expression divs and calculation divs
    expressionFunctions.loadExpressions();
    calculationsFunctions.loadCalculations();

    // Inititalise Save Text and data.changesMade (triggered from loading in values)
    data.changesMade = false;
    saveTextObject.textContent = "Changes saved";
}
initialise()