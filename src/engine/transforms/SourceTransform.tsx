import {ReactNode} from "react";
import Transform from "../Transform";
import {jsonMember, jsonObject} from "typedjson";
import {ImageStore} from '../../stores/imageStore';
import ImportComponent from '../../components/transforms/ImportComponent';
import { GUID } from '../iengine';

@jsonObject({name:"SourceTransform"})
export default class SourceTransform extends Transform {
    @jsonMember(String)
    imageId: string


    constructor(name: string = "source") {
        super(name, "#FFFFFF", 0);

        // todo: load image blob from store
        this.imageId = "";
        this.isSource = true;

    }

    public could_update(): boolean {
        return this.image != undefined || this.imageId != ""
    }

    async apply(input: Array<OffscreenCanvas | undefined>): Promise<OffscreenCanvas | undefined> {

        if (!this.valid){
            if (this.imageId != "" && !this.image) {
                this.image = await ImageStore.get(this.imageId)
            }

            if (!this.image) return undefined;
            await this.loadImage();
        }

        return this.canvas;
    }

    async setImageString(imageString: string) {
        if (this.image) {
            await ImageStore.remove(this.imageId)
        }
        this.image = imageString
        this.imageId = await ImageStore.add(imageString)

        await this.loadImage()
    }

    async loadImage() {
        if (!this.image) return
        console.log("loadImage")

        const image = new Image()
        const loadImage = async (img: HTMLImageElement) => {
            return new Promise((resolve, reject) => {
                img.onload = async () => {
                    resolve(true);
                };
            });
        };
        image.src = this.image;
        await loadImage(image);

        this.canvas.width = image.width;
        this.canvas.height = image.height;
        this.drawImage(image)
        this.valid = true;
        this.hash = crypto.randomUUID();
        this.engine.requestUpdate(this.meta.id);
    }

    drawImage(input: HTMLImageElement) {
        const vertexShaderSource = `
                attribute vec2 a_position;
                varying vec2 v_texCoord;

                void main() {
                    gl_Position = vec4(a_position, 0, 1);
                    v_texCoord = vec2((a_position.x + 1.0) / 2.0, 1.0 - (a_position.y + 1.0) / 2.0);
                }
            `;

        const fragmentShaderSource = `
                // these params should be for all filters
                precision mediump float;
                varying vec2 v_texCoord;
                uniform sampler2D u_image;
                
                void main() {
                    gl_FragColor = texture2D(u_image, v_texCoord);
                }
            `;

        this.canvas.width = input.width;
        this.canvas.height = input.height;

        const gl = this.gl
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);

        const program = gl.createProgram()!;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);

        const positionBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            1, 1
        ]), gl.STATIC_DRAW);

        const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, input);
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
        gl.deleteTexture(texture);
    }

    async updateParams(params: {[key: string]: any;}): Promise<void> {
        if (params["image"]) {
            await this.setImageString(params["image"])
            // todo: save image blob to store
        }
    }
    paramView(guid: GUID) {
        return <ImportComponent guid={guid}></ImportComponent>
    }

    visualizationView(guid: string) {
        return <></>
    }

    public onDelete(): void {
        if (!this.imageId) return;
        ImageStore.remove(this.imageId)
    }
}