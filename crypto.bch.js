const crypto = require('crypto');

function getMultiplier(nonce, clientSeed = '', serverSeed = '', houseEdge = 0.02)
{
    function* bytesGenerator(serverSeed, clientSeed, nonce)
    {
        let currentRound = 0;
        let currentRoundCursor = 0;

        while (true) {
            const hmac = crypto.createHmac('sha256', serverSeed);
            hmac.update(`${clientSeed}:${nonce}:${currentRound}`);
            const buffer = hmac.digest();

            while (currentRoundCursor < 32) {
                yield buffer[currentRoundCursor];
                currentRoundCursor += 1;
            }

            currentRoundCursor = 0;
            currentRound += 1;
        }
    }

    function* floatsGenerator(serverSeed, clientSeed, nonce)
    {
        const byteRng = bytesGenerator(serverSeed, clientSeed, nonce);

        while (true) {
            const bytes = Array(4)
                .fill(0)
                .map(() => byteRng.next().value);

            const float = bytes.reduce((result, value, i) =>
            {
                const divider = 256 ** (i + 1);
                const partialResult = value / divider;

                return result + partialResult;
            }, 0);

            yield float;
        }
    }

    const randomHash = (length = 64) =>
    {
        // Declare all characters
        let chars =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        // Pick characters randomly
        let str = '';
        for (let i = 0; i < length; i++) {
            str += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return str;

    };

    if (typeof map == 'undefined') {
        map = new Map();
        if (!clientSeed) {
            map.set('clientSeed', randomHash(32));
            map.set('serverSeed', randomHash(32));
        } else {
            map.set('clientSeed', clientSeed);
            map.set('serverSeed', serverSeed);
        }

    }
    clientSeed = map.get('clientSeed');
    serverSeed = map.get('serverSeed');



    const floatGen = floatsGenerator(serverSeed, clientSeed, nonce);
    const float = floatGen.next().value;

    const m = 100_000_000;
    const n = Math.floor(float * m) + 1;

    const crashPoint = Math.max((m / n) * (1 - houseEdge), 1);
    const multiplier = Math.floor(crashPoint * 100) / 100;

    if (nonce < 0) {
        return [
            { clientSeed },
            { serverSeed },

        ];
    } else {
        return multiplier;
    }
}

module.exports = { getMultiplier }
