module.exports = {
  up: async queryInterface => {
    return queryInterface.bulkInsert(
      'users',
      [
        {
          id: 110,
          username: 'brendan-eich',
          name: 'Brendan Eich',
          email: 'brendan-eich@outlook.com',
          location: 'Pittsburgh, Pennsylvania, US',
          bio: 'Invented JavaScript in 10 days. Still debugging it.',
          password_hash:
            '$2a$08$7DWu.Xo4Xgq2v5TMs6apHOrb6CGxpPhOtpRrbCiXlBypRR5nsqal.',
          avatar_id: 111,
          cover_id: 112,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 120,
          username: 'gabe-newell',
          name: 'Gabe Newell',
          email: 'gabe-newell@outlook.com',
          location: 'Colorado, U.S.',
          bio: 'Waiting for Half-Life 3 like the rest of you.',
          password_hash:
            '$2a$08$7DWu.Xo4Xgq2v5TMs6apHOrb6CGxpPhOtpRrbCiXlBypRR5nsqbl.',
          avatar_id: 121,
          cover_id: 122,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 130,
          username: 'gandalf',
          name: 'Gandalf',
          email: 'gandalf@outlook.com',
          location: 'Middle-earth',
          bio: 'DMs open for quests.',
          password_hash:
            '$2a$08$7DWu.Xo4Xgq2v5TMs6apHOrb6CGxpPhOtpRrbCiXlBypRR5nsqcl.',
          avatar_id: 131,
          cover_id: 132,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 140,
          username: 'james-hetfield',
          name: 'James Hetfield',
          email: 'james-hetfield@outlook.com',
          location: 'Vail, Colorado, US',
          bio: 'Seeking & Destroying since 1981. YEAH! 🤘',
          password_hash:
            '$2a$08$7DWu.Xo4Xgq2v5TMs6apHOrb6CGxpPhOtpRrbCiXlBypRR5nsqdl.',
          avatar_id: 141,
          cover_id: 142,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 150,
          username: 'john-wick',
          name: 'John Wick',
          email: 'john-wick@outlook.com',
          location: 'Confidential',
          bio: 'Be seeing you.',
          password_hash:
            '$2a$08$7DWu.Xo4Xgq2v5TMs6apHOrb6CGxpPhOtpRrbCiXlBypRR5nsqel.',
          avatar_id: 151,
          cover_id: 152,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 160,
          username: 'magnus-carlsen',
          name: 'Magnus Carlsen',
          email: 'magnus-carlsen@outlook.com',
          location: 'Norway',
          bio: 'Messi of Chess. oh shoot im late for a game',
          password_hash:
            '$2a$08$7DWu.Xo4Xgq2v5TMs6apHOrb6CGxpPhOtpRrbCiXlBypRR5nsqfl.',
          avatar_id: 161,
          cover_id: 162,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 170,
          username: 'saul-goodman',
          name: 'Saul Goodman',
          email: 'saul-goodman@outlook.com',
          location: 'Albuquerque, New Mexico, US',
          bio: 'You don’t need a criminal lawyer. You need a criminal lawyer.',
          password_hash:
            '$2a$08$7DWu.Xo4Xgq2v5TMs6apHOrb6CGxpPhOtpRrbCiXlBypRR5nsqgl.',
          avatar_id: 171,
          cover_id: 172,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: async queryInterface => {
    return queryInterface.bulkDelete('users', {
      id: [110, 120, 130, 140, 150, 160, 170],
    });
  },
};
