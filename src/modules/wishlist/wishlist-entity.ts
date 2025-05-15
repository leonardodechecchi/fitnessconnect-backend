import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  type Ref,
} from '@mikro-orm/core';
import type { User } from '../user/user-entity.js';
import { Item } from './item/item-entity.js';

@Entity()
export class Wishlist {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property()
  name!: string;

  @ManyToOne()
  owner!: Ref<User>;

  @OneToMany(() => Item, (item) => item.wishlist)
  items = new Collection<Item>(this);
}
