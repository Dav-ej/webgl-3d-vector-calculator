/* Matrix and Other Calculations */

class matrix {
    constructor(rows, columns, items) {
        this.rows = rows;
        this.columns = columns;
        this.items = items;

        // ensure numbers in items are a 'decimal' class type
        for (var i = 0; i < items.length; i++) {
            if (typeof(this.items[i]) != Decimal) {
                this.items[i] = new Decimal(this.items[i]);
            }
        }
    }

    multiplyWith(otherMatrix) {
        // Check dimensions are compatible
        if (this.columns != otherMatrix.rows) {
            return -1;
        }
        // Multiply //
        var resultMatrix = new matrix(this.rows, otherMatrix.columns, []);
        var row;
        var column;
        var dotProduct;
        for (var x = 0; x < resultMatrix.rows; x++) { // foreach row in result matrix
            // get row of digits from this.matrix
            row = this.items.slice( (x*this.columns), (x*this.columns)+this.columns );
            for (var y = 0; y < resultMatrix.columns; y++) { // foreach column of result matrix
                // get row of digits from other matrix
                column = [];
                for (var z = 0; z < otherMatrix.rows; z++) {
                    column.push(otherMatrix.items[y+(z*otherMatrix.columns)]);
                }
                // dot product the row and column
                var dotProduct = new Decimal(0);
                for (var i = 0; i < row.length; i++) {
                    dotProduct = dotProduct.add(row[i].times(column[i]));
                }
                // add this dotproduct to the result matrix items array
                resultMatrix.items.push(dotProduct);
            }
        }
        // return result matrix
        return resultMatrix;
    }

    det2x2() {
        // ad - bc
        return (this.items[0].times(this.items[3])).minus(this.items[1].times(this.items[2]));
    }

    invert2x2() {
        var det = this.det2x2();;
        // (1/det)x[d, -b, -c, a]
        // 0a 1b 2c 3d
        var items = [];
        items[0] = this.items[3].dividedBy(det);
        items[1] = this.items[1].dividedBy(det).times(-1);
        items[2] = this.items[2].dividedBy(det).times(-1);
        items[3] = this.items[0].dividedBy(det);

        return new matrix(2, 2, items);
    }
}

class angle { // pi rad = 180 deg
    static convertToRad(degrees) {
        var pi = Decimal.acos(-1);
        var degrees = new Decimal(degrees);
        return (degrees.dividedBy(180).times(pi))
    }

    static convertToDegrees(rad) {
        var pi = Decimal.acos(-1);
        var rad = new Decimal(rad);
        return (rad.dividedBy(pi)).times(180);
    }
}

function solveSimulEq_2Unknowns(info) {
    var m_A = new matrix(2, 2, [info[0], info[1], info[3], info[4]]);
    var m_B = new matrix(2, 1, [info[2], info[5]]);
    var m_AInverse = m_A.invert2x2();
    // A(x,y) = B
    // (x, y) = AInverse x B
    var m_results = m_AInverse.multiplyWith(m_B);
    return [m_results.items[0], m_results.items[1]];
}

/* Object Calculations */

class objectCalculations {
    // Intersection Points
    static intersectionLineLine(lineFormattedInfo1, lineFormattedInfo2) {
        // Get as Decimal Objects
        for (var i = 0; i < lineFormattedInfo1.length; i++) {
            lineFormattedInfo1[i] = new Decimal(lineFormattedInfo1[i]);
        }
        for (var i = 0; i < lineFormattedInfo2.length; i++) {
            lineFormattedInfo2[i] = new Decimal(lineFormattedInfo2[i]);
        }

        // Return if parallel
        if ((lineFormattedInfo1[3].dividedBy(lineFormattedInfo2[3])).equals(lineFormattedInfo1[4].dividedBy(lineFormattedInfo2[4]))) {
            if ((lineFormattedInfo1[3].dividedBy(lineFormattedInfo2[3])).equals(lineFormattedInfo1[5].dividedBy(lineFormattedInfo2[5]))) {
                return 'parallel';
            }
        }

        // Get 3 Simultaneous Equations
        var simulEq1 = [lineFormattedInfo1[3], lineFormattedInfo2[3].times(-1), lineFormattedInfo2[0].minus(lineFormattedInfo1[0])]
        var simulEq2 = [lineFormattedInfo1[4], lineFormattedInfo2[4].times(-1), lineFormattedInfo2[1].minus(lineFormattedInfo1[1])]
        var simulEq3 = [lineFormattedInfo1[5], lineFormattedInfo2[5].times(-1), lineFormattedInfo2[2].minus(lineFormattedInfo1[2])]

        // Solve eq1 and eq2
        var results = solveSimulEq_2Unknowns([simulEq1[0], simulEq1[1], simulEq1[2], simulEq2[0], simulEq2[1], simulEq2[2]]);
        // Substitute into eq3
        var substitutedResult = (results[0].times(simulEq3[0])).add(results[1].times(simulEq3[1])).minus(simulEq3[2]);

        // If no solution, return 'skew'
        if (isNaN(results[0].e) || isNaN(results[1].e)) {
            return 'skew';
        }

        // If substitution not fulfilled, return 'skew'
        if (!(substitutedResult.equals(0))) {
            return 'skew';
        }
        
        var intersectionPoint = [];
        intersectionPoint[0] = lineFormattedInfo1[0].add(lineFormattedInfo1[3].times(results[0]));
        intersectionPoint[1] = lineFormattedInfo1[1].add(lineFormattedInfo1[4].times(results[0]));
        intersectionPoint[2] = lineFormattedInfo1[2].add(lineFormattedInfo1[5].times(results[0]));

        return (intersectionPoint);
    }

    static intersectionPlaneLine(planeFormattedInfo, lineFormattedInfo) {
        if (planeFormattedInfo.length == 9) {
            planeFormattedInfo = objectCalculations.parametricPlaneToCartesian(planeFormattedInfo);
        }

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

        // Return for parallel
        var angle = objectCalculations.angleBetweenPlaneLine(planeFormattedInfo, lineFormattedInfo);
        if (angle.comparedTo(0) == 0) {
            return 'parallel';
        }

        var tCoefficient = (b1.times(a)).add(b2.times(b)).add(b3.times(c));
        var cValue = (a1.times(a)).add(a2.times(b)).add(a3.times(c)).minus(d).times(-1);
        var tValue = cValue.dividedBy(tCoefficient);

        var intersectionPoint = [];
        intersectionPoint[0] = a1.add(tValue.times(b1));
        intersectionPoint[1] = a2.add(tValue.times(b2));
        intersectionPoint[2] = a3.add(tValue.times(b3));

        return intersectionPoint;
    }
    
    // Shortest Perpendicular Distances
    static distanceLineLine(lineFormattedInfo1, lineFormattedInfo2, additionalInfo = false) {
        var a1 = new Decimal(lineFormattedInfo1[0]);
        var a2 = new Decimal(lineFormattedInfo1[1]);
        var a3 = new Decimal(lineFormattedInfo1[2]);
        var b1 = new Decimal(lineFormattedInfo1[3]);
        var b2 = new Decimal(lineFormattedInfo1[4]);
        var b3 = new Decimal(lineFormattedInfo1[5]);
        var c1 = new Decimal(lineFormattedInfo2[0]);
        var c2 = new Decimal(lineFormattedInfo2[1]);
        var c3 = new Decimal(lineFormattedInfo2[2]);
        var d1 = new Decimal(lineFormattedInfo2[3]);
        var d2 = new Decimal(lineFormattedInfo2[4]);
        var d3 = new Decimal(lineFormattedInfo2[5]);

        var simulEqs = [];
        simulEqs[0] = ( (b1.times(-1)).times(b1) ).add( (b2.times(-1)).times(b2) ).add( (b3.times(-1)).times(b3) );
        simulEqs[1] = ( d1.times(b1) ).add( d2.times(b2) ).add( d3.times(b3) );
        simulEqs[2] = ( (c1.minus(a1)).times(b1).times(-1) ).add( (c2.minus(a2)).times(b2).times(-1) ).add( (c3.minus(a3)).times(b3).times(-1) );

        simulEqs[3] = ( (b1.times(-1)).times(d1) ).add( (b2.times(-1)).times(d2) ).add( (b3.times(-1)).times(d3) );
        simulEqs[4] = ( d1.times(d1) ).add( d2.times(d2) ).add( d3.times(d3) );
        simulEqs[5] = ( (c1.minus(a1)).times(d1).times(-1) ).add( (c2.minus(a2)).times(d2).times(-1) ).add( (c3.minus(a3)).times(d3).times(-1) );
        var results = solveSimulEq_2Unknowns(simulEqs);

        var AB = [];
        AB[0] = (c1.minus(a1)).minus(b1.times(results[0])).add(d1.times(results[1]));
        AB[1] = (c2.minus(a2)).minus(b2.times(results[0])).add(d2.times(results[1]));
        AB[2] = (c3.minus(a3)).minus(b3.times(results[0])).add(d3.times(results[1]));

        // If parallel do different calculation
        if (isNaN(results[0].e) || isNaN(results[1].e)) {
            var tCoefficient = (b1.times(b1)).add(b2.times(b2)).add(b3.times(b3));
            var cValue = ( ( (a1.minus(c1)).times(b1) ).add( (a2.minus(c2)).times(b2) ).add( (a3.minus(c3)).times(b3) ) ).times(-1);
            var tValue = cValue.dividedBy(tCoefficient);

            AB[0] = (a1.minus(c1)).add(tValue.times(b1));
            AB[1] = (a2.minus(c2)).add(tValue.times(b2));
            AB[2] = (a3.minus(c3)).add(tValue.times(b3));
        }

        var sizeAB = Decimal.sqrt( ( AB[0].toPower(2) ).add( AB[1].toPower(2) ).add( AB[2].toPower(2) ) );
        if (additionalInfo == true) {
            return [sizeAB, AB, results, simulEqs];
        }
        return sizeAB;
    }

    static distancePlanePoint(planeFormattedInfo, pointFormattedInfo) {
        if (planeFormattedInfo.length == 9) {
            planeFormattedInfo = objectCalculations.parametricPlaneToCartesian(planeFormattedInfo);
        }

        var a = new Decimal(planeFormattedInfo[0]);
        var b = new Decimal(planeFormattedInfo[1]);
        var c = new Decimal(planeFormattedInfo[2]);
        var d = new Decimal(planeFormattedInfo[3]);

        var x1 = new Decimal(pointFormattedInfo[0]);
        var y1 = new Decimal(pointFormattedInfo[1]);
        var z1 = new Decimal(pointFormattedInfo[2]);

        // Get Distance
        var distanceNumerator = ((a.times(x1)).add(b.times(y1)).add(c.times(z1)).minus(d)).abs();
        var distanceDenominator = ((a.times(a)).add(b.times(b)).add(c.times(c))).sqrt();
        var distance = distanceNumerator.dividedBy(distanceDenominator);

        // Get perPoint
        var perpPointLambdaDenominator = (a.times(a)).add(b.times(b)).add(c.times(c));
        var perpPointLambdaNumerator = (d).minus(x1.times(a)).add(y1.times(b)).add(z1.times(c));
        var perpPointLambda = perpPointLambdaNumerator.dividedBy(perpPointLambdaDenominator);
        var perPoint = [ x1.add(perpPointLambda.times(a)), y1.add(perpPointLambda.times(b)), z1.add(perpPointLambda.times(c)) ];

        return [distance, perPoint];
    }

    static distanceLinePoint(lineFormattedInfo, pointFormattedInfo, additionalInfo = false) {
        var posX = new Decimal(lineFormattedInfo[0]);
        var posY = new Decimal(lineFormattedInfo[1]);
        var posZ = new Decimal(lineFormattedInfo[2]);
        var dirX = new Decimal(lineFormattedInfo[3]);
        var dirY = new Decimal(lineFormattedInfo[4]);
        var dirZ = new Decimal(lineFormattedInfo[5]);

        var x1 = new Decimal(pointFormattedInfo[0]);
        var y1 = new Decimal(pointFormattedInfo[1]);
        var z1 = new Decimal(pointFormattedInfo[2]);

        // Let G be a general point on the line
        // Shortest distance is when when (G-Point)•Line = 0
        // Calculate this and solve for lambda (λ)
        // Use t as λ

        // Calculate Position Vector part of Point to G
        var gPosX = posX.minus(x1);
        var gPosY = posY.minus(y1);
        var gPosZ = posZ.minus(z1);

        // Calculate lambda (λ); using t as λ
        var t = new Decimal(0);
        var tNumerator = ( ( dirX.times(gPosX) ).add( dirY.times(gPosY) ).add( dirZ.times(gPosZ) ) ).times(-1);
        var tDenominator = ( dirX.times(dirX) ).add( dirY.times(dirY) ).add( dirZ.times(dirZ));
        if (!tDenominator.equals(0)) {
            t = tNumerator.dividedBy(tDenominator);
        }

        // Calculate Vector Point to G
        // by subbing lambda back into Point to G
        var gX = gPosX.add( t.times(dirX) );
        var gY = gPosY.add( t.times(dirY) );
        var gZ = gPosZ.add( t.times(dirZ) );
        var g = [gX, gY, gZ];

        // Get Distance
        var distance = objectCalculations.sizeVector(g);
        
        if (additionalInfo == true) {
            return [distance, g, t];
        }
        return [distance, g];
    }

    static distancePointPoint(pointFormattedInfo1, pointFormattedInfo2) {
        var x1 = new Decimal(pointFormattedInfo1[0]);
        var y1 = new Decimal(pointFormattedInfo1[1]);
        var z1 = new Decimal(pointFormattedInfo1[2]);

        var x2 = new Decimal(pointFormattedInfo2[0]);
        var y2 = new Decimal(pointFormattedInfo2[1]);
        var z2 = new Decimal(pointFormattedInfo2[2]);

        var vectorDistance = [x2.minus(x1), y2.minus(y1), z2.minus(z1)];
        var distance = objectCalculations.sizeVector(vectorDistance);

        return [distance, vectorDistance];
    }

    // Acute Angles Between
    static angleBetweenLineLine(lineFormattedInfo1, lineFormattedInfo2) {
        var b1 = new Decimal(lineFormattedInfo1[3]);
        var b2 = new Decimal(lineFormattedInfo1[4]);
        var b3 = new Decimal(lineFormattedInfo1[5]);
        var d1 = new Decimal(lineFormattedInfo2[3]);
        var d2 = new Decimal(lineFormattedInfo2[4]);
        var d3 = new Decimal(lineFormattedInfo2[5]);

        var dotProductBD = (b1.times(d1)).add(b2.times(d2)).add(b3.times(d3));
        var magnitudeB = ((b1.toPower(2)).add(b2.toPower(2)).add(b3.toPower(2))).sqrt();
        var magnitudeD = ((d1.toPower(2)).add(d2.toPower(2)).add(d3.toPower(2))).sqrt();
        var cosTheta = dotProductBD.dividedBy(magnitudeB.times(magnitudeD)).abs();
        var theta = cosTheta.inverseCosine();

        return angle.convertToDegrees(theta);
    }

    static angleBetweenPlaneLine(planeFormattedInfo, lineFormattedInfo) {
        if (planeFormattedInfo.length == 9) {
            planeFormattedInfo = objectCalculations.parametricPlaneToCartesian(planeFormattedInfo);
        }

        var b1 = new Decimal(planeFormattedInfo[0]);
        var b2 = new Decimal(planeFormattedInfo[1]);
        var b3 = new Decimal(planeFormattedInfo[2]);
        var d1 = new Decimal(lineFormattedInfo[3]);
        var d2 = new Decimal(lineFormattedInfo[4]);
        var d3 = new Decimal(lineFormattedInfo[5]);

        var dotProductBD = (b1.times(d1)).add(b2.times(d2)).add(b3.times(d3));
        var magnitudeB = ((b1.toPower(2)).add(b2.toPower(2)).add(b3.toPower(2))).sqrt();
        var magnitudeD = ((d1.toPower(2)).add(d2.toPower(2)).add(d3.toPower(2))).sqrt();
        var sinTheta = dotProductBD.dividedBy(magnitudeB.times(magnitudeD)).abs();
        var theta = sinTheta.inverseSine();

        return angle.convertToDegrees(theta);
    }

    static angleBetweenPlanePlane(planeFormattedInfo1, planeFormattedInfo2) {
        if (planeFormattedInfo1.length == 9) {
            planeFormattedInfo1 = objectCalculations.parametricPlaneToCartesian(planeFormattedInfo1);
        }

        if (planeFormattedInfo2.length == 9) {
            planeFormattedInfo2 = objectCalculations.parametricPlaneToCartesian(planeFormattedInfo2);
        }

        var b1 = new Decimal(planeFormattedInfo1[0]);
        var b2 = new Decimal(planeFormattedInfo1[1]);
        var b3 = new Decimal(planeFormattedInfo1[2]);
        var d1 = new Decimal(planeFormattedInfo2[0]);
        var d2 = new Decimal(planeFormattedInfo2[1]);
        var d3 = new Decimal(planeFormattedInfo2[2]);

        var dotProductBD = (b1.times(d1)).add(b2.times(d2)).add(b3.times(d3));
        var magnitudeB = ((b1.toPower(2)).add(b2.toPower(2)).add(b3.toPower(2))).sqrt();
        var magnitudeD = ((d1.toPower(2)).add(d2.toPower(2)).add(d3.toPower(2))).sqrt();
        var cosTheta = dotProductBD.dividedBy(magnitudeB.times(magnitudeD)).abs();
        var theta = cosTheta.inverseCosine();

        return angle.convertToDegrees(theta);
    }

    // Vector Calculations
    static unitVector(pointFormattedInfo) {
        var x1 = new Decimal(pointFormattedInfo[0]);
        var y1 = new Decimal(pointFormattedInfo[1]);
        var z1 = new Decimal(pointFormattedInfo[2]);

        var size = objectCalculations.sizeVector(pointFormattedInfo);

        return [x1.dividedBy(size), y1.dividedBy(size), z1.dividedBy(size)];
    }

    static sizeVector(pointFormattedInfo) {
        var x1 = new Decimal(pointFormattedInfo[0]);
        var y1 = new Decimal(pointFormattedInfo[1]);
        var z1 = new Decimal(pointFormattedInfo[2]);

        var size = ( ( x1.pow(2) ).add( y1.pow(2) ).add( z1.pow(2) )  ).sqrt();

        return size;
    }

    static parametrization(planeFormattedInfo) {
        var a = new Decimal(planeFormattedInfo[0]);
        var b = new Decimal(planeFormattedInfo[1]);
        var c = new Decimal(planeFormattedInfo[2]);
        var d = new Decimal(planeFormattedInfo[3]);
        
        var zero = new Decimal(0);
        var one = new Decimal(1);
        var newFormattedInfo = [];

        if (a.equals(0) && b.equals(0)) {
            newFormattedInfo[0] = zero;
            newFormattedInfo[1] = zero;
            newFormattedInfo[2] = d.dividedBy(c);

            newFormattedInfo[3] = one;
            newFormattedInfo[4] = zero;
            newFormattedInfo[5] = zero;

            newFormattedInfo[6] = zero;
            newFormattedInfo[7] = one;
            newFormattedInfo[8] = zero;

            return newFormattedInfo;
        }
        if (b.equals(0) && c.equals(0)) {
            newFormattedInfo[0] = d.dividedBy(a);
            newFormattedInfo[1] = zero;
            newFormattedInfo[2] = zero;

            newFormattedInfo[3] = zero;
            newFormattedInfo[4] = one;
            newFormattedInfo[5] = zero;

            newFormattedInfo[6] = zero;
            newFormattedInfo[7] = zero;
            newFormattedInfo[8] = one;
            
            return newFormattedInfo;
        }
        if (a.equals(0) && c.equals(0)) {
            newFormattedInfo[0] = zero;
            newFormattedInfo[1] = d.dividedBy(b);
            newFormattedInfo[2] = zero;

            newFormattedInfo[3] = one;
            newFormattedInfo[4] = zero;
            newFormattedInfo[5] = zero;

            newFormattedInfo[6] = zero;
            newFormattedInfo[7] = zero;
            newFormattedInfo[8] = one;
            
            return newFormattedInfo;
        }

        if (!(a.equals(0))) {
            newFormattedInfo[0] = d.dividedBy(a);
            newFormattedInfo[1] = zero;
            newFormattedInfo[2] = zero;

            newFormattedInfo[3] = b.times(-1).dividedBy(a);
            newFormattedInfo[4] = one;
            newFormattedInfo[5] = zero;

            newFormattedInfo[6] = c.times(-1).dividedBy(a);
            newFormattedInfo[7] = zero;
            newFormattedInfo[8] = one;
        } else if (!(b.equals(0))) {
            newFormattedInfo[0] = zero;
            newFormattedInfo[1] = d.dividedBy(b);
            newFormattedInfo[2] = zero;

            newFormattedInfo[3] = one;
            newFormattedInfo[4] = a.times(-1).dividedBy(b);
            newFormattedInfo[5] = zero;

            newFormattedInfo[6] = zero;
            newFormattedInfo[7] = c.times(-1).dividedBy(b);
            newFormattedInfo[8] = one;
        } else {
            newFormattedInfo[0] = zero;
            newFormattedInfo[1] = zero;
            newFormattedInfo[2] = d.dividedBy(c);

            newFormattedInfo[3] = one;
            newFormattedInfo[4] = zero;
            newFormattedInfo[5] = a.times(-1).dividedBy(c);

            newFormattedInfo[6] = zero;
            newFormattedInfo[7] = one;
            newFormattedInfo[8] = b.times(-1).dividedBy(c);
        }

        return newFormattedInfo;
    }

    static parametricPlaneToCartesian(planeParamatericFormattedInfo) {
        var a1 = new Decimal(planeParamatericFormattedInfo[0]);
        var a2 = new Decimal(planeParamatericFormattedInfo[1]);
        var a3 = new Decimal(planeParamatericFormattedInfo[2]);
        var b1 = new Decimal(planeParamatericFormattedInfo[3]);
        var b2 = new Decimal(planeParamatericFormattedInfo[4]);
        var b3 = new Decimal(planeParamatericFormattedInfo[5]);
        var c1 = new Decimal(planeParamatericFormattedInfo[6]);
        var c2 = new Decimal(planeParamatericFormattedInfo[7]);
        var c3 = new Decimal(planeParamatericFormattedInfo[8]);

        // Normal:
        var n1 = (b2.times(c3)).minus(b3.times(c2));
        var n2 = (b1.times(c3)).minus(b3.times(c1)).times(-1);
        var n3 = (b1.times(c2)).minus(b2.times(c1));

        // D:
        var d = (n1.times(a1)).add(n2.times(a2)).add(n3.times(a3));

        return [n1, n2, n3, d];
    }
}

/* Expressions */

class expressions {
    static items = []; // array of expressionItems
    static vertices = [];
    static changesMade = true;

    static addsetExpression(expressionItemInstance) { // used to add new expression, or update existing
        // if expressionItemInstances doesn't have an object set, return
        if (typeof(expressionItemInstance.object) === 'undefined' || expressionItemInstance.object === null) {
            return;
        }

        this.changesMade = true
        // if exists already, set
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].id == expressionItemInstance.id) {
                this.items[i] = expressionItemInstance;
                return;
            }
        }

        // if doesn't exist already, add
        this.items.push(expressionItemInstance);

        // call object to calc vertices
        //expressionItemInstance.object.calcVertices();

        // collate new updated vertices
        //this.compileVertices();
    }

    static removeExpression(id) { // used to remove an expression from the list
        this.changesMade = true

        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].id == id) {
                this.items.splice(i, 1);
            }
        }
        
        this.compileVertices();
    }

    static getExpression(id) { // gets expression from id
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].id == id) {
                return this.items[i];
            }
        }
        return false;
    }

    static updateFormattedInfo(id, newInfo) {
        var expressionItemInstance = this.getExpression(id);
        expressionItemInstance.object.formattedInfo = newInfo;
        expressionItemInstance.object.calcVertices();
        this.recompileVertices();
    }

    static recalcVertices() { // calls all objects to recalculate vertices
        this.changesMade = true;
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].isVisible) {
                if (typeof this.items[i].object !== 'undefined' && this.items[i].object !== null) {
                    this.items[i].object.calcVertices();
                }
            }
        }
        
        this.compileVertices();
    }

    static recompileVertices() { // force recompiles vertices
        this.changesMade = true;
        this.compileVertices();
    }

    static compileVertices() { // if no changes, returns vertices, else compiles vertices and returns this
        if (this.changesMade) {
            var vertices = [];
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].isVisible) {
                    if (typeof this.items[i].object !== 'undefined' && this.items[i].object !== null) {
                        if (this.items[i].isVisible == true) {
                            for (var j = 0; j < this.items[i].object.vertices.length/7; j++) {
                                    vertices.push(this.items[i].object.vertices[(j*7)]);
                                    vertices.push(this.items[i].object.vertices[(j*7)+2]);
                                    vertices.push(this.items[i].object.vertices[(j*7)+1]);
                                    vertices.push(this.items[i].object.vertices[(j*7)+3]);
                                    vertices.push(this.items[i].object.vertices[(j*7)+4]);
                                    vertices.push(this.items[i].object.vertices[(j*7)+5]);
                                    vertices.push(this.items[i].object.vertices[(j*7)+6]);
                            }
                        }
                    }
                }
            }
            this.vertices = vertices;
            this.changesMade = false;
        }

        return this.vertices;
    }

    static hideObject(id) {
        var expressionItemInstance = this.getExpression(id);
        expressionItemInstance.isVisible = false;
        expressionItemInstance.object.calcVertices();
        this.recompileVertices();
    }

    static showObject(id) {
        var expressionItemInstance = this.getExpression(id);
        expressionItemInstance.isVisible = true;
        expressionItemInstance.object.calcVertices();
        this.recompileVertices();
    }
}

/* expressionItem */

class expressionItem {
    constructor (id, isVisible, isExpressionInputHidden) {
        this.id = id; // string
        this.isVisible = isVisible;
        this.isExpressionInputHidden = isExpressionInputHidden;
        this.object;
    }

    setObject(object) {
        this.object = object;
    }
}

/* Objects */

class object {
    constructor (formattedInfo, colour) {
        this.formattedInfo = formattedInfo;
        this.colour = colour; // array [R, G, B, A]
        this.vertices = []; // array of [X, Y, Z, R, G, B, A, repeated]
    }

    setColour(colour) {
        this.colour = colour;
    }

    calcVertices() {}
}

class basePlate extends object {
    constructor (formattedInfo, colour) {
        super(formattedInfo, colour);
        this.calcVertices();
    }

    calcVertices() {
        var scale = 1;
        this.vertices = [
            -500/scale, -500/scale, 0,     this.colour[0], this.colour[1], this.colour[2], this.colour[3],
            -500/scale, 500/scale, 0,   this.colour[0], this.colour[1], this.colour[2], this.colour[3],
            500/scale, 500/scale, 0,   this.colour[0], this.colour[1], this.colour[2], this.colour[3],
            500/scale, -500/scale, 0,     this.colour[0], this.colour[1], this.colour[2], this.colour[3],
            -500/scale, -500/scale, 0,   this.colour[0], this.colour[1], this.colour[2], this.colour[3],
            500/scale, 500/scale, 0,   this.colour[0], this.colour[1], this.colour[2], this.colour[3],
        ];
    }
}

class xLetter extends object {
    constructor (formattedInfo, colour) {
        super(formattedInfo, colour);
        this.calcVertices();
    }

    calcVertices() {
        var s = 10; // size
        var xPos = 520;
        var zPos = 2.5*s;
        var rawVertices = [ // X,Y repeated
            // Front Vertices
            0,0,

            s,0,
            s,-3*s,
            2*s, -2*s,
            3*s, 0,
            4*s, 0,

            3*s, -3*s,
            2*s, -4*s,
            0, -6*s,
            s, -6*s,
            3*s, -6*s,

            4*s, -6*s,
        ];
        var connectivity = [ // VertexNum, VertexNum, VertexNum, repeated - where VertexNum represents the corresponding vertex in the rawVertices
            // Front Vertices
            0,1,2,
            1,3,2,
            4,6,3,
            4,5,6,
            3,6,2,
            2,6,7,
            2,9,8,
            2,7,9,
            6,10,7,
            6,11,10,
        ];

        var calculatedVertices = [];
        for (var i = 0; i < connectivity.length; i++) {
            calculatedVertices.push(rawVertices[(connectivity[i]*2)] + xPos);
            calculatedVertices.push(0);
            calculatedVertices.push(rawVertices[(connectivity[i]*2)+1] + zPos);

            calculatedVertices.push(this.colour[0]);
            calculatedVertices.push(this.colour[1]);
            calculatedVertices.push(this.colour[2]);
            calculatedVertices.push(this.colour[3]);
        }

        this.vertices = calculatedVertices;
    }
}

class yLetter extends object {
    constructor (formattedInfo, colour) {
        super(formattedInfo, colour);
        this.calcVertices();
    }

    calcVertices() {
        var s = 10; // size
        var zPos = 3*s;
        var yPos = 580;
        var rawVertices = [ // X,Y, repeated
            0,0,
            s,0,
            4*s,0,
            5*s,0,
            2*s,-3*s,
            3*s,-3*s,
            2*s,-6*s,
            3*s,-6*s,
        ];
        var connectivity = [ // VertexNum, VertexNum, repeated - where VertexNum represents the corresponding vertex in the rawVertices
            0,1,4,
            1,5,4,
            2,4,5,
            2,3,5,
            4,5,6,
            5,7,6,
        ];

        var calculatedVertices = [];
        for (var i = 0; i < connectivity.length; i++) {
            calculatedVertices.push(0);
            calculatedVertices.push(rawVertices[(connectivity[i]*2)] + yPos);
            calculatedVertices.push(rawVertices[(connectivity[i]*2)+1] + zPos);

            calculatedVertices.push(this.colour[0]);
            calculatedVertices.push(this.colour[1]);
            calculatedVertices.push(this.colour[2]);
            calculatedVertices.push(this.colour[3]);
        }

        this.vertices = calculatedVertices;
    }
}

class zLetter extends object {
    constructor (formattedInfo, colour) {
        super(formattedInfo, colour);
        this.calcVertices();
    }

    calcVertices() {
        var s = 10; // size
        var xPos = -2*s;
        var zPos = 580;
        var rawVertices = [ // X,Y,Z, repeated
            // Front Vertices
            0,0,

            4*s,0,
            0,-s,
            4*s,-s,
            3*s,-s,

            0,-4*s,
            s,-4*s,
            4*s,-4*s,
            0,-5*s,
            4*s,-5*s,
        ];
        var connectivity = [ // VertexNum, VertexNum, VertexNum, repeated - where VertexNum represents the corresponding vertex in the rawVertices
            0,1,2,
            1,2,3,
            4,3,5,
            3,6,5,
            5,7,8,
            7,9,8,
        ];

        var calculatedVertices = [];
        for (var i = 0; i < connectivity.length; i++) {
            calculatedVertices.push(rawVertices[(connectivity[i]*2)] + xPos);
            calculatedVertices.push(0);
            calculatedVertices.push(rawVertices[(connectivity[i]*2)+1] + zPos);

            calculatedVertices.push(this.colour[0]);
            calculatedVertices.push(this.colour[1]);
            calculatedVertices.push(this.colour[2]);
            calculatedVertices.push(this.colour[3]);
        }

        this.vertices = calculatedVertices;
    }
}

class arrow extends object {
    constructor (formattedInfo, colour) {
        super(formattedInfo, colour);
        this.calcVertices();
    }

    calcVertices() {
        var s = 3; // size
        var l = 40; // arrow length
        var rawVertices = [ // X,Y,Z, repeated
            // Base Plane of Stick
            -500, s, s,
            -500, s, -s,
            -500, -s, s,
            -500, -s, -s,
            
            // Top Plane of Stick
            500-l, s, s,
            500-l, s, -s,
            500-l, -s, s,
            500-l, -s, -s,
            
            // Plane Base of Pyramid
            500-l, s*4, s*4,
            500-l, s*4, -s*4,
            500-l, -s*4, s*4,
            500-l, -s*4, -s*4,

            // Point of Pyramid
            500, 0, 0,
        ];
        var connectivity = [ // VertexNum, VertexNum, VertexNum, repeated - where VertexNum represents the corresponding vertex in the rawVertices
            // Base Plane of Stick
            0,1,2,
            2,3,1,

            // Top Plane of Stick
            4,5,6,
            6,7,5,

            // Faces of Stick
            0,4,6,
            0,6,2,
            2,6,7,
            2,7,3,
            1,3,7,
            1,5,7,
            0,5,1,
            0,4,5,

            // Base Plane of Pyramid
            8,9,10,
            10,11,9,

            // Sides of Pyramid
            8,10,12,
            10,12,11,
            9,11,12,
            8,9,12,
        ];

        // Get calculated Vertices with rawVertices and connectivity
        var calculatedVertices = [];
        for (var i = 0; i < connectivity.length; i++) {
            calculatedVertices.push(rawVertices[(connectivity[i]*3)]);
            calculatedVertices.push(rawVertices[(connectivity[i]*3)+1]);
            calculatedVertices.push(rawVertices[(connectivity[i]*3)+2]);
        }

        // Define rotation matrix
        if (this.formattedInfo[0] == 'x') {
            var m_rotation = new matrix(3, 3, [1,0,0, 0,1,0, 0,0,1]);
        } 
        if (this.formattedInfo[0] == 'y') {
            var m_rotation = new matrix(3, 3, [0,-1,0, 1,0,0, 0,0,1]);
        } 
        if (this.formattedInfo[0] == 'z') {
            var m_rotation = new matrix(3, 3, [0,0,-1, 0,1,0, 1,0,0]);
        } 

        // Get Vertices by Transforming calculated Vertices
        var transformedVertices = [];
        for (var i = 0; i < calculatedVertices.length/3; i++) {
            // Create Matrix with Vertex
            var m_position = new matrix(3, 1, [calculatedVertices[i*3],calculatedVertices[i*3+1],calculatedVertices[i*3+2]]);

            // Multiply Matrices
            var m_newPosition = m_rotation.multiplyWith(m_position);
            //var m_newPosition = m_position;

            // Push Vertices
            transformedVertices.push(m_newPosition.items[0]);
            transformedVertices.push(m_newPosition.items[1]);
            transformedVertices.push(m_newPosition.items[2]);

            transformedVertices.push(this.colour[0]);
            transformedVertices.push(this.colour[1]);
            transformedVertices.push(this.colour[2]);
            transformedVertices.push(this.colour[3]);
        }
        //console.log(transformedVertices);

        this.vertices = transformedVertices;
    }
}

class grid extends object {
    constructor (formattedInfo, colour) {
        super(formattedInfo, colour);
        this.calcVertices();
    }

    calcVertices() {
        var s = 1; // size, thickness
        var spacing = (250/(1.1+((scale-1)%1)))/this.formattedInfo[0]; //(((((scale)/50))+50))/(this.formattedInfo[0]); // spacing
        //console.log(spacing);

        // Define rawVertices of a line at y = 0, z = 0 (parallel to x-axis)
        var rawVertices = [ // X,Y,Z, repeated
            -500, s, s,
            -500, s, -s,
            -500, -s, s,
            -500, -s, -s,
            
            500, s, s,
            500, s, -s,
            500, -s, s,
            500, -s, -s,
        ];
        var connectivity = [ // VertexNum, VertexNum, VertexNum, repeated - where VertexNum represents the corresponding vertex in the rawVertices
            0,1,2,
            2,3,1,

            4,5,6,
            6,7,5,

            0,4,6,
            0,6,2,
            2,6,7,
            2,7,3,
            1,3,7,
            1,5,7,
            0,5,1,
            0,4,5,
        ];

        // Calculate Vertices from rawVertices and connectivity
        var calculatedVertices = [];
        for (var i = 0; i < connectivity.length; i++) {
            calculatedVertices.push(rawVertices[(connectivity[i]*3)]);
            calculatedVertices.push(rawVertices[(connectivity[i]*3)+1]);
            calculatedVertices.push(rawVertices[(connectivity[i]*3)+2]);
        }
        
        // Repeat this line from y = 0 to y = 500
        // with spacing (variable set earlier)
        var repeatedLineVertices = [];
        for (var i = 0; i <= (500/spacing); i++) {
            for (var j = 0; j < calculatedVertices.length/3; j++) {
                repeatedLineVertices.push(calculatedVertices[(j*3)]);
                repeatedLineVertices.push(calculatedVertices[(j*3)+1]+(i*spacing));
                repeatedLineVertices.push(calculatedVertices[(j*3)+2]);
            }
        }
        
        // Repeat this line from y = 0 to y = -500
        // with spacing (variable set earlier)
        for (var i = 0; i <= (500/spacing); i++) {
            for (var j = 0; j < calculatedVertices.length/3; j++) {
                repeatedLineVertices.push(calculatedVertices[(j*3)]);
                repeatedLineVertices.push(calculatedVertices[(j*3)+1]-(i*spacing));
                repeatedLineVertices.push(calculatedVertices[(j*3)+2]);
            }
        }
        
        // Define gridVertices
        // (1): repeatedLineVertices (2): + repeatedLineVertices rotated 90deg about z-axis
        // (1):
        var gridVertices = [...repeatedLineVertices];
        // (2):
        var m_rotation = new matrix(3, 3, [0,-1,0, 1,0,0, 0,0,1]);
        var m_vertex = new matrix(3, 1, [0,0,0]);
        for (var i = 0; i < repeatedLineVertices.length/3; i++) {
            m_vertex.items = [repeatedLineVertices[(i*3)], repeatedLineVertices[(i*3)+1], repeatedLineVertices[(i*3)+2]];
            var m_newVertex = m_rotation.multiplyWith(m_vertex);

            gridVertices.push(m_newVertex.items[0]);
            gridVertices.push(m_newVertex.items[1]);
            gridVertices.push(m_newVertex.items[2]);

        }

        // Add Colour Data
        var finalVertices = [];
        for (var i = 0; i < gridVertices.length/3; i++) {
            finalVertices.push(gridVertices[i*3]);
            finalVertices.push(gridVertices[i*3+1]);
            finalVertices.push(gridVertices[i*3+2]);

            finalVertices.push(this.colour[0]);
            finalVertices.push(this.colour[1]);
            finalVertices.push(this.colour[2]);
            finalVertices.push(this.colour[3]);
        }

        this.vertices = finalVertices;
    }
}

class gridBorder extends object {
    constructor (formattedInfo, colour) {
        super(formattedInfo, colour);
        this.calcVertices();
    }

    calcVertices() {
        var s = 1; // size, thickness

        // Define rawVertices of a line at y = 0, z = 0 (parallel to x-axis)
        var rawVertices = [ // X,Y,Z, repeated
            -500, s, s,
            -500, s, -s,
            -500, -s, s,
            -500, -s, -s,
            
            500, s, s,
            500, s, -s,
            500, -s, s,
            500, -s, -s,
        ];
        var connectivity = [ // VertexNum, VertexNum, VertexNum, repeated - where VertexNum represents the corresponding vertex in the rawVertices
            0,1,2,
            2,3,1,

            4,5,6,
            6,7,5,

            0,4,6,
            0,6,2,
            2,6,7,
            2,7,3,
            1,3,7,
            1,5,7,
            0,5,1,
            0,4,5,
        ];

        // Calculate Vertices from rawVertices and connectivity
        // and Translate this line to y = -500 and again for y = 500
        var calculatedVertices = [];
        for (var i = 0; i < connectivity.length; i++) {
            calculatedVertices.push(rawVertices[(connectivity[i]*3)]);
            calculatedVertices.push(rawVertices[(connectivity[i]*3)+1]-500);
            calculatedVertices.push(rawVertices[(connectivity[i]*3)+2]);
        }
        for (var i = 0; i < connectivity.length; i++) {
            calculatedVertices.push(rawVertices[(connectivity[i]*3)]);
            calculatedVertices.push(rawVertices[(connectivity[i]*3)+1]+500);
            calculatedVertices.push(rawVertices[(connectivity[i]*3)+2]);
        }
        
        // Define gridBorderVertices
        // (1): repeatedLineVertices (2): + repeatedLineVertices rotated 90deg about z-axis
        // (1):
        var gridBorderVertices = [...calculatedVertices];
        // (2):
        var m_rotation = new matrix(3, 3, [0,-1,0, 1,0,0, 0,0,1]);
        var m_vertex = new matrix(3, 1, [0,0,0]);
        for (var i = 0; i < calculatedVertices.length/3; i++) {
            m_vertex.items = [calculatedVertices[(i*3)], calculatedVertices[(i*3)+1], calculatedVertices[(i*3)+2]];
            var m_newVertex = m_rotation.multiplyWith(m_vertex);

            gridBorderVertices.push(m_newVertex.items[0]);
            gridBorderVertices.push(m_newVertex.items[1]);
            gridBorderVertices.push(m_newVertex.items[2]);

        }

        // Add Colour Data
        var finalVertices = [];
        for (var i = 0; i < gridBorderVertices.length/3; i++) {
            finalVertices.push(gridBorderVertices[i*3]);
            finalVertices.push(gridBorderVertices[i*3+1]);
            finalVertices.push(gridBorderVertices[i*3+2]);

            finalVertices.push(this.colour[0]);
            finalVertices.push(this.colour[1]);
            finalVertices.push(this.colour[2]);
            finalVertices.push(this.colour[3]);
        }

        this.vertices = finalVertices;
    }
}

// Plane
class plane extends object {
    constructor (formattedInfo, colour) {
        super(formattedInfo, colour);

        this.defaultRawVertices = [ // X,Y,Z, repeated
            0, -500, -500, 0,
            -500, 500, 0,
            500, -500, 0,
            500, 500, 0,
        ];
    
        this.defaultConnectivity = [ // VertexNum, VertexNum, VertexNum, repeated - where VertexNum represents the corresponding vertex in the rawVertices
            0, 1, 2,
            1, 3, 2,
        ];
    }

    calcVertices() {
        var info = this.formattedInfo;

        // If parametric, convert to cartesian
        if (info.length == 9) {
            info = objectCalculations.parametricPlaneToCartesian(info);
        }
        
        // Get Point perpendicular from Centre & Distance
        var worldCentre = [new Decimal(0),new Decimal(0),new Decimal(0)];
        var [distance, perPoint] = objectCalculations.distancePlanePoint(info, worldCentre);

        // Return if too far from centre
        if (distance.times(worldObjectSize).dividedBy(scale).comparedTo(800) == 1) {
            this.vertices = [];
            return;
        }

        // Transform perPoint
        for (var i = 0; i < 3; i++) {
            perPoint[i] = (perPoint[i]).times(worldObjectSize).dividedBy(scale);
        }

        // Get unit vector of normal vector of the plane
        var normal = objectCalculations.unitVector([info[0], info[1], info[2]]);

        // Calculate Lambda
        var t = new Decimal(600);

        // Reset Vertices
        var rawVertices = [];

        // Get parametrization (direction vectors) of plane
        var parametrization;
        if (this.formattedInfo.length == 9) {
            parametrization = this.formattedInfo;
        } else {
            parametrization = objectCalculations.parametrization([normal[0], normal[1], normal[2], 0]);
        }
        // Get unit vectors of these direction vectors
        var dir1 = objectCalculations.unitVector([parametrization[3], parametrization[4], parametrization[5]]);
        var dir2 = objectCalculations.unitVector([parametrization[6], parametrization[7], parametrization[8]]);
        
        // Get Four Vertices of plane by combination of direction vectors
        var addedDir = [];
        for (var i = -1; i != 3; i = i + 2) {
            for (var j = -1; j != 3; j = j + 2) {
                for (var k = 0; k < 3; k++) {
                    addedDir[k] = ((dir1[k].times(i)).add(dir2[k].times(j)));
                }
                addedDir = objectCalculations.unitVector(addedDir);
                for (var k = 0; k < 3; k++) {
                    rawVertices.push(perPoint[k].add(addedDir[k].times(t)));
                }
            }
        }

        // TESTING CODE
        // Foreach vertex, return to value without worldObjectSize or scale
        // Substitute this value back into the equation of the plane as ax + by + cz - d
        // Output this result (zero or reasonably close to zero means the point lies on the plane)
        var sub;
        var tRawVertex = [0,0,0];
        var info = [0,0,0,0];
        for (var i = 0; i < rawVertices.length/3; i++) {
            tRawVertex[0] = rawVertices[i*3].dividedBy(worldObjectSize).times(scale);
            tRawVertex[1] = rawVertices[i*3+1].dividedBy(worldObjectSize).times(scale);
            tRawVertex[2] = rawVertices[i*3+2].dividedBy(worldObjectSize).times(scale);
            info[0] = new Decimal(info[0]);
            info[1] = new Decimal(info[1]);
            info[2] = new Decimal(info[2]);
            info[3] = new Decimal(info[3]);
            sub = (info[0].times(tRawVertex[0])).add(info[1].times(tRawVertex[1])).add(info[2].times(tRawVertex[2])).minus(info[3]);
            console.log(sub.toString());
        }

        // Get final vertices
        var finalVertices = [];
        for (var i = 0; i < this.defaultConnectivity.length; i++) {
            finalVertices.push(rawVertices[this.defaultConnectivity[i]*3]);
            finalVertices.push(rawVertices[this.defaultConnectivity[i]*3+1]);
            finalVertices.push(rawVertices[this.defaultConnectivity[i]*3+2]);

            finalVertices.push(this.colour[0]);
            finalVertices.push(this.colour[1]);
            finalVertices.push(this.colour[2]);
            finalVertices.push(this.colour[3]);
        }

        this.vertices = finalVertices;
    }
}

// Line
class line extends object {
    constructor (formattedInfo, colour) {
        super(formattedInfo, colour);
    
        this.defaultConnectivity = [ // VertexNum, VertexNum, VertexNum, repeated - where VertexNum represents the corresponding vertex in the rawVertices
            // Top
            0,4,6, 0,6,2,
            // Back
            0,4,5, 0,5,1,
            // Bottom
            1,5,7, 1,7,3,
            // Front
            2,6,7, 2,7,3,
            // Left
            0,1,2, 2,1,3,
            // Right
            4,6,5, 6,7,5,
        ];
    }

    calcVertices() {
        var info = this.formattedInfo;
        
        // Get Point perpendicular from Origin  & Distance from Origin
        var worldCentre = [new Decimal(0),new Decimal(0),new Decimal(0)];
        var [distance, perPoint] = objectCalculations.distanceLinePoint(info, worldCentre);

        // Return if too far from centre
        if (distance.times(worldObjectSize).dividedBy(scale).comparedTo(800) == 1) {
            this.vertices = [];
            return;
        } 

        // Transform perpendicular point by scale and worldObjectSize
        for (var i = 0; i < 3; i++) {
            perPoint[i] = (perPoint[i]).times(worldObjectSize).dividedBy(scale);
        }

        // Define the direction vector and get unit vector
        var dir = objectCalculations.unitVector([info[3], info[4], info[5]]);

        // Define Lambda (half of the length of the line)
        var lambda = new Decimal(700);
 
        // Get Point backwards on Line
        var backwards = [perPoint[0].minus(lambda.times(dir[0])), perPoint[1].minus(lambda.times(dir[1])), perPoint[2].minus(lambda.times(dir[2]))];

        // Get Point forwards on Line
        var forwards = [perPoint[0].add(lambda.times(dir[0])), perPoint[1].add(lambda.times(dir[1])), perPoint[2].add(lambda.times(dir[2]))];

        // Reset Vertices
        var rawVertices = [];

        var s = 3;
        // Get parametrization of direction vector (to plane)
        var parametrization = objectCalculations.parametrization([info[3], info[4], info[5], 0]);
        // Get unit vectors of these direction vectors
        var dir1 = objectCalculations.unitVector([parametrization[3], parametrization[4], parametrization[5]]);
        var dir2 = objectCalculations.unitVector([parametrization[6], parametrization[7], parametrization[8]]);
        // Get Four Vertices of backwards face by combination of direction vectors
        var addedDir = [];
        for (var i = -1; i != 3; i = i + 2) {
            for (var j = -1; j != 3; j = j + 2) {
                // Add i loads of dir1 and j loads of dir2 together
                for (var k = 0; k < 3; k++) {
                    addedDir[k] = ((dir1[k].times(i)).add(dir2[k].times(j)));
                }
                // Get Unit vector of this combined dir vector
                addedDir = objectCalculations.unitVector(addedDir);
                // Add this combined dir vector to the point backwards on the line to rawVertices
                for (var k = 0; k < 3; k++) {
                    rawVertices.push(backwards[k].add(addedDir[k].times(s)));
                }
            }
        }

        // Get Four Vertices of forwards face by combination of direction vectors
        for (var i = -1; i != 3; i = i + 2) {
            for (var j = -1; j != 3; j = j + 2) {
                // Add i loads of dir1 and j loads of dir2 together
                for (var k = 0; k < 3; k++) {
                    addedDir[k] = ((dir1[k].times(i)).add(dir2[k].times(j)));
                }
                // Get Unit vector of this combined dir vector
                addedDir = objectCalculations.unitVector(addedDir);
                // Add this combined dir vector to the point backwards on the line to rawVertices
                for (var k = 0; k < 3; k++) {
                    rawVertices.push(forwards[k].add(addedDir[k].times(s)));
                }
            }
        }

        // Now push final vertices by using defaultConnectivity and rawVertices
        var finalVertices = [];
        for (var i = 0; i < this.defaultConnectivity.length; i++) {
            finalVertices.push(rawVertices[this.defaultConnectivity[i]*3]);
            finalVertices.push(rawVertices[this.defaultConnectivity[i]*3+1]);
            finalVertices.push(rawVertices[this.defaultConnectivity[i]*3+2]);

            finalVertices.push(this.colour[0]);
            finalVertices.push(this.colour[1]);
            finalVertices.push(this.colour[2]);
            finalVertices.push(this.colour[3]);
        }

        this.vertices = finalVertices;
    }
}

// Point
class point extends object {
    constructor (formattedInfo, colour) {
        super(formattedInfo, colour);

        var s = 5;

        this.defaultRawVertices = [ // X,Y,Z, repeated
            // Left
            -s,s,s,
            -s,-s,s,
            -s,s,-s,
            -s,-s,-s,
            // Right
            s,s,s,
            s,-s,s,
            s,s,-s,
            s,-s,-s,
        ];
    
        this.defaultConnectivity = [ // VertexNum, VertexNum, VertexNum, repeated - where VertexNum represents the corresponding vertex in the rawVertices
            // Top
            0,4,6, 0,6,2,
            // Back
            0,4,5, 0,5,1,
            // Bottom
            1,5,7, 1,7,3,
            // Front
            2,6,7, 2,7,3,
            // Left
            0,1,2, 2,1,3,
            // Right
            4,6,5, 6,7,5,
        ];
    }

    calcVertices() {
        var info = this.formattedInfo;
        
        // Get Point perpendicular from Centre
        var worldCentre = [new Decimal(0),new Decimal(0),new Decimal(0)];
        var [distance, perPoint] = objectCalculations.distancePointPoint(worldCentre, info);

        // Return if far from origin
        if (distance.times(worldObjectSize).dividedBy(scale).comparedTo(800) == 1) {
            this.vertices = [];
            return;
        }

        // Transform Point by worldSize and Scale, and according to worldCentre
        for (var i = 0; i < 3; i++) {
            perPoint[i] = (perPoint[i]).times(worldObjectSize).dividedBy(scale);
        }

        var finalVertices = [];
        // Define Matrix for tranformation ( atranslation) by the XYZ of the point
        var m_translation = new matrix(4, 4, [1,  0,  0,  perPoint[0], 0,  1,  0,  perPoint[1], 0,  0,  1,  perPoint[2], 0, 0, 0, 1]);
        var m_vertex;
        var m_newVertex;
        // For each Triangle: Vertex: Transform and add to final vertices along with Colour Data (X, Y, Z, R, G, B, A)
        for (var i = 0; i < this.defaultConnectivity.length; i++) {
            m_vertex = new matrix(4, 1, [this.defaultRawVertices[this.defaultConnectivity[i]*3],this.defaultRawVertices[this.defaultConnectivity[i]*3+1],this.defaultRawVertices[this.defaultConnectivity[i]*3+2],1]);
            m_newVertex = m_translation.multiplyWith(m_vertex);

            finalVertices.push(m_newVertex.items[0]);
            finalVertices.push(m_newVertex.items[1]);
            finalVertices.push(m_newVertex.items[2]);

            finalVertices.push(this.colour[0]);
            finalVertices.push(this.colour[1]);
            finalVertices.push(this.colour[2]);
            finalVertices.push(this.colour[3]);
        }

        // Update Vertices
        this.vertices = finalVertices;
    }
}