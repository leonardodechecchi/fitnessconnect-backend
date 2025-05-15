import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { SpecialtySeeder } from './specialty-seeder.js';
import { UserSeeder } from './user-seeder.js';
import { WishlistSeeder } from './wishlist-seeder.js';

export class DatabaseSeeder extends Seeder {
  override run(em: EntityManager): void | Promise<void> {
    return this.call(em, [SpecialtySeeder, UserSeeder, WishlistSeeder]);
  }
}
