// Taken from: https://web3auth.io/docs/content-hub/guides/server-side-verification

import type { NextApiRequest, NextApiResponse } from "next";
import * as jose from "jose";
import { ethers } from "ethers";

type Data = {
  name?: string;
  signature?: string;
  error?: string;
};

const signAuthMessage = async (wallet: string, twitterUserId: any): Promise<string> => {
  const { signer } = await getBackendProviderSigner();

  const signature = await signer.signMessage(`${wallet}-${twitterUserId}`);
  console.log("signAuthMessage", signature)

  return signature;
}

export const getBackendProviderSigner = async () => {
  console.log("process.env.DEV_PRIVATE_KEY", process.env.DEV_PRIVATE_KEY)
  console.log("process.env.NEXT_PUBLIC_QUICKNODE_MUMBAI", process.env.NEXT_PUBLIC_QUICKNODE_MUMBAI)
  if (!process.env.DEV_PRIVATE_KEY) {
    throw new Error("DEV_PRIVATE_KEY not set");
  }
  if (!process.env.NEXT_PUBLIC_QUICKNODE_MUMBAI) {
    throw new Error("NEXT_PUBLIC_QUICKNODE_MUMBAI not set");
  }

  const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_QUICKNODE_MUMBAI);
  const signer = new ethers.Wallet(process.env.DEV_PRIVATE_KEY, provider);

  console.log("signer", await signer.getAddress())

  // return both provider and signer
  return { provider, signer };
}

export const verifyAuthMessage = async (wallet: string, twitterUserId: any, signature: string): Promise<boolean> => {
  const { signer } = await getBackendProviderSigner();

  console.log("verifyAuthMessage.signature", signature)
  console.log("verifyAuthMessage.wallet", wallet)
  console.log("verifyAuthMessage.twitterUserId", twitterUserId)
  console.log("signer", await signer.getAddress())

  const signerAddress = await signer.getAddress();

  const message = `${wallet}-${twitterUserId}`;

  const msgHash = ethers.utils.hashMessage(message);
  const msgHashBytes = ethers.utils.arrayify(msgHash);

  // Now you have the digest,
  const recoveredPubKey = ethers.utils.recoverPublicKey(msgHashBytes, signature);
  const recoveredAddress = ethers.utils.recoverAddress(msgHashBytes, signature);

  const matches = signerAddress === recoveredAddress

  console.log('Is Authorized signature: ', matches ? '✅' : '❌');

  return matches;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  try {
    const idToken = req.headers.authorization?.split(" ")[1] || "";
    const app_pub_key = req.body.appPubKey;
    const jwks = jose.createRemoteJWKSet(new URL("https://api.openlogin.com/jwks"));
    const jwtDecoded = await jose.jwtVerify(idToken, jwks, {
      algorithms: ["ES256"],
    });

    if ((jwtDecoded.payload as any).wallets[0].public_key == app_pub_key) {
      // Verified
      console.log("Validation Success");

      // sign a message with the user wallet
      const wallet = req.body.wallet;
      const twitterUserId = req.body.twitterUserId;

      const signature = await signAuthMessage(wallet, twitterUserId);

      res.status(200).json({ name: "Validation Success", signature: signature });
    } else {
      // Verification failed
      res.status(401).json({ name: "Validation Failed" });
      console.log("Validation Failed");
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}