import type { EntityData } from '@mikro-orm/core';
import { Factory } from '@mikro-orm/seeder';
import { Item } from '../../modules/wishlist/item/item-entity.js';

export class ItemFactory extends Factory<Item> {
  override model = Item;

  protected override definition(): EntityData<Item> {
    return {};
  }
}
