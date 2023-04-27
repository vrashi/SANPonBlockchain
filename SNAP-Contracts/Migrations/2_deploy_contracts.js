var Ballot = artifacts.require("snap_sc");

module.exports = function(deployer) {
  deployer.deploy(snap_sc,4);
};
