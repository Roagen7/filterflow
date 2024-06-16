import { ReactElement, JSXElementConstructor } from "react";
import BinaryTransform from "../BinaryTransform"
import { jsonObject } from "typedjson";


const fs = `
precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_image0;
uniform sampler2D u_image1;

uniform float u_arg;

void main() {
    vec2 pixelCoords = v_texCoord ;
    vec3 col0 = texture2D(u_image0, pixelCoords).rgb;
    vec3 col1 = texture2D(u_image1, pixelCoords).rgb;

    gl_FragColor = vec4(col0.x * col1.x, col0.y * col1.y, col0.z * col1.z, 1.0);
}
`

@jsonObject({name:"BinaryAndTransform"})
export default class BinaryAndTransform extends BinaryTransform {
    constructor(){
        super("binary and", fs);
    }

    paramView(guid: string): ReactElement<any, string | JSXElementConstructor<any>> {
        return <>No params to specify</>
    }

}