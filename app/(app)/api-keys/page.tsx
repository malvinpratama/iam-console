import { ApiKeysPanel } from "@/components/api-keys-panel";
import { iamGet, backendLabel, type ApiKeysResponse, type Identity } from "@/lib/iam";

export default async function ApiKeys() {
  let keys: ApiKeysResponse = { keys: [] };
  let perms: string[] = [];
  let error: string | null = null;
  try {
    [keys, perms] = await Promise.all([
      iamGet<ApiKeysResponse>("/api-keys"),
      iamGet<Identity>("/me").then((i) => i.permissions),
    ]);
  } catch (e) {
    error = (e as Error).message;
  }

  return (
    <div className="rise">
      <header className="mb-8">
        <div className="mono mb-1 text-xs uppercase tracking-[0.25em] text-muted">Account</div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-text">API keys</h1>
      </header>
      {error ? (
        <div className="card p-6 text-sm text-danger">
          Couldn&apos;t load keys ({await backendLabel()}): <span className="mono">{error}</span>
        </div>
      ) : (
        <ApiKeysPanel keys={keys.keys} perms={perms} />
      )}
    </div>
  );
}
