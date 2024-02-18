import { useContext, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import './GraphSpace.css'
import { FilterStoreContext } from '../../stores/simpleFilterStore';
import GraphNode from './GraphNode';
import Grid from './Grid';
import { Button, ButtonGroup, ButtonToolbar } from 'react-bootstrap';
import { faCircleQuestion, faExpand, faMinus, faPlus, faQuestion, faQuestionCircle, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SearchPopup from './SearchPopup';

export default function GraphSpace(){
    // get nodes
    // render them
    // store UI position of nodes
    // render arrows (use single SVG element overlay with multiple path (use <g> elements to wrap them))
    const filterStore = useContext(FilterStoreContext);
    const viewRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLCanvasElement>(null);
    // TODO: add nodes, and edges to store
    //* NOTE, this is more like a preview of UI
    const nodes = useSyncExternalStore(filterStore.subscribeSequence.bind(filterStore), filterStore.getSequence.bind(filterStore));

    // offset is in real coordinates
    const [offset, setOffset] = useState({x:0, y:0});
    const [scale, setScale] = useState(1);
    const [debSpaceSize, setDebSpaceSize] = useState({x:0, y:0})

    // TODO: handle move (pan), and zoom (pinch)
    const elements = nodes.map((guid, index) => (
        <GraphNode guid={guid} key={index}/>
    ))

    let dragTarget: HTMLElement | undefined
    let dragMouseStartX = 0;
    let dragMouseStartY = 0;
    let dragTargetStartX = 0 , dragTargetStartY = 0;
    let dragDistance = 0;

    // adding moving elements in space instead element wise, allows to controll z-index
    function dragStart(e: React.SyntheticEvent){
        // typescript type checking
        if(!(e.nativeEvent.target instanceof HTMLElement)) return;
        // TODO: check if this really do anything
        let closest = e.nativeEvent.target.closest('.draggable');
        if (!(closest instanceof HTMLElement)) return;
        

        e.preventDefault();
        e.stopPropagation();

        // https://github.com/grafana/grafana/pull/79508/files#diff-0713145d1754d5f4b090224a1d1cdf818fe5cbdcc23c8d3aabff8fb82bf2f6baR186-R190
        const isTouch = (e.nativeEvent as TouchEvent).changedTouches && e.nativeEvent instanceof TouchEvent;
        if((e.nativeEvent as TouchEvent).changedTouches && e.nativeEvent instanceof TouchEvent){
            dragMouseStartX = e.nativeEvent.touches[0].pageX
            dragMouseStartY = e.nativeEvent.touches[0].pageY
        } else{
            dragMouseStartX = (e.nativeEvent as MouseEvent).pageX
            dragMouseStartY = (e.nativeEvent as MouseEvent).pageY
        }
        
        // get real position
        dragMouseStartX = dragMouseStartX / scale - offset.x
        dragMouseStartY = dragMouseStartY / scale - offset.y

        dragDistance = 0;
        dragTarget = closest;

        const rect = dragTarget?.getBoundingClientRect();
        const viewRect = viewRef.current?.getBoundingClientRect();

        // this results in real position
        dragTargetStartX = rect ? (window.scrollX + (rect.left - viewRect!.x)/scale) : 0;
        dragTargetStartY = rect ? (window.scrollY + (rect.top - viewRect!.y)/scale) : 0;
        // move to front

        window.addEventListener(isTouch ? 'touchmove' : 'mousemove', dragMove, {passive: false});
        window.addEventListener(isTouch ? 'touchend' : 'mouseup', dragStop, {passive: false});
    }
    
    function dragStop(e: MouseEvent | TouchEvent){
        if(dragTarget){
            e.preventDefault();
            e.stopPropagation();

            const isTouch = (e as TouchEvent).changedTouches && e instanceof TouchEvent;
            dragTarget.classList.remove('dragging');
            dragTarget = undefined;

            // dragging is a rare event, so it won't be too much overhead
            window.removeEventListener(isTouch ? 'touchmove' : 'mousemove', dragMove)
            window.removeEventListener(isTouch ? 'touchend' : 'mouseup', dragStop)

            // we are forcing to drag by default, handle tap
            if(isTouch && dragDistance === 0){
                const clickElem = document.elementFromPoint(dragMouseStartX, dragMouseStartY);
                clickElem?.dispatchEvent(new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    clientX: dragMouseStartX,
                    clientY: dragMouseStartY
                }))
            }
        }
    }

    function dragMove(e: MouseEvent | TouchEvent){
        if(dragTarget){
            e.preventDefault();
            e.stopPropagation();
            // dragTarget.classList.add('dragging');
            // const isTouch = e.type === 'touchmove';
            
            
            const isTouch = (e as TouchEvent).changedTouches && e instanceof TouchEvent;
            const vx = (isTouch ? e.touches[0].pageX : (e as MouseEvent).pageX);
            const vy = (isTouch ? e.touches[0].pageY : (e as MouseEvent).pageY)
            const dx = (vx/scale - offset.x - dragMouseStartX)
            const dy = (vy/scale - offset.y - dragMouseStartY)
            dragDistance += dx + dy;
            const x = dragTargetStartX + dx;
            const y = dragTargetStartY + dy;

            dragTarget.style.left = `${x}px`;
            dragTarget.style.top = `${y}px`;
        }
    }

    function handleWheel(e: React.WheelEvent){
        if(e.ctrlKey){
            e.preventDefault()
            e.stopPropagation()
            
            
            const viewRect = viewRef.current?.getBoundingClientRect();

            let posX = e.pageX - viewRect!.x;
            let posY = e.pageY - viewRect!.y;
            
            let newScale = Math.pow(2,Math.log2(scale) + e.deltaY/1000)
            

            handleZoom(newScale/scale, [posX, posY])

        } else {
            e.preventDefault()
            e.stopPropagation()
            
            // TODO: 
            handlePan(e.deltaX, e.deltaY)
        }
    }

    /**
     * 
     * @param value value to multiply current zoom
     * @param pivot 
     */
    function handleZoom(value: number, pivot: [number, number]){

            let newScale = scale * value;
            newScale = Math.min(Math.max(newScale,0.2),5);

            setScale(newScale)

            let displacementX = pivot[0] - pivot[0]*(newScale/scale)
            let displacementY = pivot[1] - pivot[1]*(newScale/scale)
            handlePan(displacementX, displacementY)
    }

    function handlePan(x:number, y:number){
        setOffset({x: offset.x + x, y: offset.y + y})
    }

    function handleButtomZoom(value: number){
        const viewRect = viewRef.current?.getBoundingClientRect();
        handleZoom(value, [viewRect!.width/2, viewRect!.height/2])
    }

    // the trick to prevent CTRL+Wheel Zoom is to prevent it from root element
    // TODO: convert this to more React-ish solution
    useEffect(()=>{
        document.getElementById('root')?.addEventListener('wheel', (e: WheelEvent)=>{
            if(e.ctrlKey){
                e.preventDefault();
            }
        })
    })

    useEffect(() => {
        if(viewRef.current){
            const rect = viewRef.current.getBoundingClientRect()
            setDebSpaceSize({x: Math.round(rect.width / scale), y: Math.round(rect.height / scale)})
        }
    }, [scale])

    // TODO: make it generic, and reccurent (and clean)

    //? TODO: figure out if that's a good soultion, and if using canvas won't be better
    // TODO: handle move, by dragging element
    // TODO: make dummy graph nodes
    // TODO: add overlay (centering, and zoom controlls)
    return <div className='graphView' onWheel={handleWheel}>
        {/* TODO: set dynamic size?? */}
        <Grid displacement={[offset.x, offset.y]} scale={scale} size={[1920, 895]}/>
        {/* DEBUG: transformation info */}
        <div style={{position: 'absolute', top: "2em", left: "0.2vw"}} className='debugOverlay'>{`offset: ${offset.x}, ${offset.y}`}</div>
        <div style={{position: 'absolute', top: "4.6em", left: "0.2vw"}} className='debugOverlay'>{`scale: ${scale}`}</div>
        {/* END DEBUG */}
        <div className="graphSpace" ref={viewRef} style={{transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`, outline: "1px solid green"}}>
            {/* a gnome here represent a plank size */}
            <div onMouseDown={dragStart} className='draggable' style={{backgroundImage: 'url(filterflow/gnome.webp)', backgroundSize:"0.0085px 0.0085px", width: "0.0085px", height: "0.0085px", top:"-0.0085px"}}/>
            {elements}
            {/* DEBUG: coordinates markers */}
            <div style={{position: 'absolute', top: "-2.5rem", left: "-1.5rem"}} className='debugSpaceOverlay'>0, 0</div>
            <div style={{position: 'absolute', top: "100%", left: "100%"}} className='debugSpaceOverlay'>{viewRef.current ? `${debSpaceSize.x}, ${debSpaceSize.y}` : ''}</div>
            <div style={{position: 'absolute', top: "-2.5rem", left: "100%"}} className='debugSpaceOverlay'>{viewRef.current ? `${debSpaceSize.x}, 0` : ''}</div>
            <div style={{position: 'absolute', top: "100%", left: "-1.5rem"}} className='debugSpaceOverlay'>{viewRef.current ? `0, ${debSpaceSize.y}` : ''}</div>
            {/* END DEBUG */}
            <div onMouseDown={dragStart} className='draggable'>
                <GraphNode guid='0'></GraphNode>
            </div>
        </div>

        <SearchPopup></SearchPopup>
        {/* TODO: change collor of this */}
        <div className='graphViewTooltip'>

        <Button title='view help'><FontAwesomeIcon icon={faQuestion}/></Button>
        <ButtonGroup vertical={true} >
            <Button title='auto zoom to content'><FontAwesomeIcon icon={faExpand}/></Button>
            <Button onClick={()=>{setScale(1); setOffset({x:0,y:0})}} title='reset to origin'><FontAwesomeIcon icon={faRotateLeft}/></Button>
        </ ButtonGroup>
        <ButtonGroup vertical={true} >
            <Button onClick={()=>{handleButtomZoom(3/2)}} title='zoom in'><FontAwesomeIcon icon={faPlus}/></Button>
            <Button onClick={()=>{handleButtomZoom(2/3)}} title='zoom out'><FontAwesomeIcon icon={faMinus}/></Button>
        </ButtonGroup>
        </div>
    </div>
}