const { assert } = require("chai");

const Investigator = artifacts.require('./Investigator.sol');

contract('Investigator', (accounts) => {
    before(async () => {
        this.Investigator = await Investigator.deployed()
    })

    it('Should successfully add a new investigator', async () => {
        const investigator = await this.Investigator.addInvestigator("0xed2de21f55fb1c2fd8d56f1cf2a33998030dc9ac", 1234, "Christos Bandis", "chr.bandis@gmail.com", 6973979235, "20/02/1997", "0x4889AdFd60D1734cF8e4d9A2437b06D71e9160a9");
        const investigatorExists = investigator.logs[0].args;
        const isSuccessful = investigator.logs[1].args;
        assert.equal(investigatorExists.exists, false)
        assert.equal(isSuccessful.result, true);
    })

    it('Should successfully show investigator \'s name', async () => {
        await this.Investigator.getInvestigatorName("0xed2de21f55fb1c2fd8d56f1cf2a33998030dc9ac");
    })

    it('Should successfully remove an investigator', async () => {
        await this.Investigator.removeInvestigator("0xed2de21f55fb1c2fd8d56f1cf2a33998030dc9ac", 1234);
    })

    it('Should successfully check if an investigator with the same wallet address exists', async () => {
        await this.Investigator.investigatorExists("0xed2de21f55fb1c2fd8d56f1cf2a33998030dc9ac");
    })

    it('Should successfully check if an investigator with the same id exists', async () => {
        await this.Investigator.invIdExists(1234);
    })
})