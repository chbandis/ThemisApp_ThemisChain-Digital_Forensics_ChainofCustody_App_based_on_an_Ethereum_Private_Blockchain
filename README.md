# ThemisApp & ThemisChain - Digital Forensics Chain of Custody (CoC) Application based on an Ethereum Private Blockchain (Solidity)
This project, utilizing the robustness of blockchain technology and more specifically, the blockchain platform “Ethereum”, attempts to explore the potential synergies between private blockchain and chain of custody applications, with the aim of developing an innovative and reliable solution for digital forensic investigations. This solution includes the creation of a private blockchain, tailored to the specific requirements of digital forensic applications, as well as the development of a decentralized chain of custody application designed to record and monitor the movement and management of digital evidence throughout the investigation process. 

## Table of Contents
- [Features](#features)
- [Objectives](#objectives)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Running the Application](#running-the-application)
- [Screenshots](#sreenshots)
- [Contact](#contact)

## Features
- **Generating evidence:** The role of the admin is the sole responsible for adding the evidence to the blockchain, enhancing the security and reliability of the digital forensic process. To add a piece of evidence, the admin must enter the required details, namely its hash generated through the SHA-256 algorithm, the name of the evidence and a brief description about it. Once the evidence is added, then the admin can transfer the ownership of it to the investigator who found it.
- **Transfer of ownership of evidence:** By facilitating the seamless collaboration and information flow between the stakeholders involved, the proposed system supports the secure transfer of evidence between investigators. It is also a function that only the admin role is capable of performing. In order to transfer evidence, the admin is asked to enter the address of the recipient and a short description stating the purpose of the transfer. It then updates the corresponding smart contract and adds the event to the chain of custody of the evidence.
- **Access to evidence:** Access to the evidence in question is available to investigators assigned to the case to which the evidence belongs, whether or not they are involved in the chain of custody of the evidence. However, none of them has the ability to make any changes.

## Objectives
- **Confidentiality:** Protecting data confidentiality by limiting the fact that an investigator cannot gain access to cases and evidence that are outside his or her jurisdiction.
- **Access control:** Only investigators registered by the default administrators have access to the application. 
- **Integrity and Controllability:** Guarantee the integrity and auditability of data on the blockchain, to prevent tampering and facilitate its control.
- **Traceability:** Tracing the source of the evidence, to the extent that the evidence was added to the case under investigation.
- **Efficiency:** By default, the transaction costs are eliminated, so as not to burden the investigators using the application, as the main concern of the system is to ensure that it works properly, giving the best return on digital forensics data management.
- **Easy-to-use user interface:** In the field of digital forensics, where accuracy and efficiency are paramount, a user interface that is easy to manage improves user engagement, minimizes user familiarization time and reduces errors. It also ensures that users can navigate the application effortlessly, leading to faster task completion and fewer errors.

## Project Structure
For the implementation of this project, the private Ethereum network, "ThemisChain", was developed in the infrastructure ["AWS" (Amazon Web Services)](https://aws.amazon.com). The blockchain infrastructure was implemented through "Geth" and the "PoA" (Proof-of-Authority) consensus algorithm was adopted. The network consists of three (3) nodes with the status of "validator" (the equivalent of "miner" in "PoW"), which, due to the consensus algorithm, are solely responsible for checking and validating the transactions made. The cost of transactions is set to be zero, because blockchain and by extension the chain of custody application, will be used by predefined trusted entities for security and evidence preservation purposes, which means that the size of the data will amount to a large number of megabytes and consequently, will be characterized by high costs.

The model of this project (ThemisApp & ThemisChain) includes two roles: investigator and admin. The tasks of an investigator are to collect the evidence and calculate its hash, which they then pass offline to an admin to enter into the blockchain. This way, any sensitive information remains secure and unaltered. An admin is essentially an investigator with validator rights on the blockchain. An admin's duties include those of an investigator, along with adding a new investigator, adding a new case and its evidence, transferring ownership of a piece of evidence between investigators, and deleting all the aforementioned data from the blockchain. In summary, the role of the admin is the one who has full control over the blockchain and the data entered into it.

The process of creating and then managing the chain of custody begins with the addition of the evidence to the blockchain by the admin. The uniqueness of the evidence remains intact, as it is maintained among all participants in the network. Given the possible inclusion of sensitive data in the evidence, the actual evidence is protected from exposure to the application and thus to the blockchain, therefore only its hash values are stored. Each administrator is able to check the data on the blockchain by calculating a hash value of each piece of evidence and comparing it to the corresponding value stored on the blockchain. 

## Technologies Used
- AWS (Amazon Web Services)
- Geth (Go Ethereum)
- Ganache
- Truffle
- Solidity
- HTML5, CSS3, Javascript
- Node.js
- Web3.js
- Chai

## Screenshots

![ThemisAppHomepage](https://github.com/chbandis/ThemisApp_ThemisChain-Digital_Forensics_ChainofCustody_App_based_on_an_Ethereum_Private_Blockchain/assets/91207835/977ad025-f590-41cc-95e9-c1b53602a4ab)

![InvestigatorProfile](https://github.com/chbandis/ThemisApp_ThemisChain-Digital_Forensics_ChainofCustody_App_based_on_an_Ethereum_Private_Blockchain/assets/91207835/d089ae21-1ac1-4aae-94f0-58699a114173)

![addNewInvestigator](https://github.com/chbandis/ThemisApp_ThemisChain-Digital_Forensics_ChainofCustody_App_based_on_an_Ethereum_Private_Blockchain/assets/91207835/f047b725-9f6c-432f-96ee-bbb7dacccdb6)

![OpenNewCase](https://github.com/chbandis/ThemisApp_ThemisChain-Digital_Forensics_ChainofCustody_App_based_on_an_Ethereum_Private_Blockchain/assets/91207835/8980197c-400c-43ca-909a-17c768e61de1)

![ActiveCases](https://github.com/chbandis/ThemisApp_ThemisChain-Digital_Forensics_ChainofCustody_App_based_on_an_Ethereum_Private_Blockchain/assets/91207835/b98f8ea3-b7c2-408e-9302-1edf3d72696a)

![ManageCases](https://github.com/chbandis/ThemisApp_ThemisChain-Digital_Forensics_ChainofCustody_App_based_on_an_Ethereum_Private_Blockchain/assets/91207835/f3b0285c-09f1-468f-aed2-a1794d6496de)

![AddCaseEvidence](https://github.com/chbandis/ThemisApp_ThemisChain-Digital_Forensics_ChainofCustody_App_based_on_an_Ethereum_Private_Blockchain/assets/91207835/f55bd8e7-221f-4eec-9db7-193eaba08a5b)

![TrackEvidence](https://github.com/chbandis/ThemisApp_ThemisChain-Digital_Forensics_ChainofCustody_App_based_on_an_Ethereum_Private_Blockchain/assets/91207835/4f1008d0-9113-4b88-b014-722254b7b59b)

![EvidenceChainOfCustody](https://github.com/chbandis/ThemisApp_ThemisChain-Digital_Forensics_ChainofCustody_App_based_on_an_Ethereum_Private_Blockchain/assets/91207835/54c4753f-01c8-4113-bea3-5e5cc55dad2b)

![UseCaseStoryboard](https://github.com/chbandis/ThemisApp_ThemisChain-Digital_Forensics_ChainofCustody_App_based_on_an_Ethereum_Private_Blockchain/assets/91207835/b4c374f4-2e1e-48d1-afb6-3b5b297e97ab)

## Running the Application
- [Node.js](https://nodejs.org/en/) should be installed (Python and Visual Studio Build Tools are required).
- [Metamask](https://metamask.io/download/) should be installed.
- The npm install command must be executed to install the necessary modules (Duration 2-5 minutes @ ~30Mbps).
- The RPC URL of ThemisChain is http://18.232.0.78:8545 and the Chain ID is 1997 [The network is not up anymore due to maintenance costs].
- Application url (after running the local server) is http://localhost:3000.

To run the app simply execute the `npm run dev` command inside the application folder to run the **local server** ([lite-server](https://github.com/johnpapa/lite-server)). The result should look like this:

![Lite-serverCommand](https://github.com/chbandis/ThemisApp_ThemisChain-Digital_Forensics_ChainofCustody_App_based_on_an_Ethereum_Private_Blockchain/assets/91207835/e9110781-b1b9-4490-a52f-fec1306ab888)

*The versions of the tools used are: Node.js v18.16.1 - npm v9.7.2*

## Contact
Feel free to reach out to me via [chr.bandis@gmail.com](mailto:chr.bandis@gmail.com) or connect with me on [LinkedIn](https://www.linkedin.com/in/chbandis/).
