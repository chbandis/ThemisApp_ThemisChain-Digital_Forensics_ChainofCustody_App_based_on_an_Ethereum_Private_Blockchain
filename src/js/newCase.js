App = {
    
  web3Provider: null,
  contracts: {},

  load: async () => {
    //Load necessary app functions
    await App.loadWeb3();
    await App.loadAccount();
    await App.loadIssuedContract();
    await App.loadCaseContract();
    await App.loadInvestigatorContract();
    await App.render()
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
      
  loadInvestigatorContract: async () => {
    //Create a JavaScript version of the Investigator smart contract
    const investigator = await $.getJSON('Investigator.json');
    App.contracts.Investigator = TruffleContract(investigator);
    App.contracts.Investigator.setProvider(App.web3Provider);

    App.investigator = await App.contracts.Investigator.deployed();
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

    //Clear addEvidence modal contents when modal is closed
    $('#addEvidenceModal').on('hidden.bs.modal', function (e) {
      $(this)
        .find("input,textarea")
            .val('')
            .end();
    });

    //Clear addInvestigator modal contents when modal is closed
    $('#addInvestigatorModal').on('hidden.bs.modal', function (e) {
      $(this)
        .find("input,textarea")
            .val('')
            .end();
    });
  },

  openCase: async () => {    
    //Assign submitCaseBtn, addEvidenceBtn and addInvestigatorBtn to variables
    const openCaseBtn = document.getElementById('openCaseBtn');
    const addEvidenceBtn = document.getElementById('addEvidenceBtn');
    const addInvestigatorBtn = document.getElementById('addInvestigatorBtn');
    
    //Get the values of the input fields
    const caseName = $('#caseName').val();
    const caseDesc = $('#caseDesc').val();
    const caseInvestigator = $('#caseInvestigator').val();
    const caseCreator = App.account;
    const creationTime = new Date().toLocaleString();

    //Replace all the characters, that are not included in the following range, with an empty character
    const caseNameCleared = caseName.replace(/[^0-9a-zA-Z]+/g,' ');

    const totalCases = await App.Case.caseId();
    let caseNameExists; 

    for (let i = 0; i < totalCases; i++) {
      let caseNameResult = await App.Case.getCaseName(i);
      if (caseNameResult === caseName) {  //Check if there is arleady a case with the same name
        caseNameExists = true;
      }        
    }

    //Call investigatorExists() function from the "Investigator" smart contract to check if there is already an investigator with the same wallet address
    const investigatorExists = await App.investigator.investigatorExists(caseInvestigator);
    
    //Call adminExists() function from the "Issued" smart contract to check if there is already an administrator with the same wallet address
    const adminExists = await App.issued.adminExists(caseInvestigator);
    
    //Form Validation
    if(/\d/.test(caseNameCleared)){
      alert("Case Name is not valid");
    } else if (!/^(0x)?[0-9a-f]{40}$/i.test(caseInvestigator)) {
      alert("Wallet Address is not valid");
    } else if (caseNameExists === true) {
      alert("There is already a case with the same name!");
    } else if (investigatorExists === false && adminExists === false) { 
      alert("Wallet Address does not exist!");
    } else if (caseName == "" || caseDesc == "" || caseInvestigator == "") {
      alert ("All fields are required!");
    } else {
      try {
        //Send a transaction to openNewCase() function of the "Case" smart contract
        await App.Case.openNewCase(caseNameCleared, caseDesc, caseInvestigator, caseCreator, creationTime, {from: App.account});        
       
        //Call IsSuccessful event from the "Case" smart contract and watch for its result
        const eventSuccess = App.Case.IsSuccessful();      
        eventSuccess.watch(async function(error, res) {            
          if (!error && res.args.result === true) {
            alert("Success");    
            const caseId = res.args.id.c;
            openCaseBtn.disabled = true;    //Disable the submit case button
            addEvidenceBtn.style.display = "block";   //Set the display attribute of these elements to "block" so they will be visible
            addInvestigatorBtn.style.display = "block";

            //Create an addCaseEvidence button within the addEvidence modal
            const addCaseEvidenceBtnContainer = document.getElementById('addCaseEvidenceBtnContainer');
            addCaseEvidenceBtnContainer.insertAdjacentHTML("beforeend", `
              <button name='submit' type='submit' class='btn btn-primary' onclick='App.addCaseEvidence(\"${caseId}\"); return false;'>Add Evidence</button>`)
            
            //Create an addCaseInvestigator button within the addInvestigator modal
            const addCaseInvestigatorBtnContainer = document.getElementById('addCaseInvestigatorBtnContainer');
            addCaseInvestigatorBtnContainer.insertAdjacentHTML("beforeend", `
              <button name='submit' type='submit' class='btn btn-primary' onclick='App.addCaseInvestigator(\"${caseId}\"); return false;'>Add Investigator</button>`);
          } 
        });            
      } catch {
        alert("Something went wrong");
      }       
    }
  },

  addCaseEvidence: async (caseId) => {
    //Get the values of the input fields
    const evidenceHash = $('#evidenceHash').val();
    const evidenceName = $('#evidenceName').val();
    const evidenceDesc = $('#evidenceDesc').val();
    const evidenceCreator = App.account;
    const dateCreated = new Date().toLocaleString();

    //Call evidenceCount() function from the "Case" smart contract to count the total number of evidences of the particular case
    const evidenceCount = await App.Case.evidenceCount(caseId);
    let evidenceHashResult;
    let evidenceExists;
    
    for (let i = 0; i < evidenceCount; i++) {
      evidenceHashResult = await App.Case.getEvidenceHash(caseId, i)
      if (evidenceHashResult === "0x" + evidenceHash) { //Check if there is already an evidence with the same hash
        evidenceExists = true;                          //By using the "0x" prefix, it is immediately apparent that the value is a hexadecimal string,
      }                                                 //making it easier to handle and interpret Ethereum-specific data
    }

    //Form Validation
    if (!/^[0-9a-f]{64}$/i.test(evidenceHash)) {
      alert("Evidence Hash is not a valid SHA256 hash!");
    } else if (evidenceExists === true) {
      alert("There is already an evidence with the same hash");
    } else if (/\d/.test(evidenceName)) {
      alert ("Evidence Name is not valid!");
    } else if (evidenceHash == "" || evidenceName == "" || evidenceDesc == "") {
      alert ("All fields are required!");
    } else {      
      try {
        //Send a transaction to addCaseEvidence() function of the "Case" smart contract
        await App.Case.addCaseEvidence(caseId, "0x" + evidenceHash, evidenceName, evidenceDesc, evidenceCreator, dateCreated, {from: App.account});
        
        //Call IsSuccessful_Evidence event from the "Case" smart contract and watch for its result
        const eventSuccess = App.Case.IsSuccessful_Evidence();        
        eventSuccess.watch(async function(error, res) {            
          if (!error && res.args.result === true) {
            alert("Success");    
          } 
        });            
      } catch {
        alert("Something went wrong");
      }      
    } 
  }, 

  addCaseInvestigator: async (caseId) => {
    //Get the values of the input fields
    const walletAddress = $('#walletaddress').val();
    
    //Call investigatorExists() function from the "Investigator" smart contract to check if there is already an investigator with the same wallet address
    const investigatorExists = await App.investigator.investigatorExists(walletAddress);
    
    //Call adminExists() function from the "Issued" smart contract to check if there is already an administrator with the same wallet address
    const adminExists = await App.issued.adminExists(walletAddress);
    
    //Call invExistsInCase() function from the "Case" smart contract to check if this investigator is already assigned to the case
    const invExistsInCase = await App.Case.invExistsInCase(caseId, walletAddress);
    
    //Form Validation
    if (!/^(0x)?[0-9a-f]{40}$/i.test(walletAddress)) {
      alert("Wallet Address is not valid");
    } else if (investigatorExists === true || adminExists === true) {
      if (invExistsInCase === true) {
        alert("Investigator is already assigned to the case!");
      } else {
        try {
          //Send a transaction to addCaseInvestigator() function of the "Case" smart contract
          await App.Case.addCaseInvestigator(caseId, walletAddress, {from: App.account});

          //Call IsSuccessful_Investigator event from the "Case" smart contract and watch for its result
          const eventSuccess = App.Case.IsSuccessful_Investigator();          
          eventSuccess.watch(async function(error, res) {            
            if (!error && res.args.result === true) {
              alert("Success");   
            } 
          });            
        } catch {
          alert("Something went wrong");
        }      
      }
    } else {
      alert("Wallet Address does not exist!");
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