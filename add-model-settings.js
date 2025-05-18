// Script to add ModelSettingsManager to the 3D models page
const fs = require('fs');
const path = require('path');

// Path to the 3D models page
const filePath = path.join(__dirname, 'src', 'app', 'admin', '3d-models', 'page.tsx');

// Read the current file content
let content = fs.readFileSync(filePath, 'utf8');

// Add the ModelSettingsManager import if it doesn't exist
if (!content.includes("import ModelSettingsManager from './model-settings'")) {
  content = content.replace(
    "import { Model3D, defaultModels } from '@/data/models'",
    "import { Model3D, defaultModels } from '@/data/models'\nimport ModelSettingsManager from './model-settings'"
  );
}

// Add the ModelSettingsManager component to the UI
if (!content.includes('<ModelSettingsManager />')) {
  content = content.replace(
    "    <div className=\"flex items-center justify-between mb-8\">\n      <h1 className=\"heading-lg\">3D Models</h1>\n      <button\n        onClick={handleAddModel}\n        className=\"px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors\"\n      >\n        Add New Model\n      </button>\n    </div>",
    "    <div className=\"flex items-center justify-between mb-8\">\n      <h1 className=\"heading-lg\">3D Models</h1>\n      <button\n        onClick={handleAddModel}\n        className=\"px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors\"\n      >\n        Add New Model\n      </button>\n    </div>\n\n    {/* Model Settings Manager */}\n    <ModelSettingsManager />"
  );
}

// Save the updated content back to the file
fs.writeFileSync(filePath, content, 'utf8');

console.log('Successfully added ModelSettingsManager to the 3D models page!');
