const asyncHandler = require("express-async-handler");
const crypto = require("crypto");

const keyGeneration = asyncHandler(async (req, res) => {
  //generate rsa key pair

  const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
      cipher: "aes-256-cbc",
      passphrase: "your-passphrase",
    },
  });

  res.send({ publicKey, privateKey });
});

const encryptData = asyncHandler(async (req, res) => {
  // Encrypt the data using the public key
  // Define the chunk size (must be smaller than the key size)

  // const keyHex = process.env.AES_KEY;
  // const key = keyHex.toString();
  const data = await req.body;

  // Use the decrypted data as needed

  const publicKey = data.publicKey;
  const message = data.message;
  const privateKey = data.privateKey;
  // const chunkSize = 50;

  // function chunk(str, size) {
  //   const numChunks = Math.ceil(str.length / size);
  //   const chunks = new Array(numChunks);

  //   for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
  //     chunks[i] = str.substr(o, size);
  //   }

  //   return chunks;
  // }

  // const chunks = chunk(message, chunkSize);
  const chunks = message.match(/.{1,100}/g);
  const encryptedChunks = chunks.map((chunk) => {
    const buffer = Buffer.from(chunk, "utf8");
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      buffer
    );

    return encrypted.toString("base64");
  });

  // Create signature for each chunk using private key
  const signatures = chunks.map((chunk) => {
    const sign = crypto.createSign("SHA256");
    sign.update(chunk);
    sign.end();
    const signature = sign.sign({
      key: privateKey,
      passphrase: "your-passphrase",
    });
    return signature.toString("base64");
  });

  res.send({ encryptedChunks, signatures });
});

const decryptData = asyncHandler(async (req, res) => {
  // Decrypt the encrypted data using the private key
  // Define the chunk size (must be smaller than the key size)
  const data = await req.body;

  const privateKey = data.privateKey;
  const publicKey = data.publicKey;
  const signature = data.signature;
  const encryptedChunks = JSON.parse(data.message);

  const decryptedChunks = encryptedChunks.map((encrypted) => {
    const buffer = Buffer.from(encrypted, "base64");
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        passphrase: "your-passphrase",
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      buffer
    );

    return decrypted.toString("utf8");
  });

  const decryptedResult = decryptedChunks.join("");

  // Split message into 100-character chunks
  const chunks = decryptedResult.match(/.{1,100}/g);
  // Verify each signature using public key
  const isVerified = chunks.every((chunk) => {
    const verify = crypto.createVerify("SHA256");
    verify.update(chunk);
    return verify.verify(publicKey, signature, "base64");
  });
  console.log("signature verified:" + isVerified);
  if (isVerified) {
    res.send({ status: 200, decryptedResult: decryptedResult });
    console.log("Message is not modified");
  } else {
    console.log("Message is modified");
    res.sendStatus(400);
  }
});

module.exports = { keyGeneration, encryptData, decryptData };
