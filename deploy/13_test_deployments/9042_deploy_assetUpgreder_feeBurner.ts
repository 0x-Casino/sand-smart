import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import {upgradeFee, gemAdditionFee} from '../../data/assetUpgraderFees';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts, getChainId} = hre;
  const {deploy, execute, read} = deployments;

  const AssetAttributesRegistry = await deployments.get(
    'AssetAttributesRegistry'
  );
  const Sand = await deployments.get('Sand');
  const Asset = await deployments.get('Asset');
  const GemsCatalystsRegistry = await deployments.get('GemsCatalystsRegistry');

  const {deployer} = await getNamedAccounts();
  const BURN_ADDRESS = '0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF';

  // @note For testing fee-burning only
  const chainId = await getChainId();
  if (chainId == '31337') {
    await deploy(`AssetUpgraderFeeBurner`, {
      from: deployer,
      log: true,
      args: [
        AssetAttributesRegistry.address,
        Sand.address,
        Asset.address,
        GemsCatalystsRegistry.address,
        upgradeFee,
        gemAdditionFee,
        BURN_ADDRESS,
      ],
    });

    const upgraderFeeBurner = await deployments.get('AssetUpgraderFeeBurner');
    const currentSandAdmin = await read('Sand', 'getAdmin');
    await execute(
      'Sand',
      {from: currentSandAdmin, log: true},
      'setSuperOperator',
      upgraderFeeBurner.address,
      true
    );

    const currentAdmin = await read('GemsCatalystsRegistry', 'getAdmin');
    await execute(
      'GemsCatalystsRegistry',
      {from: currentAdmin, log: true},
      'setSuperOperator',
      upgraderFeeBurner.address,
      true
    );
  }
};
export default func;
func.tags = [
  'AssetUpgraderFeeBurner',
  'AssetUpgraderFeeBurner_deploy',
  'AssetUpgraderFeeBurner_setup',
];
func.dependencies = [
  'AssetAttributesRegistry_deploy',
  'Sand_Deploy',
  'Asset_Deploy',
  'GemsCatalystsRegistry_deploy',
];
