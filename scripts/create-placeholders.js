// scripts/create-placeholders.js
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const categories = [
  { slug: 'apartments', color: '#90cdf4', name: 'Квартиры' },
  { slug: 'houses', color: '#9ae6b4', name: 'Дома' },
  { slug: 'land', color: '#fbd38d', name: 'Земельные участки' },
  { slug: 'commercial', color: '#d6bcfa', name: 'Коммерция' },
  { slug: 'industrial', color: '#e2e8f0', name: 'Промышленные объекты' },
];

// Create images directory if it doesn't exist
const imagesDir = path.join(process.cwd(), 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Create a default placeholder
function createDefaultPlaceholder() {
  const placeholderPath = path.join(imagesDir, 'placeholder.png');
  if (fs.existsSync(placeholderPath)) {
    console.log('Default placeholder already exists');
    return;
  }

  const width = 400;
  const height = 300;
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');

  // Fill with gray background
  context.fillStyle = '#f3f4f6';
  context.fillRect(0, 0, width, height);

  // Add text
  context.font = 'bold 24px Arial';
  context.fillStyle = '#6b7280';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('Изображение недоступно', width / 2, height / 2);

  // Save the image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(placeholderPath, buffer);
  console.log('Created default placeholder image');
}

// Create a placeholder for each category
function createCategoryPlaceholders() {
  const width = 400;
  const height = 300;

  categories.forEach(category => {
    const placeholderPath = path.join(imagesDir, `${category.slug}_placeholder.png`);
    if (fs.existsSync(placeholderPath)) {
      console.log(`Placeholder for ${category.slug} already exists`);
      return;
    }

    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    // Fill with category color
    context.fillStyle = category.color;
    context.fillRect(0, 0, width, height);

    // Add text
    context.font = 'bold 28px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(category.name, width / 2, height / 2);

    // Save the image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(placeholderPath, buffer);
    console.log(`Created placeholder for ${category.slug}`);
  });
}

// Execute
createDefaultPlaceholder();
createCategoryPlaceholders();
console.log('All placeholder images created successfully');