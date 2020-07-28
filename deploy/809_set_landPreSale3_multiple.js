module.exports = async ({getChainId, getNamedAccounts, deployments}) => {
  const {call, sendTxAndWait, log} = deployments;

  const chainId = await getChainId();

  const {landSaleAdmin} = await getNamedAccounts();

  const sand = await deployments.getOrNull("Sand");
  if (!sand) {
    throw new Error("no Sand contract deployed");
  }
  const land = await deployments.getOrNull("Land");
  if (!land) {
    throw new Error("no Land contract deployed");
  }

  for (let sector = 4; sector < 10; sector++) {
    const landSaleName = "LandPreSale_3_" + sector;
    const landSale = await deployments.getOrNull(landSaleName);
    if (!landSale) {
      throw new Error(`no ${landSaleName} contract deployed`);
    }

    const isMinter = await call("Land", "isMinter", landSale.address);
    if (!isMinter) {
      log(`setting ${landSaleName} as Land minter`);
      const currentLandAdmin = await call("Land", "getAdmin");
      await sendTxAndWait(
        {from: currentLandAdmin, gas: 1000000, skipUnknownSigner: true},
        "Land",
        "setMinter",
        landSale.address,
        true
      );
    }

    const isDAIEnabled = await call(landSaleName, "isDAIEnabled");
    if (!isDAIEnabled) {
      log(`enablingDAI for ${landSaleName}`);
      const currentLandSaleAdmin = await call(landSaleName, "getAdmin");
      await sendTxAndWait(
        {from: currentLandSaleAdmin, gas: 1000000, skipUnknownSigner: true},
        landSaleName,
        "setDAIEnabled",
        true
      );
    }

    if (chainId == 4) {
      continue; // skip on chainId 4 as we changed the admin and do not care for old presales
    }
    const currentAdmin = await call(landSaleName, "getAdmin");
    if (currentAdmin.toLowerCase() !== landSaleAdmin.toLowerCase()) {
      log(`setting ${landSaleName} Admin`);
      await sendTxAndWait(
        {from: currentAdmin, gas: 1000000, skipUnknownSigner: true},
        landSaleName,
        "changeAdmin",
        landSaleAdmin
      );
    }
  }
};
