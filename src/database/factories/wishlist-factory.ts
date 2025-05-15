import type { EntityData } from '@mikro-orm/core';
import { Factory } from '@mikro-orm/seeder';
import { Wishlist } from '../../modules/wishlist/wishlist-entity.js';

export class WishlistFactory extends Factory<Wishlist> {
  override model = Wishlist;

  protected override definition(): EntityData<Wishlist> {
    return {
      name: 'test1234',
    };
  }
}
