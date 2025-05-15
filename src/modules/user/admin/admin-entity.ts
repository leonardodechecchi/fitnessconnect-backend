import { Entity, OneToOne, PrimaryKeyProp } from '@mikro-orm/core';
import type { User } from '../user-entity.js';

@Entity()
export class Admin {
  @OneToOne({ primary: true })
  user!: User; // reuse the primary key from User entity

  [PrimaryKeyProp]?: 'user';
}
