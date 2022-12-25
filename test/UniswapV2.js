const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MaxUint256 } = require("@ethersproject/constants");
const { BigNumber } = require("ethers");
function expandTo18Decimals(value) {
  return BigNumber.from(value).mul(BigNumber.from(10).pow(18));
}
describe("Uniswap Test", function () {
  var UniswapV2Factory;
  var UniswapV2Router02;
  var MyToken;
  var USDT;
  var WETH;
  var UniswapV2Pair;
  it("init", async function () {
    [deployer, user1, user2, user3, user4, user5] = await ethers.getSigners();
  });
  it("deploy", async function () {
    const MyTokenInstance = await ethers.getContractFactory("MyToken");
    MyToken = await MyTokenInstance.deploy();

    const USDTInstance = await ethers.getContractFactory("USDT");
    USDT = await USDTInstance.deploy();

    const WETHInstance = await ethers.getContractFactory("WETH");
    WETH = await WETHInstance.deploy();

    const UniswapV2FactoryInstance = await ethers.getContractFactory(
      "UniswapV2Factory"
    );
    UniswapV2Factory = await UniswapV2FactoryInstance.deploy(deployer.address);

    const UniswapV2Router02Instance = await ethers.getContractFactory(
      "UniswapV2Router02"
    );
    UniswapV2Router02 = await UniswapV2Router02Instance.deploy(
      UniswapV2Factory.address,
      WETH.address
    );

    const UniswapV2PairInstance = await ethers.getContractFactory(
      "UniswapV2Pair"
    );
    UniswapV2Pair = await UniswapV2PairInstance.deploy();

    console.log("UniswapV2Factory  :::::", UniswapV2Factory.address);
    console.log("UniswapV2Router02 :::::", UniswapV2Router02.address);
    console.log("UniswapV2Pair     :::::", UniswapV2Pair.address);
    console.log("MyToken         :::::", MyToken.address);
    console.log("USDT               :::::", USDT.address);
    console.log("WETH         :::::", WETH.address);
  });

  it("mint token", async function () {
    await MyToken.mint(deployer.address, 10000);
    let balance = await MyToken.balanceOf(deployer.address);
    balance = ethers.utils.formatEther(balance);
  });

  it("approve", async function () {
    await MyToken.approve(UniswapV2Router02.address, MaxUint256);
    await USDT.approve(UniswapV2Router02.address, MaxUint256);
  });

  it("addLiquidity", async function () {
    await UniswapV2Router02.addLiquidity(
      USDT.address,
      MyToken.address,
      expandTo18Decimals(100),
      expandTo18Decimals(100),
      expandTo18Decimals(1),
      expandTo18Decimals(1),
      deployer.address,
      Math.floor(Date.now() / 1000) + 100
    );

    const pairAddress = await UniswapV2Factory.getPair(
      USDT.address,
      MyToken.address
    );
    const Pair = UniswapV2Pair.attach(pairAddress);
    const res = await Pair.getReserves();
    console.log(res);
  });

  it("addLiquidityETH", async function () {
    await UniswapV2Router02.addLiquidityETH(
      MyToken.address,
      expandTo18Decimals(10),
      expandTo18Decimals(1),
      expandTo18Decimals(1),
      deployer.address,
      Math.floor(Date.now() / 1000) + 100,
      { value: expandTo18Decimals(10) }
    );

    const pairAddress = await UniswapV2Factory.getPair(
      MyToken.address,
      WETH.address
    );
    const Pair = UniswapV2Pair.attach(pairAddress);
    const res = await Pair.getReserves();
    console.log(res);
  });

  it("swapExactTokensForTokens", async function () {
    await UniswapV2Router02.addLiquidity(
      USDT.address,
      MyToken.address,
      expandTo18Decimals(100),
      expandTo18Decimals(100),
      expandTo18Decimals(1),
      expandTo18Decimals(1),
      deployer.address,
      Math.floor(Date.now() / 1000) + 100
    );

    const pairAddress = await UniswapV2Factory.getPair(
      USDT.address,
      MyToken.address
    );
    const Pair = UniswapV2Pair.attach(pairAddress);
    const oldres = await Pair.getReserves();
    console.log("oldres: ", oldres);

    await UniswapV2Router02.swapExactTokensForTokens(
      expandTo18Decimals(10),
      expandTo18Decimals(1),
      [MyToken.address, USDT.address],
      deployer.address,
      Math.floor(Date.now() / 1000) + 100
    );

    const newres = await Pair.getReserves();
    console.log("newres: ", newres);
  });

  it("remove liquidity", async function () {
    const pairAddress = await UniswapV2Factory.getPair(
      MyToken.address,
      WETH.address
    );
    const Pair = UniswapV2Pair.attach(pairAddress);
    const res = await Pair.getReserves();

    await UniswapV2Router02.removeLiquidity(
      USDT.address,
      MyToken.address,
      res,
      expandTo18Decimals(1),
      expandTo18Decimals(1),
      deployer.address,
      Math.floor(Date.now() / 1000) + 100
    );
  });
});
