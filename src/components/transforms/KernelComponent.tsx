import { useState, useContext, useSyncExternalStore, useEffect } from 'react'
import {FormSelect} from 'react-bootstrap';
import {GUID} from "../../engine/iengine";
import { nodeStoreContext } from '../../stores/context';


export default function KernelComponent({guid}: {guid: GUID}){
    const nodeContext = useContext(nodeStoreContext);
    const node = useSyncExternalStore(nodeContext.subscribeNode(guid), nodeContext.getNode(guid));

    // TODO: check if refresh component of selection change is needed
   
    const [gridValues, setGridValues] = useState<number[][]>(node.value.getParams()["kernel"]);
    const [kernelN, setKernelN] = useState(gridValues.length);
    const [kernelWeight, setKernelWeight] = useState(node.value.getParams()["weight"] ?? 1);

    const handleKernelChange = (newKernelN: number) => {
        setKernelN(newKernelN);
        const newGridValues = Array(newKernelN).fill(0).map(() => new Array(newKernelN).fill(0))
        setGridValues(newGridValues)
        nodeContext.updateParam(guid,{
            "kernel" : newGridValues
        })
    };

    const handleInputChange = (row: number, col: number, value: string) => {
        const newGridValues = [...gridValues];
        newGridValues[row][col] = parseInt(value);
        setGridValues(newGridValues);
        nodeContext.updateParam(guid, {
            "kernel": newGridValues
        })
    };

    const handleWeightChange = (newWeight: string) => {
        const newWeightI = parseInt(newWeight)
        setKernelWeight(newWeightI)
        nodeContext.updateParam(guid,{
            "weight": newWeightI
        })
    }

    return <div className="grid">
        <label>
            Select Kernel Size:
            <FormSelect value={kernelN} onChange={(e) => handleKernelChange(parseInt(e.target.value, 10))} onPointerDown={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
            </FormSelect>
            Select Kernel Weight:
            <input
                    type="number"
                    className="form-control"
                    value={kernelWeight}
                    onChange={(e) => handleWeightChange(e.target.value)}
                    onPointerDown={e=>e.stopPropagation()}
                    onKeyDown={e=>e.stopPropagation()}
            />
        </label>
        <div className="container mt-3">
            <label className="form-label">Enter NxN Grid Values:</label>
            <div className="row">
                {gridValues.map((row, rowIndex) => (
                    <div key={rowIndex} className="row mb-2">
                        {row.map((_, colIndex) => (
                            <div key={colIndex} className="col">
                                <input
                                    type="number"
                                    className="form-control"
                                    value={gridValues[rowIndex][colIndex]}
                                    onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
                                    style={colIndex == Math.ceil(kernelN/2) - 1 && rowIndex == Math.ceil(kernelN/2) - 1 ? {borderColor: "yellow", borderWidth: 5} : {}}
                                    onPointerDown={e => e.stopPropagation()}
                                    onKeyDown={e => e.stopPropagation()}
                                />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    </div>
}