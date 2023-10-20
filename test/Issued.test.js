const { assert } = require("chai");

const Issued = artifacts.require('./Issued.sol');

contract('Issued', (accounts) => {
    before(async () => {
        this.Issued = await Issued.deployed()
    })

/*  The test below won 't pass because setAdminInfo is a private function

    it('Should successfully add a new admin', async () => {
        await this.Issued.setAdminInfo("0xed2de21f55fb1c2fd8d56f1cf2a33998030dc9ac", "Christos Bandis", "chr.bandis@gmail.com", 6973979235, "20/02/1997");
    }) */

    it('Should successfully check if an admin exists', async () => {
        await this.Issued.adminExists("0xed2de21f55fb1c2fd8d56f1cf2a33998030dc9ac");
    })
})