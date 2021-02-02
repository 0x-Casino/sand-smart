//SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "./ClaimERC721AndERC1155WithERC20.sol";
import "../common/BaseWithStorage/WithAdmin.sol";

/// @title MultiGiveaway contract.
/// @notice This contract manages multiple ERC721,ERC1155 and ERC20 claims.
contract MultiGiveawayWithERC20 is WithAdmin, ClaimERC721AndERC1155WithERC20 {
    bytes4 private constant ERC1155_RECEIVED = 0xf23a6e61;
    bytes4 private constant ERC1155_BATCH_RECEIVED = 0xbc197c81;
    bytes4 internal constant ERC721_RECEIVED = 0x150b7a02;
    bytes4 internal constant ERC721_BATCH_RECEIVED = 0x4b808c46;

    mapping(address => mapping(bytes32 => bool)) public claimed;
    mapping(bytes32 => uint256) public expiryTime;

    constructor(address admin) {
        _admin = admin;
        expiryTime[merkleRoot] = expiryTime;
    }

    /// @notice Function to set the merkle root hash for the claim data, if it is 0.
    /// @param merkleRoot The merkle root hash of the claim data.
    function setMerkleRoot(bytes32 merkleRoot) external onlyAdmin {
        // require(_merkleRoot == 0, "MERKLE_ROOT_ALREADY_SET"); // TODO:
        _merkleRoot = merkleRoot;
    }

    /// @notice Function to permit the claiming of multiple tokens to a reserved address.
    /// @param to The intended recipient (reserved address) of the tokens.
    /// @param assetIds The array of IDs of the ERC1155 tokens.
    /// @param assetValues The amounts of each ERC1155 token ID to transfer.
    /// @param assetContractAddresses The contract address for each ERC1155 token ID.
    /// @param landIds The array of IDs of the ERC721 tokens.
    /// @param landContractAddresses The contract address for each ERC721 token ID.
    /// @param erc20Amounts The array of amounts of the ERC20 tokens.
    /// @param erc20ContractAddresses The contract address for each ERC20 token ID.
    /// @param proof The proof submitted for verification.
    /// @param salt The salt submitted for verification.
    function claimMultipleTokens(
        address to,
        uint256[] calldata assetIds,
        uint256[] calldata assetValues,
        address[] calldata assetContractAddresses,
        uint256[] calldata landIds,
        address[] calldata landContractAddresses,
        uint256[] calldata erc20Amounts,
        address[] calldata erc20ContractAddresses,
        bytes32[] calldata proof,
        bytes32 salt
    ) external {
        require(block.timestamp < _expiryTime, "CLAIM_PERIOD_IS_OVER");
        require(to != address(0), "INVALID_TO_ZERO_ADDRESS");
        require(claimed[to][_merkleRoot] == false, "DESTINATION_ALREADY_CLAIMED");
        claimed[to][_merkleRoot] = true;
        _claimMultipleTokens(
            to,
            assetIds,
            assetValues,
            assetContractAddresses,
            landIds,
            landContractAddresses,
            erc20Amounts,
            erc20ContractAddresses,
            proof,
            salt
        );
    }

    function onERC721Received(
        address, /*operator*/
        address, /*from*/
        uint256, /*id*/
        bytes calldata /*data*/
    ) external pure returns (bytes4) {
        return ERC721_RECEIVED;
    }

    function onERC721BatchReceived(
        address, /*operator*/
        address, /*from*/
        uint256[] calldata, /*ids*/
        bytes calldata /*data*/
    ) external pure returns (bytes4) {
        return ERC721_BATCH_RECEIVED;
    }

    function onERC1155Received(
        address, /*operator*/
        address, /*from*/
        uint256, /*id*/
        uint256, /*value*/
        bytes calldata /*data*/
    ) external pure returns (bytes4) {
        return ERC1155_RECEIVED;
    }

    function onERC1155BatchReceived(
        address, /*operator*/
        address, /*from*/
        uint256[] calldata, /*ids*/
        uint256[] calldata, /*values*/
        bytes calldata /*data*/
    ) external pure returns (bytes4) {
        return ERC1155_BATCH_RECEIVED;
    }
}
