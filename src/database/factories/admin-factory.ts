import type { EntityData } from '@mikro-orm/core';
import { Factory } from '@mikro-orm/seeder';
import { Admin } from '../../modules/user/admin/admin-entity.js';

export class AdminFactory extends Factory<Admin> {
  override model = Admin;

  protected override definition(): EntityData<Admin> {
    return {};
  }
}
