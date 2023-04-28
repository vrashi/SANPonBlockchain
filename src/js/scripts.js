//Refrenced from metamask documentation
async function initWeb3New(operation)
{
    if (window.ethereum)
    {
        window.web3=new
        Web3(window.ethereum);
        await window.ethereum.enable();
        const accounts=await
        web3.eth.getAccounts();
        console.log(accounts[0]);
    }
    else
    {
        alert("no metamask installed");
    }

    switch (operation)
    {
        case 0:
            //Register as an applicant
            break;
        case 1:
            //Register as an merchant
            break;
        case 2:
            //Set magic number
            let magicnumber = document.getElementById('magicnum').value;
            App.contracts.Payment.methods.setMagicNumber(num)
            break;
        case 3:
            //Request Succuleux
            break;
        case 4:
            //Transfer Succuleux
            break;
        case 5:
            //Approve Succuleux Request
            break;
        case 6:
            //Deny Succuleux Request
            break;
        default:
          alert("Invalid Operation. Please do not modify Javascript.");
    }
}
/*!
* Start Bootstrap - Small Business v5.0.6 (https://startbootstrap.com/template/small-business)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-small-business/blob/master/LICENSE)
*/
// This file is intentionally blank
// Use this file to add JavaScript to your project