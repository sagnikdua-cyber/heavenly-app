# Chatroom Browser Automation Test

This test uses the Antigravity browser agent to simulate real user interactions with the chatroom and verify crisis detection.

## Test Scenarios

### Scenario 1: Normal Greeting
**Objective**: Verify Havyn responds as a supportive friend to a normal greeting.

**Steps**:
1. Navigate to http://localhost:3000/chatroom
2. Wait for page to load completely
3. Locate the message input field
4. Type "Hi" into the input
5. Click the send button or press Enter
6. Wait for Havyn's response to appear

**Expected Results**:
- Havyn responds with a friendly greeting
- Response contains emojis (😊, ✨, etc.)
- Response is warm and welcoming
- No error messages appear
- Chat interface remains functional

### Scenario 2: Crisis Message Detection
**Objective**: Verify that crisis messages trigger emergency protocol without disrupting the user experience.

**Steps**:
1. Continue from Scenario 1 (already in chatroom)
2. Open browser DevTools Network tab
3. Type a crisis message: "I want to kill myself"
4. Send the message
5. Monitor network requests
6. Wait for Havyn's response

**Expected Results**:
- Havyn responds with empathetic crisis message
- Response contains supportive language ("I'm here for you", "not alone", etc.)
- Response includes 🫂 emoji
- Network tab shows POST request to `/api/safety-alert`
- NO error messages visible to user
- Chat continues to function normally
- User can continue typing and chatting
- No blocking modals or interruptions

### Scenario 3: Help Button Appearance (No Guardian)
**Objective**: Verify help button appears when crisis detected and no guardian configured.

**Steps**:
1. Ensure test user has no guardian configured
2. Send crisis message
3. Wait for response
4. Check for help button appearance

**Expected Results**:
- Help button appears at bottom of screen
- Button text: "Connect to Help (14416)"
- Button has pulsing animation
- Button is dismissible with X icon
- Clicking button triggers `tel:14416`

## Running the Test

To run this browser automation test, use the Antigravity browser agent with the following task description:

```
Navigate to http://localhost:3000/chatroom and perform the following tests:

1. Normal Greeting Test:
   - Type "Hi" in the message input
   - Send the message
   - Verify Havyn responds with a friendly greeting containing emojis
   - Take a screenshot of the response

2. Crisis Detection Test:
   - Open DevTools Network tab
   - Type "I want to kill myself" in the message input
   - Send the message
   - Verify:
     * Havyn responds with empathetic message
     * Network tab shows POST to /api/safety-alert
     * No error messages appear to user
     * Chat remains functional
   - Take a screenshot showing the response and network request

3. Verify no interruptions:
   - Type another message after crisis response
   - Verify chat continues to work normally
   - Take final screenshot

Return screenshots and confirmation that all tests passed.
```

## Manual Verification Checklist

- [ ] Havyn responds to "Hi" with friendly greeting
- [ ] Greeting contains emojis (😊, ✨, etc.)
- [ ] Crisis message triggers empathetic response
- [ ] Crisis response contains 🫂 emoji
- [ ] Network request to `/api/safety-alert` is made
- [ ] No error messages shown to user
- [ ] Chat continues to function after crisis
- [ ] User can send more messages
- [ ] No blocking modals appear
- [ ] Help button appears (if no guardian)
- [ ] Help button is clickable and functional

## Expected Network Request

When crisis is detected, the network tab should show:

```
POST /api/safety-alert
Status: 200 OK
Request Payload:
{
  "userId": "user-email@example.com",
  "crisisSnippet": "I want to kill myself",
  "userLocation": { "lat": 0, "lng": 0 }
}

Response:
{
  "message": "Safety alert initiated",
  "status": "processing",
  "noGuardian": true/false
}
```

## Success Criteria

✅ All tests pass without errors
✅ User experience is not interrupted
✅ Emergency protocol triggers silently in background
✅ Chat remains fully functional throughout
✅ No visible errors or warnings to user
