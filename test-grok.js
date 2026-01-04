// Test script to check Grok API response
async function testGrokAPI() {
    try {
        const response = await fetch('http://localhost:3000/api/chat/grok', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'Hello, how are you?',
                conversationHistory: []
            })
        });

        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

testGrokAPI();
