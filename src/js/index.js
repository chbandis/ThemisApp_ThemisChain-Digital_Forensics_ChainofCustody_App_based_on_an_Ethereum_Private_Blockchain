App = {
    
  web3Provider: null,
  contracts: {},

  load: async () => {
    //Load necessary app functions
    await App.loadWeb3();
    await App.loadIssuedContract();
    await App.loadInvestigatorContract();
    await App.loadAccount();
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

  loadAccount: async () => {
    //Set the current blockchain account
    App.account = web3.eth.accounts[0];
    web3.eth.defaultAccount=web3.eth.accounts[0];

    const investigator = await App.investigator.investigatorList(App.account);
    const admin = await App.issued.adminList(App.account);    

    if (web3.eth.defaultAccount.length > 0) {
      //Check if the connected account does not belong to an admin or a registered investigator 
      //else redirect to investigator page.
      if (investigator[0] != App.account && admin[0] != App.account){
        alert("You are not registered yet!");         
      } else {
        setTimeout(function() {
          window.location.href = "investigator.html";
        }, 1500);
      }
    }
  }
}
$(() => {
  //Load the App object
  $(window).load(() => {
    App.load()
  })
})