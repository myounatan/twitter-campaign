import React, { useState, createContext } from "react";

import { UserContextType, Account, LoginState } from '@/types/user';
import { Web3AuthConfig, Web3AuthModalPack } from "@safe-global/auth-kit";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base";
import { Web3AuthOptions } from "@web3auth/modal";

import Transak from "@biconomy/transak";
import { BigNumber, ethers } from "ethers";

import { cache } from 'react'


export const UserContext = createContext<UserContextType | null>(null);

interface Props {
  children: React.ReactNode;
}

// this lookup table is only here to save twitter api calls when testing
type Lookup = {
  [key: string]: string;
}
const TWEET_ID_TO_AUTHOR_HANDLE: Lookup = {
  '1682751937945513987': 'cryptowesties',
  '1682950064732340225': 'cryptowesties',
  '1682951670064447488': 'cryptowesties',
  '1683052359352475648': 'cryptowesties',
  '1683041464052228098': 'cryptowesties',
  '1683036684831653888': 'cryptowesties',
  '1683018382080081920': 'cryptowesties',
};

const TWITTER_USER_ID_TO_HANDLE: Lookup = {
  '1371511387021791234': 'cryptowesties'
}

const UserProvider: React.FC<Props> = ({ children }) => {
  const [account, setAccount] = useState<Account | null>(null);

  const [loginState, setLoginState] = useState<LoginState | null>(null);

  const [provider, setProvider] = useState<any | null>(null);
  const [signer, setSigner] = useState<any | null>(null);

  const [transak, setTransak] = useState<any | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);

  const [signature, setSignature] = useState<string | null>(null);

  const [maticUSDPrice, setMaticUSDPrice] = useState<number | null>(null);

  const convertMaticUSD = (matic: number): string => {
    if (!maticUSDPrice) {
      return '';
    }

    const formatted = ethers.utils.formatEther(matic);
    const formattedLength = Math.min(formatted.length + 2, 8);

    return `$${(parseFloat(formatted) * maticUSDPrice).toFixed(formattedLength)} USD`;
  }

  const getTwitterHandleFromId = cache(async (twitterUserId: string) => {
    console.log(`found pre cache? getTwitterHandleFromId ${twitterUserId} in ${TWITTER_USER_ID_TO_HANDLE[twitterUserId]}`)
    if (TWITTER_USER_ID_TO_HANDLE[twitterUserId] !== undefined) {
      return TWITTER_USER_ID_TO_HANDLE[twitterUserId];
    }

    const res = await fetch('/api/twitteruser', {
      method: 'POST',
      body: JSON.stringify({ userId: twitterUserId }),
    });
  
    console.log(res)
  
    if (res.status === 200) {
      const data = await res.json();
      console.log(`Received twitter handle ${data.twitterHandle}`);
  
      return data.twitterHandle;
    } else {
      throw new Error('no twitter handle');
    }
  });
  
  const getTweetAuthorTwitterHandle = cache(async (tweetId: number) => {
    console.log(`found pre cache? getTweetAuthorTwitterHandle ${`${tweetId}`} in ${TWEET_ID_TO_AUTHOR_HANDLE[`${tweetId}`]}`)
    if (TWEET_ID_TO_AUTHOR_HANDLE[`${tweetId}`] !== undefined) {
      return TWEET_ID_TO_AUTHOR_HANDLE[`${tweetId}`];
    }

    const res = await fetch('/api/tweetauthor', {
      method: 'POST',
      body: JSON.stringify({ tweetId: `${tweetId}` }),
    });
  
    console.log(res)
  
    if (res.status === 200) {
      const data = await res.json();
      console.log(`Received twitter handle ${data.twitterHandle}`);
      console.log(`Received twitter user id ${data.twitterUserId}`);
  
      return data.twitterHandle;
    } else {
      throw new Error('no twitter handle');
    }
  });

  const updateBalance = async () => {
    if (!provider || !signer) {
      throw new Error('no provider or signer');
    }
    if (!account) {
      throw new Error('no account');
    }

    const balance = await signer.getBalance();
    const parsedBalance = ethers.utils.formatEther(balance);

    setAccount({
      ...account,
      balance: parsedBalance
    });
  }

  const options: Web3AuthOptions = {
    clientId: 'BEicrlVSViTgfhBz3NNpCdSG48IGS9-Xf0WD6c7zvrhRtZn9d1WUaC8SJdwbgWWXYixDKITd4IXwmAEoJwBU-Vo',
    web3AuthNetwork: 'testnet',
    chainConfig: {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: '0x13881', // mumbai
      rpcTarget: 'https://fragrant-late-asphalt.matic-testnet.discover.quiknode.pro/9820b93170b99024e4b616370542626027b0f3fd/'
    },
    uiConfig: {
      theme: 'dark',
      loginMethodsOrder: ['twitter'],
    }
  }
  
  // https://web3auth.io/docs/sdk/pnp/web/modal/initialize#configuring-adapters
  const modalConfig = {
    [WALLET_ADAPTERS.METAMASK]: {
      label: 'metamask',
      showOnDesktop: false,
      showOnMobile: false
    }
  }
  
  // https://web3auth.io/docs/sdk/pnp/web/modal/whitelabel#whitelabeling-while-modal-initialization
  const openloginAdapter = new OpenloginAdapter({
    loginSettings: {
      mfaLevel: 'none'
    },
    adapterSettings: {
      uxMode: 'popup',
      whiteLabel: {
        name: 'Twitter Campaigns'
      }
    }
  });

  // not used? no mumbai :((((
  const web3AuthConfig: Web3AuthConfig = {
    txServiceUrl: 'https://safe-transaction-polygon.safe.global'
  }

  const web3AuthModalPack = new Web3AuthModalPack(web3AuthConfig);

  const login = async () => {
    setLoadingLogin(true);
    
    // Instantiate and initialize the pack
    await web3AuthModalPack.init({ options, adapters: [openloginAdapter], modalConfig });

    const signData = await web3AuthModalPack.signIn()

    setLoginState({
      web3AuthModalPack,
      initialized: true,
      signData: signData
    });

    // get user info from web3auth
    const userInfo: any = await web3AuthModalPack.getUserInfo();
    if (!userInfo) {
      throw new Error('no user info');
    }

    const idToken = userInfo.idToken;
    const twitterUserId = userInfo.verifierId.substring(8);
    let twitterHandle = '';

    // get user twitter handle
    try {
      twitterHandle = await getTwitterHandleFromId(twitterUserId);
    } catch (e) {
      setLoadingLogin(false);

      console.log(e);
    }

    setLoadingLogin(false);
    setIsLoggedIn(true);

    // use ethers to get balance of signData.eoa
    // https://docs.ethers.io/v5/api/signer/#Signer-getBalance

    const providerSource: any = web3AuthModalPack.getProvider();
    const web3Provider = new ethers.providers.Web3Provider(providerSource)
    const eoaSigner = web3Provider.getSigner()

    const balance = await eoaSigner.getBalance();

    const parsedBalance = ethers.utils.formatEther(balance);

    setAccount({
      wallet: signData.eoa,
      balance: parsedBalance,
      email: userInfo.email,
      twitterUserId: twitterUserId,
      twitterName: userInfo.name,
      twitterHandle: twitterHandle,
      profileImage: userInfo.profileImage,
      idToken: userInfo.idToken,
    });

    setProvider(web3Provider);
    setSigner(eoaSigner);

    console.log(signData)
    console.log(userInfo)

    const transakClient = new Transak('STAGING', {
      walletAddress: signData.eoa,
      userData: {
        firstName: userInfo?.name || '',
        email: userInfo?.email || '',
      },
    });

    setTransak(transakClient);

    // fetch matic usd price using https://api.polygonscan.com/api?module=stats&action=maticprice&apikey=R3FPMSEVMGYMNGJ9Q9CDJGU1UQS5X4JMD5
    try {
      const res = await fetch('https://api.polygonscan.com/api?module=stats&action=maticprice&apikey=R3FPMSEVMGYMNGJ9Q9CDJGU1UQS5X4JMD5');
      const data = await res.json();
      console.log(data);
      setMaticUSDPrice(parseFloat(data.result.maticusd));
    } catch (e) {
      console.log(e);
    }

    // parse the idToken from the user object
    if (idToken) {
      // Taken from: https://web3auth.io/docs/content-hub/guides/server-side-verification
      const base64Url = idToken.split(".")[1];
      const base64 = base64Url.replace("-", "+").replace("_", "/");
      const parsedToken = JSON.parse(window.atob(base64));

      console.log(parsedToken);
      console.log(parsedToken.wallets[0].public_key);

      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + idToken,
        },
        body: JSON.stringify({ appPubKey: parsedToken.wallets[0].public_key, wallet: signData.eoa, twitterUserId: twitterUserId }),
      });
      if (res.status === 200) {
        console.log("JWT Verification is Successful");
        // allow login

        const data = await res.json();
        setSignature(data.signature);

        console.log('data.signature', data.signature)
      } else {
        console.log("JWT Verification Failed");

        // logout
        await logout();
      }
    }
  }

  const logout = async () => {
    await loginState?.web3AuthModalPack.signOut()

    setLoginState(null);

    setAccount(null);

    setIsLoggedIn(false);
    setLoadingLogin(false);
  }

  const fundTransak = async () => {
    if (transak) {
      transak.init();
    }
  }

  return (
    <UserContext.Provider value={{ account, signature, loginState, provider, signer, transak, isLoggedIn, loadingLogin, convertMaticUSD, login, logout, fundTransak, getTweetAuthorTwitterHandle, getTwitterHandleFromId, updateBalance }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;