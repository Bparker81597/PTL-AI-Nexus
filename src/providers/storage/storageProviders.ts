import type { Asset } from "../../types/domain";
import { createId, nowIso } from "../../utils/ids";

export interface AssetStorageProvider {
  upload(file: File, path: string): Promise<Asset>;
  delete(assetId: string): Promise<void>;
  getPublicUrl(assetId: string): Promise<string>;
}

export class LocalMockStorageProvider implements AssetStorageProvider {
  private readonly urls = new Map<string, string>();

  async upload(file: File, path: string): Promise<Asset> {
    const id = createId("asset");
    const url = URL.createObjectURL(file);
    this.urls.set(id, url);
    return {
      id,
      name: file.name,
      type: "generated-image",
      url,
      createdAt: nowIso(),
      metadata: { path, size: file.size, mimeType: file.type },
    };
  }

  async delete(assetId: string): Promise<void> {
    const url = this.urls.get(assetId);
    if (url) {
      URL.revokeObjectURL(url);
      this.urls.delete(assetId);
    }
  }

  async getPublicUrl(assetId: string): Promise<string> {
    return this.urls.get(assetId) ?? `mock://asset/${assetId}`;
  }
}

export interface R2StorageConfig {
  bucketName: string;
  publicBaseUrl?: string;
}

export class CloudflareR2StorageProviderPlaceholder implements AssetStorageProvider {
  constructor(private readonly config: R2StorageConfig) {}

  async upload(): Promise<Asset> {
    throw new Error(
      `Cloudflare R2 upload for ${this.config.bucketName} must run through a secure backend.`,
    );
  }

  async delete(): Promise<void> {
    throw new Error("Cloudflare R2 delete is not implemented in the frontend placeholder.");
  }

  async getPublicUrl(assetId: string): Promise<string> {
    return `${this.config.publicBaseUrl ?? "https://r2.example.com"}/${assetId}`;
  }
}

export class SupabaseStorageProviderPlaceholder implements AssetStorageProvider {
  async upload(): Promise<Asset> {
    throw new Error("Supabase Storage upload placeholder is intentionally not wired yet.");
  }

  async delete(): Promise<void> {
    throw new Error("Supabase Storage delete placeholder is intentionally not wired yet.");
  }

  async getPublicUrl(assetId: string): Promise<string> {
    return `supabase://storage/${assetId}`;
  }
}
