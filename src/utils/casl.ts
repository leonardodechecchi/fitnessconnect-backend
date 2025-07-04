import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { Availability } from '../modules/user/trainer/availability/availability-entity.js';
import { Exception } from '../modules/user/trainer/exception/exception-entity.js';
import { Trainer } from '../modules/user/trainer/trainer-entity.js';
import { User } from '../modules/user/user-entity.js';
import { Wishlist } from '../modules/wishlist/wishlist-entity.js';
import type { Ability, AbilityRule } from '../types/casl.js';

type FlatWishlist = Wishlist & { 'owner.id': Wishlist['owner']['id'] };
type FlatTrainer = Trainer & { 'user.id': Trainer['user']['id'] };
type FlatAvailability = Availability & {
  'trainer.user.id': Availability['trainer']['user']['id'];
};
type FlatException = Exception & {
  'trainer.user.id': Exception['trainer']['user']['id'];
};

export const createAbilityRules = (user: User): AbilityRule[] => {
  const { can, cannot, rules } = new AbilityBuilder<Ability>(
    createMongoAbility
  );

  if (user.role === 'User' || user.role === 'Trainer') {
    can('manage', 'User', { id: user.id });
    can('manage', 'Wishlist', { 'owner.id': user.id });
    can('read', 'Specialty');
  }

  // const { role, status } = user;

  // if (status === UserStatus.Restricted) {
  //   can('read', Trainer);
  //   can('read', Specialty);
  //   can('read', User, { id: user.id });
  //   can<FlatWishlist>('read', Wishlist, { 'owner.id': user.id });

  //   return rules;
  // }

  // if (role === 'User' || role === 'Trainer') {
  //   can('read', Trainer);
  //   can('read', Specialty);
  //   can('manage', User, { id: user.id });
  //   can<FlatTrainer>('create', Trainer, { 'user.id': user.id });
  //   cannot('update', User, 'status');
  //   can<FlatWishlist>('manage', Wishlist, { 'owner.id': user.id });
  // }

  // if (role === 'User') {
  //   cannot('read', Trainer, 'exceptions');
  //   cannot('read', Trainer, 'availabilities');
  // }

  // if (role === 'Trainer') {
  //   can<FlatAvailability>(['create', 'read'], Availability, {
  //     'trainer.user.id': user.id,
  //   });
  //   can<FlatException>(['create', 'read'], Exception, {
  //     'trainer.user.id': user.id,
  //   });
  // }

  // if (role === 'Admin') {
  //   can('manage', 'all');
  // }

  return rules;
};

export const createAbilityFromRules = (rules: AbilityRule[]): Ability => {
  return createMongoAbility<Ability>(rules);
};

// export const createAbility = (user: User): Ability => {
//   const { can, cannot, build } = new AbilityBuilder<Ability>(
//     createMongoAbility
//   );

//   const { role, status } = user;

//   if (status === UserStatus.Restricted) {
//     // ! only read permissions

//     can('read', Trainer);
//     can('read', Specialty);
//     can('read', User, { id: user.id });
//     can<FlatWishlist>('read', Wishlist, { 'owner.id': user.id });

//     return build();
//   }

//   // ? Common rules shared between User and Trainer
//   if (role === 'User' || role === 'Trainer') {
//     can('read', Trainer);
//     can('read', Specialty);
//     can('manage', User, { id: user.id });
//     can<FlatTrainer>('create', Trainer, { 'user.id': user.id });
//     cannot('update', User, 'status');
//     can<FlatWishlist>('manage', Wishlist, { 'owner.id': user.id });
//   }

//   // ? User specific rules
//   if (role === 'User') {
//     cannot('read', Trainer, 'exceptions');
//     cannot('read', Trainer, 'availabilities');
//   }

//   // ? Trainer specific rules
//   if (role === 'Trainer') {
//     can<FlatAvailability>(['create', 'read'], Availability, {
//       'trainer.user.id': user.id,
//     });
//     can<FlatException>(['create', 'read'], Exception, {
//       'trainer.user.id': user.id,
//     });
//   }

//   // ? Admin specific rules
//   if (role === 'Admin') {
//     can('manage', 'all');
//   }

//   return build();
// };
