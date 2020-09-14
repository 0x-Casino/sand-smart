const {guard} = require("../lib");

module.exports = async ({getNamedAccounts, deployments}) => {
  const {deploy} = deployments;
  const {deployer} = await getNamedAccounts();

  await deploy("SANDRewardPool", {
    from: deployer,
    args: [],
    log: true,
  });
};
module.exports.skip = guard(["1", "314159", "4"]); // TODO "SANDRewardPool"
module.exports.tags = ["SANDRewardPool"];
