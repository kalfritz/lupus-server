import UserRelationship from '../models/UserRelationship';

class MakeFriendsOnSignup {
  async run({ user_id }) {
    await Promise.all([
      UserRelationship.create({
        user_first_id: 1 /*Werewolf*/,
        user_second_id: user_id,
        status: 'pending_second_first',
      }),
      UserRelationship.create({
        user_first_id: 17 /*Aracanidea*/,
        user_second_id: user_id,
        status: 'pending_first_second',
      }),
      UserRelationship.create({
        user_first_id: 11 /*Luppus*/,
        user_second_id: user_id,
        status: 'friends',
        friendship_time: new Date(),
      }),
      UserRelationship.create({
        user_first_id: 18 /*Hannibal*/,
        user_second_id: user_id,
        status: 'friends',
        friendship_time: new Date(),
      }),
      UserRelationship.create({
        user_first_id: 19 /*Cicero*/,
        user_second_id: user_id,
        status: 'friends',
        friendship_time: new Date(),
      }),
      UserRelationship.create({
        user_first_id: 20 /*Mikhail Tal*/,
        user_second_id: user_id,
        status: 'friends',
        friendship_time: new Date(),
      }),
      UserRelationship.create({
        user_first_id: 21 /*Michael Scott*/,
        user_second_id: user_id,
        status: 'friends',
        friendship_time: new Date(),
      }),
    ]);
    return;
  }
}

export default new MakeFriendsOnSignup();
