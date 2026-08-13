const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./src/models/user.model');
const Post = require('./src/models/post.model');
require('dotenv').config();

const MOCK_DATA_COUNT = 5000;

async function seedData() {
  try {
    const MONGO_URL = process.env.MONGO_URI || 'mongodb://localhost:27017/blogify';
    await mongoose.connect(MONGO_URL);
    console.log('Connected to MongoDB');

    // Clear existing data (optional, but good for a fresh start)
    await User.deleteMany({});
    await Post.deleteMany({});
    console.log('Cleared existing data');

    // 1. Create a few authors
    const hashedPassword = await bcrypt.hash('password123', 10);
    const usersToCreate = [
      { username: 'ProfessorSmith', email: 'smith@academy.edu', password: hashedPassword, firstName: 'John', lastName: 'Smith' },
      { username: 'ScholarJane', email: 'jane@academy.edu', password: hashedPassword, firstName: 'Jane', lastName: 'Doe' },
      { username: 'ResearcherAlex', email: 'alex@academy.edu', password: hashedPassword, firstName: 'Alex', lastName: 'Johnson' }
    ];

    const users = await User.insertMany(usersToCreate);
    console.log(`Created ${users.length} users`);

    // 2. Generate 5000 mock posts
    console.log(`Generating ${MOCK_DATA_COUNT} posts. This might take a few seconds...`);
    const postsToInsert = [];
    
    const topics = ['Quantum Computing', 'Classical Literature', 'Machine Learning', 'Ancient History', 'Astrophysics', 'Philosophy of Mind', 'Economics', 'Cognitive Psychology', 'Organic Chemistry', 'Linguistics'];
    
    for (let i = 0; i < MOCK_DATA_COUNT; i++) {
      const author = users[Math.floor(Math.random() * users.length)]._id;
      const topic = topics[Math.floor(Math.random() * topics.length)];
      
      postsToInsert.push({
        title: `The Impact of ${topic} on Modern Society (Part ${i + 1})`,
        content: `This is a comprehensive analysis exploring the depths of ${topic}. We delve into its historical context, theoretical frameworks, and practical applications in today's rapidly evolving world. Throughout this research, we observed significant correlations that challenge previously established paradigms.\n\nFurthermore, the integration of cross-disciplinary methodologies has illuminated new pathways for future inquiry. (Simulated paragraph ${i})`,
        author: author,
        // Spread the creation date over the last year so sorting works nicely
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000))
      });
    }

    // Insert in batches to avoid memory overload if the count is huge
    const batchSize = 1000;
    for (let i = 0; i < postsToInsert.length; i += batchSize) {
      const batch = postsToInsert.slice(i, i + batchSize);
      await Post.insertMany(batch);
      console.log(`Inserted batch ${i / batchSize + 1} of ${Math.ceil(postsToInsert.length / batchSize)}`);
    }

    console.log('✅ Seeding complete! Added 5000 posts.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
