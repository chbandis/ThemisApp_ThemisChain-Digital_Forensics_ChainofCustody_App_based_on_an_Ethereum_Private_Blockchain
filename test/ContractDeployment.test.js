const { assert } = require("chai");

const Issued = artifacts.require('./Issued.sol');
const Investigator = artifacts.require('./Investigator.sol');
const Case = artifacts.require('./Case.sol');
const Evidence = artifacts.require('./Evidence.sol');

    contract('Issued', (accounts) => {
        before(async () => {
            this.Issued = await Issued.deployed()
        })

        it('Contract "Issued" successfully deployed', async () => {
            const address = await this.Issued.address;
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        })
    })

    contract('Investigator', (accounts) => {
        before(async () => {
            this.Investigator = await Investigator.deployed()
        })

        it('Contract "Investigator" successfully deployed', async () => {
            const address = await this.Investigator.address;
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        })
    })

    contract('Case', (accounts) => {
        before(async () => {
            this.Case = await Case.deployed()
        })

        it('Contract "Case" successfully deployed', async () => {
            const address = await this.Case.address;
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        })
    })

    contract('Evidence', (accounts) => {
        before(async () => {
            this.Evidence = await Evidence.deployed()
        })

        it('Contract "Evidence" successfully deployed', async () => {
            const address = await this.Evidence.address;
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        })
    })