// Temporary direct fetch for metadata.json to test accessibility
fetch('model/metadata.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  })
  .then(data => console.log('Metadata fetched directly:', data))
  .catch(error => console.error('Error fetching metadata directly:', error));

let model;
let labels;

async function loadModel() {
  try {
    console.log('Loading model...');
    model = await tf.loadGraphModel('model/model.json');
    console.log('Model loaded successfully:', model);

    // Fetch metadata (labels)
    console.log('Fetching metadata...');
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
  console.log('Image preprocessed');
  return tensor.div(255.0); // Normalize the image
}

async function predict(imageElement) {
  try {
    if (!model) {
      console.log('Model not loaded yet, loading now...');
      await loadModel();
    }

    if (!model) {
      throw new Error('Model failed to load');
    }

    const processedImage = await preprocessImage(imageElement);
    console.log('Processed image:', processedImage);

    const predictions = await model.predict(processedImage).data();
    console.log('Predictions:', predictions);

    return predictions;
  } catch (error) {
    console.error('Error during prediction:', error);
  }
}

async function classifyImage(imageElement) {
  const predictions = await predict(imageElement);
  if (!predictions) {
    console.error('No predictions received');
    return 'undefined';
  }
  console.log('Classify image - predictions:', predictions);

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
    console.log('Image loaded for prediction');
    const result = await classifyImage(image);
    console.log('Classification result:', result);
    document.getElementById('result').innerText = `Classification: ${result}`;
  };
});
