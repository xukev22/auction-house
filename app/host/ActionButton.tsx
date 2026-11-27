'use client';

import { useState, useTransition, type ReactNode } from 'react';
import type { ActionResult } from './actions';
import { ErrorText, primaryButton, secondaryButton } from './ui';

// A button that runs one host action and shows its error, if any, underneath.
export function ActionButton({
  action,
  children,
  primary = false,
  disabled = false,
  confirm,
}: {
  action: () => Promise<ActionResult>;
  children: ReactNode;
  primary?: boolean;
  disabled?: boolean;
  // Asks first, for things that can't be undone.
  confirm?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        disabled={disabled || pending}
        onClick={() => {
          if (confirm && !window.confirm(confirm)) return;
          setError(undefined);
          startTransition(async () => {
            const result = await action();
            setError(result.error);
          });
        }}
        className={primary ? primaryButton : secondaryButton}
      >
        {children}
      </button>
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}
