App =
{
  web3: null,
  contracts: {},
  address: "",
  network_id: 3, // 5777 for local
  handler: null,
  value: 1000000000000000000,
  index: 0,
  margin: 10,
  left: 15,
  init: function ()
  {
    return App.initWeb3();
  },

  initWeb3: function ()
  {
    if (typeof web3 !== "undefined")
    {
      App.web3 = new Web3(Web3.givenProvider);
    }
    else
    {
      App.web3 = new Web3(App.url);
    }
    ethereum.request({ method: "eth_requestAccounts" });
    return App.initContract();
  },

  initContract: function ()
  {
    App.contracts.snap_sc = new App.web3.eth.Contract(App.abi, App.address, {});
    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on("click", "#regapplicant", function () {
      App.handleInitialization(jQuery("#Initialize").val());
    });

    $(document).on("click", "#getCounter", function () {
      App.handleGet();
    });
    $(document).on("click", "#incrementCounter", function () {
      App.handleIncrement(jQuery("#Increment").val());
    });
    $(document).on("click", "#decrementCounter", function () {
      App.handleDecrement(jQuery("#Decrement").val());
    });
    App.populateAddress();
  },

  populateAddress: async function () {
    const accounts = await App.web3.eth.getAccounts();
    App.handler = accounts[0];
  },

  handleInitialization: function (counterValue) {
    if (counterValue === "") {
      toastr.error("Please enter a valid initializing value.", "Reverted!");
      return false;
    }
    var option = { from: App.handler };
    App.contracts.snap_sc.methods
      .initialize(counterValue)
      .send(option)
      .on("receipt", (receipt) => {
        toastr.success("Success! Counter is set to " + counterValue);
      })
      .on("error", (err) => {
        toastr.error(App.getErrorMessage(err), "Reverted!");
      });
  },

  handleGet: function () {
    App.contracts.snap_sc.methods
      .get()
      .call()
      .then((r) => {
        jQuery("#counter_value").text(r);
      })
      .catch((err) => {
        toastr.error(App.getErrorMessage(err), "Reverted!");
      });
  },

  handleIncrement: function (incrementValue) {
    if (incrementValue === "") {
      toastr.error("Please enter a valid incrementing value.", "Reverted!");
      return false;
    }
    var option = { from: App.handler };
    App.contracts.snap_sc.methods
      .increment(incrementValue)
      .send(option)
      .on("receipt", (receipt) => {
        toastr.success("Success! Counter is incremented by " + incrementValue);
      })
      .on("error", (err) => {
        toastr.error(App.getErrorMessage(err), "Reverted!");
      });
  },

  handleDecrement: function (decrementValue) {
    if (decrementValue === "") {
      toastr.error("Please enter a valid decrementing value.", "Reverted!");
      return false;
    }
    var option = { from: App.handler };
    App.contracts.snap_sc.methods
      .decrement(decrementValue)
      .send(option)
      .on("receipt", (receipt) => {
        toastr.success("Success! Counter is decremented by " + decrementValue);
      })
      .on("error", (err) => {
        toastr.error(App.getErrorMessage(err), "Reverted!");
      });
  },

  getErrorMessage: function (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    let errorReason = "";

    if (errorCode === 4001) {
      return "User rejected the request!";
    } else if (
      errorMessage.includes("Access Denied: user is not the contract deployer!")
    ) {
      return "Access Denied: The address calling this function is not the deployer!";
    } else if (
      errorMessage.includes(
        "Access Denied: counterPhase is not at Initialized!"
      )
    ) {
      return "Access Denied: Counter has not been initialized!";
    } else {
      return "Unexpected Error!";
    }
  },

  abi: [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "int256",
          "name": "n",
          "type": "int256"
        }
      ],
      "name": "decrement",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "get",
      "outputs": [
        {
          "internalType": "int256",
          "name": "",
          "type": "int256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "int256",
          "name": "n",
          "type": "int256"
        }
      ],
      "name": "increment",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "int256",
          "name": "x",
          "type": "int256"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
};

$(function () {
  $(window).load(function () {
    App.init();
    toastr.options = {
      closeButton: true,
      debug: false,
      newestOnTop: false,
      progressBar: false,
      positionClass: "toast-bottom-full-width",
      preventDuplicates: false,
      onclick: null,
      showDuration: "300",
      hideDuration: "1000",
      timeOut: "5000",
      extendedTimeOut: "1000",
      showEasing: "swing",
      hideEasing: "linear",
      showMethod: "fadeIn",
      hideMethod: "fadeOut",
    };
  });
});

/* Detect when the account on metamask is changed */
window.ethereum.on("accountsChanged", () => {
  App.populateAddress();
});

/* Detect when the network on metamask is changed */
window.ethereum.on("chainChanged", () => {
  App.populateAddress();
});
