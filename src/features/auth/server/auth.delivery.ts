import "server-only";

import nodemailer from "nodemailer";

import { serverEnv } from "@/lib/config/env.server";

let transport: nodemailer.Transporter | null = null;

function getTransport(): nodemailer.Transporter {
  if (transport) return transport;

  transport = nodemailer.createTransport({
    host: serverEnv.smtpHost,
    port: serverEnv.smtpPort,
    secure: serverEnv.smtpSecure,
    auth:
      serverEnv.smtpUser && serverEnv.smtpPassword
        ? { user: serverEnv.smtpUser, pass: serverEnv.smtpPassword }
        : undefined,
  });

  return transport;
}

export async function sendVerificationCode(input: {
  email: string;
  gamerTag: string;
  code: string;
}): Promise<void> {
  await getTransport().sendMail({
    from: serverEnv.smtpFrom,
    to: input.email,
    subject: "Verify your VERZUS account",
    text: `Hi ${input.gamerTag},\n\nYour VERZUS verification code is ${input.code}. It expires in 15 minutes.\n\nIf you did not create this account, ignore this message.`,
  });
}

export async function sendPasswordReset(input: {
  email: string;
  gamerTag: string;
  token: string;
}): Promise<void> {
  const resetUrl = `${serverEnv.appUrl}/reset-password?token=${encodeURIComponent(input.token)}`;

  await getTransport().sendMail({
    from: serverEnv.smtpFrom,
    to: input.email,
    subject: "Reset your VERZUS password",
    text: `Hi ${input.gamerTag},\n\nReset your VERZUS password using this link:\n${resetUrl}\n\nThe link expires in 30 minutes.`,
  });
}
