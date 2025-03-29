const express = require('express');
const { chromium } = require('playwright');
const app = express();
const port = 3000;

app.use(express.json());

// Function to validate hex color
function isValidHex(hex) {
  return /^#?([0-9A-F]{3}|[0-9A-F]{6})$/i.test(hex);
}

// Convert 3-digit hex to 6-digit hex
function expandHex(hex) {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Expand 3-digit hex
  if (hex.length === 3) {
    return hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  
  return hex;
}

async function getRandomPalette() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to Coolors generator
    await page.goto('https://coolors.co/generate');
    
    // Dismiss any initial dialogs if they appear
    try {
      await page.keyboard.press('Escape');
    } catch (e) {
      // Ignore error if no dialog
    }
    
    // Press spacebar to generate a palette
    await page.keyboard.press(' ');
    
    // Extract the palette from the URL
    const url = page.url();
    const palette = url.split('/').pop().split('-');
    
    // Format the palette
    const colors = palette.map(color => `#${color.toUpperCase()}`);
    
    return colors;
  } catch (error) {
    console.error('Error getting random palette:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function generatePaletteFromColor(baseColor) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to Coolors generator
    await page.goto('https://coolors.co/generate');
    
    // Dismiss any initial dialogs if they appear
    try {
      await page.keyboard.press('Escape');
    } catch (e) {
      // Ignore error if no dialog
    }
    
    // First generate a random palette
    await page.keyboard.press(' ');
    
    // Get color panels
    const colorPanels = await page.$$('div[class*="color_panel"]');
    if (colorPanels.length === 0) {
      throw new Error('Could not find color panels');
    }
    
    // Click on the first color panel to select it
    await colorPanels[0].click();
    
    // Find the color input field and enter the base color
    const hexInput = await page.$('input[value^="#"]') || await page.$('input[placeholder*="HEX"]');
    if (!hexInput) {
      throw new Error('Could not find hex input field');
    }
    
    // Clear existing value and enter new hex color
    await hexInput.click({ clickCount: 3 }); // Select all text
    await hexInput.fill(baseColor.startsWith('#') ? baseColor : `#${baseColor}`);
    await page.keyboard.press('Enter');
    
    // Press spacebar to generate palette based on this color
    await page.keyboard.press(' ');
    
    // Extract the palette from the URL
    const url = page.url();
    const palette = url.split('/').pop().split('-');
    
    // Format the palette
    const colors = palette.map(color => `#${color.toUpperCase()}`);
    
    return colors;
  } catch (error) {
    console.error(`Error generating palette from ${baseColor}:`, error);
    
    // Fallback: Generate a harmonious palette programmatically
    // Here we implement a simple complementary color scheme
    try {
      const hex = expandHex(baseColor.replace('#', ''));
      
      // Convert hex to RGB
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      // Generate complementary colors
      const complementary = `#${(255 - r).toString(16).padStart(2, '0')}${(255 - g).toString(16).padStart(2, '0')}${(255 - b).toString(16).padStart(2, '0')}`;
      
      // Create a palette with different shades
      const colors = [
        `#${hex}`,
        `#${Math.floor(r * 0.8).toString(16).padStart(2, '0')}${Math.floor(g * 0.8).toString(16).padStart(2, '0')}${Math.floor(b * 0.8).toString(16).padStart(2, '0')}`,
        `#${Math.floor(r * 0.6).toString(16).padStart(2, '0')}${Math.floor(g * 0.6).toString(16).padStart(2, '0')}${Math.floor(b * 0.6).toString(16).padStart(2, '0')}`,
        complementary,
        `#${Math.floor(r * 0.2 + 204).toString(16).padStart(2, '0')}${Math.floor(g * 0.2 + 204).toString(16).padStart(2, '0')}${Math.floor(b * 0.2 + 204).toString(16).padStart(2, '0')}`
      ];
      
      return colors;
    } catch (fallbackError) {
      console.error('Fallback palette generation failed:', fallbackError);
      throw error; // Throw the original error
    }
  } finally {
    await browser.close();
  }
}

// API endpoint to get a random palette
app.post('/api/random-palette', async (req, res) => {
  try {
    const palette = await getRandomPalette();
    res.json({ palette });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to generate a palette from a specific color
app.post('/api/palette-from-color', async (req, res) => {
  try {
    const { color } = req.body;
    
    if (!color) {
      return res.status(400).json({ error: 'Color is required' });
    }
    
    // Validate hex color
    const hexColor = color.startsWith('#') ? color : `#${color}`;
    if (!isValidHex(hexColor)) {
      return res.status(400).json({ error: 'Invalid hex color. Use format #RRGGBB or RRGGBB' });
    }
    
    const palette = await generatePaletteFromColor(hexColor);
    res.json({ palette });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// MCP endpoint to handle Claude's requests
app.post('/mcp', async (req, res) => {
  try {
    const { name, arguments: args } = req.body;
    
    if (name === 'random_palette') {
      const palette = await getRandomPalette();
      res.json({ response: { palette } });
    } else if (name === 'palette_from_color') {
      const { color } = args;
      
      if (!color) {
        return res.status(400).json({ error: 'Color is required' });
      }
      
      // Validate hex color
      const hexColor = color.startsWith('#') ? color : `#${color}`;
      if (!isValidHex(hexColor)) {
        return res.status(400).json({ error: 'Invalid hex color. Use format #RRGGBB or RRGGBB' });
      }
      
      const palette = await generatePaletteFromColor(hexColor);
      res.json({ response: { palette } });
    } else {
      res.status(400).json({ error: 'Unknown method name' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Coolors MCP Server listening on port ${port}`);
});

// Export mcp info for Claude
module.exports = {
  name: 'coolors',
  description: 'Generate color palettes using Coolors.co',
  functions: [
    {
      name: 'random_palette',
      description: 'Generate a random color palette',
      parameters: {},
      returns: {
        palette: {
          type: 'array',
          description: 'An array of colors in hex format',
          items: {
            type: 'string',
            description: 'A color in hex format (e.g., "#FF5733")'
          }
        }
      }
    },
    {
      name: 'palette_from_color',
      description: 'Generate a color palette starting from a specific color',
      parameters: {
        color: {
          type: 'string',
          description: 'The starting color in hex format (e.g., "#FF5733" or "FF5733")',
          required: true
        }
      },
      returns: {
        palette: {
          type: 'array',
          description: 'An array of colors in hex format',
          items: {
            type: 'string',
            description: 'A color in hex format (e.g., "#FF5733")'
          }
        }
      }
    }
  ]
};