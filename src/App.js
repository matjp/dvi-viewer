import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import { useEffect, useRef, useState } from 'react';
import { dviDecode } from '@matjp/dvi-decode';
import opentype from 'opentype.js';

const luaFontPath = '/dvi-viewer/lua-font-files';

function SelectFileButton(props) {
  const handleChange = (e) => {
    props.fileEvent(e.target.files[0]);
  };

  return (
    <div className='mt-5' >
      <Form.Label>Select a DVI File...</Form.Label>
      <Form.Control type="file" accept=".dvi" onChange={handleChange}></Form.Control>
    </div>
  );
}

function DocumentCanvas(props) {
  const cnv = useRef();
  enableHighDPICanvas(cnv.current);
  const ctx = cnv.current ? cnv.current.getContext('2d', { alpha: false }) : undefined;

  useEffect( () => {
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, props.widthPixels, props.heightPixels);
      ctx.fillStyle = 'black';
      if (props.doc) {
        const pageIndex = props.pageNo-1;
        props.doc.pages[pageIndex].rules.forEach(
          rule => ctx.fillRect(props.marginPixels + rule.x, rule.y, rule.w, rule.h)
        );
        props.doc.pages[pageIndex].pageFonts.forEach(
          async pageFont => {
            const docFont = props.doc.fonts.find(f => f.fontNum === pageFont.fontNum);
            if (docFont) {
              const otfFont = await opentype.load(docFont.fontPath + docFont.fontName);
              if (otfFont) {
                pageFont.glyphs.forEach(glyph => {
                  let otfGlyph = otfFont.glyphs.get(glyph.glyphIndex);
                  if (otfGlyph)
                    glyph.glyphSizes.forEach(glyphSize =>
                      glyphSize.glyphPlacements.forEach(glyphPlacement => 
                        otfGlyph.draw(ctx, props.marginPixels + glyphPlacement.x, glyphPlacement.y, glyphSize.sz, { features: {hinting: true} })
                      )
                    );
                });
              }
            }
        });
      }
    }
  }, [ctx, props.doc, props.pageNo, props.widthPixels, props.heightPixels, props.marginPixels]);

  return (
    <div
      style={{
        height: props.height ? props.height + "px" : "auto",
        width: props.widthPixels ? props.widthPixels + 10 + "px" : "auto",
        overflowY: 'auto'
      }}
    >
    <canvas ref={cnv} width={props.widthPixels} height={props.heightPixels}></canvas>
    </div>  
  )
}

function enableHighDPICanvas(canvas) {
  if (canvas) {
    var pixelRatio = window.devicePixelRatio || 1;
    if (pixelRatio === 1) return;
    var oldWidth = canvas.width;
    var oldHeight = canvas.height;
    canvas.width = oldWidth * pixelRatio;
    canvas.height = oldHeight * pixelRatio;
    canvas.style.width = oldWidth + 'px';
    canvas.style.height = oldHeight + 'px';
    canvas.getContext('2d', { alpha: false }).scale(pixelRatio, pixelRatio);
  }
}

function App() { 
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


  const onFile = (f) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
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
    if (dviData)
      fetch('font.map').then(res => res.text())
        .then(text => {
          const fontMap = new Map();        
          const mapLines = text.split('\n');
          mapLines.forEach(line => {
              const words = line.split(':');
              fontMap.set(words[0],words[1]);
          });        
          dviDecode(dviData, dpi, mag * 10, fontMap, luaFontPath, true)
          .then(json => {
            const doc = JSON.parse(json);
            setDoc(doc);
            setPageCount(doc.pages.length);
            setPageNo(1);
          })
        })
  }, [dviData, dpi, mag] );

  return (
    <Container className=".main_container" fluid>
      <Row className="main-row">
        <Col className="side-bar" xxl={2}>
          <ButtonGroup className="bg-side" vertical>
            <InputGroup className="bg-nav">
              <SelectFileButton fileEvent={onFile}></SelectFileButton>{' '}
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
