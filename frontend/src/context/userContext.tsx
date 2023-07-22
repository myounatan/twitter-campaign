import React, { useState, createContext } from "react";

import { UserContextType, Account, LoginState } from '@/types/user';
import { Web3AuthConfig, Web3AuthModalPack } from "@safe-global/auth-kit";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base";
import { Web3AuthOptions } from "@web3auth/modal";

import Transak from "@biconomy/transak";

export const UserContext = createContext<UserContextType | null>(null);

interface Props {
  children: React.ReactNode;
}

const UserProvider: React.FC<Props> = ({ children }) => {
  const [account, setAccount] = useState<Account | null>(null);

  const [loginState, setLoginState] = useState<LoginState | null>(null);

  const [transak, setTransak] = useState<any | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);


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
      loginMethodsOrder: ['twitter']
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
    const res = await fetch('/api/twitteruser', {
      method: 'POST',
      body: JSON.stringify({ userId: twitterUserId }),
    });

    console.log(res)

    if (res.status === 200) {
      const data = await res.json();
      console.log(`Received twitter handle ${data.username}`);

      twitterHandle = data.username;
    } else {
      setLoadingLogin(false);

      throw new Error('no twitter handle');
    }

    setLoadingLogin(false);
    setIsLoggedIn(true);

    setAccount({
      wallet: signData.eoa,
      email: userInfo.email,
      twitterUserId: twitterUserId,
      twitterName: userInfo.name,
      twitterHandle: twitterHandle,
      profileImage: userInfo.profileImage,
      idToken: userInfo.idToken,
    });

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

    // parse the idToken from the user object
    if (idToken) {
      // Taken from: https://web3auth.io/docs/content-hub/guides/server-side-verification
      const base64Url = idToken.split(".")[1];
      const base64 = base64Url.replace("-", "+").replace("_", "/");
      const parsedToken = JSON.parse(window.atob(base64));

      console.log(parsedToken);
      console.log(parsedToken.wallets[0].public_key);

      const res = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + idToken,
        },
        body: JSON.stringify({ appPubKey: parsedToken.wallets[0].public_key }),
      });
      if (res.status === 200) {
        console.log("JWT Verification is Successful");
        // allow login
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
    <UserContext.Provider value={{ account, loginState, transak, isLoggedIn, loadingLogin, login, logout, fundTransak }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;