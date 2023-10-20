# ThemisApp & ThemisChain - Digital Forensics Chain of Custody (CoC) Application based on an Ethereum Private Blockchain
For the implementation of this project, the private Ethereum network, "ThemisChain", was developed in the infrastructure ["AWS" (Amazon Web Services)](https://aws.amazon.com). The blockchain infrastructure was implemented through "Geth" and the "PoA" (Proof-of-Authority) consensus algorithm was adopted. The network consists of three (3) nodes with the status of "validator" (the equivalent of "miner" in "PoW"), which, due to the consensus algorithm, are solely responsible for checking and validating the transactions made. The cost of transactions is set to be zero, because blockchain and by extension the chain of custody application, will be used by predefined trusted entities for security and evidence preservation purposes, which means that the size of the data will amount to a large number of megabytes and consequently, will be characterized by high costs.

The model of this project (ThemisApp & ThemisChain) includes two roles: investigator and admin. The tasks of an investigator are to collect the evidence and calculate its hash, which they then pass offline to an admin to enter into the blockchain. This way, any sensitive information remains secure and unaltered. An admin is essentially an investigator with validator rights on the blockchain. An admin's duties include those of an investigator, along with adding a new investigator, adding a new case and its evidence, transferring ownership of a piece of evidence between investigators, and deleting all the aforementioned data from the blockchain. In summary, the role of the admin is the one who has full control over the blockchain and the data entered into it.

The process of creating and then managing the chain of custody begins with the addition of the evidence to the blockchain by the admin. The uniqueness of the evidence remains intact, as it is maintained among all participants in the network. Given the possible inclusion of sensitive data in the evidence, the actual evidence is protected from exposure to the application and thus to the blockchain, therefore only its hash values are stored. Each administrator is able to check the data on the blockchain by calculating a hash value of each piece of evidence and comparing it to the corresponding value stored on the blockchain. 

Below are some screenshots of the application's user interface:

![ThemisAppHomepage](https://github.com/chbandis/ThemisApp_ThemisChain-Digital_Forensics_ChainofCustody_App_based_on_an_Ethereum_Private_Blockchain/assets/91207835/05188df5-6db5-40c9-90dd-cf2e7a4447fb)

![InvestigatorProfile](https://github.com/chbandis/ThemisApp_ThemisChain-Digital_Forensics_ChainofCustody_App_based_on_an_Ethereum_Private_Blockchain/assets/91207835/ce40ecb5-8896-4e38-8c00-a87c3846e07c)

![AddNewInvestigator](https://github.com/chbandis/ThemisApp_ThemisChain-Digital_Forensics_ChainofCustody_App_based_on_an_Ethereum_Private_Blockchain/assets/91207835/d72f0ea8-b1d7-41b5-a2f3-317d0a005425)

![OpenNewCase](https://github.com/chbandis/ThemisApp_ThemisChain-Digital_Forensics_ChainofCustody_App_based_on_an_Ethereum_Private_Blockchain/assets/91207835/074529a2-7a9f-4f3e-9663-d5a5f6233f91)

![ActiveCases](https://github.com/chbandis/ThemisApp_ThemisChain-Digital_Forensics_ChainofCustody_App_based_on_an_Ethereum_Private_Blockchain/assets/91207835/f3f4da46-aaa7-4a67-9b4d-0a221b7e5f95)

![ManageCases](https://github.com/chbandis/ThemisApp_ThemisChain-Digital_Forensics_ChainofCustody_App_based_on_an_Ethereum_Private_Blockchain/assets/91207835/b7bf8b07-c661-43d1-9272-f7a9db4b6906)

![AddCaseEvidence](https://github.com/chbandis/ThemisApp_ThemisChain-Digital_Forensics_ChainofCustody_App_based_on_an_Ethereum_Private_Blockchain/assets/91207835/11be29fb-191f-45b5-9b53-8cddf39c12ef)

![TrackEvidence](https://github.com/chbandis/ThemisApp_ThemisChain-Digital_Forensics_ChainofCustody_App_based_on_an_Ethereum_Private_Blockchain/assets/91207835/d8ef309f-7b0c-444b-a67b-7b8546a1f698)

![EvidenceChainOfCustody](https://github.com/chbandis/ThemisApp_ThemisChain-Digital_Forensics_ChainofCustody_App_based_on_an_Ethereum_Private_Blockchain/assets/91207835/d9d8454b-0015-4ee3-ad54-ff12bd6792d4)

![UseCaseStoryboard](https://github.com/chbandis/ThemisApp_ThemisChain-Digital_Forensics_ChainofCustody_App_based_on_an_Ethereum_Private_Blockchain/assets/91207835/1d6bc5f1-1f17-42f9-88a6-edf3be1bdc41)

**Running the Application**
- [Node.js](https://nodejs.org/en/) should be installed (Python and Visual Studio Build Tools are required).
- [Metamask](https://metamask.io/download/) should be installed.
- The npm install command must be executed to install the necessary modules (Duration 2-5 minutes @ ~30Mbps).
- The RPC URL of ThemisChain is http://18.232.0.78:8545 and the Chain ID is 1997 [The network is not up anymore due to maintenance costs].
- Application url (after running the local server) is http://localhost:3000.

To run the app simply execute the `npm run dev` command inside the application folder to run the **local server** ([lite-server](https://github.com/johnpapa/lite-server)). The result should look like this:

![Lite-serverCommand](https://github.com/chbandis/ThemisApp_ThemisChain-Digital_Forensics_ChainofCustody_App_based_on_an_Ethereum_Private_Blockchain/assets/91207835/e9110781-b1b9-4490-a52f-fec1306ab888)

*The versions of the tools used are: Node.js v18.16.1 - npm v9.7.2*
