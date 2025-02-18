import multer from 'multer';
import crypto from 'crypto';
import { resolve, extname } from 'path';

module.exports = {
  storage: multer.diskStorage({
    destination: resolve(__dirname, `..`, `..`, `tmp`, `uploads`),
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, res) => {
        if (err) return cb(err);
        return cb(null, res.toString('hex') + extname(file.originalname));
      });
    },
  }),
};

/* attributes: {
  include: [
    [
      sequelize.fn('COUNT', sequelize.col('comments.id')),
      'commentsCount',
    ],
  ],
},
group: [sequelize.col('Post.id')], */
