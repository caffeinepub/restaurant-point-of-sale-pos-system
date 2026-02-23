import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg">
            <UtensilsCrossed className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">Sistem POS Restorant</CardTitle>
          <CardDescription className="text-base">
            Identifikohu për të hyrë në sistemin e menaxhimit të restorantit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-600 py-6 text-lg font-semibold hover:from-orange-600 hover:to-amber-700"
            size="lg"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Duke u identifikuar...
              </>
            ) : (
              'Identifikohu'
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Përdor Internet Identity për hyrje të sigurt
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
