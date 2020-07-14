const {runCommonTests} = require("./subTests/common_tests");
const {runEtherTests} = require("./subTests/ether_tests");
const {runSandTests} = require("./subTests/sand_tests");

runCommonTests();
runEtherTests();
runSandTests();
