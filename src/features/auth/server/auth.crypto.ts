import "server-only";

import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  type ScryptOptions,
} from "node:crypto";

const passwordKeyLength = 64;
const scryptCost = 16_384;
const scryptBlockSize = 8;
const scryptParallelization = 1;

function deriveScryptKey(
  password: string,
  salt: Buffer,
  keyLength: number,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, keyLength, options, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey);
    });
  });
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizePhone(value: string): string {
  return value.trim().replace(/[\s()-]/gu, "");
}

export function normalizeGamerTag(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeIdentifier(value: string): string {
  const trimmed = value.trim();
  return trimmed.includes("@") ? normalizeEmail(trimmed) : normalizePhone(trimmed);
}

export function hashOpaqueToken(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function createSessionToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return {
    token,
    tokenHash: hashOpaqueToken(token),
  };
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await deriveScryptKey(password, salt, passwordKeyLength, {
    N: scryptCost,
    r: scryptBlockSize,
    p: scryptParallelization,
    maxmem: 64 * 1024 * 1024,
  });

  return [
    "scrypt",
    scryptCost,
    scryptBlockSize,
    scryptParallelization,
    salt.toString("hex"),
    derived.toString("hex"),
  ].join("$");
}

export async function verifyPassword(password: string, encodedHash: string): Promise<boolean> {
  const [algorithm, costValue, blockSizeValue, parallelizationValue, saltHex, digestHex] =
    encodedHash.split("$");

  if (
    algorithm !== "scrypt" ||
    !costValue ||
    !blockSizeValue ||
    !parallelizationValue ||
    !saltHex ||
    !digestHex
  ) {
    return false;
  }

  const cost = Number(costValue);
  const blockSize = Number(blockSizeValue);
  const parallelization = Number(parallelizationValue);
  const expected = Buffer.from(digestHex, "hex");

  if (
    !Number.isInteger(cost) ||
    !Number.isInteger(blockSize) ||
    !Number.isInteger(parallelization) ||
    expected.length !== passwordKeyLength
  ) {
    return false;
  }

  const actual = await deriveScryptKey(password, Buffer.from(saltHex, "hex"), expected.length, {
    N: cost,
    r: blockSize,
    p: parallelization,
    maxmem: 64 * 1024 * 1024,
  });

  return timingSafeEqual(actual, expected);
}
