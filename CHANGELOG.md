# Changelog

## [Unreleased]

### Added
- `continue-game.js`: Details table now shows the bet amount placed on the winning round (based on initial bet, escalated by betMultiplier after losses) plus the win amount paid out for that round (winning round bet * target multiplier); winning round bets and payouts are also recorded in the session results as `winningBetAmounts` and `winningPayouts`.
- `continue-game.js`: Summary table now includes a 'Total Bets' column showing the accumulated sum of all bet amounts placed during the simulation.
- `cli-game/server.js` + `web-interface.html`: Web interface now matches continue-game.js output - `/api/simulate` tracks and returns total wagered (`totalBets`), last winning round bet (`winningRoundBet`) and win amount (`winAmount`, persisted in session history as `totalWagered`/`winningBetAmounts`/`winningPayouts`); results tables show a 'Total Bets' column, 'Winning Round Bet'/'Win Amount' rows, and all numeric values/amounts are formatted to two decimal places.

### Fixed
- `cli-game/limbo`: `play` command passed arguments to continue-game.js in the wrong order (initialBet/betMultiplier were interpreted as numberOfBets/betMultiplier); documented usage now works as intended.
- `cli-game/README.md` and `WEB-README.md`: Corrected continue-game.js usage signature and parameter order, replaced stale sample output with current table output (including Total Bets, Winning Round Bet, Win Amount), fixed inaccurate session-history/features/comparison descriptions, and documented function-iteration.js, repeat-script.js, and params.json.

### Changed
- `continue-game.js`: All displayed numeric values and amounts (balances, profits, bets, multipliers, win probability) are now formatted to two decimal places.
