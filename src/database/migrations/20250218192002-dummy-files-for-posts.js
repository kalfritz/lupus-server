module.exports = {
  up: queryInterface => {
    return queryInterface.bulkInsert(
      'files',
      [
        {
          id: 201,
          name: 'magnus-carsen-post',
          path: 'magnus-carsen-post.webp',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 202,
          name: 'brendan-eich-post',
          path: 'brendan-eich-post.png',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 203,
          name: 'gabe-newell-post',
          path: 'gabe-newell-post.webp',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 204,
          name: 'gabe-newell-post-2',
          path: 'gabe-newell-post-2.webp',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 205,
          name: 'gandalf-post',
          path: 'gandalf-post.webp',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 206,
          name: 'james-hetfield-post',
          path: 'james-hetfield-post.webp',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: queryInterface => {
    return queryInterface.bulkDelete('files', {
      id: [201, 202, 203, 204, 205, 206],
    });
  },
};
