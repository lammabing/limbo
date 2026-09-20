const he = 0.98;

function main() {
    const args = process.argv.slice(2);
    const xMin = parseInt(args[0]) || 2;
    const xMax = parseInt(args[1]) || 10;
    const nMin = parseInt(args[2]) || 2;
    const nMax = parseInt(args[3]) || 20;

    const targets = [];
    for (let x = xMin; x <= xMax; x++) {
        targets.push(x);
    }

    const header = 'n    ' + targets.map(t => (t + 'x').padEnd(6)).join('');
    console.log(header);
    console.log('-'.repeat(Math.max(header.length, 50)));

    for (let n = nMin; n <= nMax; n++) {
        let row = n.toString().padEnd(5);
        for (const x of targets) {
            const p = 1 - Math.pow(1 - he / x, n);
            row += (p * 100).toFixed(1).padStart(6);
        }
        console.log(row);
    }
}

if (require.main === module) {
    main();
}
