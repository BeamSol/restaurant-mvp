"use client";

import { inviteUser, removeUser, setRole } from "@/app/admin/actions";
import type { Role } from "@/lib/types";
import { ActionForm, ConfirmButton, Field } from "./ui";

type U = { user_id: string; email: string; full_name: string | null; role: Role };

export default function UsersAdmin({ users, me }: { users: U[]; me: string }) {
  return (
    <div className="space-y-4">
      <section className="card p-4">
        <h2 className="h3 mb-2">People with access</h2>
        <ul className="divide-y divide-border">
          {users.map((u) => (
            <li key={u.user_id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-[14px]">
              <span>
                <strong>{u.full_name || u.email}</strong> {u.user_id === me && <span className="text-muted">(you)</span>}
                <span className="text-secondary block">{u.email}</span>
              </span>
              <span className="flex items-center gap-2">
                <select
                  defaultValue={u.role}
                  disabled={u.user_id === me}
                  onChange={async (e) => {
                    const r = await setRole(u.user_id, e.target.value as Role);
                    if (!r.ok) alert(r.error);
                  }}
                  className="field !h-9 !w-auto"
                  aria-label={`Role of ${u.email}`}
                >
                  <option value="STAFF">Staff</option>
                  <option value="OWNER">Owner</option>
                </select>
                {u.user_id !== me && (
                  <ConfirmButton action={() => removeUser(u.user_id)} confirm={`Remove admin access for ${u.email}?`}>
                    Remove
                  </ConfirmButton>
                )}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-secondary mt-2">
          <strong>Staff</strong> can: mark dishes sold out, edit dishes (not prices), hours &amp; holidays, events, gallery, announcements. <strong>Owners</strong> can do everything, including prices, branches, settings, reviews
          and users.
        </p>
      </section>
      <section className="card p-4">
        <h2 className="h3">Invite someone</h2>
        <p className="text-secondary">There is no public sign-up. Only people you invite can log in.</p>
        <ActionForm action={inviteUser} submit="Invite" resetOnSuccess className="mt-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Email">
              <input name="email" type="email" required className="field" />
            </Field>
            <Field label="Name">
              <input name="full_name" className="field" />
            </Field>
            <Field label="Role">
              <select name="role" className="field" defaultValue="STAFF">
                <option value="STAFF">Staff</option>
                <option value="OWNER">Owner</option>
              </select>
            </Field>
            <Field label="Temporary password (optional)" hint="Leave empty to send an email invite. Or set a password and tell them in person; they can change it later.">
              <input name="temp_password" type="text" minLength={10} autoComplete="off" className="field" />
            </Field>
          </div>
        </ActionForm>
      </section>
    </div>
  );
}
