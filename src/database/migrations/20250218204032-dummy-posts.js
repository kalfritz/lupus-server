module.exports = {
  up: queryInterface => {
    return queryInterface.bulkInsert(
      'posts',
      [
        {
          id: 201,
          content:
            'The London System is a chess opening characterized by early development of the dark-squared bishop to f4 and subsequent moves that aim for a harmonious piece setup without much early pawn tension.',
          user_id: 160,
          picture_id: 201,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 301,
          content:
            'One of the most anticipated additions to JavaScript is Records and Tuples, offering immutable data structures for more predictable state management. They eliminate the need for libraries like Immutable.js.',
          user_id: 110,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 203,
          content:
            'Survival horror adventure Liminal Point is coming out in 2026 for PC.',
          user_id: 120,
          picture_id: 203,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 302,
          content:
            'If you ever hear a small voice in your head saying, “Just take the shortcut through Mirkwood”—ignore it. That is how people vanish. On an unrelated note, if anyone sees a certain Hobbit, please remind him that second breakfast is not a universal right. #AdventurerTips #HobbitsAndTheirFood',
          user_id: 130,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 303,
          content: `People keep asking if I'm back I never left. Stay sharp. Watch your six. And never, ever touch a man's dog. #FortisFortunaAdiuvat #NoBusinessOnContinentalGround #BeSeeingYou`,
          user_id: 150,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 304,
          content:
            'Thing you folks need to know about me? I got nothing to lose. Christ, you should see my office. #BetterCallSaul',
          user_id: 170,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 206,
          content:
            'Nothing else matters gotta be one of my favorite songs fr #Metallica',
          user_id: 140,
          picture_id: 206,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 305,
          content:
            'The blade is in your aorta. If you pull it out you will bleed and you will die. Consider this a professional courtesy.',
          user_id: 150,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 202,
          content:
            'Simple method for swaping two variables: Because it is concise and expressive, employ the destructuring assignment strategy. Swapping is accomplished using a single line of code. It supports any data type, including numbers, texts, booleans, and objects.',
          user_id: 110,
          picture_id: 202,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 204,
          content:
            'Valve Bans All Steam Games Forcing Players to Watch In-Game Advertisements.',
          user_id: 120,
          picture_id: 204,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 205,
          content:
            'Minas Tirith—City of Kings, beacon of hope, and, unfortunately, home to some of the most stubborn men I’ve ever met. If you hear the horns of Gondor, do not hesitate. Stand, fight, and remember: even the smallest light can hold back the darkness. Now, if only someone would convince Denethor that setting oneself on fire is not a leadership strategy…',
          user_id: 130,
          picture_id: 205,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: queryInterface => {
    return queryInterface.bulkDelete('posts', {
      id: [201, 301, 203, 302, 303, 304, 206, 305, 202, 204, 205],
    });
  },
};
