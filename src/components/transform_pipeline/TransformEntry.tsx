import { useState, useContext, useSyncExternalStore, useMemo, useEffect } from 'react';
import {Button} from 'react-bootstrap';
import { 
    faEye, 
    faEyeSlash, 
    faTrash,
    faCommentDots,
    faComment} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Entry from './Entry';
import { Channel, FilterStoreContext } from '../../stores/simpleFilterStore';
import { GUID } from '../../engine/engine';
import { CircleSwitch } from '../CircleSwitch';

const SwitchModeSingle = true;

export default function TransformEntry({ guid }: { guid: GUID }){
    
    const filterStore = useContext(FilterStoreContext);

    const transformWatch = useSyncExternalStore(filterStore.subscribe(guid) as any, filterStore.getTransformWatch.bind(filterStore, guid))
    const transform = transformWatch.value;
    const preview = useSyncExternalStore(filterStore.subscribePreview.bind(filterStore) as any, filterStore.getPreview.bind(filterStore))
    const [enabled, setEnabled] = useState(transform.getEnabled());
    const in_focus = guid == preview.end && ( preview.distance == 1 || preview.distance == 0);
    const [name,setName] = useState(transform.getName());
    // TODO create map in store with hash to hash pare value
    let [visualiation,setVisualisation] = useState(<>0</>);
    
    let [selectedColors,setSelectedColors] = useState([true,true,true])
    const colorsChannels = [Channel.RED, Channel.GREEN, Channel.BLUE]; // TODO: get this info from meta

    useEffect(()=>{
        if (preview.distance === 1 && preview.end === guid) {
            setVisualisation(transform.visualizationView(guid))
        }else{
            setVisualisation(<></>)
        }
    },[preview])

    useEffect(()=>{
        setName(transform.getName());
    },[transformWatch])


    
    
    const handleEyeClick = () => {
        const newState = !enabled;
        setEnabled(newState);
        filterStore.setEnabled(guid, newState);
    }

    const handleTrashClick = () => {
        filterStore.removeFromSequence(guid)
        filterStore.applyTransforms()
    }

    const handleExpansion = (expanded: boolean) => {
        transform.setExpanded(expanded)
        filterStore.commitToPersistentStore()
    }

    const handleToggleFocus = () => {
        if (in_focus){
            filterStore.resetPreview();
        }else{
            filterStore.setPreview(guid,colorsChannels.filter((_,i) => selectedColors[i]));
        }
    }

    let handlePreviewColorChange = (i:number,item:Channel) => {
        return () =>{
            if ( SwitchModeSingle ){
                if (selectedColors[i] == true && !selectedColors.reduce((prev,value)=>prev && value,true)){
                        let newState = [...selectedColors.map(() => true)];
                        setSelectedColors(newState);
                        filterStore.setPreview(guid, colorsChannels.filter((_,i) => newState[i]));
                    }else{
                            let newState= [...selectedColors.map(() => false)];
                            newState[i]=true;
                            setSelectedColors(newState)
                            filterStore.setPreview(guid, colorsChannels.filter((_,i) => newState[i]));
                        }
            }else{
                let newState= [...selectedColors];
                newState[i] = !newState[i];
                setSelectedColors(newState)
                filterStore.setPreview(guid, colorsChannels.filter((_,i) => newState[i]));
            }

        }
    }

    return <div key={guid} id={guid} style={{opacity: enabled ? '100%' : '60%'}}>
               <Entry color={transform.getColor()} initialOpen={transform.getExpanded()} openHook={handleExpansion}>
               <Entry.Header>{name}</Entry.Header>
               <Entry.Body>
                    {transform.paramView(guid)}
                    {visualiation}
                </Entry.Body>
               <Entry.Icons>
                    <div key={crypto.randomUUID()}>
                        <Button className='border-0 bg-transparent'>
                            <FontAwesomeIcon onClick={handleEyeClick} className="iconInCard" icon={enabled ? faEye : faEyeSlash} />
                        </Button>
                        <Button className='border-0 bg-transparent'>
                            <FontAwesomeIcon onClick={handleTrashClick} className="iconInCard" icon={faTrash} />
                        </Button>
                        <Button className='border-0 bg-transparent'>
                            <FontAwesomeIcon onClick={handleToggleFocus} className="iconInCard" icon={in_focus ? faCommentDots : faComment} />
                        </Button>
                        <div className='border-0 bg-transparent'>
                        {
                            colorsChannels.map((item, i) => 
                                <CircleSwitch key={i} color={colorsChannels[i]} state={selectedColors[i]} toggleState={handlePreviewColorChange(i,item)}/>
                                )
                        }
                        </div>
                    </div>
                </Entry.Icons>
            </Entry>
        </div>
}
