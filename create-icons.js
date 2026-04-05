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
    16: `iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAACgElEQVQ4jXWTX0jeVRjHP+e8P/v5Mp1baw0MnUbiVNQuumgXBWa7qC6C2IIugpFGf8AbUbobbhFBII3RwDXFG+kqELoJnGgEQv/GHKnbWJmb5aZ799pUjPf9ned5unjJ+bp8bg7n8P08z/ecL8exo+zkhWYVOhFpJ2iNieCCLmgi4xpsMB7rndmud1tg17lYN9KfE/Q9ap/wrqUaDu0FM/hrFf3xd2xmUZzoQGol6XazffmtBtZ1LraN0m/t8fI21/EirqFyp7HCkOlbyKffYH9mJ0oe8Iqb7ct7AF1Pn7WDFW3+1Ou7wgDu2cNEA+/gKve9lMS5fgBnJy80q7lpf+YNT/WBXeEiJzeWSN76Qshpq1eh07VU/S9sd/4uPhCFzTyuvhJ/tC5lGjo8Ii/T9NQjsI5MIe8OYteXCvvJOeSrKUiXFK5ztA6CHIsIWk15aTE8+gv69U9YPhC6R3CV++FgOdEnb4IrBOf27YGgh72JGKubD21PXoPMOtHIB0RnjsPaP7AnJvr4BHj/UJdZAxGLLMiiXf6j0b3WCrmAa6nCtTUUpjz/DKmzb+ObqyBKFbv8bg4LetuT6CX94Tfs5l2IIzhQViT0zz0NcUnx4169hYzP4CSMeQ02SBJET4/C/Y1HM9uZzL018u8PQRLEhTDk47HeGSc6oLczhM6LWGZ9V1i/v0b+1c+w+WUs6Pk4OzwXAaRWkm6t4Igtrbbbz/O4F+qRixNQVgqHKrD5FfTSr+iVBRCBoOPprO+B7Z+pqe+xJM71U/vkh2TWvS4/gCAQFESwwioW9Hw663scXyZFDf6rXONHTaahgyDHSLQGFSzogpMw5kIYirPDc9v1/wLYIDzY9ZkbhgAAAABJRU5ErkJggg==`,
    48: `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`,
    128: `iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABmJLR0QA/wD/AP+gvaeTAAAapUlEQVR4nO2dd4BU1b3HP797Z7bRlCIoiKDBAoJRo/gEFOyoUZKAREVEYkxeTDHxCRZi1hBFY4klogLWZ8UK+kAsQFBUihVUpKtIh6Utuzsz9/zeH3dmdnaZ3blTdxb2+8fMvefcc37nzOfO977nfGdnhAMe6FKd1u0oG2c39jY5Hqmcz3TFZAegwMwRYRqZv1pHqUHWN2+k5vWWVeaGSuJKEzjH0a6bqZ2TrhtqMzC0K2qR4cT8bHOz96X3MqSa3y3HQGsWTg7wALe/SXOqPEkKrI6QhgNehd5BXAAK0BOm71K33qgA6BqYAA+H2UPVhqr8DWtdBY2NjzZAjBsJJAoXO3lB4CZAQMGiJ0dU9N9OhsCdI0+4wA3B5kOHwdMPNbiqWAFhMANeaTGe0Y9YAGAJ4NVF9s6i+gkGLjCcFBOBXnCYClEE2CVS4j8HxbXLCBtGMGDkCbGc47cHVs7AJB4u0JqYHnOaY7RA7RRSApFaD3RKTjFE8/TlEHIJBhMIaELZS5HgGxe8NN2EW6EaHgANRLVJcE4E8q6gJ8KByPH/jGGWCi7UrB7d4IMKkBIq8BQEfFElcFMFLt3qDd0OhG/MH8C1Hw4KJkS7HfCYJITfJdYvB2j+TE9EaFPV9xS+qbGJxTjNGJKCJ0ACmGFRbHyW4oQkChCj4paMcISi1bpBXdtV6iBRXGKSuJJGW1YCWuJYhKPAYkHJyAAN5PU1VVQF0ALVMiB7FW/wbWf/YAoBhV5apuLAoVWXDVIDdtqrGHAMVLMb5ZrQkLeDRvYMMMSwMZgL5j3SicmA6DWDjLZ5sVFJBQkVrXQe9OmFvCikH01bqTZJrgW2Q5kbhd3MMBz1Y6VNiSmULSOcjCNEJSCnQLR0YL7n5vklc5dGX9VPNvBbZCsrIiuQFApn8DK2SLuShRsYoXX0eJnxBUqiB0CKsRSj2PZAAQAE3APoloqoJBBkBvDOBiCv+WFpT/OkAi4RgMoJ7qRb98BOl+zBiQBCiMjQaSGMQ7GBTEG62vMCDjhJxRhTjGQi8hSmgz5hQK2EDj1sB3SOQqfZi3mQdBsDXFLHFYGFl+MqA6AAIERoIIFJGClnFmExOBj1X17OaCiCIrA0OUB7fOASNKQfOhZAtGaKFmBaWYGPO2sCpCDVBhgjimDxCAUCFqO4YCpDAQIgCO1DFBECOwaDKMH/+NN5qE7+AAmhYFJ2cIF5i4aBORl1q+xpgRXuT0FiDk2JhTVXSCFNJEFBBoBkbBrBGg0V6ALADHgeKBL1aKBi1lYQegqNRAmOyoJBBp/MNEYMmHRIY2mFYgTe74UjB3qEtKOBHq0kH5vxRNjDCB5MBsgBLAoJc4BJfwYzVcECBEWVbY+VFRUMDQpTf5+WRMePIEJ1S1Y2K45fqpJiwAAAADbSURBVBFvAiYXHXK3RRGcKcAMQkqQAYABqnByPqFY2ANNqC1SrXdT+5S/S2v4tFT3E8wR3G2hFU3GMqEGAFT20RTtPEPeS5pHqNrr9e/F5JHX9Y1/yx1aHd+/A7qAGHzN4MKw0VaxsKSJAFiRHUOjWIpxhHF5GsRR2o0M0o1IFjEISlUCcELNIVSkJTYQxCVGU2EJBs4HicaqAMzgoJSCCBijMDFsqBjRFNdCJHPkTnOoJBGOYDRFGLkBn1bGQXhBJVVHbFRhMiEFNt8p6XCXRH5Iqd1oBCCNm8R4P5oeNjgU0GXaZLfHuNKoXTQf3F3sIb3x+WXBHAELhFheFXjAeQISwj4dJiNRDUAUZMSrRODwjDegW3BqsrREb0AYhivDg2KNaEX8XCqT1RMkbHoN4+n7JoQMi3QAAAAHJFAAAAQgAAAA4AAAAOAAAABQAAAAUAAAAOAAAAGgAAAA8AAAALAAAAHAAAAAAAAQAAAAIAAAADAAAAAgAAAAMAAAAFAAAAA`
  };
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = (size / 2) - 1;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX + 0.5;
      const dy = y - centerY + 0.5;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= radius) {
        // Pink color
        pixels.push(245, 0, 87, 255); // RGBA
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
