import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import usdcImg from '../public/centre-usdc_28.png'
import wbtcImg from '../public/wbtc_28.png'
import shibaImg from '../public/shibatoken_32.png'

const axios = require('axios').default
const treasuryAddress = '0x4F0be2B25d159CCB3173316A31c8680B8147cBb1'
const Web3 = require('web3')
const web3 = new Web3(
  Web3.givenProvider ||
    'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
)

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState('')
  const [marketPrice, setMarketPrice] = useState(0)
  const [currentBalance, setBalance] = useState(0)
  const [currentTreasuryBalance, setTreasuryBalance] = useState(0)
  const [amountToPay, setAmountToPay] = useState('')
  const [chainId, setChainId] = useState(0)
  const [cryptoPayment, setCryptoPayment] = useState('$ETH')

  const whitelistedPaymentAddresses = [
    {
      token: '$ETH',
      ContractAddress: null,
      img: wbtcImg,
    },
    {
      token: '$WBTC',
      ContractAddress: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
      img: wbtcImg,
      abi: null,
    },
    {
      token: '$SHIBA',
      ContractAddress: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
      img: shibaImg,
      abi: null,
    },
    {
      token: '$USDC',
      ContractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      img: usdcImg,
      abi: null,
    },
  ]

  const getEthMarketPrice = async () => {
    const fetchEth = await axios
      .get(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
      )
      .then(function (response) {
        // handle success
        const price = response.data.ethereum.usd
        console.log(price.toFixed(0))

        setMarketPrice(response.data.ethereum.usd)
      })
  }
  useEffect(() => {
    if (currentAccount) {
      getBalance(currentAccount)
      getEthMarketPrice()
      getTreasuryBalance()
    } else {
      return
    }
  }, [currentAccount])

  useEffect(() => {}, [cryptoPayment])

  const connectWallet = async () => {
    try {
      const { ethereum } = window
      let _chainId = await ethereum.request({ method: 'eth_chainId' })
      console.log('Connected to chain ' + _chainId)
      // let balance = await ethereum.request({ method: "eth_balance" });
      // console.log(balance)
      // String, hex code of the chainId
      const mainnet = '0x1'

      if (!ethereum) {
        alert('Get MetaMask!')
        return
      } else if (_chainId !== mainnet) {
        alert('You are not connected to the main network!')
        return
      }

      /*
       * Fancy method to request access to account.
       */
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      })

      /*
       * print out public address once we authorize Metamask.
       */
      console.log('Connected', accounts[0])
      setCurrentAccount(accounts[0])
      setChainId(_chainId)

      await getBalance(currentAccount)
      await getEthMarketPrice()
    } catch (error) {
      console.log(error)
    }
  }

  const disconnectWallet = async () => {
    setCurrentAccount(null)
  }

  const getBalance = async (currentAccount) => {
    const provider = new ethers.providers.JsonRpcProvider(
      'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
    )
    const balance = await provider.getBalance(
      `${currentAccount.toString()}`,
      'latest'
    )
    const userBalance = Number(ethers.utils.formatEther(balance))

    setBalance(userBalance)
  }
  const getTreasuryBalance = async () => {
    const provider = new ethers.providers.JsonRpcProvider(
      'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
    )
    const balance = await provider.getBalance(treasuryAddress, 'latest')
    const treasury = Number(ethers.utils.formatEther(balance))

    setTreasuryBalance(treasury)
  }

  const doTx = async (e, currentAccount, amountToPay, cryptoPayment) => {
    const { ethereum } = window

    if (!ethereum) {
      console.log('no ethereum found')
      return
    } else if (cryptoPayment === '$ETH') {
      try {
        e.preventDefault()

        const transactionParameters = {
          nonce: '0x00', // ignored by MetaMask
          // gasPrice: ethers.utils.hexValue(21000000), // customizable by user during MetaMask confirmation.
          // gas: ethers.utils.hexValue(21000000), // customizable by user during MetaMask confirmation.
          to: treasuryAddress, // Required except during contract publications.
          from: currentAccount, // must match user's active address.
          value: ethers.utils.parseEther(amountToPay)._hex, // Only required to send ether to the recipient from the initiating external account.
          // data:
          //   '0x7f7465737432000000000000000000000000000000000000000000000000000000600057', // Optional, but used for defining smart contract creation and interaction.
          chainId, // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
        }

        // txHash is a hex string
        // As with any RPC call, it may throw an error
        const txHash = await ethereum.request({
          method: 'eth_sendTransaction',
          params: [transactionParameters],
        })
        console.log(txHash)
      } catch (e) {
        console.log(e)
      }
    } else {
      try {
        // e.preventDefault()
        // const getSelectedTokenAttributes = whitelistedPaymentAddresses.find(e=>e.token === cryptoPayment)
        // const {ContractAddress,abi} = getSelectedTokenAttributes

        // const provider = new ethers.providers.Web3Provider(ethereum);
        // const signer = provider.getSigner();
        // const connectedContract = new ethers.Contract(
        //   ContractAddress,
        //   abi,
        //   signer
        // );

        // let txn = await connectedContract.transferFrom(currentAccount,treasuryAddress,amountToPay)
        return

        // const transactionParameters = {
        //   to: treasuryAddress, // Required except during contract publications.
        //   from: currentAccount, // must match user's active address.
        //   value: ethers.utils.parseEther(amountToPay)._hex, // Only required to send ether to the recipient from the initiating external account.
        //   chainId, // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
        // }

        // const txHash = {

        // }
        return
      } catch (e) {
        console.log(e)
      }
    }
  }

  //create an input on the front end for the user to add a token
  //2. Display balance of such token
  //--- Before doing the above whitelist certain addresses
  //3. User's balance is fetched from the contract address
  //4. Conditionnally call a function whether user pays with $ETH or with another ERC20 Token

  return (
    <>
      <div className={styles.App}>
        <h1>This is your Crypto payment gateway</h1>
        <div className={styles.App}>
          {!currentAccount ? (
            <>
              <button onClick={connectWallet}>Connect</button>
            </>
          ) : (
            <>
              <h3>
                The balance of the treasury is
                {' ' + currentTreasuryBalance.toFixed(5)}. It is worth $
                {(currentTreasuryBalance * marketPrice).toFixed(2)}
              </h3>
              <p> Current Eth Market Price is ${marketPrice} </p>

              <p>Connected with : {currentAccount}</p>
              <p>
                In your balance you currently have{' '}
                {currentBalance.toFixed(5) + ' '}
                $ETH which is equal to $
                {(currentBalance * marketPrice).toFixed(2)}
              </p>

              <form onChange={(event) => setAmountToPay(event.target.value)}>
                <p>
                  Enter the value in {!cryptoPayment ? '$ETH' : cryptoPayment}{' '}
                  you want to send
                </p>
                <input type="text" placeholder="Amount to pay..." />

                <button
                  type="submit"
                  className="cta-pay"
                  onClick={(e) =>
                    doTx(e, currentAccount, amountToPay, cryptoPayment)
                  }
                >
                  PAY
                </button>
              </form>
              <button onClick={disconnectWallet}>Disconnect</button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
