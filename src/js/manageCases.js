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
    await App.render();
    await App.renderCase();
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
    $('#addEvidenceModal').on('hidden.bs.modal', function () {
      $(this)
        .find("input,textarea")
            .val('')
            .end();
      });
      
    //Clear addInvestigator modal contents when modal is closed
    $('#addInvestigatorModal').on('hidden.bs.modal', function () {
      $(this)
        .find("input,textarea")
            .val('')
            .end();
    });

    //Clear removeInvestigator modal contents when modal is closed
    $('#removeInvestigatorModal').on('hidden.bs.modal', function () {
      $(this)
        .find("input,textarea")
            .val('')
            .end();
    })
  },

  renderCase: async () => {       
    //Load cases and add them to "caseTable"
    const table = document.getElementById('caseTable');
    const totalCases = await App.Case.caseId();
  
    for (let i = 1; i <= totalCases; i++){      
      //Get case from the caseList of the "Case" smart contract
      let caseInfo = await App.Case.caseList(i);

      //Assign the returned values to variables 
      let caseNum = caseInfo[0].toNumber();
      let caseName = caseInfo[1];
      let caseDesc = caseInfo[2];
      let creationDate = caseInfo[4];
      let caseClosed = caseInfo[5];

      //Get case investigator
      let caseInvestigators = await App.Case.getCaseInvestigators(i);
      let caseInvestigatorsLen = caseInvestigators[1];

      if (caseClosed === false) {
        let row = table.insertRow();
        let caseNumContainer = row.insertCell(0);
        caseNumContainer.innerHTML = caseNum;
        let caseNameContainer = row.insertCell(1);
        caseNameContainer.innerHTML = caseName;
        let caseDescContainer = row.insertCell(2);
        caseDescContainer.innerHTML = `
          <div class="col-sm-12 text-center">
            <button type="submit" class="btn btn-secondary" id="readDescBtn" data-toggle="modal" data-target="#caseDescModal" onclick='App.showCaseDesc(\"${caseDesc}\")'>Read Description</button>
          </div>`;
        let caseInvestigatorsContainer = row.insertCell(3);
          for (let j = 0; j < caseInvestigatorsLen; j++) {
            //Check if investigator 's address isn 't undefined and empty
            if (caseInvestigators[0][j] != undefined && caseInvestigators[0][j] != '0x0000000000000000000000000000000000000000') {
              caseInvestigatorsContainer.innerHTML += caseInvestigators[0][j] + "<br>";
            }
          }
        let creationDateContainer = row.insertCell(4);
        creationDateContainer.innerHTML = creationDate;  
        let addEvidenceContainer = row.insertCell(5);   //Create addEvidenceModal, addInvestigatorModal and removeInvestigatorModal buttons
        addEvidenceContainer.innerHTML = `
          <div class="col-sm-12 text-center">            
            <button type='button' class='openEvidenceModal btn btn-outline-success' data-toggle='modal' data-id=${caseNum} data-target='#addEvidenceModal'>
              <i class="fa fa-plus" aria-hidden="true"></i>
            </button>
          </div>`;  
        let addInvestigatorBtnContainer = row.insertCell(6);            
        addInvestigatorBtnContainer.innerHTML = `
          <div class="col-sm-12 text-center">            
            <button type='button' class='openAddModal btn btn-outline-success' data-toggle='modal' data-id=${caseNum} data-target='#addInvestigatorModal'>
              <i class="fa fa-plus" aria-hidden="true"></i>
            </button>                                                                                        
            <button type='button' class='openRemoveModal btn btn-outline-danger' data-toggle='modal' data-id=${caseNum} data-target='#removeInvestigatorModal'>
              <i class="fa fa-minus" aria-hidden="true"></i>
            </button>
          </div>`;  
        let caseStatusContainer = row.insertCell(7);            
        caseStatusContainer.innerHTML = `
          <div class="col-sm-12 text-center" id="closeIcon">
            <button type='button' class='btn btn-outline-danger' onclick='App.closeCase(\"${caseNum}\", \"${caseName}\")'>
              <i class="fa fa-ban" aria-hidden="true"></i>
            </button>
          </div>`;  
      }            
    }

    //Event listeners to pass caseId to the corresponding function on button click
    $(document).on("click", ".openEvidenceModal", function () {
      var caseId = $(this).data('id');
      $("#addCaseEvidenceBtnContainer #addEvidenceBtn").click(function(){ 
        App.addEvidence(caseId); 
        return false; 
      });
    });

    $(document).on("click", ".openAddModal", function () {
      var caseId = $(this).data('id');
      $("#addCaseInvestigatorBtnContainer #addInvBtn").click(function(){ 
        App.addInvestigator(caseId); 
        return false; 
      });
    });

    $(document).on("click", ".openRemoveModal", function () {
      var caseId = $(this).data('id');
      $("#removeCaseInvestigatorBtnContainer #removeInvBtn").click(function(){ 
        App.removeInvestigator(caseId); 
        return false; 
      });
    });  
  },

  showCaseDesc: async (caseDesc) => {
    //Function to show case description modal content
    document.querySelector('.modal-body').innerHTML = caseDesc;

    //Clear caseDesc modal content when modal is closed
    $("#caseDescModal").on("hidden.bs.modal", function () {
      document.querySelector('.modal-body').innerHTML = "";
    });
  },

  addEvidence: async (caseId) => {
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
    if (evidenceExists === true) {
      alert("There is already an evidence with the same hash");
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
  },

  addInvestigator: async (caseNum) => {
    //Get the value of the addWalletAddress input field
    const walletAddress = $('#addWalletAddress').val();

    //Call investigatorExists() function from the "Investigator" smart contract to check if there is already an investigator with the same wallet address
    const investigatorExists = await App.investigator.investigatorExists(walletAddress);
    
    //Call adminExists() function from the "Issued" smart contract to check if there is already an administrator with the same wallet address
    const adminExists = await App.issued.adminExists(walletAddress);
    
    //Call invExistsInCase() function from the "Case" smart contract to check if the case has already been assigned to the investigator  
    const invExistsInCase = await App.Case.invExistsInCase(caseNum, walletAddress);
  
    //Form Validation
    if (!/^(0x)?[0-9a-f]{40}$/i.test(walletAddress)) {
      alert("Wallet Address is not valid"); 
    } else if (investigatorExists === true || adminExists === true) {
      if (invExistsInCase === false) {
        try {
          //Send a transaction to addCaseInvestigator() function of the "Case" smart contract
          await App.Case.addCaseInvestigator(caseNum, walletAddress, {from: App.account});

          //Call IsSuccessful_Investigator event from the "Case" smart contract and watch for its result
          const eventSuccess = App.Case.IsSuccessful_Investigator();
          eventSuccess.watch(async function(error, res) {            
            if (!error && res.args.result === true) {
              if(!alert("Success")) {             
                  window.location.reload();                
              }
            }
          });
        } catch {
          alert("Something went wrong");
        }
      } else {
        alert("This case has already been assigned to this investigator!");
      }  
    } else {
      alert("Wallet Address does not exist!");
    }
  },

  removeInvestigator: async (caseNum) => {
    //Get the value of the removeWalletAddress input field
    const walletAddress = $('#removeWalletAddress').val();

    //Call investigatorExists() function from the "Investigator" smart contract to check if there is already an investigator with the same wallet address
    const investigatorExists = await App.investigator.investigatorExists(walletAddress);
   
    //Call adminExists() function from the "Issued" smart contract to check if there is already an administrator with the same wallet address
    const adminExists = await App.issued.adminExists(walletAddress);
    
    //Call invExistsInCase() function from the "Case" smart contract to check if the case has already been assigned to the investigator
    const invExistsInCase = await App.Case.invExistsInCase(caseNum, walletAddress);

    //Form Validation
    if (!/^(0x)?[0-9a-f]{40}$/i.test(walletAddress)) {
      alert("Wallet Address is not valid"); 
    } else if (investigatorExists === true || adminExists === true) {
      if (invExistsInCase === true) {
        if (confirm("Remove Investigator: " + walletAddress + "?")) {
          try {
            //Send a transaction to removeCaseInvestigator() function of the "Case" smart contract
            await App.Case.removeCaseInvestigator(caseNum, walletAddress, {from: App.account});

            //Call IsSuccessful_Investigator event from the "Case" smart contract and watch for its result
            const eventSuccess = App.Case.IsSuccessful_Investigator();
            eventSuccess.watch(async function(error, res) {            
              if (!error && res.args.result === true) {
                if(!alert("Success")) {             
                    window.location.reload();                
                }
              }
            });            
          } catch {
            alert("Something went wrong");
          }
        }  
      } else {
        alert("The case has not been assigned to an investigator with this address!");
      }  
    } else {
      alert("Wallet Address does not exist!");
    }    
  },

  closeCase: async (caseNum, caseName) => {
    //Display a confirmation alert
    if (confirm("Close #" + caseNum + " " + caseName + "?")) {
      try {
        //Send a transaction to closeCase() function of the "Case" smart contract
        await App.Case.closeCase(caseNum, {from: App.account});

        if(!alert("Success")) {                    
          setTimeout(function() {
              window.location.reload();
          }, 2000);
        }
      } catch {
        alert("Something went wrong");
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