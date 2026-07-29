import type { CharacterRepository, ProjectRepository } from "../../../repositories/contracts";

export interface SupabaseClientConfig {
  url: string;
  anonKey: string;
}

export class SupabaseCharacterRepositoryPlaceholder implements Partial<CharacterRepository> {
  constructor(private readonly config: SupabaseClientConfig) {}

  async testConnection(): Promise<boolean> {
    return Boolean(this.config.url && this.config.anonKey);
  }
}

export class SupabaseProjectRepositoryPlaceholder implements Partial<ProjectRepository> {
  constructor(private readonly config: SupabaseClientConfig) {}

  async testConnection(): Promise<boolean> {
    return Boolean(this.config.url && this.config.anonKey);
  }
}
