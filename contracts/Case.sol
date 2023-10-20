// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Evidence.sol";
import "./Issued.sol";

contract Case is Evidence, Issued {
    
    //Case ID counter
    uint public caseId;

    //Case info struct
    struct CaseInfo {
        uint caseNum;
        string caseName;
        string caseDesc;
        address[] caseInvestigators;
        address creator;
        string creationTime;
        mapping (uint => Evidence.EvidenceInfo[]) evidenceList;
        bool closed; //default false
    }

    //(Not used) Modifier to check if an evidence was deleted 
/*  modifier evidenceNotDeleted(uint _caseId, uint _evidenceId) {
        bool isDeleted = caseList[_caseId].evidenceList[_caseId][_evidenceId].deleted;
        require (isDeleted == false, "There is no such evidence");
        _;
    } */

    //Case List
    mapping (uint => CaseInfo) public caseList;

    //Events
    event CaseExists(bool result);
    event IsSuccessful(bool result, uint id);
    event IsSuccessful_Evidence(bool result); 
    event IsSuccessful_Investigator(bool result); 

    //Function to open a new case, with the "onlyAdmin" modifier from "Issued" smart contract, which means that only an admin can interact with it
    function openNewCase (string memory _caseName, string memory _caseDesc, address _caseInvestigator, address _caseCreator, string memory _creationTime) public onlyAdmin {
        caseId++;   //Case Id starts with 1
        
        if (caseList[caseId].caseNum != caseId) {   //Case Id existence check
            emit CaseExists(false);
            caseList[caseId].caseNum = caseId;
            caseList[caseId].caseName = _caseName;
            caseList[caseId].caseDesc = _caseDesc;
            caseList[caseId].caseInvestigators.push(_caseInvestigator); 
            caseList[caseId].creator = _caseCreator;
            caseList[caseId].creationTime = _creationTime;
            caseList[caseId].closed = false;

            emit IsSuccessful(true, caseId);
        } else {
            emit CaseExists(true);
        }
    }

    //Function to check if a case exists based on its ID
    function caseExists (uint _caseId) public view returns (bool) {
        if (caseList[_caseId].caseNum == _caseId) {
            return true;
        }
    }

    //Function which returns the name of a case based on its ID
    function getCaseName (uint _caseId) public view returns (string memory) {
        return caseList[_caseId].caseName;
    }

    //Function which returns the active cases of a certain investigator
    function activeCases (uint _caseId, address _walletAddress) public view returns (uint, string memory, string memory, address, string memory, bool) {
        CaseInfo storage thisCase = caseList[_caseId];
        
        address[] memory caseInvestigatorsArray = caseList[_caseId].caseInvestigators;
        uint len = caseInvestigatorsArray.length;

        for (uint i = 0 ; i < len; i++){
            if (caseList[_caseId].caseInvestigators[i] == _walletAddress) {                
                return (thisCase.caseNum, thisCase.caseName, thisCase.caseDesc, thisCase.creator, thisCase.creationTime, thisCase.closed);
            }
        }        
    }

    //Function to close a case based on its ID and delete its evidence, with the "onlyAdmin" modifier from "Issued" smart contract, which means that only an admin can interact with it
    function closeCase (uint _caseId) public onlyAdmin {
        caseList[_caseId].caseNum = 0;                                                      //In blockchain is impossible to delete something permanently, like in a traditional 
        caseList[_caseId].caseName = "";                                                    //database. Instead, delete means to assign the default value in a variable. For example,
        caseList[_caseId].caseDesc = "";                                                    //the default value of a string variable is "" (empty) and of a uint is 0
        caseList[_caseId].creator = 0x0000000000000000000000000000000000000000;
        caseList[_caseId].creationTime = "";
        caseList[_caseId].closed = true;

        uint caseLen = caseList[_caseId].caseInvestigators.length;
        for (uint i = 0 ; i < caseLen; i++){
            delete caseList[_caseId].caseInvestigators[i];
        }

        Evidence.EvidenceInfo[] storage thisEvidence = caseList[_caseId].evidenceList[_caseId];

        uint evidLen = thisEvidence.length;
        for (uint j = 0 ; j < evidLen; j++){
            delete thisEvidence[j];             //Delete doesn 't actually delete the element but it assigns the default value to it (see comment above)
        }
    }

    //Function to assign an investigator to a case, with the "onlyAdmin" modifier from "Issued" smart contract, which means that only an admin can interact with it
    function addCaseInvestigator (uint _caseId, address _investigator) public onlyAdmin {       
        caseList[_caseId].caseInvestigators.push(_investigator);
        emit IsSuccessful_Investigator(true);
    }

    //Function to remove an investigator from a case, with the "onlyAdmin" modifier from "Issued" smart contract, which means that only an admin can interact with it
    function removeCaseInvestigator (uint _caseId, address _investigator) public onlyAdmin {       
        caseList[_caseId].caseInvestigators.push(_investigator);

        uint caseLen = caseList[_caseId].caseInvestigators.length;
        for (uint i = 0 ; i < caseLen; i++){
            if (caseList[_caseId].caseInvestigators[i] == _investigator) {
                delete caseList[_caseId].caseInvestigators[i];
            }
        }
        emit IsSuccessful_Investigator(true);
    }

    //Function which returns the investigators of a particular case and the total number of them 
    function getCaseInvestigators (uint _caseId) public view returns (address[] memory, uint) {
        address[] memory CaseInvestigators = caseList[_caseId].caseInvestigators;
        uint len = CaseInvestigators.length;
        address[] memory investigatorResult = new address[](len);

        for (uint i = 0 ; i < len; i++){
            investigatorResult[i] = CaseInvestigators[i];
        }
        return (investigatorResult, len);
    }

    //Function to check if a case has already been assigned to an investigator
    function invExistsInCase (uint _caseId, address _walletAddress) public view returns (bool) {
        address[] memory CaseInvestigators = caseList[_caseId].caseInvestigators;
        uint len = CaseInvestigators.length;

        for (uint i = 0 ; i < len; i++){
            if (CaseInvestigators[i] == _walletAddress) {
                return true;
            }            
        }
    }

    //Function to add evidence to a case, with the "onlyAdmin" modifier from "Issued" smart contract, which means that only an admin can interact with it
    function addCaseEvidence (uint _caseId, bytes memory _evidenceHash, string memory _evidenceName, string memory _evidenceDesc, address _creator, string memory _dateCreated) public onlyAdmin {   
        Evidence.EvidenceInfo[] storage thisEvidence = caseList[_caseId].evidenceList[_caseId];
        Evidence.EvidenceInfo storage singleEvidence = thisEvidence.push();

        singleEvidence.evidenceHash = _evidenceHash;
        singleEvidence.evidenceName = _evidenceName;
        singleEvidence.evidenceDesc = _evidenceDesc;
        singleEvidence.creator = _creator;
        singleEvidence.dateCreated = _dateCreated;
        singleEvidence.transferChain.push(_creator);
        singleEvidence.transferDesc.push("Creation");
        singleEvidence.transferTime.push(_dateCreated);
        singleEvidence.deleted = false;    

        emit IsSuccessful_Evidence(true);
    }
    
    //Function which returns evidence 's info
    function getCaseEvidenceCollapsed(uint _caseId, uint _evidenceId) public view returns (bytes memory, string memory, string memory, bool) {
        Evidence.EvidenceInfo memory thisEvidence = caseList[_caseId].evidenceList[_caseId][_evidenceId];
        return (thisEvidence.evidenceHash, thisEvidence.evidenceName, thisEvidence.dateCreated, thisEvidence.deleted);
    }

    //Function which returns evidence 's info
    function getCaseEvidenceExpanded(uint _caseId, uint _evidenceId) public view returns (bytes memory, string memory, string memory, address, string memory) {
        Evidence.EvidenceInfo memory thisEvidence = caseList[_caseId].evidenceList[_caseId][_evidenceId];
        return (thisEvidence.evidenceHash, thisEvidence.evidenceName, thisEvidence.evidenceDesc, thisEvidence.creator, thisEvidence.dateCreated);
    }

    //Function which returns evidence 's hash
    function getEvidenceHash(uint _caseId, uint _evidenceId) public view returns (bytes memory) {        
        Evidence.EvidenceInfo memory thisEvidence = caseList[_caseId].evidenceList[_caseId][_evidenceId];
        return (thisEvidence.evidenceHash);
    }

    //Function which returns the total number of the evidences in a case 
    function evidenceCount (uint _caseId) public view returns (uint){
        Evidence.EvidenceInfo[] storage thisEvidence = caseList[_caseId].evidenceList[_caseId];
        return thisEvidence.length;
    }

    //Function which returns the current owner of an evidence
    function getCurrentOwner (uint _caseId, uint _evidenceId) public view returns (address) {
        Evidence.EvidenceInfo memory thisEvidence = caseList[_caseId].evidenceList[_caseId][_evidenceId];
        address[] memory chain = thisEvidence.transferChain;
        return chain[chain.length - 1];
    }

    //Function to transfer an evidence from one investigator to another, with the "onlyAdmin" modifier from "Issued" smart contract, which means that only an admin can interact with it
    function transferEvidence (uint _caseId, uint _evidenceId, address _transferTo, string memory _transferDesc, string memory _transferTime) public onlyAdmin {
        Evidence.EvidenceInfo storage thisEvidence = caseList[_caseId].evidenceList[_caseId][_evidenceId];

        thisEvidence.transferChain.push(_transferTo);
        thisEvidence.transferDesc.push(_transferDesc);
        thisEvidence.transferTime.push(_transferTime);

        emit IsSuccessful_Evidence(true);
    }

    //Function which returns the chain of custody of an evidence 
    function viewChainOfCustody (uint _caseId, uint _evidenceId) public view returns (uint, string memory, bytes memory, address[] memory, string[] memory, string[] memory) {
        Evidence.EvidenceInfo memory thisEvidence = caseList[_caseId].evidenceList[_caseId][_evidenceId];

        address[] memory transfChain = thisEvidence.transferChain;
        uint transfArrayLen = transfChain.length;       //transfArrayLen is the same as the length of timeChain and descChain
        address[] memory transfResult = new address[](transfArrayLen);

        string[] memory timeChain = thisEvidence.transferTime;
        string[] memory timeResult = new string[](transfArrayLen);

        string[] memory descChain = thisEvidence.transferDesc;
        string[] memory descResult = new string[](transfArrayLen);

        for (uint i = 0 ; i < transfArrayLen; i++){ 
            transfResult[i] = transfChain[i];
            timeResult[i] = timeChain[i];
            descResult[i] = descChain[i];
        } 
        return (transfArrayLen, thisEvidence.evidenceName, thisEvidence.evidenceHash, transfChain, timeChain, descChain);
    }

    //Function to delete a certain evidence, with the "onlyAdmin" modifier from "Issued" smart contract, which means that only an admin can interact with it
    function deleteEvidence (uint _caseId, uint _evidenceId) public onlyAdmin {
        Evidence.EvidenceInfo storage thisEvidence = caseList[_caseId].evidenceList[_caseId][_evidenceId];

        thisEvidence.evidenceHash = "0x0000000000000000000000000000000000000000000000000000000000000000";   
        thisEvidence.evidenceName = "";                                                                     
        thisEvidence.evidenceDesc = "";                                                                     
        thisEvidence.creator = 0x0000000000000000000000000000000000000000;        
        thisEvidence.dateCreated = "";

        uint transfArrayLen = thisEvidence.transferChain.length;
        for (uint i = 0 ; i < transfArrayLen; i++){
            thisEvidence.transferChain[i] = 0x0000000000000000000000000000000000000000;
            thisEvidence.transferDesc[i] = "";
            thisEvidence.transferTime[i] = "";
        }
        thisEvidence.deleted = true;

        emit IsSuccessful_Evidence(true);
    }
}   