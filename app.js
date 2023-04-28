const fs = require('fs');
const bip39 = require('bip39');
const ecc = require('tiny-secp256k1')
const { BIP32Factory } = require('bip32')
const bip32 = BIP32Factory(ecc)

const derivationPaths = [
    "m/44'/0'/0'",
    "m/49'/0'/0'",
    "m/84'/0'/0'",
];

async function getWallet() {
    let i = 0;


    while (true) {
        const mnemonic = bip39.generateMnemonic(128);
        const seed = await bip39.mnemonicToSeed(mnemonic);

        let logs = ''

        for (const path of derivationPaths) {
            const rootNode = bip32.fromSeed(seed);
            const childNode = rootNode.derivePath(path);
            const xpub = childNode.neutered().toBase58();

            let derive = path == derivationPaths[1]? 'compat' : path == derivationPaths[0]? 'normal' : 'segwit'
            // const url = `https://api.blockchain.info/haskoin-store/btc/xpub/${xpub}?derive=${derive}`;
            const url = `https://api.haskoin.com/btc/xpub/${xpub}?derive=${derive}`;


            try {
                const response = await fetch(url);
                const data = await response.json();

                const balance = await data.balance.received;

                let demo = `${balance} - ${path} - ${xpub}\n`
                logs+=demo

                if (balance > 0) {
                    const fileName = '----winwin.txt';
                    const filePath = '../' + fileName;
                    const content = `${path}\n${mnemonic}\n${xpub}\n\n`;

                    fs.appendFile(filePath, content, (err) => {
                        if (err) throw err;
                    })
                }

            } catch (err) {
                console.log(`API Error ${err.message} - ${xpub}`)
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        i += 1;
        console.log(i, mnemonic+'\n'+logs, '\n')
    }
}

getWallet();
