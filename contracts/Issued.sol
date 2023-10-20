// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Issued {

    //Administrator counter
    uint public adminCounter;

    //Administrator info struct
    struct AdminInfo {
        address walletAddress;
        string fullName;
        string email;
        uint mobile;
        string dob;
    }

    //Administrator lists
    mapping(address => AdminInfo) public adminList;
    mapping(uint => AdminInfo) public adminCountList; //This list is used by the admins to render every administrator info

    //Constructor used to create three administrators with the setAdminInfo() function. These addresses correspond to the authorized nodes of the private blockchain (ThemisChain)
    constructor() {
        setAdminInfo(0xEd2DE21F55Fb1c2Fd8d56f1Cf2A33998030dc9Ac, "Christos Bandis", "chr.bandis@gmail.com", 6973979235, "1997-02-20"); //Node 0
        setAdminInfo(0x038573b4588805551f475d737Dad9b91b5a17025, "Admin NodeOne", "admin@nodeone.com", 6999999999, "1997-01-01"); //Node 1
        setAdminInfo(0x86f565572b9331025CC5a0861cd6F4A3d7b134dF, "Admin NodeTwo", "admin@nodetwo.com", 6900000000, "1997-01-02"); //Node 2
    }

    //onlyAdmin modifier used in "Investigator" and "Case" smart contracts
    modifier onlyAdmin() {
        require(adminList[msg.sender].walletAddress == msg.sender, "You are not allowed");
        _;
    }

    //Private function to add an administrator (can be called only within this smart contract)
    function setAdminInfo (address _walletAddress, string memory _fullname, string memory _email, uint _mobile, string memory _dob) private {
        adminList[_walletAddress].walletAddress = _walletAddress;
        adminList[_walletAddress].fullName = _fullname;
        adminList[_walletAddress].email = _email;
        adminList[_walletAddress].mobile = _mobile;
        adminList[_walletAddress].dob = _dob;

        adminCountList[adminCounter].walletAddress = _walletAddress;
        adminCountList[adminCounter].fullName = _fullname;
        adminCountList[adminCounter].email = _email;
        adminCountList[adminCounter].mobile = _mobile;
        adminCountList[adminCounter].dob = _dob;

        adminCounter++;
    }

    //Function to check if an administrator exists
    function adminExists (address _walletAddress) public view returns (bool) {
        if (adminList[_walletAddress].walletAddress == _walletAddress) {
            return true;
        } else {
            return false;
        }
    }
}