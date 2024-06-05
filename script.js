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

async function loadModelOnly() {
  try {
    console.log('Loading model only...');
    model = await tf.loadGraphModel('model/model.json');
    console.log('Model loaded successfully:', model);
  } catch (error) {
    console.error('Error loading the model:', error);
  }
}

async function fetchMetadataOnly() {
  try {
    console.log('Fetching metadata only...');
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
    console.error('Error fetching metadata:', error);
  }
}

// Call the loadModelOnly function directly for debugging
loadModelOnly();

// Call the fetchMetadataOnly function directly for debugging
fetchMetadataOnly();
