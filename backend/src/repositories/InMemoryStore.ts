export class InMemoryStore<T extends { id: string }> {
  private store: Map<string, T> = new Map();

  async find(query: Partial<T>): Promise<T[]> {
    const results: T[] = [];
    for (const item of this.store.values()) {
      let match = true;
      for (const key in query) {
        if ((item as any)[key] !== (query as any)[key]) {
          match = false;
          break;
        }
      }
      if (match) results.push(item);
    }
    return results;
  }

  async findById(id: string): Promise<T | null> {
    return this.store.get(id) || null;
  }

  async create(data: T): Promise<T> {
    this.store.set(data.id, data);
    return data;
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, updatedAt: new Date() } as T;
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}
