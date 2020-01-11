import User from '../models/User';
import UserRelationship from '../models/UserRelationship';

class FriendshipController {
  async store(req, res) {
    const { userId } = req;
    const { person_id } = req.params;

    let user_first_id = 0;
    let user_second_id = 0;
    let defaultStatus = '';

    if (userId < person_id) {
      user_first_id = Number(userId);
      user_second_id = Number(person_id);
      defaultStatus = 'pending_first_second';
    } else {
      user_first_id = Number(person_id);
      user_second_id = Number(userId);
      defaultStatus = 'pending_second_first';
    }

    const person = await User.findByPk(person_id);

    if (!person) {
      throw new Error('Sorry. This user does not exist');
    }

    const [relationship, created] = await UserRelationship.findOrCreate({
      where: {
        user_first_id,
        user_second_id,
      },
      defaults: {
        status: defaultStatus,
        friendship_time: new Date(),
      },
    });

    if (created) {
      return res.json(relationship);
    } else {
      if (user_first_id === userId) {
        if (relationship.status === 'pending_first_second') {
          throw new Error('Pending Request');
        }
        if (relationship.status === 'pending_second_first') {
          relationship.status = 'friends';
          await relationship.save();
          return res.json(relationship);
        }
        if (relationship.status === 'friends') {
          throw new Error('You are already friends');
        }
        if (relationship.status === 'block_first_second') {
          relationship.status = 'friends';
          await relationship.save();
          return res.json(relationship);
        }
        if (relationship.status === 'block_second_first') {
          throw new Error('Invalid operation');
        }
        if (relationship.status === 'block_both') {
          relationship.status = 'block_second_first';
          await relationship.save();
          return res.json(relationship);
        }
      } else {
        if (relationship.status === 'pending_first_second') {
          relationship.status = 'friends';
          await relationship.save();
          return res.json(relationship);
        }
        if (relationship.status === 'pending_second_first') {
          throw new Error('Pending Request');
        }
        if (relationship.status === 'friends') {
          throw new Error('You are already friends');
        }
        if (relationship.status === 'block_first_second') {
          throw new Error('Invalid operation');
        }
        if (relationship.status === 'block_second_first') {
          relationship.status = 'friends';
          await relationship.save();
          return res.json(relationship);
        }
        if (relationship.status === 'block_both') {
          relationship.status = 'block_first_second';
          await relationship.save();
          return res.json(relationship);
        }
      }
    }
  }
}

export default new FriendshipController();