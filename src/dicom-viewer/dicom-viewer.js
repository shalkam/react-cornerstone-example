import React from "react";
import Hammer from "hammerjs";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";
import dicomLoader from "./dicom-loader";
// import exampleImageIdLoader from "./exampleImageIdLoader";

class DicomViewer extends React.Component {
  componentWillMount() {
    cornerstoneTools.external.cornerstone = cornerstone;
    cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
    cornerstoneTools.external.Hammer = Hammer;
    dicomLoader(cornerstone);
  }
  componentDidMount() {
    this.loadImage();
  }
  dicomImage = null;
  loadImage = () => {
    const element = this.dicomImage;
    // Listen for changes to the viewport so we can update the text overlays in the corner
    function onImageRendered(e) {
      const viewport = cornerstone.getViewport(e.target);
      document.getElementById(
        "mrbottomleft"
      ).textContent = `WW/WC: ${Math.round(
        viewport.voi.windowWidth
      )}/${Math.round(viewport.voi.windowCenter)}`;
      document.getElementById(
        "mrbottomright"
      ).textContent = `Zoom: ${viewport.scale.toFixed(2)}`;
    }
    element.addEventListener("cornerstoneimagerendered", onImageRendered);
    const config = {
      // invert: true,
      minScale: 0.25,
      maxScale: 20.0,
      preventZoomOutsideImage: true
    };
    cornerstoneTools.zoom.setConfiguration(config);
    document.getElementById("chkshadow").addEventListener("change", () => {
      cornerstoneTools.length.setConfiguration({ shadow: this.checked });
      cornerstoneTools.angle.setConfiguration({ shadow: this.checked });
      cornerstone.updateImage(element);
    });
    const imageId = "example://1";
    cornerstone.enable(element);
    cornerstone.loadImage(imageId).then(image => {
      cornerstone.displayImage(element, image);
      cornerstoneTools.mouseInput.enable(element);
      cornerstoneTools.mouseWheelInput.enable(element);
      // // Enable all tools we want to use with this element
      cornerstoneTools.wwwc.activate(element, 1); // ww/wc is the default tool for left mouse button
      cornerstoneTools.pan.activate(element, 2); // pan is the default tool for middle mouse button
      cornerstoneTools.zoom.activate(element, 4); // zoom is the default tool for right mouse button
      cornerstoneTools.zoomWheel.activate(element); // zoom is the default tool for middle mouse wheel
      cornerstoneTools.probe.enable(element);
      cornerstoneTools.length.enable(element);
      cornerstoneTools.ellipticalRoi.enable(element);
      cornerstoneTools.rectangleRoi.enable(element);
      cornerstoneTools.angle.enable(element);
      cornerstoneTools.highlight.enable(element);
    });
  };
  enableTool = (toolName, mouseButtonNumber) => {
    this.disableAllTools();
    cornerstoneTools[toolName].activate(this.dicomImage, mouseButtonNumber);
  };
  // helper function used by the tool button handlers to disable the active tool
  // before making a new tool active
  disableAllTools = () => {
    cornerstoneTools.wwwc.disable(this.dicomImage);
    cornerstoneTools.pan.activate(this.dicomImage, 2); // 2 is middle mouse button
    cornerstoneTools.zoom.activate(this.dicomImage, 4); // 4 is right mouse button
    cornerstoneTools.probe.deactivate(this.dicomImage, 1);
    cornerstoneTools.length.deactivate(this.dicomImage, 1);
    cornerstoneTools.ellipticalRoi.deactivate(this.dicomImage, 1);
    cornerstoneTools.rectangleRoi.deactivate(this.dicomImage, 1);
    cornerstoneTools.angle.deactivate(this.dicomImage, 1);
    cornerstoneTools.highlight.deactivate(this.dicomImage, 1);
    cornerstoneTools.freehand.deactivate(this.dicomImage, 1);
  };
  dicomImageRef = el => {
    this.dicomImage = el;
  };
  render() {
    return (
      <div className="container">
        <div className="page-header">
          <h1>React Cornerstone DICOM Viewer</h1>
        </div>
        <br />
        <div className="row">
          <div className="col-3">
            <ul className="list-group">
              <button
                onClick={() => {
                  this.enableTool("wwwc", 1);
                }}
                className="list-group-item"
              >
                WW/WC
              </button>
              <button
                onClick={() => {
                  this.enableTool("pan", 3);
                }}
                className="list-group-item"
              >
                Pan
              </button>
              <button
                onClick={() => {
                  this.enableTool("zoom", 5);
                }}
                className="list-group-item"
              >
                Zoom
              </button>
              <button
                onClick={() => {
                  this.enableTool("length", 1);
                }}
                className="list-group-item"
              >
                Length
              </button>
              <button
                onClick={() => {
                  this.enableTool("probe", 1);
                }}
                className="list-group-item"
              >
                Probe
              </button>
              <button
                onClick={() => {
                  this.enableTool("ellipticalRoi", 1);
                }}
                className="list-group-item"
              >
                Elliptical ROI
              </button>
              <button
                onClick={() => {
                  this.enableTool("rectangleRoi", 1);
                }}
                className="list-group-item"
              >
                Rectangle ROI
              </button>
              <button
                onClick={() => {
                  this.enableTool("angle", 1);
                }}
                className="list-group-item"
              >
                Angle
              </button>
              <button
                onClick={() => {
                  this.enableTool("highlight", 1);
                }}
                className="list-group-item"
              >
                Highlight
              </button>
              <button
                onClick={() => {
                  this.enableTool("freehand", 1);
                }}
                className="list-group-item"
              >
                Freeform ROI
              </button>
            </ul>
            <div className="checkbox">
              <label htmlFor="chkshadow">
                <input type="checkbox" id="chkshadow" />Apply shadow
              </label>
            </div>
            <br />
          </div>
          <div className="col-9">
            <div
              style={{
                width: 512,
                height: 512,
                position: "relative",
                display: "inline-block",
                color: "white"
              }}
              onContextMenu={() => false}
              className="cornerstone-enabled-image"
              unselectable="on"
              onSelectStart={() => false}
              onMouseDown={() => false}
            >
              <div
                ref={this.dicomImageRef}
                style={{
                  width: 512,
                  height: 512,
                  top: 0,
                  left: 0,
                  position: "absolute"
                }}
              />
              <div
                id="mrtopleft"
                style={{ position: "absolute", top: 3, left: 3 }}
              >
                Patient Name
              </div>
              <div
                id="mrtopright"
                style={{ position: "absolute", top: 3, right: 3 }}
              >
                Hospital
              </div>
              <div
                id="mrbottomright"
                style={{ position: "absolute", bottom: 3, right: 3 }}
              >
                Zoom:
              </div>
              <div
                id="mrbottomleft"
                style={{ position: "absolute", bottom: 3, left: 3 }}
              >
                WW/WC:
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12">
            <h3>Functionality</h3>
            <ul>
              <li>
                Activation of a tool for the left mouse button
                <ul>
                  <li>
                    WW/WC - Adjust the window width and window center of the
                    image (activated by default)
                  </li>
                  <li>Pan - Pan the image</li>
                  <li>Zoom - Zoom the image</li>
                  <li>Length - Length measurement tool</li>
                  <li>
                    Probe - Display the image x,y coordinate under cursor as
                    well as the pixel value (stored pixel and modality)
                  </li>
                  <li>
                    Elliptical ROI - An elliptical ROI that shows mean, stddev
                    and area
                  </li>
                  <li>
                    Rectangle ROI - A rectangular ROI that shows mean, stddev
                    and area
                  </li>
                  <li>
                    Highlight - Darkens the image around a rectangular ROI
                  </li>
                  <li>Angle - Cobb angle tool</li>
                </ul>
              </li>
              <li>Use the activated tool by dragging the left mouse button</li>
              <li>Pan by dragging the middle mouse button</li>
              <li>Zoom by dragging the right mouse button</li>
              <li>Zoom by rolling the mouse wheel</li>
              <li>
                Tool dragging - left click drag on any measurement tool line to
                move it
              </li>
              <li>
                Tool deletion - left click drag on any measurement tool line and
                drop it off the image to delete it
              </li>
              <li>
                Tool handles - left click drag on any measurement tool handle
                (the circle) to change the handles position
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default DicomViewer;
