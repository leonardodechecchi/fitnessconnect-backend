import {
  BeforeCreate,
  BeforeUpdate,
  Entity,
  Enum,
  HiddenProps,
  OneToOne,
  OptionalProps,
  PrimaryKey,
  Property,
  type EventArgs,
} from '@mikro-orm/core';
import { hash, verify } from 'argon2';
import { Admin } from './admin/admin-entity.js';
import { Trainer } from './trainer/trainer-entity.js';

export enum UserStatus {
  ACTIVE = 'active',
  RESTRICTED = 'restricted',
  BANNED = 'banned',
}

@Entity()
export class User {
  [OptionalProps]?: 'fullName' | 'role' | 'status';
  [HiddenProps]?: 'password' | 'status' | 'role' | 'trainer' | 'admin';

  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property()
  firstName!: string;

  @Property()
  lastName!: string;

  @Property({ unique: true })
  email!: string;

  @Property({ lazy: true, hidden: true })
  password?: string;

  @Property()
  profilePictureUrl?: string;

  @Enum({ items: () => UserStatus, hidden: true })
  status: UserStatus = UserStatus.ACTIVE;

  @Property()
  timezone!: string;

  @OneToOne(() => Trainer, (trainer) => trainer.user, {
    orphanRemoval: true,
    hidden: true,
  })
  trainer?: Trainer; // optional one-to-one relationship with Trainer entity

  @OneToOne(() => Admin, (admin) => admin.user, {
    orphanRemoval: true,
    hidden: true,
  })
  admin?: Admin; // optional one-to-one relationship with Admin entity

  @Property({ persist: false })
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  @Property({ persist: false, hidden: true })
  get role(): 'User' | 'Trainer' | 'Admin' {
    if (this.admin) return 'Admin';
    if (this.trainer) return 'Trainer';
    return 'User';
  }

  @BeforeCreate()
  @BeforeUpdate()
  async hashPassword(args: EventArgs<User>) {
    const password = args.changeSet?.payload.password;

    if (password) {
      const passwordHash = await hash(password);
      this.password = passwordHash;
    }
  }

  async verifyPassword(plainTextPassword: string) {
    if (!this.password) {
      throw new Error('User password is not set');
    }

    return verify(this.password, plainTextPassword);
  }

  isBanned() {
    return this.status === UserStatus.BANNED;
  }
}
