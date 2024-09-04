import React, { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import "./index.css";
import { Camera, CameraType } from "react-camera-pro";

const App: React.FC = () => {
  const [isCaptureEnable, setCaptureEnable] = useState<boolean>(false);
  const [camera, setCamera] = useState<CameraType | null>(null); // Camera reference type
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // State to manage loading
  const [recognizedText, setRecognizedText] = useState<string>("");

  const capture = () => {
    if (camera) {
      const imageSrc = camera.takePhoto(); // Capture the image
      if (typeof imageSrc === "string") {
        // If the returned value is a base64 string
        setUrl(imageSrc);
      } else if (imageSrc instanceof ImageData) {
        // If it's an ImageData object, convert to base64 string using a canvas
        const canvas = document.createElement("canvas");
        canvas.width = imageSrc.width;
        canvas.height = imageSrc.height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.putImageData(imageSrc, 0, 0);
          const base64String = canvas.toDataURL("image/jpeg"); // Convert to base64 string
          setUrl(base64String);
        }
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (files && files.length > 0) {
      const image = files[0];
      setUrl(URL.createObjectURL(image)); // Set uploaded image as URL
    }
  };

  useEffect(() => {
    const recognizeText = async () => {
      setLoading(true);
      if (url) {
        try {
          const result = await Tesseract.recognize(url);
          setRecognizedText(result.data.text);
        } catch (error) {
          console.error("OCR Error: ", error);
        }
      }
      setLoading(false);
    };
    recognizeText();
  }, [url]);

  return (
    <>
      <header>
        <h1 style={{ color: "black" }}>Camera App with OCR</h1>
      </header>
      {!isCaptureEnable && (
        <button onClick={() => setCaptureEnable(true)}>Start</button>
      )}

      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {isCaptureEnable && (
        <>
          <div>
            <button onClick={() => setCaptureEnable(false)}>End</button>
          </div>
          <div>
            <Camera
              ref={(ref: CameraType) => setCamera(ref)} // Reference to the camera with type
              aspectRatio={16 / 9}
              facingMode="environment" // Use back camera
              errorMessages={{
                noCameraAccessible: "No camera device accessible.",
                permissionDenied: "Permission denied. Please allow camera access.",
                switchCamera: "It is not possible to switch camera to another one because there is only one video device accessible.",
                canvas: "Canvas is not supported.",
              }}
            />
          </div>
          <button onClick={capture}>Capture</button>
        </>
      )}
      {url && (
        <>
          <div>
            <button onClick={() => setUrl(null)}>Delete</button>
          </div>
          <div>
            <img src={url} alt="Screenshot" />
          </div>
        </>
      )}
      {loading && <p>Loading OCR...</p>}
      {recognizedText && (
        <div>
          <h2>Extracted Text:</h2>
          <p>{recognizedText}</p>
        </div>
      )}
    </>
  );
};

export default App;
