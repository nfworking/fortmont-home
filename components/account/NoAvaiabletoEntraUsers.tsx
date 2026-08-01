export function NoAvailableToEntraUsers() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Access Denied</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Your account does not have access to this feature. Please contact support for assistance.
        </p>
        <p>If you would like to change your Entra User Information, please visit <a href="https://account.microsoft.com" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">https://account.microsoft.com</a> and login with your work account.</p>
        </div>
    );

}