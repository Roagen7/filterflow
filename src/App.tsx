import {useState} from 'react';
import { Button } from 'react-bootstrap';
import { faList } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import BrandNavBar from './components/brand_nav_bar/BrandNavBar'
import PreviewContainer from './components/preview_container/PreviewContainer';
import TransformPipeline from './components/transform_pipeline/TransformPipeline';
import SplitPane from "./components/SplitPane";

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function App() {
  const [expanded, setExpanded] = useState(true);

  const splitPane = (  
    <SplitPane expanded={expanded}>
      <SplitPane.Left>
        <div className='resizableStyle'>
          <TransformPipeline setExpanded={setExpanded}/>
        </div>
      </SplitPane.Left>
      <SplitPane.Right><div className='resizableStyle'><PreviewContainer/></div></SplitPane.Right>
    </SplitPane> 
  )

  const expandButton = (
    <Button className="border-0 floatingButton" style={{
      borderRadius: '50%',
      backgroundColor: 'rgba(0,0,0, 0.5)'
    }}>
      <FontAwesomeIcon icon={faList} onClick={() => {setExpanded(true)}}/>
    </Button>
  )

  return (
      <div className="App">
        <BrandNavBar />
        {expanded ? <></> : expandButton}
        {splitPane}
      </div>   
  );
}