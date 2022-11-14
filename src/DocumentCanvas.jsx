import { useRef, useEffect } from 'react';
import opentype from 'opentype.js';

export default function DocumentCanvas(props) {
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
            rule => ctx.fillRect(props.marginPixels + rule.x, props.marginPixels + rule.y, rule.w, rule.h)
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
                          otfGlyph.draw(ctx, props.marginPixels + glyphPlacement.x, props.marginPixels + glyphPlacement.y, glyphSize.sz, { features: {hinting: true} })
                        )
                      );
                  });
                }
              }
          });
          props.doc.pages[pageIndex].images.forEach(
            async image => {
              let img = new Image();
              img.src = image.fileName.replace('.eps','.svg');
              try {
                await img.decode();
                ctx.drawImage(img, props.marginPixels + image.x, props.marginPixels + image.y, image.w, image.h);
              } catch(err) {
                console.log(err);
              }
            }
          );
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
