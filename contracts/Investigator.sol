// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Issued.sol";

contract Investigator is Issued {

    //Investigator counter
    uint public investigatorCounter;
    
    //Array that keeps a history of the IDs assigned to investigators
    uint[] public investigatorIdArray;

    //Investigator info struct
    struct InvestigatorInfo {
        address walletAddress;
        uint invId;
        string fullName;
        string email;
        uint mobile;
        string dob;
        address issuedBy;
    }

    //Investigator lists
    mapping (address => InvestigatorInfo) public investigatorList;
    mapping (uint => InvestigatorInfo) public adminInvestigatorList; //This list is used by the admins to render every investigator info

    //Events
    event IsSuccessful(bool result);
    event AddressExists(bool exists);

    //Function to add an investigator, with the "onlyAdmin" modifier from "Issued" smart contract, which means that only an admin can interact with it
    function addInvestigator (address _walletAddress, uint _invId, string memory _fullName, string memory _email, uint _mobile, string memory _dob, address _issuer) public onlyAdmin {
        investigatorCounter++;    //Investigator counter starts with 1

        if (investigatorList[_walletAddress].walletAddress != _walletAddress) {     //Investigator existence check by wallet address
            emit AddressExists(false);
            investigatorList[_walletAddress].walletAddress = _walletAddress;
            investigatorList[_walletAddress].invId = _invId;
            investigatorList[_walletAddress].fullName = _fullName;
            investigatorList[_walletAddress].email = _email;
            investigatorList[_walletAddress].mobile = _mobile;
            investigatorList[_walletAddress].dob = _dob;
            investigatorList[_walletAddress].issuedBy = _issuer;
        
            adminInvestigatorList[investigatorCounter].walletAddress = _walletAddress;
            adminInvestigatorList[investigatorCounter].invId = _invId;
            adminInvestigatorList[investigatorCounter].fullName = _fullName;
            adminInvestigatorList[investigatorCounter].email = _email;
            adminInvestigatorList[investigatorCounter].mobile = _mobile;
            adminInvestigatorList[investigatorCounter].dob = _dob;
            adminInvestigatorList[investigatorCounter].issuedBy = _issuer;

            investigatorIdArray.push(_invId);   //Push investigator ID to the idArray
            emit IsSuccessful(true);
        } else {
            emit AddressExists(true);
        }
    }

    //Function which returns the name of a certain investigator
    function getInvestigatorName (address _walletAddress) public view returns (string memory) {
        return investigatorList[_walletAddress].fullName;
    }

    //Function to delete an investigator, with the "onlyAdmin" modifier from "Issued" smart contract, which means that only an admin can interact with it
    function removeInvestigator(address _walletAddress, uint _invId) public onlyAdmin {
        investigatorList[_walletAddress].walletAddress = 0x0000000000000000000000000000000000000000;
        investigatorList[_walletAddress].invId = 0;                                     
        investigatorList[_walletAddress].fullName = "";                     //In blockchain is impossible to delete something permanently, like in a traditional 
        investigatorList[_walletAddress].email = "";                        //databases. Instead, delete means to assign the default value in a variable. For example, 
        investigatorList[_walletAddress].mobile = 0;                        //the default value of a string variable is "" (empty) and of a uint is 0
        investigatorList[_walletAddress].dob = "";
        investigatorList[_walletAddress].issuedBy = 0x0000000000000000000000000000000000000000;

        adminInvestigatorList[_invId].walletAddress = 0x0000000000000000000000000000000000000000;
        adminInvestigatorList[_invId].invId = 0;
        adminInvestigatorList[_invId].fullName = "";
        adminInvestigatorList[_invId].email = "";
        adminInvestigatorList[_invId].mobile = 0;
        adminInvestigatorList[_invId].dob = "";
        adminInvestigatorList[_invId].issuedBy = 0x0000000000000000000000000000000000000000;

        emit IsSuccessful(true);
    }

    //Function to check if an investigator exists
    function investigatorExists (address _walletAddress) public view returns (bool) {
        if (investigatorList[_walletAddress].walletAddress == _walletAddress) {
            return true;
        } else {
            return false;
        }
    }

    //Function to check if an investigator 's ID in the IdArray
    function invIdExists (uint _invId) public view returns (bool) {    
        for (uint i = 0; i < investigatorIdArray.length; i++) {
            if (investigatorIdArray[i] == _invId) {
                return true;
            } 
        }
        return false;
    }
}