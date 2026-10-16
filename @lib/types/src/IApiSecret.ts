export interface ApiSecret {
  clientId?: string;
  clientSecret?: string;
  apiKey?: string;
}

export interface CreateManifestApiSecret extends ApiSecret {
  saveManifestApiKey?: string;
}
