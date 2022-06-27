// const ethers = require("ethers");
// const fs = require("fs-extra");
// require("dotenv").config();

import {ethers} from "ethers"
import * as fs from "fs-extra"
import "dotenv/config"

// Encrypts private key with a password

async function main() {
  // Connect wallet using private key from .env file
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!);
  // Encrypt the wallet data using private key and a password
  const encryptedJsonKey = await wallet.encrypt(
    process.env.PRIVATE_KEY_PASSWORD!,
    process.env.PRIVATE_KEY!
  );
  console.log(encryptedJsonKey);
  //   Write the encryptedJson object to a file
  fs.writeFileSync("./.encryptedKey.json", encryptedJsonKey);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
