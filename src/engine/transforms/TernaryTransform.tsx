
import { jsonObject } from "typedjson";
import Transform from "../Transform";
import { GUID } from "../iengine";


const vs = `
attribute vec2 a_position;
varying vec2 v_texCoord;

void main() {
    gl_Position = vec4(a_position, 0, 1);
    v_texCoord = vec2((a_position.x + 1.0) / 2.0, 1.0 - (a_position.y + 1.0) / 2.0);
}
`;

const default_fs = `
precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_image0;
uniform sampler2D u_image1;
uniform sampler2D u_image2;

uniform float u_arg;

void main() {
    vec2 pixelCoords = v_texCoord ;
    vec3 col0 = texture2D(u_image0, pixelCoords).rgb;
    vec3 col1 = texture2D(u_image1, pixelCoords).rgb;
    vec3 col2 = texture2D(u_image2, pixelCoords).rgb;

    gl_FragColor = vec4(col0.x, col0.y, col0.z, 1.0);
}
`

@jsonObject({name:"TernaryTransform"})
abstract class TernaryTransform extends Transform {
    
    fragment_shader: string

    constructor(name: string = "Ternary transform", fragment?: string) {
        super(name, '#F4E2F4');
        this.meta.input_size = 3;
        this.gl = this.canvas.getContext('webgl', {preserveDrawingBuffer: true})!;
        this.fragment_shader = fragment ?? default_fs
    }

    public async _update_node(): Promise<boolean> {
        // based on input connections perform calculations
        let [parent1, _] = this.inputs.get(0)!;
        let [parent2, __] = this.inputs.get(1)!;
        let [parent3, ___] = this.inputs.get(2)!;

        let input0 = this.engine.getNode(parent1)?.canvas;
        let input1 = this.engine.getNode(parent2)?.canvas;
        let input2 = this.engine.getNode(parent3)?.canvas;
        return await this.apply([input0, input1, input2]) != undefined;
    }

    visualizationView(guid: string) {
        return <></>
    }

    async _apply(input: Array<OffscreenCanvas>): Promise<OffscreenCanvas> {
            this.canvas.width = input.reduce((prev, el, _) => prev < el.width ? el.width : prev, 0);
            this.canvas.height = input.reduce((prev, el, _) => prev < el.height ? el.height : prev, 0);;

            const gl = this.gl
            gl.viewport(0,0, this.canvas.width, this.canvas.height);

            const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
                gl.shaderSource(vertexShader, vs);
                gl.compileShader(vertexShader);

            const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
                gl.shaderSource(fragmentShader, this.fragment_shader);
                gl.compileShader(fragmentShader);

            const program = gl.createProgram()!;
                gl.attachShader(program, vertexShader);
                gl.attachShader(program, fragmentShader);
                gl.linkProgram(program);
                gl.useProgram(program);

            const positionBuffer = gl.createBuffer()!;
                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                    -1,    -1, 
                    1,     -1, 
                    -1,    1,
                    1,     1
                ]), gl.STATIC_DRAW);

            const texture0loc = gl.getUniformLocation(program, "u_image0");
                gl.uniform1i(texture0loc, 0);
            const texture1loc = gl.getUniformLocation(program, "u_image1");
                gl.uniform1i(texture1loc, 1);
            const texture2loc = gl.getUniformLocation(program, "u_image2");
                gl.uniform1i(texture2loc, 2);
                     
            const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
                gl.enableVertexAttribArray(positionAttributeLocation);
                gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);  
            
            const texture0 = gl.createTexture();
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, texture0);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, input[0]);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            const texture1 = gl.createTexture();
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, texture1);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, input[1]);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            const texture2 = gl.createTexture();
                gl.activeTexture(gl.TEXTURE2);
                gl.bindTexture(gl.TEXTURE_2D, texture2);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, input[2]);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);
            gl.deleteProgram(program);
            gl.deleteBuffer(positionBuffer);
            gl.deleteTexture(texture0);

            return this.canvas;
    }
}

export default TernaryTransform;