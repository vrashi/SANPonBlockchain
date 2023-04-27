App =
{
    // top level varaibles
    web3: null,
    contracts: {},
    //development
    url:'http://127.0.0.1:7545',
    network_id:1337,
    sender:null,
    receiver:null,
    value:1000000000000000000,
    index:0,
    margin:10,
    left:15,
    init: function()
    {
      return App.initWeb3();
    },
    
    initWeb3: function()
    {   
      //initializing web3      
      if (typeof web3 !== 'undefined') {
        App.web3 = new Web3(Web3.givenProvider);
      } else {
        App.web3 = new Web3(App.url);
      }
      ethereum.enable();      
      return App.initContract();  
    },

    initContract: function()
    {   
      $.getJSON('snap-sc.json', function(data)
      {       
        App.contracts.Payment = new App.web3.eth.Contract(data.abi, data.networks[App.network_id].address, {});
        //populating contract's balance
        App.web3.eth.getBalance(App.contracts.Payment._address).then((res)=>{ jQuery('#channel_balance').text(App.web3.utils.fromWei(res),"ether");})   
      }) 
           
      return App.bindEvents();
    },  
  
    bindEvents: function()
    {  
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
  
    //Function for magic number to be set by merchants
    setMagic:function(num)
    {  
      if(typeof(num) != typeof(1))
      {
        alert('Please correct the magic number.');
        return false;
      }
      App.contracts.Payment.methods.setMagicNumber(num)
    },


    //Function for users to request tickets from the bureaucrat
    requestTickets:function(amount)
    {
      if(typeof(amount) != typeof(1))
      {
        alert('Please correct the requested amount.');
        return false;
      }
      //Run the SC
      App.contracts.Payment.methods.requestProvisionChange(amount)
      
      //Record off-chain
      const fs = require('fs');
      let data = App.contracts.Payment._address+" formally requests "+amount+" Succuleux.";
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
      if(typeof(amount) != typeof(1))
      {
        alert('Please correct the amount');
        return false;
      }
      App.contracts.Payment.methods.transferTickets(address, amount)
    },

    //Function for bureaucrats approving requests
    approve:function (address, amount)
    {     
      if(typeof(amount) != typeof(1))
      {
        alert('Please correct the amount');
        return false;
      }
      App.contracts.Payment.methods.transferTickets(address, amount)
    },

    //Function for bureaucrats denying requests
    deny:function (address)
    {     
      alert('Request Denied!');
      return false;
    }
  }
  
  $(function()
  {
    $(window).load(function()
    {
      App.init();
      toastr.options =
      {
        "positionClass": "right newtoast",
        "preventDuplicates": true,
        "closeButton": true
      };
    });
  });