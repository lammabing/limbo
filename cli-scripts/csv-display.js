#!/usr/bin/env node

/**
 * Script to display CSV file content with aligned columns in the terminal
 * Usage: node csv-display.js <csv-file-path>
 */

const fs = require('fs');

/**
 * Parse a CSV line into an array of values
 * @param {string} line - A line from the CSV file
 * @returns {Array<string>} - An array of parsed values
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        // Handle escaped quotes
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last value
  values.push(current.trim());
  
  return values;
}

/**
 * Calculate the maximum width for each column
 * @param {Array<Array<string>>} rows - Array of CSV rows
 * @returns {Array<number>} - Array of maximum widths for each column
 */
function getColumnWidths(rows) {
  if (rows.length === 0) return [];
  
  const widths = new Array(rows[0].length).fill(0);
  
  for (const row of rows) {
    for (let i = 0; i < row.length; i++) {
      if (row[i] && row[i].length > widths[i]) {
        widths[i] = row[i].length;
      }
    }
  }
  
  return widths;
}

/**
 * Format a table row with aligned columns
 * @param {Array<string>} row - Array of values in a row
 * @param {Array<number>} widths - Array of column widths
 * @returns {string} - Formatted row string
 */
function formatRow(row, widths) {
  let result = '|';
  
  for (let i = 0; i < widths.length; i++) {
    let cell = row[i] || '';
    
    // Truncate very long values to prevent terminal overflow
    if (cell.length > 50) {
      cell = cell.substring(0, 47) + '...';
    }
    
    const padding = widths[i] - cell.length;
    result += ` ${cell}${' '.repeat(padding)} |`;
  }
  
  return result;
}

/**
 * Format the separator line between header and data
 * @param {Array<number>} widths - Array of column widths
 * @returns {string} - Separator line
 */
function formatSeparator(widths) {
  let result = '|';
  
  for (const width of widths) {
    result += `-`.repeat(width + 2) + '|';
  }
  
  return result;
}

/**
 * Display CSV content with aligned columns
 * @param {string} filePath - Path to the CSV file
 */
function displayCSV(filePath) {
  // Read the file
  let fileContent;
  try {
    fileContent = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file: ${error.message}`);
    process.exit(1);
  }
  
  // Split into lines and parse each line
  const lines = fileContent.split('\n').filter(line => line.trim() !== '');
  const rows = lines.map(line => parseCSVLine(line));
  
  if (rows.length === 0) {
    console.log('CSV file is empty or contains no valid data.');
    return;
  }
  
  // Calculate column widths
  const widths = getColumnWidths(rows);
  
  // Format and display the table
  for (let i = 0; i < rows.length; i++) {
    console.log(formatRow(rows[i], widths));
    
    // Add separator after header (first row)
    if (i === 0 && rows.length > 1) {
      console.log(formatSeparator(widths));
    }
  }
}

// Command-line argument handling
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length !== 1) {
    console.log('Usage: node csv-display.js <csv-file-path>');
    console.log('Example: node csv-display.js output.csv');
    process.exit(1);
  }
  
  const filePath = args[0];
  displayCSV(filePath);
}

module.exports = { parseCSVLine, getColumnWidths, formatRow, formatSeparator, displayCSV };