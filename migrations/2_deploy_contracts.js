var Issued = artifacts.require("./Issued.sol");
var Investigator = artifacts.require("./Investigator.sol");
var Case = artifacts.require("./Case.sol");
var Evidence = artifacts.require("./Evidence.sol");

  module.exports = async function(deployer) {
    await deployer.deploy(Issued);
    await deployer.deploy(Investigator);
    await deployer.deploy(Case);
    await deployer.deploy(Evidence);
   };