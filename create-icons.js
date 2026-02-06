// Script to generate PNG icons for the extension
// Run with: node create-icons.js

const fs = require('fs');
const path = require('path');

// Simple PNG generation using raw bytes
// This creates a basic colored icon

function createIcon(size) {
  // Create a simple PNG with a message bubble design
  // Using inline base64 encoded minimal PNGs for reliability
  
  const icons = {
    16: `iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA2klEQVQ4T6WTwQ3CMAxFf7qCjtARGIENYAJgA9iAERiBDWAC2ABGYANGYAPoCtRSJVKlJBTaE6f/8+04Nvy41OeQ1gFuIb0g/IBnkhKJYwUUQCkpStJvBmgB96DOJfU+QNJc0h7QG0h3uwI2JR0l7UhamwJmkq6SpqbLJPUlnSQNtgBJE0kNSZeSJqeAoaS7pLakzi+gIekg6SzpI6ApaSOpJukt6R0lhJgapVqS9paAkaR7zIdQc0nDEJB0kPRMG/wp4BUzWkhKTfgL8ALqkmZu7G9JfeL5/x/6AlTtPxHGPphxAAAAAElFTkSuQmCC`,
    48: `iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAA7ElEQVRoge2ZwQ3CIBSG/3YFR3AERmADnUAnsBt0A0dwBDfQERyBEdzADawckpqGhKLYEvn+A4ck7+PlQUoAABLiJhqAKfAI5MA9cA4cBCdUQFlkknpNIGkk6SppKunkA5L2klqSbn4haSwpk9T0hdFI0lHS0wjQBu4lJXG8kfSQNPYBSRtJhaTML5R0kLST1PIBSWNJd0ldX+hL2koq/EJJhaSepJLyAEk9SWdJPV9IJD0l3Xzhn+RL/nXECMSQdJDU9YGppFJSwwdSSV1JA+5u+5gpabkvUIcDOXCW1PKBUtJJUtcHMkl7SYUvvAFzSjwRp2vDgQAAAABJRU5ErkJggg==`,
    128: `iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAADk0lEQVR4nO3dQW7bMBBA0d+gO/TYPUaP0aN4T+S+SLPxIk7smJJIDsnfe4CRRaL/SLYsS3MHAABQsVX0BY6dL1/un17/3v7+8eHt56vVd3+tPjy/vrz/+fLlw+ubt+8/XV57XX//8bV8vXx5+f3Ppw+PDw/398+Pj48Pj8+Pd6fH50+Pd/f358f7u/Pjw8P53enu/HR3d/p5dnqy/nlydlw/HUenZ+dZXGb9C6ivfQPw/1r78/sCb7H65/9/c/x8Db9e/fNPly/fnv3pb/fl+vVu/fPV63fv/2fwx/YNzP1BYr8+XkXfAPy0uu37l/sba3/eey5J+wbu27+/BN7v5NcHAPd8v8FP0P6F71f0DcA/sP7nu8fqq+/vG5DbXoJ+gv1L0K/V8k8Av1T7xuqfL58u/9l+g75c/fOl6yv/QP+FroLzA8AP1L/B/wbqNaAE/kTu7+Tf5feXYF8A/uPtn/8W/gXvfP9a9D/8f1b0fy4A/7H65xt/0R/gn/oD/kSu7+Tf5PaHYF7g9geh/yL3N4KfC/Dq9gP8n9+v/w3cn+P+HJ5f7bYDwH+s/1m9hJaJ+xLYF/i15O8A8Fr2D7kH/on75/D8SrcdAP5D/aP/r18r/hbYN4CftP6B/Y/5g/BJ+A/1j/4f/p++f0/4P+In7F/k/knoS3ANgP9A/5j/6//h+/f0b+Rf5P5J2BfAf/X/dfx+jfqfnbm+D78E9wH4D/UP/k++/4r/fv8fJPwD+H+/dwmqeAneBe5L8BPUP7i+wn/kd8L3J/wp6tdIfbP/yP2Tf5P7EjwL4D/UP/o/+R/++/0/0Gf/kPsS+JnvX2Bf4Neo/8n3BfJy/6rgfYF6A/A/6h/8e32/fhf4uQA/9wfoS+S+RK0B+Jf1D+6fsv3VwH+gfvb/zv7fvk//I+H/Y/0M/kPu3/vXbL8E+wL4T/UP7p/yJ6m/xP8f5H9cN4D/UP/o/+X7Bfgp5P7wS2BfID/2+1f4FbgGwP+s/+WA/8hf/2aL6wH+R++F+w3Af+S+2f9k/Rdxn/BzAv6E/w/AP1D/U+E/8h/7E08+AD/APwB+3P4B99X+h/8X4L/k/oT/q8O/BfiX24/4+/9/s/y8wPUG/lj/E/vHa/+tvu9foB7B7Vv+E+rP4Fey/s3qn9Y+hB/R7Vf8K+EP5P59/97+of8L/iv7h/43/f8S/s3+h8t/X/i/H5B/ifv3gv+V/7+hvgn/BvcVAAAAAElFTkSuQmCC`
  };
  
  return Buffer.from(icons[size], 'base64');
}

// Alternative: Generate colorful icons programmatically
function generateColorfulIcon(size) {
  // PNG file structure
  const width = size;
  const height = size;
  
  // Simple blue circle icon
  const pixels = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = (size / 2) - 1;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX + 0.5;
      const dy = y - centerY + 0.5;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= radius) {
        // Blue color (Facebook blue)
        pixels.push(0, 132, 255, 255); // RGBA
      } else {
        // Transparent
        pixels.push(0, 0, 0, 0);
      }
    }
  }
  
  return createPNG(width, height, pixels);
}

// Create PNG from raw pixels
function createPNG(width, height, pixels) {
  const zlib = require('zlib');
  
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);  // bit depth
  ihdr.writeUInt8(6, 9);  // color type (RGBA)
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace
  
  // Create raw image data with filter bytes
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0); // Filter byte (none)
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      rawData.push(pixels[idx], pixels[idx + 1], pixels[idx + 2], pixels[idx + 3]);
    }
  }
  
  const compressedData = zlib.deflateSync(Buffer.from(rawData));
  
  function createChunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    
    const typeBuffer = Buffer.from(type);
    const crcData = Buffer.concat([typeBuffer, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(crcData), 0);
    
    return Buffer.concat([length, typeBuffer, data, crc]);
  }
  
  // CRC32 calculation
  function crc32(data) {
    let crc = 0xFFFFFFFF;
    const table = [];
    
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      }
      table[i] = c;
    }
    
    for (let i = 0; i < data.length; i++) {
      crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
    }
    
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }
  
  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Main execution
const iconsDir = path.join(__dirname, 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

// Generate icons
[16, 48, 128].forEach(size => {
  const iconPath = path.join(iconsDir, `icon${size}.png`);
  const iconData = generateColorfulIcon(size);
  fs.writeFileSync(iconPath, iconData);
  console.log(`Created: ${iconPath}`);
});

console.log('\n✅ Icon generation complete!');
console.log('Your extension is now ready to install.');
