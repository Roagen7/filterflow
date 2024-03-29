import { IEngine } from "../engine/iengine";
import { BaseFilterStore } from "./baseFilterStore";
import { CanvasPointer, CanvasPosition, GUID, IPreviewStore, IPreviewStores, PreviewSelections } from "./storeInterfaces";
import { Channel } from "./storeInterfaces";
import Transform from "../engine/Transform";
export abstract class PreviewStores extends BaseFilterStore implements IPreviewStores{
    
    previewStores: Map<string,IPreviewStore>

    constructor(fileName: string,engine: IEngine<Transform> ){
        super(fileName,engine);
        this.previewStores = new Map();
    }

    
    getPreviewStore(name: string): IPreviewStore | undefined {
        return this.previewStores.get(name);
    }
    addPreviewStore(name: string,inputs: GUID[],output: GUID): void {
        this.previewStores.set(name,new PreviewStore(inputs,output));
    }
    removePreviewStore(name: string): void {
        this.previewStores.delete(name);
    }

}

export class PreviewStore implements IPreviewStore{
    context: {
        inputs: GUID[]
        output: GUID
    }

    selection: {
        pointer: CanvasPointer
        preview: PreviewSelections
        channel: Channel
    }

    selectionListener: CallableFunction[]
    contextListener: CallableFunction[]

    constructor(inputs: GUID[],output:GUID){
        this.context = {inputs,output};
        this.selectionListener = [];
        this.contextListener = [];
        this.selection = {
            pointer: {destination: [0,0],source:[0,0]},
            preview: {destination: {center:[0,0],size:[0,0],start: [0,0]},source:{center:[0,0],size:[0,0],start: [0,0]}},
            channel: Channel.NONE
        }
    }

    getSelection(){
        return this.selection
    }

    subscribeSelection(listener: CallableFunction){
        this.selectionListener = [...this.selectionListener,listener]
        return () => {
            this.selectionListener = this.selectionListener.filter( v => v != listener)
        }
    }

    updateSelection(pointer: CanvasPointer, preview: PreviewSelections, channel: Channel){
        this.selection = {pointer,preview, channel};
        this.selectionListener.forEach(v => v())
    }
    
    updateContext(inputs: GUID[],output: GUID){
        this.context = {inputs,output};
        this.contextListener.forEach( v => v());
    }

    getContext(){
        return this.context
    }

    subscribeContext(listener: CallableFunction){
        this.contextListener = [...this.contextListener,listener]
        return () => {
            this.contextListener = this.contextListener.filter( v => v != listener)
        }
    }
}