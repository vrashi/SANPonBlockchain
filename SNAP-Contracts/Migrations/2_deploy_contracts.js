var Ballot = artifacts.require("snap_sc");

module.exports = function(deployer) {
  deployer.deploy(Ballot,4);
};
