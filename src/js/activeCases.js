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

  render: async () => {       
    //If the connected account belongs to an administrator, call the insertAdminSidebar() function to load the full sidebar
    const admin = await App.issued.adminList(App.account);

    if (admin[0] == App.account) {
      App.insertAdminSidebar();
    }
  },

  renderCase: async () => { 
    //Load active cases and add them to "caseTable"
    const table = document.getElementById('caseTable');
    const totalCases = await App.Case.caseId();
  
    for (let i = 1; i <= totalCases; i++){   
      //Get active cases from the activeCases() function of the "Case" smart contract   
      let caseInfo = await App.Case.activeCases(i, App.account);

      //Assign the returned values to variables 
      let caseNum = caseInfo[0].toNumber();
      let caseName = caseInfo[1];
      let caseDesc = caseInfo[2];
      let caseCreator = caseInfo[3];
      let creationDate = caseInfo[4];
      let caseClosed = caseInfo[5];

      if (caseNum != 0 && caseClosed === false) {
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
        let caseCreatorContainer = row.insertCell(3);
        caseCreatorContainer.innerHTML = caseCreator;  
        let creationDateContainer = row.insertCell(4);
        creationDateContainer.innerHTML = creationDate;                           
      }           
    }    
  },

  showCaseDesc: async (caseDesc) => {
    //Function to show case description modal content
    document.querySelector('.modal-body').innerHTML = caseDesc;

    //Clear caseDesc modal content when modal is closed
    $("#caseDescModal").on("hidden.bs.modal", function () {
      document.querySelector('.modal-body').innerHTML = "";
    });
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