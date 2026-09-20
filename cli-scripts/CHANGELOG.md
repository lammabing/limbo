# Changelog

## [Unreleased]

### Changed
- Monetary amounts in CLI output now use comma separators (e.g. `$335,544,310.00`)
- `formatCurrency` in `table-utils.js` now formats with `toLocaleString('en-US')` thousand separators
- `cost-calculation.js`, `profit-calculation.js`, and `profit-simulation.js` display money via `formatCurrency` instead of raw `toFixed(2)`
- `cli-game/init-game.js` and `cli-game/continue-game.js` display money via `formatCurrency` (tables, details, and inline messages)
- `cli-game/server.js` JSON data left untouched to avoid breaking the web interface
