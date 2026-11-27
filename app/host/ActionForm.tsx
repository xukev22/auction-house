'use client';

import { useActionState, type ReactNode } from 'react';
import type { ActionResult } from './actions';
import { ErrorText, primaryButton, secondaryButton } from './ui';

// A form for one host action: its fields, a submit button, and the error underneath.
// className lays out the fields and button (a row by default).
export function ActionForm({
  action,
  children,
  submitLabel,
  primary = false,
  className = 'flex flex-wrap items-end gap-2',
}: {
  action: (state: ActionResult, formData: FormData) => Promise<ActionResult>;
  children: ReactNode;
  submitLabel: string;
  primary?: boolean;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className={className}>
        {children}
        <button
          type="submit"
          disabled={pending}
          className={primary ? primaryButton : secondaryButton}
        >
          {submitLabel}
        </button>
      </div>
      {state.error && <ErrorText>{state.error}</ErrorText>}
    </form>
  );
}
