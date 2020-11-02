//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.7.1;

import "./AdminUpgradeabilityProxy.sol";
import "../BaseWithStorage/Ownable.sol";

contract ProxyAdmin is Ownable {
    AdminUpgradeabilityProxy proxy;

    constructor(AdminUpgradeabilityProxy _proxy, address payable _owner) public Ownable(_owner) {
        proxy = _proxy;
    }

    function proxyAddress() public view returns (address) {
        return address(proxy);
    }

    function admin() public returns (address) {
        return proxy.admin();
    }

    function changeAdmin(address newAdmin) public onlyOwner {
        proxy.changeAdmin(newAdmin);
    }

    function upgradeTo(address implementation) public onlyOwner {
        proxy.upgradeTo(implementation);
    }

    function upgradeToAndCall(address implementation, bytes memory data) public payable onlyOwner {
        // prettier-ignore
        proxy.upgradeToAndCall{value:msg.value}(implementation, data);
    }
}
