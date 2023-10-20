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

  addInvestigator: async () => {     
    //Generate a random 4-digit Investigator ID from 1 to 10           
    let id = "";
    for (let i=0; i<4; i++) { 
        id += Math.floor((Math.random() * 9) +1)
    };

    //Get the values of the input fields
    const walletAddress = $('#walletAddress').val();
    let investigatorId = parseInt(id);
    const fullName = $('#fullName').val();
    const email = $('#email').val();
    const mobile = $('#mobile').val();
    const dob = $('#dob').val();
    const issuerAddress = App.account;

    //Call investigatorExists() function from the "Investigator" smart contract to check if there is already an investigator with the same wallet address
    const investigatorExists = await App.investigator.investigatorExists(walletAddress); 
    
    //Call adminExists() function from the "Issued" smart contract to check if there is already an administrator with the same wallet address
    const adminExists = await App.issued.adminExists(walletAddress);
    
    //Form Validation
    if (investigatorExists === false && adminExists === false) {
      if (!/^(0x)?[0-9a-f]{40}$/i.test(walletAddress)) {
        alert("Wallet Address is not valid");
      } else if(/\d/.test(fullName)){
        alert("Full Name is not valid");
      } else if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
        alert("Email is not valid");
      } else if (isNaN(mobile)) {
        alert("Mobile Number is not valid");
      } else if (walletAddress == "" || fullName == "" || email == "" || mobile == "" || dob == "") {
        alert ("All fields are required!");
      } else {
        try {
          //If the first random 4-digit ID exists, generate a new one  
          const invIdExists = await App.investigator.invIdExists(investigatorId);
          if (invIdExists === true) {
            id = "";
            for (let i=0; i<4; i++) {             
              id += Math.floor((Math.random() * 9) +1)
              investigatorId = parseInt(id);
            }
            //Send a transaction to addInvestigator() function of the "Investigator" smart contract
            await App.investigator.addInvestigator(walletAddress, investigatorId, fullName, email, mobile, dob, issuerAddress, {from: App.account});
          } else {
            await App.investigator.addInvestigator(walletAddress, investigatorId, fullName, email, mobile, dob, issuerAddress, {from: App.account});
          } 

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
    } else {
      alert("There is already an investigator with the same wallet address!");
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