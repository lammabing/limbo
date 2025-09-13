# Product Context

This file provides a high-level overview...

*
## Utilities

[2025-08-31 10:18:34] - Created outcome-generator.js utility script for generating crypto multiplier outcomes based on client seed, server seed, and number of rounds. The utility uses the getMultiplier function from crypto.bch.js to generate deterministic outcomes for each round. Usage: node outcome-generator.js <clientSeed> <serverSeed> <n>
[2025-08-31 10:23:58] - Updated outcome-generator.js utility to output results to a CSV file with two columns: Round and Multiplier. The utility now saves outcomes.csv in the current directory instead of displaying on console.
[2025-08-31 16:43:36] - Added getRunTimeLength() function to outcome-generator.js that reads the CSV output and calculates the number of consecutive rounds from the start where multiplier values are below a user-specified threshold. Updated command-line interface to optionally accept a threshold parameter for analysis.
[2025-09-04 11:01:50] - Updated outcome-generator.js to display outcomes on console in addition to saving to CSV. Now shows each round's multiplier on console and includes run time length analysis when threshold is provided. The utility provides both visual output and structured data export.
[2025-09-04 11:55:45] - Created multi-outcome-generator.js wrapper script that runs the outcome generator multiple times with randomly generated client and server seeds. Usage: node multi-outcome-generator.js <iterations> <rounds> [threshold]. Each iteration generates unique random seeds and runs the full outcome analysis including highest outcome tracking and threshold analysis.

## Autobet Features

[2025-09-04 10:38:11] - [2025-09-04 18:37:54] - Reviewed autobet implementation: Stop on loss and stop on profit functionality is fully implemented. UI elements exist in public/index.html (stopProfit and stopLoss inputs), and logic is implemented in public/script.js. The autoBetRound function checks currentProfit against configured stopProfit and stopLoss values, stopping autobet when conditions are met. Server-side logic in server.js and crypto.bch.js handles provably fair multiplier generation.
[2025-09-04 10:44:07] - [2025-09-04 18:43:34] - Fixed UI issue: Stop loss and stop profit input fields were disabled during auto betting. Removed elements.stopProfit and elements.stopLoss from disableAutoModeControls function so users can modify stop conditions while auto betting is active.
