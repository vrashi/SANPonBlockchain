//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.21 <0.7.0;

contract Migrations {
  address public bureaucrat;
  uint public last_completed_migration;

  constructor() public
  {
    bureaucrat = msg.sender;
  }

  modifier restricted()
  {
    if (msg.sender == bureaucrat) _;
  }

  function setCompleted(uint completed) public restricted
  {
    last_completed_migration = completed;
  }
}