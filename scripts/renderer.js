class renderer {
  static drawScene;

  static initialiseWebGL() {
    // Define Shaders in GLSL Language (Similar to C/C#)
    var vertexShaderText = `
    attribute vec4 a_position; // Attributes define how to pull out data from a buffer
    attribute vec4 a_colour;
    varying vec4 v_colour; // Varyings are a way for a vertex shader to pass data to a fragment shader
    uniform mat4 u_matrix; // Uniforms are like global variables in the WebGL program
  
    void main() {
      v_colour = a_colour;
      gl_Position = u_matrix * a_position;
    }`;
  
    var fragShaderText = `
    precision mediump float;
    varying vec4 v_colour;
  
    void main() {
      gl_FragColor = v_colour;
    }`;
  
    // Get Canvas from the id we set in html
    var canvas = document.getElementById("#canvas");
  
    // Get WebGLRenderingContext, the 'tool' to draw onto the canvas essentially is what .getContext is
    var gl = canvas.getContext("webgl");
  
    if (!gl) {
      // If WebGL not supported, switch to experimental-webgl
      gl = canvas.getContext('experimental-webgl');
    }
  
    // Create Shaders
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderText);
    gl.compileShader(vertexShader);
  
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragShaderText);
    gl.compileShader(fragShader);
  
    // Create and bind the vertices buffer,
    // this is where the attributes 'position' and 'colour' will pull data from
    var b_vertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b_vertices);
  
    // Create Program, Attach Shaders and Link Program
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
  
    // Setting up the WebGL State for supplying data //
    // Get the locations the attributes 'position' and 'colour'
    var a_positionLocation = gl.getAttribLocation(program, "a_position"); // Attributes provide buffer data to the Vertex Shader
    var a_colourLocation = gl.getAttribLocation(program, "a_colour");     // and define how to pull data out of a buffer (the format)
                                                                          // A buffer is a string of binary data
  
    renderer.drawScene = function() {
      // Rendering //
      // WebGL works in clip space, we need to define the canvas viewport size
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  
      // Make the Canvas Gray and Clear the buffers
      gl.clearColor(0.975, 0.975, 0.975, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
      // Tell WebGL which program to use (execute)
      gl.useProgram(program);
  
      // Define how to pull data from the triangle vertices buffer for the attributes
      // vertexAttribPointer(AtribLocation, N.Elements per Attrib, Type of elements, Normalised?, 
      //                     Stride between consecutive vertex Attribs, Offset from wehre vertex Attrib begins)
      // and Enable the attributes
      gl.enableVertexAttribArray(a_positionLocation);
      gl.vertexAttribPointer(a_positionLocation, 3, gl.FLOAT, false, 7 * Float32Array.BYTES_PER_ELEMENT, 0);
  
      gl.enableVertexAttribArray(a_colourLocation);
      gl.vertexAttribPointer(a_colourLocation, 4, gl.FLOAT, false, 7 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
  
      // Compute the projection matrix
      var translation = [0,0,0];
      var rotation = [angle.convertToRad(rotation1), angle.convertToRad(rotation2), 0]; //[degToRad(40), degToRad(25), degToRad(325)];
      var scale = [1, 1, 1];
      var m_projection = new matrix(4, 4, [(1 / gl.canvas.width), 0, 0, 0, 0, (1 / gl.canvas.height), 0, 0, 0, 0, (1 / gl.canvas.width), 0, 0, 0, 0, 1]); // Projection Matrix
      var m_translation = new matrix(4, 4, [1,  0,  0,  0, 0,  1,  0,  0, 0,  0,  1,  0, translation[0], translation[1], translation[2], 1]);
      var m_xRotation = new matrix(4, 4, [1, 0, 0, 0, 0, Math.cos(rotation[0]), Math.sin(rotation[0]), 0, 0, -Math.sin(rotation[0]), Math.cos(rotation[0]), 0, 0, 0, 0, 1]);
      var m_yRotation = new matrix(4, 4, [Math.cos(rotation[1]), 0, -Math.sin(rotation[1]), 0, 0, 1, 0, 0, Math.sin(rotation[1]), 0, Math.cos(rotation[1]), 0, 0, 0, 0, 1]);
      var m_zRotation = new matrix(4, 4, [Math.cos(rotation[2]), Math.sin(rotation[2]), 0, 0, -Math.sin(rotation[2]), Math.cos(rotation[2]), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
      var m_scale = new matrix(4, 4, [scale[0], 0, 0, 0, 0, scale[1], 0, 0, 0, 0, scale[2], 0, 0, 0, 0, 1]);
  
      var m_compute = m_projection.multiplyWith(m_translation).multiplyWith(m_yRotation).multiplyWith(m_xRotation).multiplyWith(m_zRotation).multiplyWith(m_scale);
      ////console.log(m_compute);
  
      // Set the uniform matri to the projection matrix.
      var u_matrixLocation = gl.getUniformLocation(program, "u_matrix");
      gl.uniformMatrix4fv(u_matrixLocation, false, m_compute.items);
  
      // Enable depth test
      gl.enable(gl.DEPTH_TEST);
      
      // Draw Triangles //
      // Update the vertices buffer data with triangle vertices & draw
      // gl.DYNAMIC_COPY: "The contents are intended to be respecified repeatedly by reading data from WebGL, and used many times as the source for WebGL drawing and image specification commands."
      // - mdn web docs
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(expressions.compileVertices()), gl.DYNAMIC_DRAW);
      gl.drawArrays(gl.TRIANGLES, 0, expressions.compileVertices().length/7);
    }
    renderer.drawScene();
  }
}
window.addEventListener('load', renderer.initialiseWebGL);