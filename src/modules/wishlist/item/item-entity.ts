import { Entity, ManyToOne, PrimaryKey, type Ref } from '@mikro-orm/core';
import type { Trainer } from '../../user/trainer/trainer-entity.js';
import type { Wishlist } from '../wishlist-entity.js';
import type { ItemShape } from './item-schemas.js';

@Entity()
export class Item implements ItemShape {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne()
  wishlist!: Ref<Wishlist>;

  @ManyToOne()
  trainer!: Ref<Trainer>;
}
