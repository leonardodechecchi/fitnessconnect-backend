import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { Answer } from '../modules/qa/answer/answer-entity.js';
import { Specialty } from '../modules/specialty/specialty-entity.js';
import { Availability } from '../modules/user/trainer/availability/availability-entity.js';
import { Exception } from '../modules/user/trainer/exception/exception-entity.js';
import { Trainer } from '../modules/user/trainer/trainer-entity.js';
import { User, UserStatus } from '../modules/user/user-entity.js';
import { Wishlist } from '../modules/wishlist/wishlist-entity.js';
import type { Ability } from '../types/casl.js';

type FlatWishlist = Wishlist & { 'owner.id': Wishlist['owner']['id'] };
type FlatTrainer = Trainer & { 'user.id': Trainer['user']['id'] };
type FlatAvailability = Availability & {
  'trainer.user.id': Availability['trainer']['user']['id'];
};
type FlatException = Exception & {
  'trainer.user.id': Exception['trainer']['user']['id'];
};

export const createAbility = (user: User): Ability => {
  const { can, cannot, build } = new AbilityBuilder<Ability>(
    createMongoAbility
  );

  const { role, status } = user;

  if (status === UserStatus.Restricted) {
    // ! only READ permissions

    can('read', Trainer);
    can('read', User, { id: user.id });
    can<FlatWishlist>('read', Wishlist, { 'owner.id': user.id });

    return build();
  }

  switch (role) {
    case 'Admin':
      can('manage', 'all');
      break;
    case 'User':
      can('read', Trainer);
      can('read', Specialty);
      cannot('read', Trainer, 'exceptions');
      cannot('read', Trainer, 'availabilities');
      can<FlatTrainer>('create', Trainer, { 'user.id': user.id });
      can('manage', User, { id: user.id });
      cannot('update', User, ['status']);
      can<FlatWishlist>('manage', Wishlist, { 'owner.id': user.id });
      break;
    case 'Trainer':
      // TODO
      can('read', Trainer);
      can('read', Specialty);
      can<FlatTrainer>('create', Trainer, { 'user.id': user.id });
      can('manage', User, { id: user.id });
      cannot('update', User, ['status']);
      can<FlatWishlist>('manage', Wishlist, { 'owner.id': user.id });

      // ! trainer specific rules
      can<FlatAvailability>(['create', 'read'], Availability, {
        'trainer.user.id': user.id,
      });
      can<FlatException>(['create', 'read'], Exception, {
        'trainer.user.id': user.id,
      });
      can('create', Answer);
      break;
  }

  return build();
};
