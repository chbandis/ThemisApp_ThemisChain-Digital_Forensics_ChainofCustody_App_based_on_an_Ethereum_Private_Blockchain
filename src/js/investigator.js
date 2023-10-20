App = {
    
  web3Provider: null,
  contracts: {},

  load: async () => {
    //Load necessary app functions
    await App.loadWeb3();
    await App.loadAccount();
    await App.loadIssuedContract();
    await App.loadInvestigatorContract();
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

  loadInvestigatorContract: async () => {
    //Create a JavaScript version of the Investigator smart contract
    const investigator = await $.getJSON('Investigator.json');
    App.contracts.Investigator = TruffleContract(investigator);
    App.contracts.Investigator.setProvider(App.web3Provider);

    App.investigator = await App.contracts.Investigator.deployed();
  },

  loadCaseContract: async () => {
    //Create a JavaScript version of the Case smart contract
    const Case = await $.getJSON('Case.json');
    App.contracts.Case = TruffleContract(Case);
    App.contracts.Case.setProvider(App.web3Provider);

    App.Case = await App.contracts.Case.deployed();
  },

  render: async () => {
    //Get investigator info based on the connected wallet account from the investigatorList of the "Investigator" smart contract   
    const investigator = await App.investigator.investigatorList(App.account);

    //Get administrator info based on the connected wallet account from the adminList of the "Issued" smart contract   
    const admin = await App.issued.adminList(App.account);

    //Get the passed parameters of the url
    const urlParams = new URLSearchParams(document.location.search);
    const passedAddress = urlParams.get("addr");
    
    //Check if the connected account does not belong to an admin or a registered investigator 
    //and redirect to index page.
    if (investigator[0] != App.account && admin[0] != App.account){
      alert("You are not registered yet!");
      window.location.href = "index.html";           
    } else if (investigator[0] == App.account) {  //If the connected account belongs to an investigator, pass the address to renderInvestigatorInfo() function
      document.getElementById('first-box').style.minWidth = "unset";  //CSS correction
      App.renderInvestigatorInfo(investigator[0]); 
    } else if (urlParams.has('addr')) {   //If there is a passed parameter (a wallet address) in the url, then pass it to renderInvestigatorInfo() function
      document.getElementById('first-box').style.minWidth = "unset";  //If the passed address belongs to an administrator and the connected wallet
      App.renderInvestigatorInfo(passedAddress);                      //belongs to an investigator, then the investigator won't see admins info 
    } else if (admin[0] == App.account) {   //If the connected account belongs to an administrator, call the renderAdminInfo() function
      document.getElementById('first-box').style.minWidth = "unset";  
      App.renderAdminInfo();   
    }

    //If the connected account belongs to an administrator, call the insertAdminSidebar() function to load the full sidebar
    if (admin[0] == App.account) {
      App.insertAdminSidebar();
    }
  },

  renderInvestigatorInfo: async (address) => { 
    //Get investigator from the investigatorList of the "Investigator" smart contract
    const investigator = await App.investigator.investigatorList(address);

    //Assign the returned values to variables 
    const walletAddress = investigator[0];
    const investigatorId = investigator[1];
    const fullName = investigator[2];
    const email = investigator[3];
    const mobile = investigator[4];
    const dob = investigator[5];
    const issuedBy = investigator[6];

    const totalCases = await App.Case.caseId();
    let activeCaseCounter = 0;
    for (let i = 1; i <= totalCases; i++) {
      let activeCases = await App.Case.activeCases(i, address);
      let caseNum = activeCases[0]; //If no case has been assigned to the investigator, then this 
      if (caseNum != 0 ) {          //function will return caseId (or caseNum) equal to 0
        activeCaseCounter += 1;
      }
    }

    //Replace the contents of each HTML element with the corresponding variable
    document.getElementById('walletAddressTop').innerText = walletAddress;
    document.getElementById('walletAddress').innerText = walletAddress;
    document.getElementById('fullNameTop').innerText = fullName;
    document.getElementById('fullName').innerText = fullName;
    document.getElementById('investigatorIdTop').innerText += investigatorId;
    document.getElementById('investigatorId').innerText += investigatorId;
    document.getElementById('email').innerText = email;
    document.getElementById('mobile').innerText = mobile;
    document.getElementById('dob').innerText = dob;
    document.getElementById('activeCases').innerText = activeCaseCounter;
    document.getElementById('issuedBy').innerText = issuedBy;

    //CTA (call to action) email button
    const emailBtn = document.getElementById('email-btn');
    emailBtn.onclick = function() {
      var link = `mailto:\"${email}\"`;     
      window.location.href = link;
    }

    //CTA (call to action) mobile button
    const callBtn = document.getElementById('call-btn');
    callBtn.onclick = function() {
      var link = `tel:\"${mobile}\"`;     
      window.location.href = link;
    }
  },

  renderAdminInfo: async () => {    
    //Get the administrator from the adminList of the "Issued" smart contract
    const admin = await App.issued.adminList(App.account);

    //Assign the returned values to variables 
    const walletAddress = admin[0];
    const fullName = admin[1];
    const email = admin[2];
    const mobile = admin[3];
    const dob = admin[4];

    const totalCases = await App.Case.caseId();
    let activeCaseCounter = 0;
    for (let i = 1; i <= totalCases; i++) {
      let activeCases = await App.Case.activeCases(i, walletAddress);
      let caseNum = activeCases[0]; //If no case has been assigned to the administrator, then this 
      if (caseNum != 0 ) {          //function will return caseId (or caseNum) equal to 0
        activeCaseCounter += 1;
      }
    }

    //Replace the contents of each HTML element with the corresponding variable
    document.getElementById('walletAddressTop').innerText = walletAddress;
    document.getElementById('walletAddress').innerText = walletAddress;
    document.getElementById('fullNameTop').innerText = fullName;
    document.getElementById('fullName').innerText = fullName;
    document.getElementById('investigatorIdTop').innerText = "Admin";
    document.getElementById('investigatorId').innerText = "Admin";
    document.getElementById('email').innerText = email;
    document.getElementById('mobile').innerText = mobile;
    document.getElementById('dob').innerText = dob;
    document.getElementById('activeCases').innerText = activeCaseCounter;
    document.getElementById('hrIssuedBy').style.display="none"; //Set the display attribute of these elements to none so they won 't be visible 
    document.getElementById('rowIssuedBy').style.display="none";

    //CTA (call to action) email button
    const emailBtn = document.getElementById('email-btn');
    emailBtn.onclick = function() {
      var link = `mailto:\"${email}\"`;     
      window.location.href = link;
    }

    //CTA (call to action) mobile button
    const callBtn = document.getElementById('call-btn');
    callBtn.onclick = function() {
      var link = `tel:\"${mobile}\"`;     
      window.location.href = link;
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