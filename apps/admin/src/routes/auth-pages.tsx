import { useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { Copy, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useT } from '@/components/form-fields';
import { authClient } from '@/lib/auth';

function AuthCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <main className="grid min-h-svh place-items-center bg-[radial-gradient(ellipse_at_top_right,#2a2463_0%,#0b0d17_60%)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="gap-3">
          <img src="/logo.png" alt="" className="size-14 rounded-2xl" />
          <CardTitle className="font-heading text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </main>
  );
}

const codeInputProps = {
  inputMode: 'numeric' as const,
  autoComplete: 'one-time-code',
  pattern: '[0-9]{6}',
  maxLength: 6,
  className: 'text-center text-2xl tracking-[0.5em] tabular-nums',
};

export function LoginPage() {
  const t = useT();
  const navigate = useNavigate();
  const [step, setStep] = useState<'credentials' | 'code'>('credentials');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [trustDevice, setTrustDevice] = useState(true);

  const onCredentials = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(undefined);
    const { data, error: err } = await authClient.signIn.email({
      email: String(form.get('email')),
      password: String(form.get('password')),
    });
    setBusy(false);
    if (err) return setError(t('auth.invalidCredentials'));
    if (data && 'twoFactorRedirect' in data && data.twoFactorRedirect) return setStep('code');
    void navigate({ to: '/' });
  };

  const onCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = String(new FormData(e.currentTarget).get('code')).trim();
    setBusy(true);
    setError(undefined);
    const { error: err } = await authClient.twoFactor.verifyTotp({ code, trustDevice });
    setBusy(false);
    if (err) return setError(t('auth.invalidCode'));
    void navigate({ to: '/' });
  };

  return step === 'credentials' ? (
    <AuthCard title={t('auth.signInTitle')} description={t('auth.signInSubtitle')}>
      <form onSubmit={onCredentials} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <Input id="email" name="email" type="email" autoComplete="username" required autoFocus />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">{t('auth.password')}</Label>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={busy}>
          {t('auth.signIn')}
        </Button>
      </form>
    </AuthCard>
  ) : (
    <AuthCard title={t('auth.twoFactorTitle')} description={t('auth.twoFactorSubtitle')}>
      <form onSubmit={onCode} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="code">{t('auth.code')}</Label>
          <Input id="code" name="code" required autoFocus {...codeInputProps} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={trustDevice} onCheckedChange={(v) => setTrustDevice(v === true)} />
          {t('auth.trustDevice')}
        </label>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={busy}>
          {t('auth.verify')}
        </Button>
      </form>
    </AuthCard>
  );
}

export function SetupTwoFactorPage() {
  const t = useT();
  const navigate = useNavigate();
  const session = authClient.useSession();
  const [setup, setSetup] = useState<{ totpURI: string; backupCodes: string[] }>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const onPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(undefined);
    const { data, error: err } = await authClient.twoFactor.enable({ password: String(new FormData(e.currentTarget).get('password')) });
    setBusy(false);
    if (err || !data || !('totpURI' in data)) return setError(t('auth.invalidCredentials'));
    setSetup({ totpURI: data.totpURI, backupCodes: data.backupCodes });
  };

  const onCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(undefined);
    const { error: err } = await authClient.twoFactor.verifyTotp({ code: String(new FormData(e.currentTarget).get('code')).trim() });
    setBusy(false);
    if (err) return setError(t('auth.invalidCode'));
    await session.refetch();
    toast.success(t('auth.setupDone'));
    void navigate({ to: '/' });
  };

  return (
    <AuthCard title={t('auth.setupTitle')} description={t('auth.setupIntro')}>
      <ol className="mb-5 flex list-decimal flex-col gap-1 pl-5 text-sm text-muted-foreground">
        <li>{t('auth.setupStep1')}</li>
        <li>{t('auth.setupStep2')}</li>
        <li>{t('auth.setupStep3')}</li>
      </ol>
      {!setup ? (
        <form onSubmit={onPassword} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{t('auth.password')}</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required autoFocus />
          </div>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={busy}>
            {t('auth.generateQr')}
          </Button>
        </form>
      ) : (
        <form onSubmit={onCode} className="flex flex-col gap-4">
          <div className="self-center rounded-xl bg-white p-3">
            <QRCodeSVG value={setup.totpURI} size={200} level="M" title="Two-step verification QR code" />
          </div>
          <Alert>
            <ShieldCheck className="size-4" />
            <AlertDescription className="flex flex-col gap-2">
              <span className="font-medium">{t('auth.backupCodesTitle')}</span>
              <span>{t('auth.backupCodesNote')}</span>
              <code className="grid grid-cols-2 gap-1 font-mono text-sm">
                {setup.backupCodes.map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </code>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="self-start"
                onClick={() => {
                  void navigator.clipboard.writeText(setup.backupCodes.join('\n'));
                  toast.success(t('ui.copied'));
                }}
              >
                <Copy className="size-4" /> {t('ui.copy')}
              </Button>
            </AlertDescription>
          </Alert>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="code">{t('auth.code')}</Label>
            <Input id="code" name="code" required autoFocus {...codeInputProps} />
          </div>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={busy}>
            {t('auth.verify')}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
