import type { Dictionary, EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Specialty } from '../../modules/specialty/specialty-entity.js';

export class SpecialtySeeder extends Seeder {
  override run(em: EntityManager, context: Dictionary) {
    const bodybuilding = em.create(Specialty, { name: 'bodybuilding' });
    const yoga = em.create(Specialty, { name: 'yoga' });
    const powerlifting = em.create(Specialty, { name: 'powerlifting' });

    context.specialties = [bodybuilding, yoga, powerlifting];
  }
}
