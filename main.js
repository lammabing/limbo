const config = {
    rounds: { label: "rounds", type: "number", value: 10 },
    stopProfit: { label: "stopProfit", type: "balance", value: 500 },
    stopLoss: { label: "stopLoss", type: "balance", value: -2500 },
    unitBet: { label: "unitBet", type: "balance", value: 1 },
    betMultiplier: { label: "betMultiplier", type: "number", value: 1.0 },
    target: { label: "target", type: "number", value: 0 },
    provider: { label: "provider", type: "string", value: './crypto.bch.js' },
};

const { getMultiplier } = require(config.provider.value);
const varMap = new Map();
const sMap = new Map();
const rMap = new Map(); // Assuming this is used somewhere  

// Helper function to filter a map based on a threshold  
const filterMap = (inputMap, threshold) =>
{
    return new Map(Array.from(inputMap).filter(([key, value]) => value > threshold));
};

// Generic get function  
const get = (id, map = varMap) => map.get(id);

// Generic update function  
const update = (id, val, map = varMap) => map.set(id, val);

// Generic increment function  
const increment = (id, dx = 1, map = varMap) => map.set(id, (map.get(id) || 0) + dx);

// Function to generate a random integer within a range  
const rndInt = (lowerBound = 0, upperBound = 30) =>
{
    lowerBound = Math.ceil(lowerBound);
    upperBound = Math.floor(upperBound);
    const range = upperBound - lowerBound + 1;
    return Math.floor(Math.random() * range) + lowerBound;
};

// Helper function to round a number to two decimal places  
const fv = (x, n = 2) => Number(Math.round(parseFloat(x + 'e' + n)) + 'e-' + n);


// Function to extract specific key values from a configuration object  
function getConfig(sourceObj = config, keyToExtract = 'value')
{
    const newObj = {};
    for (const [outerKey, nestedObj] of Object.entries(sourceObj)) {
        if (nestedObj.hasOwnProperty(keyToExtract)) {
            newObj[outerKey] = nestedObj[keyToExtract];
        }
    }
    return newObj;
}

// Function to get the target value  
function getTarget(nonce, targetMap = rMap, userConfig = getConfig(config))
{
    if (userConfig.target > 0) {
        return userConfig.target;
    }

    /**
     * Calculates the mean of the values in an array.
     * @param {number[]} arr - The array of numbers.
     * @returns {number} The mean of the array values.
     */
    function findMean(arr)
    {
        if (arr.length === 0) return 0;
        const sum = arr.reduce((acc, val) => acc + val, 0);
        return sum / arr.length;
    }

    const filteredMap = filterMap(targetMap, 3.5);
    const mapSize = filteredMap.size;

    if (mapSize > 10) {
        const index = rndInt(0, mapSize - 1);
        const targetsArr = Array.from(filteredMap.keys());

        const mean = (findMean(targetsArr));

        return Array.from(filteredMap.keys())[index];
    }

    if (!get('currentTarget')) {
        update('currentTarget', 2);
        return get('currentTarget');
    }

    update('currentTarget', get('currentTarget') + rndInt(-1, 1));
    return get('currentTarget');
}

// Function to process the map  
function process(m, nonce, map = sMap)
{
    const roundToNearest = (x) =>
    {
        return x < 100 ? Math.round(x / 10) * 10 :
            x < 1000 ? Math.round(x / 100) * 100 :
                Math.round(x / 1000) * 1000;
    };

    const mClass = roundToNearest(m);

    if (!map.has(mClass)) {
        map.set(mClass, 0);
    }
    map.set(mClass, fv(map.get(mClass) + 1));

    for (const [key, value] of map.entries()) {
        if (mClass > key) {
            map.set(key, 0);
        } else {
            map.set(key, fv(value + 1));
            rMap.set(key, fv((value + 1) / key));
        }
    }

    rMap.delete(0);
    deleteRandomEntry(12, map)
    //  console.log(map.size)
    return rMap;
}


const deleteRandomEntry = (limit = 12, map) =>
{
    if (map.size > limit) {
        const keys = Array.from(map.keys());
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        map.delete(randomKey);
    }
};

// Function to place a bet  
async function bet(betAmount, target)
{
    betAmount = fv(betAmount);
    const nonce = get('nonce');
    const multiplier = fv(getMultiplier(nonce));
    const profit = multiplier >= target ? fv((target - 1) * betAmount) : fv(-betAmount);
    const balance = fv((get('balance') || 0) + fv(profit));
    update('balance', balance);

    if (profit > 0) update('currentTarget', rndInt(2, 10))

    const result = {
        nonce: nonce,
        multiplier: multiplier,
        target: target,
        betAmount: betAmount,
        profit: profit,
        balance: balance
    };

    const loseStreak = profit > 0 ? 0 : increment('loseStreak') + 1


    process(result.multiplier, get('nonce'));
    return result;
}
function summarize(msg)
{
    function findMinValue(arr)
    {
        if (arr.length === 0) {
            return { minValue: undefined, minIndex: -1 };
        }

        let minValue = arr[0];
        let minIndex = 0;

        for (let i = 1; i < arr.length; i++) {
            if (arr[i] < minValue) {
                minValue = arr[i];
                minIndex = i;
            }
        }

        return { minValue, minIndex };
    }

    function appendToCSV(data)
    {
        const csvRow = Object.values(data).join(',') + '\n';
        fs.appendFile('results.csv', csvRow, (err) =>
        {
            if (err) throw err;
            console.log('Data appended to results.csv');
        });
    }

    const getArrayByKeys = (arr) =>
    {
        return arr.reduce((acc, obj) =>
        {
            for (let key in obj) {
                if (!acc[key]) acc[key] = [];
                acc[key].push(obj[key]);
            }
            return acc;
        }, {});
    };
    const balancesArr = getArrayByKeys(msg)['balance'];
    const seeds = getMultiplier(-1);

    const summary = {
        clientSeed: seeds[0]['clientSeed'],
        serverSeed: seeds[1]['serverSeed'],
        balance: balancesArr[balancesArr.length - 1],
        position: balancesArr.length,
        minBalance: findMinValue(balancesArr)['minValue'],
        minimumIndex: findMinValue(balancesArr)['minIndex']
    }

    const fs = require('fs').promises;
    const path = require('path');
    console.table(msg);
    // appendObjectToCSV(summary);
    console.log(summary);
    appendToCSV(summary, "data.csv");

}
// Function to run multiple betting rounds  
async function betRounds()
{
    update('loseStreak', 0);
    const userConfig = getConfig();
    const { target, betMultiplier, stopProfit, stopLoss, unitBet, rounds } = userConfig;
    const results = [];
    let i = 0;

    if (!get('nonce')) update('nonce', 0);

    do {
        i++;
        increment('nonce');
        const currentBet = unitBet * Math.pow(betMultiplier, i - 1);
        const result = await bet(currentBet, getTarget(get('nonce')));
        results.push(result);

    } while (rounds > i && rounds > 0 || get('balance') < stopProfit && get('balance') > stopLoss);

    return results;
}

betRounds().then(results => summarize(results));

