"use client";

import 'dotenv/config'

import Image from 'next/image'
import styles from '../app/page.module.css'
import { AppBar, Box, Button, Toolbar, Typography, Stack } from '@mui/material';
import { useState } from 'react';

// safe authkit twitter login shiiii
import { Web3AuthModalPack, Web3AuthConfig, AuthKitSignInData } from '@safe-global/auth-kit'
import { Web3AuthOptions } from '@web3auth/modal'
import { OpenloginAdapter } from '@web3auth/openlogin-adapter'
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from '@web3auth/base';

export default function Header() {
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

  const web3AuthModalPack = new Web3AuthModalPack(web3AuthConfig)

  const defaultSignData: AuthKitSignInData = {
    eoa: '',
    safes: []
  }

  const defaultUserInfo: any = {
    aggregateVerifier: '',
    dappShare: '',
    email: '',
    idToken: '',
    name: '',
    oAuthAccessToken: '',
    oAuthIdToken: '',
    profileImage: '',
    typeOfLogin: '',
    verifier: '',
    verifierId: ''
  }

  const [loadingLogin, setLoadingLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginState, setLoginState] = useState({
    web3AuthModalPack: web3AuthModalPack,
    initialized: false,
    signData: defaultSignData
  });
  const [userInfo, setUserInfo] = useState(defaultUserInfo);

  const login = async () => {
    // Instantiate and initialize the pack
    await web3AuthModalPack.init({ options, adapters: [openloginAdapter], modalConfig });

    setLoadingLogin(true);

    const signData = await web3AuthModalPack.signIn()

    setLoginState({
      web3AuthModalPack,
      initialized: true,
      signData: signData
    });

    // get user info from web3auth
    const userInfo = await web3AuthModalPack.getUserInfo();

    setLoadingLogin(false);
    setIsLoggedIn(true);

    setUserInfo(userInfo);

    console.log(signData)
    console.log(userInfo)

    // parse the idToken from the user object
    const idToken = userInfo.idToken;
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
    await loginState.web3AuthModalPack.signOut()

    setLoginState({
      web3AuthModalPack,
      initialized: true,
      signData: defaultSignData
    });

    setUserInfo(defaultUserInfo);

    setIsLoggedIn(false);
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Stack spacing={2} direction="row">
        <Image
            className={styles.logo}
            src="/next.svg"
            alt="Next.js Logo"
            width={180}
            height={37}
            priority
          />
          <Button variant="outlined" color="inherit">
            <Typography variant="body1" color="inherit">
              Campaigns
            </Typography>
          </Button>
          <Button variant="text" color="inherit">
            <Typography variant="body1" color="inherit">
              All Reward History
            </Typography>
          </Button>
        </Stack>
        <Box component="div" sx={{ flexGrow: 1 }}>
        </Box>
        {isLoggedIn ? (
          <Button variant="outlined" color="inherit" onClick={logout}>
            <Stack spacing={2} direction="row">
              <Typography variant="body1" color="inherit">
                Logout
              </Typography>
              <Image
                className={styles.twitterprofilepic}
                src={userInfo.profileImage}
                alt="Twitter Login Logo"
                width={25}
                height={25}
                priority
              />
            </Stack>
          </Button>
        ) : (
          <Button variant="outlined" color="inherit" onClick={login} disabled={loadingLogin}>
            <Stack spacing={2} direction="row">
              <Typography variant="body1" color="inherit">
                Login
              </Typography>
              <Image
                src="/twitter-48.png"
                alt="Twitter Login Logo"
                width={25}
                height={25}
                priority
              />
            </Stack>
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}