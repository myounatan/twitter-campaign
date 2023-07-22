import { AuthKitSignInData, Web3AuthModalPack } from "@safe-global/auth-kit";

export interface Account {
  wallet: string;
  email: string;
  twitterUserId: number;
  twitterName: string;
  twitterHandle: string; // also username
  profileImage: string;
  idToken: string;
}

export interface LoginState {
  web3AuthModalPack: Web3AuthModalPack,
  initialized: boolean,
  signData: AuthKitSignInData
}

export type UserContextType = {
  // account state object
  account: Account | null;

  // login state object
  loginState: LoginState | null;

  // transak state object
  transak: any | null;

  // boolean flags
  isLoggedIn: boolean;
  loadingLogin: boolean;

  login: () => void;
  logout: () => void;

  fundTransak: () => void;
};