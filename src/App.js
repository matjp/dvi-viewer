import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import { useEffect, useState } from 'react';
import WelcomeAlert from './WelcomeAlert';
import InstructionMessage from './InstructionMessage';
import SelectFileButton from './SelectFileButton';
import DocumentCanvas from './DocumentCanvas';
import ModalLog from './ModalLog';
import { dviDecode } from '@matjp/dvi-decode';

const luaFontPath = '/dvi-viewer/lua-font-files';
let firstLoad = true;
let logs = [];

function debugLog(msg){
  logs.push(msg);
}

function App() { 
  const [debugMode, setDebugMode] = useState(false);
  const [pageWidth, setPageWidth] = useState(8.27); /* in inches (A4 default) */
  const [pageHeight, setPageHeight] = useState(11.69); /* in inches (A4 default) */
  const [dpi, setDpi] = useState(96);
  const [dviData, setDviData] = useState();
  const [mag, setMag] = useState(100);
  const [doc, setDoc] = useState();
  const [pageNo, setPageNo] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [widthPixels, setWidthPixels] = useState(() => { return Math.floor(pageWidth * dpi) });
  const [heightPixels, setHeightPixels] = useState(() => { return Math.floor(pageHeight * dpi) });
  const [marginPixels, setMarginPixels] = useState(() => { return Math.floor(dpi) }); /* 1 inch margin @ default 100% mag */
  const [selectMsg, setSelectMsg] = useState('Select a DVI File...');

  const onDebugMode = () => setDebugMode(!debugMode);

  const onFile = (f) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      setSelectMsg('Select a DVI File...Loading...');
      setDviData(new Uint8Array(evt.target.result));
    }
    reader.readAsArrayBuffer(f);
  }

  const onPageSize = (e) => { 
    const arr = e.target.value.split(':');
    setPageWidth(Number(arr[0]));
    setPageHeight(Number(arr[1]));
    setPageMetrics(mag / 100);
  }

  const onDpi = (e) => { 
    if (e.target.value >= 60 && e.target.value <= 300) {
      setDpi(e.target.value);
      setPageMetrics(mag / 100);
    }
  }

  const onMag = (e) => { 
    if (e.target.value >= 100 && e.target.value <= 200) {
      setMag(e.target.value);
      setPageMetrics(e.target.value / 100);
    }
  }

  function setPageMetrics(scaleFactor) {
    setWidthPixels(Math.floor(pageWidth * dpi * scaleFactor));
    setHeightPixels(Math.floor(pageHeight * dpi * scaleFactor));
    setMarginPixels(Math.floor(dpi * scaleFactor));
  }
  
  useEffect( () => {
    if (firstLoad) {
      firstLoad = false;
      fetch('align.dvi').then(res => res.arrayBuffer())
        .then(ab => setDviData(new Uint8Array(ab)));
    }

    if (dviData)
      fetch('font.map').then(res => res.text())
        .then(text => {
          const fontMap = new Map();        
          const mapLines = text.split('\n');
          mapLines.forEach(line => {
              const words = line.split(':');
              fontMap.set(words[0],words[1]);
          });       
          logs = [];
          dviDecode(dviData, dpi, mag * 10, fontMap, luaFontPath, debugMode, debugLog)
          .then(json => {
            const doc = JSON.parse(json);
            setDoc(doc);
            setPageCount(doc.pages.length);
            setPageNo(1);
            setSelectMsg('Select a DVI File...Loaded.');
          })
          .catch((err) => {
            debugLog(err);
            setSelectMsg('Select a DVI File...Load error. See log for details.');
          });
        })
  }, [dviData, dpi, mag, debugMode] );

  return (
    <Container className=".main_container" fluid>    
      <Row className="top-row">
        <InstructionMessage/>
        <WelcomeAlert/>                    
      </Row>
      <Row className="main-row">
        <Col className="side-bar" xxl={2}>
          <ButtonGroup className="bg-side" vertical>
            <InputGroup className="bg-nav">
              <SelectFileButton fileEvent={onFile} selectMsg={selectMsg}></SelectFileButton>{' '}
            </InputGroup>
            <InputGroup>
              <InputGroup.Text id="it-pgsz">Page Size</InputGroup.Text>
              <Form.Select onChange={onPageSize}>
                <option value="8.27:11.69">A4</option>                
                <option value="8.5:11">US Letter</option>                
              </Form.Select>
            </InputGroup>    
            <InputGroup>
              <InputGroup.Text id="it-dpi">Display DPI</InputGroup.Text>
              <Form.Control
                type="number"
                value={dpi}
                min="60"
                max="300"
                step="1"
                onChange={onDpi}
              />
            </InputGroup>
            <InputGroup>
              <InputGroup.Text id="it-mag">Magnification(%)</InputGroup.Text>
              <Form.Control
                type="number"
                value={mag}
                min="100"
                max="200"
                step="10"
                onChange={onMag}
              />
            </InputGroup>               
            <Button>Page {pageNo} of {pageCount}</Button>                     
            <ButtonGroup>
              <Button onClick={() => { if (pageNo > 1) setPageNo(pageNo-1) }}>Prev Page</Button>
              <Button onClick={() => { if (pageNo < pageCount) setPageNo(pageNo+1) }}>Next Page</Button>
            </ButtonGroup> 
          </ButtonGroup>
          <p>&nbsp;</p>
            <ButtonGroup className="me-2">
              <ModalLog logs={logs}></ModalLog>
            </ButtonGroup>            
            <Form.Group className="me-2">
              <Form.Check type="checkbox" label="Debug mode" checked={debugMode} onChange={onDebugMode}/>
            </Form.Group>
        </Col>
        <Col className="doc">
          <DocumentCanvas
            height={window.innerHeight} doc={doc} pageNo={pageNo} widthPixels={widthPixels} heightPixels={heightPixels} marginPixels={marginPixels}>
          </DocumentCanvas>
        </Col>
      </Row>
    </Container>    
  );
}

export default App;
