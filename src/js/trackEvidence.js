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
        let accounts = await web3.eth.getAccounts();
        App.account = accounts[0];
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
        const admin = await App.issued.adminList(App.account);

        if (admin[0] == App.account) {
            App.insertAdminSidebar();
        } 

        //Clear transferOwnership modal contents when modal is closed
        $('#transferOwnershipModal').on('hidden.bs.modal', function () {
            $(this)
                .find("input,textarea")
                    .val('')
                    .end();
            transferDate = "";
        })
    },

    renderEvidence: async () => { 
        //Every time this function is called, create a new table
        const $evidenceCollapsedTable = $('#evidenceCollapsedContainer');
        $evidenceCollapsedTable.find('#evidenceCollapsedTable').html(`
            <thead>
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Evidence Name</th>
                    <th scope="col">Evidence Hash</th>
                    <th scope="col">Dated Created</th>
                    <th scope="col">Expand</th>
                </tr>
            </thead>
            <tbody id="evidenceInfo"></tbody>`);

        $('#evidenceCollapsedContainer').append($evidenceCollapsedTable);
        $evidenceCollapsedTable.show();

        //Every time this function is called, clear the evidenceExpanded table contents
        const $pageContainer = $('#pageContainer');
        $pageContainer.find('#evidenceExpandedTable').html(``);
        $pageContainer.find('#evidenceBtns').html(``);
        $('#pageContainer').append($pageContainer);
        $pageContainer.show();

        //Get the value of the "caseId" input field     
        const caseId = document.getElementById("caseId").value;

        //Call evidenceCount() function from the "Case" smart contract to count the total number of evidences of the particular case
        const evidenceCount = await App.Case.evidenceCount(caseId);
        
        //Call adminExists() function from the "Issued" smart contract to check if there is already an administrator with the same wallet address
        const adminExists = await App.issued.adminExists(App.account);

        //Call invExistsInCase() function from the "Case" smart contract to check if the case has already been assigned to the investigator
        const invExistsInCase = await App.Case.invExistsInCase(caseId, App.account);
        
        if (invExistsInCase === true || adminExists === true) {
            if (evidenceCount == 0){    //Check if there is evidence for this case
                alert("There is currently no evidence for case #" + caseId);
            } else {
                for (let i = 0; i < evidenceCount; i++){    //For every evidence found, call renderEvidenceCollapsed() function
                    App.renderEvidenceCollapsed(caseId, i);
                }
            }
        } else {
            alert("You are now allowed to view Case #" + caseId + " evidence!");
        }
    },

    renderEvidenceCollapsed: async (caseId, evidenceId) => { 
        const evidenceTable = document.getElementById('evidenceInfo');
   
        //Get the evidence info from the getCaseEvidenceCollapsed() function of the "Case" smart contract
        let evidence = await App.Case.getCaseEvidenceCollapsed(caseId, evidenceId);

        //Assign the returned values to variables 
        let evidenceNum = evidenceId+1;
        let evidenceHash = evidence[0];
        let evidenceName = evidence[1];
        let dateCreated = evidence[2];
        let isDeleted = evidence[3];

        if (isDeleted === false && evidenceName != "") { //If the evidence is not deleted, add its info to the table
            let row = evidenceTable.insertRow();
            let evidenceNumContainer = row.insertCell(0);
            evidenceNumContainer.innerHTML = evidenceNum;
            let evidenceNameContainer = row.insertCell(1);
            evidenceNameContainer.innerHTML = evidenceName;
            let evidenceHashContainer = row.insertCell(2);
            evidenceHashContainer.innerHTML = evidenceHash;
            let dateCreatedContainer = row.insertCell(3);
            dateCreatedContainer.innerHTML = dateCreated;
            let expandEvidenceBtnContainer = row.insertCell(4);            
            expandEvidenceBtnContainer.innerHTML = `
                <div class="col-sm-12 text-center">            
                    <button type='button' class='btn btn-outline-success' id='expandBtn' onclick='App.renderEvidenceExpanded(${caseId},${evidenceId})'>
                        <i class="fa fa-expand" aria-hidden="true"></i>
                    </button>
                </div>`;  
        } 
    },

    renderEvidenceExpanded: async (caseId, evidenceId) => {               
        //Get the evidence info from the getCaseEvidenceExpanded() function of the "Case" smart contract
        const evidence = await App.Case.getCaseEvidenceExpanded(caseId, evidenceId);

        //Get the current owner of the evidence from the getCurrentOwner() function of the "Case" smart contract
        const currentOwner = await App.Case.getCurrentOwner(caseId, evidenceId);

        //Assign the returned values to variables 
        const evidenceNum = evidenceId+1;
        const evidenceHash = evidence[0];
        const evidenceName = evidence[1];
        const evidenceDesc = evidence[2];
        const evidenceCreator = evidence[3];
        const dateCreated = evidence[4];
        
        //Append the above variables along with the transferOwnership, viewChainOfCustody and deleteEvidence buttons to the evidenceExpanded table
        const $pageContainer = $('#pageContainer');
        $pageContainer.find('#evidenceExpandedTable').html(`
            <tbody>
                <tr>
                    <th scope="col">Evidence #</th>
                    <td>${evidenceNum}</td>
                </tr>
                <tr>
                    <th scope="col">Evidence Name</th>
                    <td>${evidenceName}</td>
                </tr>
                <tr>
                    <th scope="col">Evidence Hash</th>
                    <td>${evidenceHash}</td>
                </tr>
                <tr>
                    <th scope="col">Evidence Description</th>
                    <td style="white-space:pre-wrap">${evidenceDesc}</td>
                </tr>
                <tr>
                    <th scope="col">Dated Created</th>
                    <td>${dateCreated}</td>
                </tr>
                <tr>
                    <th scope="col">Evidence Creator</th>
                    <td>${evidenceCreator}</td>
                </tr>
                <tr>
                    <th scope="col">Current Owner</th>
                    <td>${currentOwner}</td>
                </tr>
            </tbody>
            <tbody id="evidenceExpandedInfo"></tbody>`);

        $pageContainer.find('#evidenceBtns').html(`
            <div class="form-group row">
                <div class="col-sm-4 text-center">
                    <button name="transferOwnershipBtn" type="button" class="openTransferOwnershipModal btnStyle btn btn-primary" id="transferOwnershipBtn"  data-toggle="modal" data-transfer='{"case":${caseId}, "evidence":${evidenceId}}' data-target="#transferOwnershipModal">Transfer Ownership</button>
                </div>
                <div class="col-sm-4 text-center">
                    <button name="viewChainOfCustodyBtn" type="button" class="openChainOfCustodyModal btnStyle btn btn-primary" id="viewChainOfCustodyBtn" data-toggle="modal" data-target="#chainOfCustodyModal" onclick='App.viewChainOfCustody(${caseId}, ${evidenceId})'>View Chain of Custody</button>
                </div>
                <div class="col-sm-4 text-center">
                    <button name="deleteEvidenceBtn" type="button" class="btnStyle btn btn-primary" id="deleteEvidenceBtn" onclick='App.deleteEvidence(\"${caseId}\", \"${evidenceId}\", \"${evidenceName}\")'>Delete Evidence</button>
                </div>
            </div>`);
            
        $('#pageContainer').append($pageContainer);
        $pageContainer.show();

        //Call the adminExists() function of the "Issued" smart contract to check if the connected account is an admin
        const adminExists = await App.issued.adminExists(App.account);
        if (adminExists === false) {    //If the connected account is not an admin then disable transferOwnership and deleteEvidence buttons
            transferOwnershipBtn.disabled = true;
            deleteEvidenceBtn.disabled = true;
        }

        //Event listener to pass caseId and evidenceId to the transferOwnership() function on button click
        $(document).on("click", ".openTransferOwnershipModal", function () {
            var caseId = $(transferOwnershipBtn).data('transfer').case;
            var evidenceId = $(transferOwnershipBtn).data('transfer').evidence;
            $("#transferOwnershipBtnContainer #transferOwnershipBtnModal").click(function(){ 
                App.transferOwnership(caseId, evidenceId); 
                return false; 
            });
        });        
    },

    transferOwnership: async (caseId, evidenceId) => {
        //Get the values of the input fields
        const transferTo = document.getElementById("walletAddress").value;
        const transferDesc = document.getElementById("transferDesc").value;
        const transferDate = new Date().toLocaleString([], {
                                    hour12: false,
                                });
 
        //Call investigatorExists() function from the "Investigator" smart contract to check if there is already an investigator with the same wallet address
        const investigatorExists = await App.investigator.investigatorExists(transferTo);

        //Call adminExists() function from the "Issued" smart contract to check if there is already an administrator with the same wallet address
        const adminExists = await App.issued.adminExists(transferTo);

        //Get the current owner of the evidence from the getCurrentOwner() function of the "Case" smart contract
        const currentOwner = await App.Case.getCurrentOwner(caseId, evidenceId);
        
        //Form Validation
        if (transferTo == "" || transferDesc == "") {
            alert ("All fields are required!");
        } else if (!/^(0x)?[0-9a-f]{40}$/i.test(transferTo)) {
            alert("Wallet Address is not valid"); 
        } else if (investigatorExists === true || adminExists === true) {
            if (currentOwner === transferTo) {
                alert("This investigator is already the current owner of the evidence");
            } else {
                try {
                    //Send a transaction to transferEvidence() function of the "Case" smart contract
                    await App.Case.transferEvidence(caseId, evidenceId, transferTo, transferDesc, transferDate, {from: App.account});
                    
                    if(!alert("Success")) { 
                        setTimeout(function() {
                            window.location.reload();    
                        }, 2000);
                    }
                } catch {
                    alert("Something went wrong");
                }  
            }
        } else {
            alert("Wallet Address does not exist!");
        }
    },

    viewChainOfCustody: async (caseId, evidenceId) => {
        //Call viewChainOfCustody() function from the "Case" smart contract to get the chain of custody of the particular evidence
        const chain = await App.Case.viewChainOfCustody(caseId, evidenceId);
        
        //Assign the returned values to variables 
        const arrayLength = chain[0];
        const evidenceName = chain[1];
        const evidenceHash = chain[2];        
        const transferedTo = chain[3];
        const transfDate = chain[4];
        const transfDesc = chain[5];
   
        //Get the length (number of transfers) of the chain of custody modal 
        const transfTimeline = document.getElementById('timeline');
        let timelineLen = document.getElementsByClassName('vtimeline-point').length
        
        if (timelineLen === 0) {    //If the length is 0 then show the data. This check was applied because each time the function was
            for (let i = 0; i < arrayLength; i++) {                         //called, the contents of the modal multiplied
                transfTimeline.insertAdjacentHTML("beforeend", `
                    <div class="vtimeline-point">
                        <div class="vtimeline-icon">
                            <i class="fa fa-exchange" aria-hidden="true"></i>
                        </div>
                        <div class="vtimeline-block">
                            <span class="vtimeline-date">${transfDate[i]}</span>
                            <div class="vtimeline-content">                                                                        
                                <h3>${evidenceName}</h3>
                                <h6>${evidenceHash}</h6>
                                <ul class="post-meta list-inline">
                                    <li class="list-inline-item">
                                        <i class="fa fa-user-circle-o"></i>
                                        <a href='/investigator.html?addr=${transferedTo[i]}' style='color: inherit; text-decoration: inherit;'>&nbsp;Transfered To: <h6>${transferedTo[i]}</h6></a>
                                    </li>
                                    <li class="list-inline-item">
                                        <i class="fa fa-calendar-o"></i>&nbsp;${transfDate[i]}
                                    </li>
                                </ul>
                                <p id="transferDescription"> 
                                    <i class="fa fa-info" aria-hidden="true"></i>&nbsp;Transfer Description<br>
                                        ${transfDesc[i]}
                                </p><br>
                            </div>
                        </div>
                    </div>`);
            }
        }
    },

    deleteEvidence: async (caseId, evidenceId, evidenceName) => {
        //Parse the integer of the evidenceId and add 1 to it
        const evidId = parseInt(evidenceId) + 1;

        //Display a confirmation alert
        if (confirm("Delete evidence #" + evidId + " " + evidenceName + "?")) {
          try {
            //Send a transaction to deleteEvidence() function of the "Case" smart contract
            await App.Case.deleteEvidence(caseId, evidenceId, {from: App.account});

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