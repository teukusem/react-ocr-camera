import { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";
import "./index.css";

const videoConstraints = {
  width: 720,
  height: 360,
  facingMode: "environment", // Use back camera
};

const App: React.FC = () => {
  const [isCaptureEnable, setCaptureEnable] = useState<boolean>(false);
  const webcamRef = useRef<Webcam>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // State to manage loading

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      const byteString = atob(imageSrc.split(",")[1]); 
      const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];
      const byteArray = new Uint8Array(byteString.length);
  
      for (let i = 0; i < byteString.length; i++) {
        byteArray[i] = byteString.charCodeAt(i);
      }
  
      const blob = new Blob([byteArray], { type: mimeString });
      const blobUrl = URL.createObjectURL(blob);
  
      setUrl(blobUrl);
    }
  }, [webcamRef]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (files && files.length > 0) {
      const image = files[0];
      setUrl(URL.createObjectURL(image));
    }
  };

  const [recognizedText, setRecognizedText] = useState('');
  useEffect(() => {
    const recognizeText = async () => {
      setLoading(true)
      if (url) {
        const result = await Tesseract.recognize(url);
        setRecognizedText(result.data.text);
      }
      setLoading(false)
    };
    recognizeText();
  }, [url]);
  
  return (
    <>
      <header>
        <h1 style={{ color: 'black' }}>Camera App with OCR</h1>
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
            <Webcam
              audio={false}
              width={540}
              height={360}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
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
