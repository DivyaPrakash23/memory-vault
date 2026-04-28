// face-api.js runs fully in the browser — no raw images sent to server
import * as faceapi from "face-api.js";

let modelsLoaded = false;

export const loadModels = async () => {
  if (modelsLoaded) return;
  const MODEL_URL = "/models"; // place face-api models in /public/models
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  modelsLoaded = true;
  console.log("face-api.js models loaded");
};

// Extract descriptor from an HTML image or video element
export const extractDescriptor = async (element) => {
  const detection = await faceapi
    .detectSingleFace(element, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks(true)
    .withFaceDescriptor();

  if (!detection) throw new Error("No face detected");
  return detection.descriptor; // Float32Array
};

// Match a descriptor against labeled known profiles
export const matchFace = (descriptor, labeledDescriptors) => {
  const matcher   = new faceapi.FaceMatcher(labeledDescriptors, 0.5);
  const bestMatch = matcher.findBestMatch(descriptor);
  return {
    label:    bestMatch.label,
    distance: bestMatch.distance,
    isMatch:  bestMatch.label !== "unknown",
  };
};

// Build labeled descriptors from stored profiles
export const buildLabeledDescriptors = (profiles) =>
  profiles.map(
    (p) =>
      new faceapi.LabeledFaceDescriptors(p.label, [new Float32Array(p.descriptor)])
  );