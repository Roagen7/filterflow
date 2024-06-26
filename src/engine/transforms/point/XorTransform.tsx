

import { jsonObject } from "typedjson";
import { BitwiseTransform } from "./BitwiseTransform";

@jsonObject({name:"XorTransform"})
export class XorTransform extends BitwiseTransform {
    // XOR = v1*(1-v2) +v2*(1-v1)
    constructor() {
        super('XOR', true,    `
        precision mediump float;
        varying vec2 v_texCoord;
        uniform sampler2D u_image;

        uniform float u_arg;
        
        void main() {
            float n_arg = u_arg/255.0;

            vec2 pixelCoords = v_texCoord ;
            vec3 col = texture2D(u_image, pixelCoords).rgb;
            col.r = col.r * (1.0-n_arg) + n_arg * (1.0-col.r);
            col.g = col.g * (1.0-n_arg) + n_arg * (1.0-col.g);
            col.b = col.b * (1.0-n_arg) + n_arg * (1.0-col.b);

            gl_FragColor = vec4(col, 1.0);
        }
        `)
        this.params = {...this.params, "argument" : 1};
    }

    public infoView(): string | null {
        return "for each channel performs the following operation: pixel_value * (255 - argument) + argument * (255 - pixel_value)"
    }
}
