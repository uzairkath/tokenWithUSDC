const { expect } = require("chai");
const { Wallet, Contract } = require("ethers");
const { ethers, network } = require("hardhat");
const { abi, routerAbi } = require("../constants");
let pmf;
let USDC;
let router02;
let owner, addr1, addr2;

describe("PolyMath", function () {
  it("should deploy the token", async function () {
    owner = await ethers.getSigner();
    addr2 = await ethers.getImpersonatedSigner(
      "0x2Ca3e4EA261A46e753beB149a24fbC0a2b65d74c"
    );
    addr1 = await ethers.getImpersonatedSigner(
      "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621"
    );
    const PMF = await ethers.getContractFactory("PolyMath");
    pmf = await PMF.deploy();
    await pmf.deployed();
    USDC = await ethers.getContractAt(
      abi,
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
    );
    router02 = await ethers.getContractAt(
      routerAbi,
      "0x7a250d5630b4cf539739df2c5dacb4c659f2488d"
    );
  });

  it("should check pair address", async function () {
    const address = await pmf.uniswapV2Pair();
    console.log(address);
  });
  it("should check the balance of impersonated address", async function () {
    const balance = await USDC.balanceOf(owner.getAddress());
    console.log(balance);
  });
  it("should add the liquidity", async function () {
    console.log(await USDC.balanceOf(addr1.address));
    await USDC.connect(addr1).transfer(owner.address, 17774890791318);
    console.log(await USDC.balanceOf(owner.address));
    console.log(pmf.address);
    console.log(USDC.address);
    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const timestampBefore = blockBefore.timestamp;
    console.log(timestampBefore);
    await pmf.approve(router02.address, 1000000);
    await USDC.approve(router02.address, 1000000);
    await router02.addLiquidity(
      pmf.address,
      USDC.address,
      1000000,
      1000000,
      0,
      0,
      owner.getAddress(),
      timestampBefore + 15
    );
  });
  it("should set swap and liquify enabled", async function () {
    await pmf.setSwapAndLiquifyEnabled(true);
    console.log(await pmf.swapAndLiquifyEnabled());
  });

  it("should buy the tokens from the exchange", async function () {
    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const timestampBefore = blockBefore.timestamp;
    await USDC.connect(addr1).approve(router02.address, 1000000);

    let path = [USDC.address, pmf.address];
    for (let i = 1; i <= 100; i++) {
      await router02
        .connect(addr1)
        .swapExactTokensForTokensSupportingFeeOnTransferTokens(
          1000,
          0,
          path,
          addr1.address,
          timestampBefore + 5 * i
        );
    }
    console.log(await pmf.balanceOf(addr1.address));
    console.log(await pmf.balanceOf(pmf.address));
  });

  // it("should swap the tokens for usdc", async function () {
  //   console.log(await USDC.balanceOf(pmf.address));
  //   console.log(await pmf.balanceOf(pmf.address));
  //   await pmf.swapTokensForUSDC(100);
  //   console.log(await USDC.balanceOf(await pmf.usdcManager()));
  // });

  it("should sell the tokens to the exchange", async function () {
    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const timestampBefore = blockBefore.timestamp;
    await pmf.connect(addr1).approve(router02.address, 85219);
    let path = [pmf.address, USDC.address];
    await router02
      .connect(addr1)
      .swapExactTokensForTokensSupportingFeeOnTransferTokens(
        85219,
        0,
        path,
        addr1.address,
        timestampBefore + 20
      );
    console.log(await pmf.balanceOf(addr1.address));
    console.log(await pmf.balanceOf(pmf.address));
  });

  it("should change liquidity fee", async function () {
    // pmf.on("LiquidityFeeChanged", (old, _new, e) => {
    //   let info = {
    //     oldFee: old,
    //     newFee: _new,
    //     data: e,
    //   };
    //   console.log(JSON.stringify(info, null, 2));
    // });

    // await pmf.changeLiquidityFee(5);

    //checking transfer after making changes
    pmf.on(
      "SwapAndLiquify",
      (tokensSwapped, ethReceived, tokensIntoLiqudity, e) => {
        let info = {
          tokensSwapped: tokensSwapped,
          ethReceived: ethReceived,
          tokensIntoLiqudity: tokensIntoLiqudity,
          data: e,
        };
        console.log(JSON.stringify(info, null, 4));
      }
    );
    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const timestampBefore = blockBefore.timestamp;
    await USDC.connect(addr1).approve(router02.address, 1000000);

    let path = [USDC.address, pmf.address];
    for (let i = 1; i <= 100; i++) {
      await router02
        .connect(addr1)
        .swapExactTokensForTokensSupportingFeeOnTransferTokens(
          1000,
          0,
          path,
          addr1.address,
          timestampBefore + 5 * i
        );
    }
    console.log(await pmf.balanceOf(addr1.address));
    console.log(await pmf.balanceOf(pmf.address));

    console.log(addr1.address);
    // sell the tokens
    const _blockNumBefore = await ethers.provider.getBlockNumber();
    const _blockBefore = await ethers.provider.getBlock(_blockNumBefore);
    const _timestampBefore = _blockBefore.timestamp;
    await pmf.connect(addr1).approve(router02.address, 81224);
    let _path = [pmf.address, USDC.address];
    await router02
      .connect(addr1)
      .swapExactTokensForTokensSupportingFeeOnTransferTokens(
        81224,
        0,
        _path,
        addr1.address,
        _timestampBefore + 300
      );
    console.log(await pmf.balanceOf(addr1.address));
    console.log(await pmf.balanceOf(pmf.address));
  });

  it("should update the router address", async function () {
    await pmf.updateUniswapV2Router(Wallet.createRandom().address);
  });

  it("should exclude multiple accounts from fees", async function () {
    const [newad1, newad2, newad3] = await ethers.getSigners();
    let excludedAccounts = [newad1.address, newad2.address, newad3.address];
    await pmf.excludeMultipleAccountsFromFees(excludedAccounts, true);

    //should check whether they are excluded or not
    let bool = await pmf.isExcludedFromFees(newad1.address);
    expect(bool).to.be.equal(true);
  });

  it("should set new automated marketmaker pair", async function () {
    const newad1 = await ethers.getSigner();
    console.log("old signer: ", newad1.address);
    await pmf.setAutomatedMarketMakerPair(newad1.address, true);
  });

  it("should update liquidity wallet", async function () {
    await pmf.updateLiquidityWallet(
      "0xd109fc566401ca57445810b9a3c187876cf44544"
    );
  });

  it("should transfer 0 value", async function () {
    await pmf.connect(addr1).transfer(addr2.address, 0);
  });
});
