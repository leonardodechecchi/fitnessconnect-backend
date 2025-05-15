import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Specialty {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ unique: true })
  name!: string;
}
