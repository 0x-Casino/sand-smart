const {guard} = require("../lib");
const {getLands} = require("../data/LandPreSale_4_2/getLands");

const fs = require("fs");
const {calculateLandHash} = require("../lib/merkleTreeHelper");

module.exports = async ({getChainId, getNamedAccounts, deployments, network}) => {
  const {deploy} = deployments;
  const chainId = await getChainId();

  const {deployer, landSaleBeneficiary, backendReferralWallet, landSaleFeeRecipient} = await getNamedAccounts();

  const sandContract = await deployments.get("Sand");
  const landContract = await deployments.get("Land");
  const assetContract = await deployments.get("Asset");
  const estateContract = await deployments.get("Estate");

  for (let sector = 11; sector <= 14; sector++) {
    const {lands, merkleRootHash, saltedLands, tree} = getLands(sector, network.live, chainId);
    const landSaleName = "LandPreSale_4_2_" + sector;

    await deploy(landSaleName, {
      from: deployer,
      gas: 3000000,
      linkedData: lands,
      contract: "EstateSaleWithFee",
      args: [
        landContract.address,
        sandContract.address,
        sandContract.address,
        deployer,
        landSaleBeneficiary,
        merkleRootHash,
        2591016400, // TODO
        backendReferralWallet,
        2000,
        estateContract.address,
        assetContract.address,
        landSaleFeeRecipient, // TODO FeeDistributor for 5% fee
      ],
      log: true,
    });

    const landsWithProof = [];
    for (const land of saltedLands) {
      land.proof = tree.getProof(calculateLandHash(land));
      landsWithProof.push(land);
    }
    fs.writeFileSync(`./.presale_4_2_${sector}_proofs_${chainId}.json`, JSON.stringify(landsWithProof, null, "  "));
  }
};
module.exports.skip = guard(["1", "4", "314159"], "LandPreSale_4_2");
module.exports.tags = ["LandPreSale_4_2_multiple"];
module.exports.dependencies = ["Sand", "Land", "DAI", "Asset", "Estate"];
