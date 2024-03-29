import { registry } from "./TransformDeclarations"
import ConvolutionTransform from "./transforms/ConvolutionTransform"
import GaussianTransform from "./transforms/convolution/GaussianTransform"
import { Conn4LaplaceTransform, Conn8LaplaceTransform } from "./transforms/convolution/LaplaceTransform"
import { SobelXTransform, SobelYTransform } from "./transforms/convolution/SobelTransform"
import DilatationTransform from "./transforms/morphologic/DilatationTransform"
import ErosionTransform from "./transforms/morphologic/ErosionTransform"
import MuxTransform from "./transforms/other/MuxTransform"
import { AndTransform } from "./transforms/point/AndTransform"
import { BrightnessTransform } from "./transforms/point/BrightnessTransform"
import { GrayscaleTransform } from "./transforms/point/GrayscaleTransform"
import { OrTransform } from "./transforms/point/OrTransform"
import { ThresholdTransform } from "./transforms/point/ThresholdTransform"
import { XorTransform } from "./transforms/point/XorTransform"
import { ToYCbCrTransform, FromYCbCrTransform } from "./transforms/point/YCbCrTransform"
import AvgPoolingTransform from "./transforms/pooling/AvgPoolingTransform"
import MaxPoolingTransform from "./transforms/pooling/MaxPoolingTransform"
import MinPoolingTransform from "./transforms/pooling/MinPoolingTransform"

let init = false;

export default function declareOps(){
    if (init){
        return;
    }
    
    init = true;
    registry.declareLinear("4-connected laplace", Conn4LaplaceTransform)
    .declareLinear("8-connected laplace", Conn8LaplaceTransform)
    .declareLinear("gaussian", GaussianTransform)
    .declareLinear("sobel X", SobelXTransform)
    .declareLinear("sobel Y", SobelYTransform)
    .declareLinear("custom_kernel", ConvolutionTransform)
    .declarePooling("max_pooling", MaxPoolingTransform)
    .declarePooling("min_pooling", MinPoolingTransform)
    .declarePooling("avg_pooling", AvgPoolingTransform)
    .declareLogical("xor", XorTransform)
    .declareLogical("or", OrTransform)
    .declareLogical("and", AndTransform)
    .declarePoint("brightness", BrightnessTransform)
    .declarePoint("threshold", ThresholdTransform)
    .declarePoint("grayscale", GrayscaleTransform)
    .declarePoint("to YCbCr", ToYCbCrTransform)
    .declarePoint("from YCbCr", FromYCbCrTransform)
    .declareMorphologic("erosion", ErosionTransform)
    .declareMorphologic("dilatation", DilatationTransform)
    .declareOther("mux", MuxTransform)
}

 