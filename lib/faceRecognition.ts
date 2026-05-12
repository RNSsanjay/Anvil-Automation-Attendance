import * as faceapi from 'face-api.js';

let modelsLoaded = false;

/**
 * Load face-api.js models from CDN
 * Models: SsdMobilenetv1, FaceLandmark68Net, FaceRecognitionNet
 */
export async function loadFaceModels(): Promise<boolean> {
  if (modelsLoaded) return true;
  
  try {
    const MODEL_URL = '/models'; // We'll serve models from public/models
    
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    
    modelsLoaded = true;
    console.log('Face recognition models loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading face models:', error);
    return false;
  }
}

/**
 * Detect face in image and return face descriptor (128-dimension vector)
 * @param imageElement - HTML Image or Video element
 * @returns Face descriptor array or null if no face detected
 */
export async function detectFaceDescriptor(
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<Float32Array | null> {
  try {
    const detection = await faceapi
      .detectSingleFace(imageElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    if (!detection) {
      return null;
    }
    
    return detection.descriptor;
  } catch (error) {
    console.error('Error detecting face:', error);
    return null;
  }
}

/**
 * Extract face descriptor from base64 image string
 * @param base64Image - Base64 encoded image
 * @returns Face descriptor array or null
 */
export async function getFaceDescriptorFromBase64(base64Image: string): Promise<number[] | null> {
  try {
    const img = await faceapi.fetchImage(base64Image);
    const descriptor = await detectFaceDescriptor(img);
    
    if (!descriptor) {
      return null;
    }
    
    // Convert Float32Array to regular array for JSON serialization
    return Array.from(descriptor);
  } catch (error) {
    console.error('Error getting face descriptor from base64:', error);
    return null;
  }
}

/**
 * Compare two face descriptors and return similarity distance
 * Lower distance = more similar (threshold typically 0.6)
 * @param descriptor1 - First face descriptor
 * @param descriptor2 - Second face descriptor
 * @returns Euclidean distance between descriptors
 */
export function compareFaceDescriptors(
  descriptor1: number[] | Float32Array,
  descriptor2: number[] | Float32Array
): number {
  const d1 = descriptor1 instanceof Float32Array ? descriptor1 : new Float32Array(descriptor1);
  const d2 = descriptor2 instanceof Float32Array ? descriptor2 : new Float32Array(descriptor2);
  
  return faceapi.euclideanDistance(d1, d2);
}

/**
 * Check if two faces match based on descriptor comparison
 * @param descriptor1 - First face descriptor
 * @param descriptor2 - Second face descriptor
 * @param threshold - Maximum distance for match (default 0.6)
 * @returns True if faces match
 */
export function facesMatch(
  descriptor1: number[] | Float32Array,
  descriptor2: number[] | Float32Array,
  threshold: number = 0.6
): boolean {
  const distance = compareFaceDescriptors(descriptor1, descriptor2);
  return distance < threshold;
}

/**
 * Find best matching face from multiple stored descriptors
 * @param currentDescriptor - Face descriptor to match
 * @param storedDescriptors - Array of stored face descriptors
 * @returns Object with bestMatch and distance, or null if no good match
 */
export function findBestMatch(
  currentDescriptor: number[] | Float32Array,
  storedDescriptors: number[][]
): { bestMatch: number; distance: number; isMatch: boolean } | null {
  if (!storedDescriptors || storedDescriptors.length === 0) {
    return null;
  }
  
  let bestDistance = Infinity;
  let bestMatchIndex = -1;
  
  storedDescriptors.forEach((stored, index) => {
    const distance = compareFaceDescriptors(currentDescriptor, stored);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestMatchIndex = index;
    }
  });
  
  return {
    bestMatch: bestMatchIndex,
    distance: bestDistance,
    isMatch: bestDistance < 0.6 // threshold for matching
  };
}

/**
 * Validate that image contains a clear, detectable face
 * @param imageElement - HTML Image or Video element
 * @returns True if face is detected with good confidence
 */
export async function validateFacePresence(
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<{ isValid: boolean; confidence?: number; message?: string }> {
  try {
    const detection = await faceapi
      .detectSingleFace(imageElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
      .withFaceLandmarks();
    
    if (!detection) {
      return { isValid: false, message: 'No face detected. Please center your face.' };
    }
    
    const confidence = detection.detection.score;
    
    if (confidence < 0.7) {
      return { isValid: false, confidence, message: 'Face not clear. Please improve lighting.' };
    }
    
    return { isValid: true, confidence, message: 'Face detected successfully' };
  } catch (error) {
    console.error('Error validating face:', error);
    return { isValid: false, message: 'Error detecting face' };
  }
}
