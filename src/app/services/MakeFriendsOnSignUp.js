import UserRelationship from '../models/UserRelationship';

class MakeFriendsOnSignup {
  async run({ user_id }) {
    await Promise.all([
      UserRelationship.create({
        user_first_id: 150 /* John Wick */,
        user_second_id: user_id,
        status: 'pending_first_second',
      }),
      UserRelationship.create({
        user_first_id: 170 /* Saul Goodman */,
        user_second_id: user_id,
        status: 'pending_second_first',
      }),
      UserRelationship.create({
        user_first_id: 110 /* Brendan Eich */,
        user_second_id: user_id,
        status: 'friends',
        friendship_time: new Date(),
      }),
      UserRelationship.create({
        user_first_id: 120 /* Gabe Newell */,
        user_second_id: user_id,
        status: 'friends',
        friendship_time: new Date(),
      }),
      UserRelationship.create({
        user_first_id: 130 /* Gandalf */,
        user_second_id: user_id,
        status: 'friends',
        friendship_time: new Date(),
      }),
      UserRelationship.create({
        user_first_id: 140 /* James Hetfield */,
        user_second_id: user_id,
        status: 'friends',
        friendship_time: new Date(),
      }),
      UserRelationship.create({
        user_first_id: 160 /* Magnus Carlsen */,
        user_second_id: user_id,
        status: 'friends',
        friendship_time: new Date(),
      }),
    ]);
  }
}

export default new MakeFriendsOnSignup();
