import { readFileSync } from "fs";
import path, { resolve } from 'path';
import { constants as CryptoConsts, createSign, createVerify, privateDecrypt, publicEncrypt } from 'crypto'


function r(...args: string[]) {
  return readFileSync(resolve(__dirname, ...args)).toString();
}

export function loadKeys() {
  const keys: Map<string, string> = new Map();
  keys.set("2", r('../data/keys/MHYPrivCN.pem'));
  keys.set("3", r('../data/keys/MHYPrivOS.pem'));
  keys.set("4", r('../data/keys/MHYPrivCN1.pem'));
  keys.set("5", r('../data/keys/MHYPrivOS1.pem'));
  keys.set("Sign", r('../data/keys/SigningKey.pem'));
  return keys;
}

export const DefaultEc2bPath = path.join(__dirname, "ec2b.bin");
export const DefaultEc2bKeyPath = path.join(__dirname, "ec2b.key");

export class Ec2bKey {
  readonly ec2b;
  readonly key;

  constructor() {
    this.ec2b = readFileSync(DefaultEc2bPath);
    this.key = readFileSync(DefaultEc2bKeyPath);
  }

  cipher(buffer: Buffer) {
    buffer = cloneBuffer(buffer);
    xorBuffer(this.key, buffer);
    return buffer;
  }
}

export function cloneBuffer(buffer: Buffer) {
  const other = Buffer.allocUnsafe(buffer.length);
  buffer.copy(other);
  return other;
}

export function xorBuffer(key: Buffer, buffer: Buffer) {
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] ^= key[i % key.length]!;
  }
}

export class RSAUtils {
  public static keys: Map<string, string>;

  static initKeys(){
    RSAUtils.keys = loadKeys()
  }

  static encryptAndSign(data: Uint8Array, key_id: string): { content: string, sign: string } {
    let content = RSAUtils.rsaEncrypt(RSAUtils.keys.get(key_id)!, Buffer.from(data)).toString('base64');
    let signed = RSAUtils.rsaSign(RSAUtils.keys.get("Sign")!, Buffer.from(data)).toString('base64');

    return {
      content: content,
      sign: signed
    }
  }

  static rsaEncrypt = (publicKey: Buffer | string, plaintext: Buffer): Buffer => {
    const chunkSize = 256 - 11
    const chunkCount = Math.ceil(plaintext.length / chunkSize)
    const chunks: Buffer[] = []

    for (let i = 0; i < chunkCount; i++) {
      const chunk = plaintext.subarray(i * chunkSize, (i + 1) * chunkSize)
      chunks.push(publicEncrypt({ key: publicKey, padding: CryptoConsts.RSA_PKCS1_PADDING }, chunk))
    }

    return Buffer.concat(chunks)
  }

  static rsaDecrypt = (privateKey: Buffer | string, ciphertext: Buffer): Buffer => {
    const chunkSize = 256
    const chunkCount = Math.ceil(ciphertext.length / chunkSize)
    const chunks: Buffer[] = []

    for (let i = 0; i < chunkCount; i++) {
      const chunk = ciphertext.subarray(i * chunkSize, (i + 1) * chunkSize)
      chunks.push(privateDecrypt({ key: privateKey, padding: CryptoConsts.RSA_PKCS1_PADDING }, chunk))
    }

    return Buffer.concat(chunks)
  }

  static rsaSign = (privateKey: Buffer | string, data: Buffer): Buffer => {
    const signer = createSign('RSA-SHA256')
    signer.update(data)
    return signer.sign({ key: privateKey, padding: CryptoConsts.RSA_PKCS1_PADDING })
  }

  static rsaVerify = (publicKey: Buffer | string, data: Buffer, signature: Buffer): boolean => {
    if (
      publicKey == null || data == null || signature == null ||
      publicKey.length <= 0 || data.length <= 0 || signature.length <= 0
    ) return false

    const verifier = createVerify('RSA-SHA256')
    verifier.update(data)
    return verifier.verify({ key: publicKey, padding: CryptoConsts.RSA_PKCS1_PADDING }, signature)
  }
}