App = {
    
  web3Provider: null,
  contracts: {},

  load: async () => {
    //Load necessary app functions
    await App.loadWeb3();
    await App.loadAccount();
    await App.loadIssuedContract();
    await App.loadInvestigatorContract();
    await App.render();
    await App.renderInvestigatorInfo();
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

  renderInvestigatorInfo: async () => { 
    //Load investigators and add them to "investigatorTable"
    const table = document.getElementById('investigatorTable');
    const totalAdmins = await App.issued.adminCounter();
    const totalInvestigators = await App.investigator.investigatorCounter();

    for (let i = 0; i < totalAdmins; i++){
      //Get admins from the adminCountList() function of the "Issued" smart contract 
      let admin = await App.issued.adminCountList(i);

      //Assign the returned values to variables 
      let walletAddress = admin[0];
      let adminId = "Admin";
      let fullName = admin[1];
      let email = admin[2];
      let mobile = admin[3];
      let dob = admin[4];

      let row = table.insertRow();
      let investigatorNumContainer = row.insertCell(0);
      investigatorNumContainer.innerHTML = "-";
      let fullNameContainer = row.insertCell(1);
      fullNameContainer.innerHTML = fullName;
      let investigatorIdContainer = row.insertCell(2);
      investigatorIdContainer.innerHTML = adminId;
      let walletAddressContainer = row.insertCell(3);
      walletAddressContainer.innerHTML = walletAddress;        
      let emailContainer = row.insertCell(4);
      emailContainer.innerHTML = email;
      let mobileContainer = row.insertCell(5);            
      mobileContainer.innerHTML = mobile;               
      let dobContainer = row.insertCell(6);
      dobContainer.innerHTML = dob;
      let issuedByContainer = row.insertCell(7);            
      issuedByContainer.innerHTML = "-";    
      let removeBtnContainer = row.insertCell(8);            
      removeBtnContainer.innerHTML = "-";                
    }        

    for (let i = 1; i <= totalInvestigators; i++){
      //Get investigators from the adminInvestigatorList() function of the "Investigator" smart contract
      let investigator = await App.investigator.adminInvestigatorList(i);

      //Assign the returned values to variables 
      let investigatorNum = i; 
      let walletAddress = investigator[0];
      let investigatorId = investigator[1];
      let fullName = investigator[2];
      let email = investigator[3];
      let mobile = investigator[4].toNumber();
      let dob = investigator[5];
      let issuedBy = investigator[6];

      if (investigatorId != 0) {
        let row = table.insertRow();
        let investigatorNumContainer = row.insertCell(0);
        investigatorNumContainer.innerHTML = investigatorNum;
        let fullNameContainer = row.insertCell(1);
        //Make invastigator 's full name clickable, so the admin can view their profile page 
        fullNameContainer.innerHTML = `<a href='/investigator.html?addr=${walletAddress}' style='color: inherit; text-decoration: inherit;'>${fullName}</a>`;
        let investigatorIdContainer = row.insertCell(2);
        investigatorIdContainer.innerHTML = `#${investigatorId}`;
        let walletAddressContainer = row.insertCell(3);
        walletAddressContainer.innerHTML = walletAddress;        
        let emailContainer = row.insertCell(4);
        emailContainer.innerHTML = email;
        let mobileContainer = row.insertCell(5);            
        mobileContainer.innerHTML = mobile;               
        let dobContainer = row.insertCell(6);
        dobContainer.innerHTML = dob;
        let issuedByContainer = row.insertCell(7);            
        issuedByContainer.innerHTML = issuedBy;    
        let removeBtnContainer = row.insertCell(8);            
        removeBtnContainer.innerHTML = `
          <div class="col-sm-12 text-center">
            <button type='button' class='btn btn-outline-danger' onclick='App.removeInvestigator(\"${walletAddress}\", \"${investigatorNum}\", \"${investigatorId}\", \"${fullName}\")'>
                <i class="fa fa-minus" aria-hidden="true"></i>
            </button>
          </div>`;                  
      }
    }
  },

  removeInvestigator: async (walletAddress, investigatorNum, investigatorId, fullName) => {
    //Display a confirmation alert
    if (confirm("Remove investigator #" + investigatorId + " " + fullName + "?")) {
      try {
        //Send a transaction to removeInvestigator() function of the "Investigator" smart contract
        await App.investigator.removeInvestigator(walletAddress, investigatorNum, {from: App.account});

        //Call IsSuccessful event from the "Investigator" smart contract and watch for its result
        const eventSuccess = App.investigator.IsSuccessful();
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