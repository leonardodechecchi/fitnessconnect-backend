import { faker } from '@faker-js/faker';
import type { EntityData } from '@mikro-orm/core';
import { Factory } from '@mikro-orm/seeder';
import { Trainer } from '../../modules/user/trainer/trainer-entity.js';

export class TrainerFactory extends Factory<Trainer> {
  override model = Trainer;

  protected override definition(): EntityData<Trainer> {
    return {
      bio: faker.person.bio(),
      sessionDuration: 60,
    };
  }
}
