const { assert } = require("chai");

const Case = artifacts.require('./Case.sol');

contract('Case', (accounts) => {
    before(async () => {
        this.Case = await Case.deployed()
    })

    it('Should successfully add a Case to caseList mapping', async () => {
        const Case = await this.Case.openNewCase("Test Case", "Case Description", "0x4889AdFd60D1734cF8e4d9A2437b06D71e9160a9", "0xed2de21f55fb1c2fd8d56f1cf2a33998030dc9ac", "21/07/2023");
        const caseExists = Case.logs[0].args;
        const isSuccessful = Case.logs[1].args;
        assert.equal(caseExists.result, false)
        assert.equal(isSuccessful.result, true);
    })

    it('Should successfully show if a Case exists', async () => {
        await this.Case.caseExists(1);
    })

    it('Should successfully get the name of a Case', async () => {
        await this.Case.getCaseName(1);
    })

    it('Should successfully show info about the active cases of an investigator', async () => {
        await this.Case.activeCases(1, "0xed2de21f55fb1c2fd8d56f1cf2a33998030dc9ac");
    })

    it('Should successfully close a case', async () => {
        await this.Case.closeCase(1);
    })
    
    it('Should successfully assign an investigator to a case', async () => {
        await this.Case.addCaseInvestigator(1, "0x4889AdFd60D1734cF8e4d9A2437b06D71e9160a9");
    })
    
    it('Should successfully remove an investigator from a case', async () => {
        await this.Case.removeCaseInvestigator(1, "0x4889AdFd60D1734cF8e4d9A2437b06D71e9160a9");
    })
    
    it('Should successfully show the investigators of a case', async () => {
        await this.Case.getCaseInvestigators(1);
    })
    
    it('Should successfully show if an investigators exists in a case', async () => {
        await this.Case.invExistsInCase(1, "0xed2de21f55fb1c2fd8d56f1cf2a33998030dc9ac");
    })
    
    it('Should successfully add evidence to a case', async () => {
        const Case = await this.Case.addCaseEvidence(1, "0x16839c4d6f33218465749bb03e8b4404e5c63b41f86a3e8d629e3ff9bee6e45d", "Test Evidence", "Test Evidence Description", "0xed2de21f55fb1c2fd8d56f1cf2a33998030dc9ac", "21/07/2023");
        const IsSuccessful_Evidence = Case.logs[0].args;
        assert.equal(IsSuccessful_Evidence.result, true);
    })
    
    it('Should successfully get collapsed info of an evidence', async () => {
        await this.Case.getCaseEvidenceCollapsed(1, 0);
    })
    
    it('Should successfully get expanded info of an evidence', async () => {
        await this.Case.getCaseEvidenceExpanded(1, 0);
    })
    
    it('Should successfully get the hash of an evidence', async () => {
        await this.Case.getEvidenceHash(1, 0);
    })
    
    it('Should successfully count the evidences of a case', async () => {
        await this.Case.getEvidenceHash(1, 0);
    })
    
    it('Should successfully get the current owner of an evidence', async () => {
        await this.Case.getEvidenceHash(1, 0);
    })
    
    it('Should successfully transfer the evidence', async () => {
        const Case = await this.Case.transferEvidence(1, 0, "0xed2de21f55fb1c2fd8d56f1cf2a33998030dc9ac", "Transfer Description", "21/07/2023");
        const IsSuccessful_Evidence = Case.logs[0].args;
        assert.equal(IsSuccessful_Evidence.result, true);
    })

    it('Should successfully show the chain of custody of an evidence', async () => {
        await this.Case.viewChainOfCustody(1, 0);
    })

    it('Should successfully delete an evidence', async () => {
        await this.Case.deleteEvidence(1, 0);
    })
})