import { useRef, useState, useCallback } from "react";
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
  const [text, setText] = useState<string>(""); // State to store extracted text
  const [loading, setLoading] = useState<boolean>(false); // State to manage loading

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setUrl(imageSrc);
      recognizeText(imageSrc); // Call OCR function
    }
  }, [webcamRef]);

  const recognizeText = (imageSrc: string) => {
    setLoading(true);
    Tesseract.recognize(
      imageSrc,
      'eng',
      {
        logger: (m) => console.log(m), // Optional logger to check progress
      }
    )
      .then(({ data: { text } }) => {
        setText(text);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  return (
    <>
      <header>
        <h1 style={{ color: 'black' }}>Camera App with OCR</h1>
      </header>
      {!isCaptureEnable && (
        <button onClick={() => setCaptureEnable(true)}>Start</button>
      )}
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
      {text && (
        <div>
          <h2>Extracted Text:</h2>
          <p>{text}</p>
        </div>
      )}
    </>
  );
};

export default App;
