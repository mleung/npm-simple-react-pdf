import React from 'react';
import ReactDOM from 'react-dom';
import PDF from 'pdfjs-dist/build/pdf.combined.js';

let {Component, PropTypes} = React;

export default class SimplePDF extends React.Component {

  constructor(props) {
    super(props);

    // bind
    this.loadPDF = this.loadPDF.bind(this);
  }

  loadPDF() {

    // get node for this react component
    let node = ReactDOM.findDOMNode(this).getElementsByClassName("S-PDF-ID")[0];

    // clean for update
    node.innerHTML = "";

    // set styles
    node.style.width = "100%";
    node.style.height = "100%";
    node.style.overflowX = "hidden";
    node.style.overflowY = "scroll";
    node.style.padding = '0px';

    const props = this.props;

    PDF.getDocument(this.props.file).then(function(pdf) {

      // no scrollbar if pdf has only one page
      if (pdf.numPages===1) {
        node.style.overflowY = "hidden";
      }

      let pagesRendered = 0;

      for (let id=1,i=1; i<=pdf.numPages; i++) {

        pdf.getPage(i).then(function(page) {

          // calculate scale according to the box size
          const boxWidth = node.clientWidth;
          const pdfWidth = page.getViewport(1).width;
          const scale = boxWidth / pdfWidth;
          const viewport = page.getViewport(scale);

          // set canvas for page
          let canvas = document.createElement('canvas');
          canvas.id  = "page-"+id; id++;
          canvas.width  = viewport.width;
          canvas.height = viewport.height;
          node.appendChild(canvas);

          // get context and render page
          const context = canvas.getContext('2d');
          const renderContext = {
            canvasContext : context,
            viewport      : viewport
          };
          page.render(renderContext).then(() => {
            if (pagesRendered === pdf.numPages - 1) {
              props.onRenderComplete();
            }
            props.onPageRenderComplete(page);
            pagesRendered++;
            }, (error) => {
              props.onPageRenderError(error);
            });
        });
      }
    });
  }

  render() {
    return (
      <div className="SimplePDF">
        <div className="S-PDF-ID"></div>
      </div>
    );
  }

  componentDidMount() {
    this.loadPDF();
  }

  componentDidUpdate() {
    this.loadPDF();
  }
}

SimplePDF.propTypes = {
  onPageRenderComplete: PropTypes.func,
  onRenderComplete: PropTypes.func,
  onPageRenderError: PropTypes.func,
  file: PropTypes.string
};

SimplePDF.defaultProps = {
  onPageRenderComplete: () => {},
  onRenderComplete: () => {},
  onPageRenderError: () => {},
  file: null
};
