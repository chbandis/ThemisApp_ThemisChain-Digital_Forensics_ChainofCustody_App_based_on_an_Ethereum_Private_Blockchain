App = {
    
  web3Provider: null,
  contracts: {},

  load: async () => {
    //Load necessary app functions
    await App.loadWeb3();
    await App.loadAccount();
    await App.loadIssuedContract();
    await App.loadCaseContract();
    await App.render();
  },

  loadWeb3: async () => {
    //Connect to blockchain using web3.js library
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        await window.ethereum.request({ method: "eth_requestAccounts"});
      } catch (error) {
        console.error("User denied account access");
      }
    } else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://18.232.0.78:8545');
    }
    web3 = new Web3(App.web3Provider);       
  },
  
  loadAccount: async () => {
    //Set the current blockchain account
    App.account = web3.eth.accounts[0];
  },

  loadIssuedContract: async () => {
    //Create a JavaScript version of the Issued smart contract
    const issued = await $.getJSON('Issued.json');
    App.contracts.Issued = TruffleContract(issued);
    App.contracts.Issued.setProvider(App.web3Provider);

    App.issued = await App.contracts.Issued.deployed();
  },

  loadCaseContract: async () => {
    //Create a JavaScript version of the Case smart contract
    const Case = await $.getJSON('Case.json');
    App.contracts.Case = TruffleContract(Case);
    App.contracts.Case.setProvider(App.web3Provider);

    App.Case = await App.contracts.Case.deployed();
  },

  render: async () => { 
    //If the connected account belongs to an administrator, call the insertAdminSidebar() function to load the full sidebar
    //else show "Access Denied" message
    const admin = await App.issued.adminList(App.account);

    if (admin[0] == App.account) {
      App.insertAdminSidebar();
    } else {
      alert("Access Denied!");
      window.location.href = "index.html";  
    }
  },

  addEvidence: async () => {
    //Get the values of the input fields
    const caseId = $('#caseId').val();
    const evidenceHash = $('#evidenceHash').val();
    const evidenceName = $('#evidenceName').val();
    const evidenceDesc = $('#evidenceDesc').val();
    const evidenceCreator = App.account;
    const dateCreated = new Date().toLocaleString();

    if (isNaN(caseId)) {  //Check if caseID value is a number
      alert("Case ID is not valid"); 
    } else {
      const caseExists = await App.Case.caseExists(caseId); //Call caseExists() function from the the "Case" smart contract to check if the case exists
      
      //Call evidenceCount() function from the "Case" smart contract to count the total number of evidences of the particular case
      const evidenceCount = await App.Case.evidenceCount(caseId);
      let evidenceHashResult;
      let evidenceExists;
      
      for (let j = 0; j < evidenceCount; j++) {
        evidenceHashResult = await App.Case.getEvidenceHash(caseId, j);
        if (evidenceHashResult === "0x" + evidenceHash) { //Check if there is already an evidence with the same hash
          evidenceExists = true;                          //By using the "0x" prefix, it is immediately apparent that the value is a hexadecimal string,
      }                                                   //making it easier to handle and interpret Ethereum-specific data.
      }

      //Form Validation
      if (caseExists === false || caseId == 0) {
        alert("There is no case with id: " + caseId);
      } else if (!/^[0-9a-f]{64}$/i.test(evidenceHash)) {
        alert("Evidence Hash is not a valid SHA256 hash!");
      } else if (evidenceExists === true) {
        alert("There is already an evidence with the same hash!");
      } else if (/\d/.test(evidenceName)) {
        alert ("Evidence Name is not valid!");
      } else if (caseId == "" || evidenceHash == "" || evidenceName == "" || evidenceDesc == "") {
        alert ("All fields are required!");
      } else {
        try {
          //Send a transaction to addCaseEvidence() function of the "Case" smart contract
          await App.Case.addCaseEvidence(caseId, "0x" + evidenceHash, evidenceName, evidenceDesc, evidenceCreator, dateCreated, {from: App.account});
          
          //Call IsSuccessful_Evidence event from the "Case" smart contract and watch for its result
          const eventEvidenceSuccess = App.Case.IsSuccessful_Evidence();
          eventEvidenceSuccess.watch(async function(error, res) {            
            if (!error && res.args.result === true) {
              alert("Success");    
            }
          });
        } catch {
          alert("Something went wrong");
        }    
      }
    }    
  },

  insertAdminSidebar: async () => {
    //Admin Sidebar function
    const adminSidebar = document.getElementById("sidebar");
    adminSidebar.insertAdjacentHTML("beforeend", ` 
      <li>
        <a href="./newcase.html" id="newCaseMenuItem">
          <img src="/img/new-case.png" alt=""/>
          <span class="nav-item">Open new Case</span>
        </a>
        <span class="tooltip">Open new Case</span>
      </li>
          
      <li>
        <a href="./addInvestigator.html">
          <img src="/img/add-investigator.png" alt=""/>
          <span class="nav-item">Add new Investigator</span>
        </a>
        <span class="tooltip">Add new Investigator</span>
      </li>
        
      <li>
        <a href="./addevidence.html">
          <img src="/img/add-evidence.png" alt=""/>
          <span class="nav-item">Add new Evidence</span>
        </a>
        <span class="tooltip">Add new Evidence</span>
      </li>
          
      <li>
        <a href="./manageinvestigators.html">
          <img src="/img/investigator.png" alt=""/>
          <span class="nav-item">Manage Investigators</span>
        </a>
        <span class="tooltip">Manage Investigators</span>
      </li>

      <li>
        <a href="./managecases.html">
          <img src="/img/cases.png" alt=""/>
          <span class="nav-item">Manage Cases</span>
        </a>
        <span class="tooltip">Manage Cases</span>
      </li>`);
  }
}
$(() => {
  //Load the App object
  $(window).on('load', () => {
    App.load()
  })
})