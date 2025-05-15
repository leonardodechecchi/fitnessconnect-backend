import { faker } from '@faker-js/faker';
import { ref, type Dictionary, type EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { AdminFactory } from '../factories/admin-factory.js';
import { TrainerFactory } from '../factories/trainer-factory.js';
import { UserFactory } from '../factories/user-factory.js';

export class UserSeeder extends Seeder {
  override run(em: EntityManager, context: Dictionary): void | Promise<void> {
    const user = new UserFactory(em);
    const trainer = new TrainerFactory(em);
    const admin = new AdminFactory(em);

    context.users = user.make(10);

    context.trainers = trainer
      .each((trainer) => {
        trainer.user = ref(user.makeOne());
        trainer.specialties.set(
          faker.helpers.arrayElements(context.specialties)
        );
      })
      .make(10);

    admin
      .each((admin) => {
        admin.user = user.makeOne();
      })
      .makeOne();

    trainer
      .each((trainer) => {
        trainer.user = ref(user.makeOne({ email: 'leo.dechi99@gmail.com' }));
      })
      .makeOne();
  }
}
