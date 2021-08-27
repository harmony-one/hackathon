const Web3 = require('web3')
const moment = require('moment-timezone')
const IUniswapV2PairAbi = require("./IUniswapV2Pair.json").abi
const IUniswapV2Factory = require("./IUniswapV2Factory.json").abi
const UniswapV2Router02 = require("./IUniswapV2Router02.json").abi

// WEB3 CONFIG
const web3 = new Web3("https://api.s0.t.hmny.io")

/**
 * Setup factory contracts
 */

const VIPER_FACTORY_ADDRESS = "0x7D02c116b98d0965ba7B642ace0183ad8b8D2196"
const viperFactoryContract = new web3.eth.Contract(IUniswapV2Factory, VIPER_FACTORY_ADDRESS)

const LOOT_FACTORY_ADDRESS = "0x021AeF70c404aa9d70b71C615F17aB3a4038851A"
const lootFactoryContract = new web3.eth.Contract(IUniswapV2Factory, LOOT_FACTORY_ADDRESS)

/**
 * Setup router contracts
 */

const VIPER_ROUTER = "0xf012702a5f0e54015362cBCA26a26fc90AA832a3"
const viperRouterContract = new web3.eth.Contract(UniswapV2Router02, VIPER_ROUTER)

const LOOT_ROUTER = "0x6d9eF21E7b93CF0C45847d586E1b9eFCaaB76009"
const lootRouterContract = new web3.eth.Contract(UniswapV2Router02, LOOT_ROUTER)


/**
 * Function to get the output amount of one uni-like exchange.
 */
async function getUNIOutputAmount(factory, router, inputTokenAddress, outputTokenAddress, inputAmount) {
    const pairAddress = await factory.methods.getPair(inputTokenAddress, outputTokenAddress).call()
    const pairContract = new web3.eth.Contract(IUniswapV2PairAbi, pairAddress)
    let token0 = await pairContract.methods.token0().call()
    const { reserve0, reserve1 } = await pairContract.methods.getReserves().call()

    let outputAmount;
    if (token0.toLowerCase() === inputTokenAddress.toLowerCase())
        outputAmount = await router.methods.getAmountOut(inputAmount, reserve0, reserve1).call()
    else
        outputAmount = await router.methods.getAmountIn(inputAmount, reserve0, reserve1).call()

    return outputAmount
}

/**
 *  Called every n seconds to show the price tables.
 */
async function checkPair(args) {
    const { inputTokenSymbol, inputTokenAddress, outputTokenSymbol, outputTokenAddress, inputAmount } = args

    /**
     * Get exchange rate from Viper
     */

    const viperReturn = await getUNIOutputAmount(viperFactoryContract, viperRouterContract, inputTokenAddress, outputTokenAddress, inputAmount)

    /**
     * Get exchange rate from LootSwap
     */
    const lootswapReturn = await getUNIOutputAmount(lootFactoryContract, lootRouterContract, inputTokenAddress, outputTokenAddress, inputAmount)


    /**
     * Print the output amounts to a table.
     */
    console.table([{
        'Input Token': inputTokenSymbol,
        'Output Token': outputTokenSymbol,
        'Input Amount': web3.utils.fromWei(inputAmount, 'Ether'),
        'Viper Return': web3.utils.fromWei(viperReturn, 'Ether'),
        'Loot Return': web3.utils.fromWei(lootswapReturn, 'Ether'),
        'Timestamp': moment().tz('America/Chicago').format(),
    }])
}

let priceMonitor
let monitoringPrice = false

const ETH_TOKEN = "0x6983d1e6def3690c4d616b13597a09e6193ea013"
const BUSD_TOKEN = "0x0ab43550a6915f9f67d0c454c2e90385e6497eaa"
const ONE_TOKEN = "0xcf664087a5bb0237a0bad6742852ec6c8d69a27a"

async function monitorPrice() {
    if (monitoringPrice) {
        return
    }

    console.log("Checking prices...")
    monitoringPrice = true

    try {

        // ADD YOUR CUSTOM TOKEN PAIRS HERE!!!

        await checkPair({
            inputTokenSymbol: 'ONE',
            inputTokenAddress: ONE_TOKEN,
            outputTokenSymbol: 'BUSD',
            outputTokenAddress: BUSD_TOKEN,
            inputAmount: web3.utils.toWei('1', 'ETHER')
        })

        await checkPair({
            inputTokenSymbol: 'ONE',
            inputTokenAddress: ONE_TOKEN,
            outputTokenSymbol: '1ETH',
            outputTokenAddress: ETH_TOKEN,
            inputAmount: web3.utils.toWei('1', 'ETHER')
        })

    } catch (error) {
        console.error(error)
        monitoringPrice = false
        clearInterval(priceMonitor)
        return
    }

    monitoringPrice = false
}

// Check markets every n seconds
const POLLING_INTERVAL = process.env.POLLING_INTERVAL || 3000 // 3 Seconds
monitorPrice()
priceMonitor = setInterval(async () => { await monitorPrice() }, POLLING_INTERVAL)
