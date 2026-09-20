# Changelog

## [Unreleased]

### Added
- `cli-game/server.js` + `web-interface.html`: Web simulation results now include the actual outcome multiplier rolled on the winning round ("Winning Multiplier" row in the details table, `winningMultiplier` in the `/api/simulate` response, persisted as `winningMultipliers` in session history).
- `continue-game.js`: Details table now shows the bet amount placed on the winning round (based on initial bet, escalated by betMultiplier after losses) plus the win amount paid out for that round (winning round bet * target multiplier); winning round bets and payouts are also recorded in the session results as `winningBetAmounts` and `winningPayouts`.
- `continue-game.js`: Summary table now includes a 'Total Bets' column showing the accumulated sum of all bet amounts placed during the simulation.
- `cli-game/server.js` + `web-interface.html`: Web interface now matches continue-game.js output - `/api/simulate` tracks and returns total wagered (`totalBets`), last winning round bet (`winningRoundBet`) and win amount (`winAmount`, persisted in session history as `totalWagered`/`winningBetAmounts`/`winningPayouts`); results tables show a 'Total Bets' column, 'Winning Round Bet'/'Win Amount' rows, and all numeric values/amounts are formatted to two decimal places.
- `cli-game/server.js` + `web-interface.html`: `/api/simulate` now records and returns the actual multiplier outcome rolled on the winning round (`winningMultiplier`, persisted as `winningMultipliers` in session history); web results details table shows a 'Winning Multiplier' row alongside the winning round bet and win amount.

### Fixed
- `cli-game/limbo`: `play` command passed arguments to continue-game.js in the wrong order (initialBet/betMultiplier were interpreted as numberOfBets/betMultiplier); documented usage now works as intended.
- `cli-game/README.md` and `WEB-README.md`: Corrected continue-game.js usage signature and parameter order, replaced stale sample output with current table output (including Total Bets, Winning Round Bet, Win Amount), fixed inaccurate session-history/features/comparison descriptions, and documented function-iteration.js, repeat-script.js, and params.json.

### Changed
- `public/script.js` + `public/index.html`: Target multiplier slider now extends to 1,000,000x (was 10,000x). The 0-100 slider range is split into 3 equal 2-decade segments (1.01x-100x, 100x-10,000x, 10,000x-1,000,000x) for both the manual and auto target sliders; max slider label updated to 1,000,000x.
- `public/script.js`: AutoBet Speed Mode rounds now run much faster - removed the 100ms delay before ending each round and the 300ms inter-round delay (now 0ms, still yielding to the event loop so the UI repaints and Stop stays responsive). Round rate is now limited only by the `/play` request and per-round DOM updates.
- `prob-xn.js`: Now supports an optional house edge argument (`probAtLeastOne(x, n, houseEdge)` / CLI arg in `[0, 1)`); per-trial probability becomes `(1 - edge) / x`. Header output displays the edge when set.
- `prob-xn.js`: Absorbed the functionality of `prob-xn-edge.js` (house-edge-adjusted limbo probabilities), which has been removed as redundant; `cli-scripts/README.md` updated accordingly.
- `continue-game.js`: All displayed numeric values and amounts (balances, profits, bets, multipliers, win probability) are now formatted to two decimal places.
