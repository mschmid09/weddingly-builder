import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { LockKeyhole } from 'lucide-react';

interface PasswordPromptProps {
  onSubmit: (password: string) => void;
  error?: string;
  primaryColor?: string;
  headingFont?: string;
}

export function PasswordPrompt({
  onSubmit,
  error,
  primaryColor = '#e4b6c6',
  headingFont = 'Playfair Display',
}: PasswordPromptProps) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
  };

  return (
    <div className="guest-stationery guest-password min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div
          className="text-center mb-8"
          style={{
            fontFamily: headingFont,
          }}
        >
          <LockKeyhole className="mx-auto mb-6" size={24} strokeWidth={1} aria-hidden="true" />
          <h1 className="text-3xl sm:text-4xl mb-4">
            A private invitation
          </h1>
          <p className="text-gray-600">
            Enter your invitation password to join us.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              aria-label="Invitation password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full text-center text-lg"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm mt-2 text-center">
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="guest-password-submit w-full"
          >
            Open invitation
          </Button>
        </form>
      </div>
    </div>
  );
}
