App =
{
    // top level varaibles
    web3: null,
    contracts: {},
    //development
    url:'http://127.0.0.1:7545',
    network_id:5777,
    sender:null,
    receiver:null,
    value:1000000000000000000,
    index:0,
    margin:10,
    left:15,
    account:"",
    init: function()
    {
      return App.initWeb3();
    },
    
    initWeb3: async function()
    {   
      //initializing web3      
      if (typeof web3 !== 'undefined') {
        App.web3 = new Web3(Web3.givenProvider);
      } else {
        App.web3 = new Web3(App.url);
      }
      await ethereum.enable();  
      let accounts = await App.web3.eth.getAccounts();
      console.log(accounts[0]);
      App.account= accounts[0]
      console.log(accounts)
      return App.initContract(); 
      
    },

    initContract: function()
    {   
      $.getJSON('assets/SNAP.json', function(data)
      {   
        console.log(data)    

      //   App.contracts.snap_sc = TruffleContract(data);
      // // Connect provider to interact with contract
      //   App.contracts.snap_sc.setProvider(App.web3Provider);

        App.contracts.snap_sc = new App.web3.eth.Contract(data.abi, data.networks[App.network_id].address, {});
        //populating contract's balance
        App.web3.eth.getBalance(App.contracts.snap_sc._address).then((res)=>{ jQuery('#channel_balance').text(App.web3.utils.fromWei(res),"ether");})   
      }) 
      return App.bindEvents();
    },  
  
    bindEvents: function()
    {  
      //Applicant registration
      $(document).on('click', '#regapplicant', function()
      {
        App.regApp();
      });

      //Merchant registration
      $(document).on('click', '#regmerchant', function()
      {
        App.regMer();
      });

      //Allows the merchant to set a magic number
      $(document).on('click', '#setmagic', function()
      {
        App.setMagic(jQuery('#magicnum').val());
      });

      //Allows an applicant to request additional Succuleux
      $(document).on('click', '#requestbutton', function()
      {
        App.requestTickets(jQuery('#requestamount').val());
      });

      //Allows anybody to transfer tickets to anybody
      $(document).on('click', '#send', function()
      {
         App.transferTokens(jQuery('#receiveaddress').val(), jQuery('#sendamount').val());
      });
  
      //Allows bureaucrat to approve Succuleux requests
      $(document).on('click', '#approve', function()
      {
        App.approve(jQuery('#addressdecision').val(), jQuery('#amountdecision').val());
      });

      //Allows bureaucrat to deny Succuleux requests
      $(document).on('click', '#deny', function()
      {
        App.deny(jQuery('#addressdecision').val());
      });

      //Allows user to view balance
      $(document).on('click', '#viewbalance', function()
      {
        App.viewBalance();
      });

      //Allows bureaucrat to deny Succuleux requests
      $(document).on('click', '#redeemtokens', function()
      {
        App.redeem(jQuery('#bureaucrataddress').val(), jQuery('#redeemamount').val());
      });

      App.populateAddress();
    },

    //Not sure WTF this does?
    populateAddress : function()
    {  
        // getting sender and reciever address and their balances            
        new Web3(App.url).eth.getAccounts((err, accounts) => {
          if(!err)
          {
            App.receiver=accounts[1]; 
            App.sender = accounts[0];         
            jQuery('#receiver').val(App.receiver);
            App.web3.eth.getBalance(accounts[0]).then((res)=>{ jQuery('#sender_balance').text(App.web3.utils.fromWei(res),"ether");});
            App.web3.eth.getBalance(accounts[1]).then((res)=>{ jQuery('#receiver_balance').text(App.web3.utils.fromWei(res),"ether");});      
        }
        else
        {
          console.log('Something went wrong');
        }
          });
    },  

    regApp:function()
    {
      console.log( App.contracts.snap_sc.methods)
      // App.contracts.Payment.deployed().then((instance) => {
      //   console.log(instance);
      //   // return instance.
      // })
      App.contracts.snap_sc.methods.registerApplicant().send({
        from : App.account
      }).then(a => {
        console.log("This happened #6", a);
      }).catch();
    },

    regMer:function()
    {
      App.contracts.snap_sc.methods.registerMerchant().send({
        from : App.account
      });
    },

    //Function for magic number to be set by merchants
    setMagic:function(num)
    {  
      num = Number(num)
      console.log(typeof(num))
      // if(num != "")
      // {
      //   alert('Please correct the magic number.');
      //   return false;
      // }
      App.contracts.snap_sc.methods.setMagicNumber(num).send({from:App.account})
    },

    //Function for users to request tickets from the bureaucrat
    requestTickets: async function(amount)
    {
      // if(typeof(amount) != typeof(1))
      // {
      //   alert('Please correct the requested amount.');
      //   return false;
      // }
      //Run the SC
      await App.contracts.snap_sc.methods.requestProvisionChange(amount).send({from:App.account})
      
      //Record off-chain
      const fs = require('fs');
      let data = App.contracts.snap_sc._address+" formally requests "+amount+" Succuleux.";
      fs.appendFile('requests.txt', data, function (err)
      {
        if (err)
        {
          throw err;
        }
      });
    },
  
    //Function for transferring tickets in any context besides approving provisions
    transferTokens:function (address, amount)
    {     
      // if(typeof(amount) != typeof(1))
      // {
      //   alert('Please correct the amount');
      //   return false;
      // }
      App.contracts.snap_sc.methods.purchaseMeal(address, amount).send({from:App.account})
    },

    redeem:function(address, amount)
    {
      App.contracts.snap_sc.methods.sendToGovt(address, amount).send({from:App.account})
    },

    //Function for bureaucrats approving requests
    approve:function (address, amount)
    {     
      // if(typeof(amount) != typeof(1))
      // {
      //   alert('Please correct the amount');
      //   return false;
      // }
      App.contracts.snap_sc.methods.approveProvisionChange(address).send({from:App.account})
    },

    //Function for bureaucrats denying requests
    deny:function (address)
    {     
      alert('Request Denied!');
      return false;
    },

    viewBalance:function()
    {
      App.contracts.snap_sc.methods.getTokenBalance().send({from:App.account}).then(function(receipt)
      {
        console.log(typeof(receipt));
        document.getElementById('balancebox').innerHTML = receipt;
      })
      //console.log(balance);
      //document.getElementById('balancebox').innerHTML = String(balance);
    }
  }
;
addEventListener("load", (event) => {
  App.init()
});
