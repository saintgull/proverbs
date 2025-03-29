// Import required modules
const { chromium } = require('playwright');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { McpServer } = require('@modelcontextprotocol/sdk');

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

// Get a random color palette from Coolors.co
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
    
    // Fallback: Generate random colors
    return [
      '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0').toUpperCase(),
      '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0').toUpperCase(),
      '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0').toUpperCase(),
      '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0').toUpperCase(),
      '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0').toUpperCase()
    ];
  } finally {
    await browser.close();
  }
}

// Generate a color palette from a base color
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

// Create the MCP server
async function main() {
  console.log('Initializing Coolors MCP Server...');
  
  // Create a server with standard MCP implementation
  const server = new McpServer({
    implementation: {
      name: 'coolors',
      version: '1.0.0'
    }
  });
  
  // Add the random_palette tool
  server.addTool({
    name: 'random_palette',
    description: 'Generate a random color palette',
    parameters: {},
    handler: async () => {
      try {
        console.log('Generating random palette...');
        const palette = await getRandomPalette();
        console.log('Generated palette:', palette);
        return { palette };
      } catch (error) {
        console.error('Error in random_palette tool:', error);
        throw error;
      }
    }
  });
  
  // Add the palette_from_color tool
  server.addTool({
    name: 'palette_from_color',
    description: 'Generate a color palette starting from a specific color',
    parameters: {
      type: 'object',
      properties: {
        color: {
          type: 'string',
          description: 'The starting color in hex format (e.g., "#FF5733" or "FF5733")'
        }
      },
      required: ['color']
    },
    handler: async ({ color }) => {
      try {
        console.log(`Generating palette from color: ${color}`);
        
        if (!color) {
          throw new Error('Color is required');
        }
        
        // Validate hex color
        const hexColor = color.startsWith('#') ? color : `#${color}`;
        if (!isValidHex(hexColor)) {
          throw new Error('Invalid hex color. Use format #RRGGBB or RRGGBB');
        }
        
        const palette = await generatePaletteFromColor(hexColor);
        console.log('Generated palette:', palette);
        return { palette };
      } catch (error) {
        console.error('Error in palette_from_color tool:', error);
        throw error;
      }
    }
  });
  
  // Connect to the client using stdio transport
  const transport = new StdioServerTransport();
  
  // Handle server exit
  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });
  
  process.stdin.on('close', async () => {
    console.log('Standard input closed, shutting down...');
    await server.close();
    process.exit(0);
  });
  
  // Start the server
  try {
    console.log('Connecting to MCP client...');
    await server.connect(transport);
    console.log('Coolors MCP Server connected and running');
  } catch (error) {
    console.error('Error connecting to MCP client:', error);
    process.exit(1);
  }
}

// Run the server
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});