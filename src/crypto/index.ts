import { readFileSync } from "fs";
import path, { resolve } from 'path';
import { constants as CryptoConsts, createSign, createVerify, privateDecrypt, publicEncrypt } from 'crypto'


function r(...args: string[]) {
  return readFileSync(resolve(__dirname, ...args)).toString();
}

export const publicKey_OS = r('../data/keys/OS_Public.pem');
export const privateKey_OS = r('../data/keys/OS_Private.pem');
export const signingKey = r('../data/keys/SigningKey.pem');

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

export function encryptAndSign(data: Uint8Array): {content: string, sign:string} {
    let content = rsaEncrypt(publicKey_OS,Buffer.from(data)).toString('base64');
    let signed = rsaSign(signingKey,Buffer.from(data)).toString('base64');

    return {
        content: content,
        sign: signed
    }
}

export const rsaEncrypt = (publicKey: Buffer | string, plaintext: Buffer): Buffer => {
  const chunkSize = 256 - 11
  const chunkCount = Math.ceil(plaintext.length / chunkSize)
  const chunks: Buffer[] = []

  for (let i = 0; i < chunkCount; i++) {
    const chunk = plaintext.subarray(i * chunkSize, (i + 1) * chunkSize)
    chunks.push(publicEncrypt({ key: publicKey, padding: CryptoConsts.RSA_PKCS1_PADDING }, chunk))
  }

  return Buffer.concat(chunks)
}

export const rsaDecrypt = (privateKey: Buffer | string, ciphertext: Buffer): Buffer => {
  const chunkSize = 256
  const chunkCount = Math.ceil(ciphertext.length / chunkSize)
  const chunks: Buffer[] = []

  for (let i = 0; i < chunkCount; i++) {
    const chunk = ciphertext.subarray(i * chunkSize, (i + 1) * chunkSize)
    chunks.push(privateDecrypt({ key: privateKey, padding: CryptoConsts.RSA_PKCS1_PADDING }, chunk))
  }

  return Buffer.concat(chunks)
}

export const rsaSign = (privateKey: Buffer | string, data: Buffer): Buffer => {
  const signer = createSign('RSA-SHA256')
  signer.update(data)
  return signer.sign({ key: privateKey, padding: CryptoConsts.RSA_PKCS1_PADDING })
}

export const rsaVerify = (publicKey: Buffer | string, data: Buffer, signature: Buffer): boolean => {
  if (
    publicKey == null || data == null || signature == null ||
    publicKey.length <= 0 || data.length <= 0 || signature.length <= 0
  ) return false

  const verifier = createVerify('RSA-SHA256')
  verifier.update(data)
  return verifier.verify({ key: publicKey, padding: CryptoConsts.RSA_PKCS1_PADDING }, signature)
}