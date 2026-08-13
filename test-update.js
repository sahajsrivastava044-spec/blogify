async function testUpdate() {
  try {
    console.log('1. Logging in as Smith...');
    const loginRes = await fetch('http://localhost:3001/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'smith@academy.edu',
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.data.token;
    console.log('Login successful, got token.');

    console.log('2. Fetching posts...');
    const getRes = await fetch('http://localhost:3001/api/v1/posts/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const getData = await getRes.json();
    
    // Find a post authored by Smith
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const userId = payload.id;
    
    const myPost = getData.data.find(p => p.author === userId || p.author._id === userId);
    if (!myPost) {
      console.log('No post found for Smith. Cannot test update.');
      return;
    }
    console.log(`Found post to edit: ${myPost._id}`);
    
    console.log('3. Updating the post...');
    const newTitle = myPost.title + ' [UPDATED BY SCRIPT]';
    const updateRes = await fetch(`http://localhost:3001/api/v1/posts/${myPost._id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({
        title: newTitle,
        content: myPost.content + '\nThis content was updated.'
      })
    });
    
    const updateData = await updateRes.json();
    console.log('Update response status:', updateRes.status);
    
    if (updateData.success && updateData.data.title === newTitle) {
      console.log('✅ Update logic is working perfectly!');
    } else {
      console.log('❌ Update succeeded but data looks wrong.', updateData);
    }
    
  } catch (err) {
    console.error('❌ Error during test:', err.message);
  }
}

testUpdate();
