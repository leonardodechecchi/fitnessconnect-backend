import { faker } from '@faker-js/faker';
import type { Dictionary, EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { ItemFactory } from '../factories/item-factory.js';
import { WishlistFactory } from '../factories/wishlist-factory.js';

export class WishlistSeeder extends Seeder {
  override run(em: EntityManager, context: Dictionary) {
    const wishlist = new WishlistFactory(em);
    const item = new ItemFactory(em).each(
      (item) => (item.trainer = faker.helpers.arrayElement(context.trainers))
    );

    wishlist
      .each((wishlist) => {
        wishlist.owner = faker.helpers.arrayElement(context.users);
        wishlist.items.set(item.make(5));
      })
      .make(10);
  }
}
