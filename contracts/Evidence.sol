// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Evidence {

    //Evidence info struct (used in "Case" smart contract)
    struct EvidenceInfo {
        bytes evidenceHash;
        string evidenceName;
        string evidenceDesc;
        address creator;
        string dateCreated;
        address[] transferChain;
        string[] transferDesc;
        string[] transferTime;
        bool deleted; //default false
    } 
}