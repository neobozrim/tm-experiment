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

// Call the loadModel function directly for debugging
loadModel();
