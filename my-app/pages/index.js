import Head from 'next/head'
import { Contract, providers, utils } from "ethers";
import React, { useEffect, useState, useRef } from 'react';
import Web3Modal from "web3modal";
import { abi, NFT_CONTRACT_ADDRESS } from "../constants";
import styles from '../styles/Home.module.css'


export default function Home() {

// !       Check whether the wallet is connected or not
const [walletConnected, setWalletConnected] = useState(false);
// *      Waiting to set the waiting time while transaction is going on and while completed
const [waiting, setWaiting] = useState(false);
// ^      We have to keep the record of tokens So we have to use tokenid like how much tokens is minted till now 
const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
// ?      Creating a Web3modal reference for connecting Metamask wallet
const web3ModalRef = useRef();


//  !           Signer and Provider function
// *      Provider is needed to interact with the blockchain for eg like reading balance, reading transaction etc. "ONLY FOR READING PURPOSE"
// *      Siigner is used for making transactions like it will authorize the signature for the transaction
// *      Metamask exposes the Signer ABI to the website which request signature from the user and that uses signer function
// ?      {needSigner} :-  If it is true means you need the signer and by default it is false

const getProviderOrSigner = async (needSigner = false) => {
  // !    Connect to Metamask
  // *    WE are going to use Web3modal as we store it as a reference 
  const provider = await web3ModalRef.current.connect();
  const web3Provider = new providers.Web3Provider(provider);

  // !    If user is not connected to the network then we will tell them to connect by throwing an error
  const { chainId } = await web3Provider.getNetwork();
  if (chainId !== 4) {
    window.alert("You are not on rinkeby network");
    throw new Error("Change your current network to Rinkeby");
  }

  if (needSigner) {
    const signer = web3Provider.getSigner();
    return signer;
  }
  return web3Provider;
}


// *    For minting NFT
const publicMint = async () => {
  try {
    console.log("Public Mint");
// *    We will need signer function as it is an write function and it include transaction for mining
const signer = await getProviderOrSigner(true);
// ?      Create a new instance of the Contract with the signer which will allow to update the methods
const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
// !        Call the mint function from the contract 
const tx = await nftContract.mint({
  // *   Here we will define value which contains the value set by us in the contract 
  //!     which is 0.01 ether
  value : utils.parseEther("0.01"),
});
setWaiting(true);
//*     We will wait until the transaction is completed
await tx.wait();
setWaiting(false);
window.alert("You have successfully minted the Punk NFT");
  } catch (err) {
    console.error(err);
  }
}


//  *       Connecting Wallet 
const connectWallet = async () => {
  try {
    // *  We will use provider here as it not require any transaction
    // !    When used for the first time it will prompts the user  to connect their wallet
    await getProviderOrSigner();
    setWalletConnected(true);
  } catch (err) {
    console.error(err);
  }
}

//  !       Useeffect is used to react to changes in state of the website
// *        The array at the end will trigger the effect when changes occur in that state
// ?        Here whenever the state of the wallet changes it will trigger the effect
useEffect(() => {
  // *    if wallet is not connected then we will create a new instance with web3modal and connect the metamask wallet
  if (!walletConnected) {
    web3ModalRef.current = new Web3Modal({
      network: "rinkeby",
      providerOptions: {},
      disableInjectedProvider: false,
    });

    connectWallet();
    getTokenIdsMinted();

    // *    We will set an interval to get the number of token ids minted every 5 seconds
    setInterval(async function () {
      await getTokenIdsMinted();
    }, 5 * 1000);
  }
}, [walletConnected]);









//  *   We need to get the number of tokenIds that have been minted
const getTokenIdsMinted = async () => {
  try {
    // *      We will need provider as we are using metamask to view the id 
    const provider = await getProviderOrSigner();
    //  ?     We will connect to contract using a provider so we will only have read access
    const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
    // &    Call the tokenIds  from the contract 
    const _tokenIds = await nftContract.tokenIds();
    console.log("tokenIds", _tokenIds);
    // *      tokenIds is generated as a Big number so we have to convert it
    setTokenIdsMinted(_tokenIds.toString());
  } catch (err) {
    console.error(err);
  }
}


//  *   We will create a button render 
const renderButton = () => {
  // !      if the wallet is not connected it will show Connect wallet
  if (!walletConnected) {
    return (
      <button className={styles.button} onClick={connectWallet} >
      Connect your Wallet 😄.
      </button>
    );
  }

  // *    If its connecting then we have to wait so we will use waiting hook we created
  if (waiting) {
    return <button className={styles.button} > 🔃Loading... </button>;
  }
  return (
    <button className={styles.button} onClick={publicMint}>
    Mint your NFT.
    </button>
  )
}



  return (
    <div>
      <Head>
      <title>PUNKS NFT</title>
      <meta name="description" content="LW3Punks-Dapp" />
      <link rel="icon" href="/favicon.ico" />
      </Head>
        <div className={styles.main}>
        <div>
        <h1 className={styles.title}>🚀 Welcome to Punk NFT 🙏🏻</h1>
        <div className={styles.description}>
        Its an NFT Which is named as PUNK
        </div>
        <div className={styles.description}>
        {tokenIdsMinted}/10 have been minted.
        </div>
        {renderButton()}
        </div>
        <div>
        <img src="../public/Punks/1.png" alt="" className={styles.image} />
        </div>
        </div>
        <footer className={styles.footer}>Made with &#10084; by @YashPatel </footer>
    </div>
  );
}
