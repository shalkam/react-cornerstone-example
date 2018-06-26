import daikon from "daikon";

const httpGetAsync = (theUrl, callback) => {
  const xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = () => {
    if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
      callback(xmlHttp.response);
    }
  };
  xmlHttp.open("GET", theUrl, true); // true for asynchronous
  xmlHttp.responseType = "arraybuffer";
  xmlHttp.send(null);
};
const dicomLoader = cs => {
  const image1PixelData = new Promise(resolve => {
    httpGetAsync("assets/dicom-image", response => {
      const data = new DataView(response);
      const image = daikon.Series.parseImage(data);
      const spacing = image.getPixelSpacing();
      resolve({
        minPixelValue: image.getImageMin(),
        maxPixelValue: image.getImageMax(),
        // slope: image.getDataScaleSlope(),
        // intercept: image.getDataScaleIntercept(),
        windowCenter: image.getWindowCenter(),
        windowWidth: image.getWindowWidth(),
        getPixelData: () => image.getInterpretedData(),
        rows: image.getRows(),
        columns: image.getCols(),
        height: image.getCols(),
        width: image.getRows(),
        color: false,
        columnPixelSpacing: spacing[1],
        rowPixelSpacing: spacing[0],
        sizeInBytes: image.getRows() * image.getCols() * 2
      });
    });
  });
  function getExampleImage(imageId) {
    const width = 256;
    const height = 256;

    function getPixelData() {
      if (imageId === "example://1") {
        return image1PixelData;
      }

      throw new Error("unknown imageId");
    }

    return {
      promise: new Promise(resolve =>
        getPixelData().then(pixelData =>
          resolve({
            imageId,
            minPixelValue: 0,
            maxPixelValue: 257,
            slope: 1.0,
            intercept: 0,
            windowCenter: 127,
            windowWidth: 256,
            rows: height,
            columns: width,
            height,
            width,
            color: false,
            columnPixelSpacing: 0.8984375,
            rowPixelSpacing: 0.8984375,
            sizeInBytes: width * height * 2,
            ...pixelData
          })
        )
      ),
      cancelFn: undefined
    };
  }

  // register our imageLoader plugin with cornerstone
  cs.registerImageLoader("example", getExampleImage);
};

export default dicomLoader;
