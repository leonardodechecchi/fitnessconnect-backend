import { faker } from '@faker-js/faker';
import type { EntityData } from '@mikro-orm/core';
import { Factory } from '@mikro-orm/seeder';
import { User } from '../../modules/user/user-entity.js';

export class UserFactory extends Factory<User> {
  override model = User;

  protected override definition(): EntityData<User> {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      profilePictureUrl: faker.image.avatarGitHub(),
      timezone: 'Europe/Rome',
      password: 'prova1234',
    };
  }
}
