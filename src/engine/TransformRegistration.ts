import {registry} from "./TransformDeclarations"
import ConvolutionTransform from "./transforms/ConvolutionTransform"
import GaussianTransform from "./transforms/convolution/GaussianTransform"
import {Conn4LaplaceTransform, Conn8LaplaceTransform} from "./transforms/convolution/LaplaceTransform"
import {SobelXTransform, SobelYTransform} from "./transforms/convolution/SobelTransform"
import BinaryAndTransform from "./transforms/logical/BinaryAndTransform"
import BinaryOrTransform from "./transforms/logical/BinaryOrTransform"
import BinarySubstractTransform from "./transforms/logical/BinarySubstractTransform"
import BinaryXorTransform from "./transforms/logical/BinaryXorTransform"
import DilatationTransform from "./transforms/morphologic/DilatationTransform"
import ErosionTransform from "./transforms/morphologic/ErosionTransform"
import SkeletonizationTransform from "./transforms/morphologic/SkeletonizationTransform"
import AdditionTransform from "./transforms/binary/AddTransform"
import MuxTransform from "./transforms/other/MuxTransform"
import PerlinNoiseTransform from "./transforms/other/PerlinNoiseTransform"
import RedSourceTransform from "./transforms/other/RedSourceTransform"
import WhiteNoiseTransform from "./transforms/other/WhiteNoiseTransform"
import {AndTransform} from "./transforms/point/AndTransform"
import {BrightnessTransform} from "./transforms/point/BrightnessTransform"
import ChannelCombinationTransform from "./transforms/point/ChannelCombinationTransform"
import {BChannelExtractionTransform, GChannelExtractionTransform, RChannelExtractionTransform} from "./transforms/point/ChannelExtractionTransform"
import {GrayscaleTransform} from "./transforms/point/GrayscaleTransform"
import {OrTransform} from "./transforms/point/OrTransform"
import {ThresholdTransform} from "./transforms/point/ThresholdTransform"
import {XorTransform} from "./transforms/point/XorTransform"
import {ToYCbCrTransform, FromYCbCrTransform} from "./transforms/point/YCbCrTransform"
import AvgPoolingTransform from "./transforms/pooling/AvgPoolingTransform"
import MaxPoolingTransform from "./transforms/pooling/MaxPoolingTransform"
import MinPoolingTransform from "./transforms/pooling/MinPoolingTransform"
import MultiplyTransform from "./transforms/binary/MultiplyTransform"
import SubtractionTransform from "./transforms/binary/SubTransform"

let init = false;

export default function declareOps() {
    if (init) {
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
        .declareLogical("binary and", BinaryAndTransform)
        .declareLogical("binary or", BinaryOrTransform)
        .declareLogical("binary xor", BinaryXorTransform)
        .declareBinary("addition", AdditionTransform)
        .declareBinary("multiply", MultiplyTransform)
        .declareBinary("subtraction", SubtractionTransform)
        .declarePoint("brightness", BrightnessTransform)
        .declarePoint("threshold", ThresholdTransform)
        .declarePoint("grayscale", GrayscaleTransform)
        .declarePoint("to YCbCr", ToYCbCrTransform)
        .declarePoint("from YCbCr", FromYCbCrTransform)
        .declarePoint("R channel", RChannelExtractionTransform)
        .declarePoint("G channel", GChannelExtractionTransform)
        .declarePoint("B channel", BChannelExtractionTransform)
        .declarePoint("Channel combination", ChannelCombinationTransform)
        .declareMorphologic("erosion", ErosionTransform)
        .declareMorphologic("dilatation", DilatationTransform)
        .declareMorphologic("skeletonization", SkeletonizationTransform)
        .declareOther("mux", MuxTransform)
        .declareSource("white noise", WhiteNoiseTransform)
        .declareSource("red", RedSourceTransform)
        .declareSource("perlin noise", PerlinNoiseTransform)
}

