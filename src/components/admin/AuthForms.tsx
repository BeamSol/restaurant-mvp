"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, requestReset, setPassword } from "@/app/admin/auth-actions";
import { Status, SubmitButton } from "./ui";

export function LoginForm({ notice }: { notice?: string }) {
  const [state, action] = useActionState(login, null);
  return (
    <form action={action} className="space-y-3">
      {notice && <p className="rounded-[8px] bg-amber-50 p-2 text-[13px] text-amber-900">{notice}</p>}
      <label className="block">
        <span className="label">Email</span>
        <input name="email" type="email" autoComplete="username" required className="field" />
      </label>
      <label className="block">
        <span className="label">Password</span>
        <input name="password" type="password" autoComplete="current-password" required className="field" />
      </label>
      <SubmitButton className="btn btn-primary w-full">Log in</SubmitButton>
      <Status state={state} />
      <p className="text-center text-[13px]">
        <Link href="/admin/forgot/" className="text-primary hover:underline">
          Forgot password?
        </Link>
      </p>
    </form>
  );
}

export function ForgotForm() {
  const [state, action] = useActionState(requestReset, null);
  return (
    <form action={action} className="space-y-3">
      <label className="block">
        <span className="label">Your email</span>
        <input name="email" type="email" required className="field" />
      </label>
      <SubmitButton className="btn btn-primary w-full">Send reset link</SubmitButton>
      <Status state={state} />
      <p className="text-center text-[13px]">
        <Link href="/admin/login/" className="text-primary hover:underline">
          Back to login
        </Link>
      </p>
    </form>
  );
}

export function SetPasswordForm() {
  const [state, action] = useActionState(setPassword, null);
  return (
    <form action={action} className="space-y-3">
      <label className="block">
        <span className="label">New password (min. 10 characters)</span>
        <input name="password" type="password" autoComplete="new-password" minLength={10} required className="field" />
      </label>
      <label className="block">
        <span className="label">Repeat password</span>
        <input name="confirm" type="password" autoComplete="new-password" minLength={10} required className="field" />
      </label>
      <SubmitButton className="btn btn-primary w-full">Save password</SubmitButton>
      <Status state={state} />
    </form>
  );
}
