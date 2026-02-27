/**
 * Table formatting utility for CLI scripts
 * Provides functions to display data in formatted table columns
 */

/**
 * Creates a formatted table from headers and rows
 * @param {string[]} headers - Array of column headers
 * @param {Array<Array<string|number>>} rows - Array of row data arrays
 * @param {Object} options - Table formatting options
 * @param {boolean} [options.showBorder=true] - Show table borders
 * @param {boolean} [options.centerAlign=false] - Center align column content
 * @param {Object} [options.columnAlignments] - Per-column alignment ('left', 'center', 'right')
 * @returns {string} Formatted table string
 */
function createTable(headers, rows, options = {}) {
    const {
        showBorder = true,
        centerAlign = false,
        columnAlignments = {}
    } = options;

    // Calculate column widths based on headers and data
    const columnWidths = headers.map((header, index) => {
        const maxWidthInColumn = rows.reduce((max, row) => {
            const cellValue = row[index] !== undefined ? String(row[index]) : '';
            return Math.max(max, cellValue.length);
        }, header.length);
        return Math.max(maxWidthInColumn, 3); // Minimum width of 3
    });

    // Helper function to align text in a cell
    function alignText(text, width, columnIndex) {
        const alignment = columnAlignments[columnIndex] || (centerAlign ? 'center' : 'left');
        const padding = width - text.length;

        if (alignment === 'right') {
            return ' '.repeat(padding) + text;
        } else if (alignment === 'center') {
            const leftPadding = Math.floor(padding / 2);
            const rightPadding = padding - leftPadding;
            return ' '.repeat(leftPadding) + text + ' '.repeat(rightPadding);
        } else {
            return text + ' '.repeat(padding);
        }
    }

    let table = '';

    if (showBorder) {
        // Create top border
        table += '┌' + columnWidths.map(w => '─'.repeat(w)).join('┬') + '┐\n';
    }

    // Add header row
    table += '│' + headers.map((h, i) => alignText(h, columnWidths[i], i)).join('│') + '│\n';

    if (showBorder) {
        // Create separator line
        table += '├' + columnWidths.map(w => '─'.repeat(w)).join('┼') + '┤\n';
    }

    // Add data rows
    rows.forEach(row => {
        table += '│' + row.map((cell, i) => 
            alignText(cell !== undefined ? String(cell) : '', columnWidths[i], i)
        ).join('│') + '│\n';
    });

    if (showBorder) {
        // Create bottom border
        table += '└' + columnWidths.map(w => '─'.repeat(w)).join('┴') + '┘';
    }

    return table;
}

/**
 * Creates a simple key-value table for displaying properties
 * @param {Object} data - Object with key-value pairs
 * @param {Object} options - Table formatting options
 * @param {string} [options.keyLabel='Property'] - Label for the key column
 * @param {string} [options.valueLabel='Value'] - Label for the value column
 * @param {boolean} [options.showBorder=true] - Show table borders
 * @returns {string} Formatted key-value table string
 */
function createKeyValueTable(data, options = {}) {
    const {
        keyLabel = 'Property',
        valueLabel = 'Value',
        showBorder = true
    } = options;

    const headers = [keyLabel, valueLabel];
    const rows = Object.entries(data).map(([key, value]) => [key, value]);

    return createTable(headers, rows, { showBorder, columnAlignments: { 0: 'left', 1: 'right' } });
}

/**
 * Creates a summary table with colored highlights for specific values
 * @param {Object} data - Object with key-value pairs
 * @param {Object} options - Table formatting options
 * @param {string[]} [options.highlightKeys] - Keys to highlight
 * @param {Function} [options.highlightFn] - Function to determine if value should be highlighted
 * @returns {string} Formatted summary table string with ANSI colors
 */
function createSummaryTable(data, options = {}) {
    const {
        highlightKeys = [],
        highlightFn = null
    } = options;

    const headers = ['Property', 'Value'];
    const rows = Object.entries(data).map(([key, value]) => {
        let formattedValue = String(value);
        
        // Apply highlighting if conditions are met
        const shouldHighlight = highlightKeys.includes(key) || 
                               (highlightFn && highlightFn(key, value));
        
        if (shouldHighlight) {
            // Green color for positive/highlighted values
            formattedValue = `\x1b[32m${formattedValue}\x1b[0m`;
        }
        
        return [key, formattedValue];
    });

    return createTable(headers, rows, { 
        showBorder: true, 
        columnAlignments: { 0: 'left', 1: 'right' } 
    });
}

/**
 * Displays a section header with optional underline
 * @param {string} title - Section title
 * @param {Object} options - Formatting options
 * @param {string} [options.character='='] - Character to use for underline
 * @param {boolean} [options.showUnderline=true] - Show underline
 * @returns {string} Formatted section header
 */
function createSectionHeader(title, options = {}) {
    const {
        character = '=',
        showUnderline = true
    } = options;

    let header = `\n${title}\n`;
    if (showUnderline) {
        header += character.repeat(title.length) + '\n';
    }
    return header;
}

/**
 * Formats a number as currency
 * @param {number} value - Number to format
 * @param {string} [currency='$'] - Currency symbol
 * @param {number} [decimals=2] - Number of decimal places
 * @returns {string} Formatted currency string
 */
function formatCurrency(value, currency = '$', decimals = 2) {
    return `${currency}${Number(value).toFixed(decimals)}`;
}

/**
 * Formats a number with thousand separators
 * @param {number} value - Number to format
 * @param {number} [decimals=2] - Number of decimal places
 * @returns {string} Formatted number string
 */
function formatNumber(value, decimals = 2) {
    return Number(value).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

module.exports = {
    createTable,
    createKeyValueTable,
    createSummaryTable,
    createSectionHeader,
    formatCurrency,
    formatNumber
};
