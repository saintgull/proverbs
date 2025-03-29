# Coolors MCP Server

This is a Model Context Protocol (MCP) server that generates color palettes using the Coolors.co website. It provides two main functions:

1. Generate random color palettes
2. Generate palettes starting from a specific base color

## Installation

1. Ensure you have Node.js installed (v14 or later recommended)
2. Install dependencies:

```bash
npm install
```

3. Install Playwright browsers:

```bash
npx playwright install chromium
```

## Running the server

```bash
npm start
```

The server will start on port 3000 by default.

## Testing the API directly

You can test the API endpoints using curl or any API testing tool:

### Get a random palette:

```bash
curl -X POST http://localhost:3000/api/random-palette
```

### Get a palette starting from a specific color:

```bash
curl -X POST http://localhost:3000/api/palette-from-color \
  -H "Content-Type: application/json" \
  -d '{"color": "#8A3FFC"}'
```

## Using with Claude

To use this with Claude, add the MCP configuration to your .mcp.json file:

```json
{
  "servers": {
    "coolors": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

Then you can use the MCP with Claude:

```
Generate a random color palette:
{{mcp__coolors__random_palette}}

Generate a palette based on a specific color:
{{mcp__coolors__palette_from_color color="#8A3FFC"}}
```

## Functions

### random_palette

Generates a random 5-color palette.

**Returns:**
- `palette`: Array of 5 colors in hex format (e.g., `["#FF5733", "#33FF57", "#5733FF", "#FF33A8", "#33A8FF"]`)

### palette_from_color

Generates a 5-color palette starting from a specific color.

**Parameters:**
- `color`: (Required) The base color in hex format (e.g., "#FF5733" or "FF5733")

**Returns:**
- `palette`: Array of 5 colors in hex format (e.g., `["#FF5733", "#33FF57", "#5733FF", "#FF33A8", "#33A8FF"]`)

## Implementation Details

This MCP uses Playwright to automate interactions with the Coolors.co website:

1. For random palettes, it navigates to Coolors.co/generate and presses the spacebar to generate a random palette
2. For specific color palettes, it attempts to set the first color in the generator to the requested color and generates a palette

If the website interaction fails, it falls back to generating a palette algorithmically based on the input color.

## Use Cases

- Web development: Get harmonious color schemes for websites
- Design projects: Find color palettes for graphics, presentations, etc.
- Art projects: Discover inspiring color combinations