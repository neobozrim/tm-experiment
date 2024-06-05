let model;
let labels;

async function loadModel() {
  try {
    console.log('Loading model...');
    model = await tf.loadGraphModel('model/model.json');
    console.log('Model loaded successfully');
    
    const metadataResponse = await fetch('model/metadata.json');
    if (!metadataResponse.ok) {
      throw new Error('Failed to load metadata.json');
    }

    const metadataJson = await metadataResponse.json();
    labels = metadataJson.labels;
    if (!labels) {
      throw new Error('Labels not found in metadata.json');
    }

    console.log('Metadata loaded successfully:', labels);
  } catch (error) {
    console.error('Error loading the model or metadata:', error);
  }
}

async function preprocessImage(imageElement) {
  const tensor = tf.browser.fromPixels(imageElement)
    .resizeNearestNeighbor([224, 224])
    .toFloat()
    .expandDims();
  return tensor.div(255.0); // Normalize the image
}

async function predict(imageElement) {
  if (!model) {
    await loadModel();
  }

  const processedImage = await preprocessImage(imageElement);
  const predictions = await model.predict(processedImage).data();

  return predictions;
}

async function classifyImage(imageElement) {
  const predictions = await predict(imageElement);

  // Define a threshold for "undefined" classification
  const threshold = 0.5; // Example threshold, adjust based on your model's performance

  const maxPrediction = Math.max(...predictions);
  const maxIndex = predictions.indexOf(maxPrediction);

  if (maxPrediction < threshold) {
    return 'undefined';
  } else {
    return labels[maxIndex];
  }
}

document.getElementById('predictButton').addEventListener('click', async () => {
  const fileInput = document.getElementById('imageUpload');
  if (fileInput.files.length === 0) {
    alert('Please select an image file.');
    return;
  }

  const image = new Image();
  image.src = URL.createObjectURL(fileInput.files[0]);
  image.onload = async () => {
    const result = await classifyImage(image);
    document.getElementById('result').innerText = `Classification: ${result}`;
  };
});
