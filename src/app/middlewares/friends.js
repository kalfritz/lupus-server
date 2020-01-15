import UserRelationship from '../models/UserRelationship';

export default async (req, res, next) => {
  const { userId: user_id } = req;

  try {
    const [friendships_first, friendships_second] = await Promise.all([
      UserRelationship.findAll({
        where: {
          status: 'friends',
          user_second_id: user_id,
        },
      }),
      UserRelationship.findAll({
        where: {
          status: 'friends',
          user_first_id: user_id,
        },
      }),
    ]);
    let friendsIds = [];

    if (friendships_first.length > 0) {
      friendships_first.forEach(friendship =>
        friendsIds.push(Number(friendship.user_first_id))
      );
    }
    if (friendships_second.length > 0) {
      friendships_second.forEach(friendship =>
        friendsIds.push(Number(friendship.user_second_id))
      );
    }

    req.friendsIds = friendsIds;
    next();
  } catch (err) {
    return res.status(500).json(err);
  }
};
