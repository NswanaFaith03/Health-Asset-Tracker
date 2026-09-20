# Using Claude Code with FCC for DigiHealth Development

## Quick Start

Claude Code is now running. Use it to:

### 1. **Analyze Project Structure**
```
> What are the main routes in this application?
> Explain the role-based routing system
> Show me the authentication context setup
```

### 2. **Code Generation**
```
> Create a new component for student dashboard
> Generate a form for patient consultations
> Write an API integration hook for lab results
```

### 3. **Debugging & Fixing**
```
> Why is the API base URL configured this way?
> How does the authentication token flow work?
> What's the purpose of the api-base-url.ts file?
```

### 4. **Feature Implementation**
```
> How do I add a new role-based route for admin?
> Create the mental health buddy chat component
> Implement the queue management system for nurses
```

## Example: Let's Ask Claude Code About Your Project

### Question 1: "Explain the authentication flow"
Claude will:
- Read `contexts/AuthContext.tsx`
- Analyze `app/(Joshua-auth)/login.tsx`
- Review `utils/api-base-url.ts`
- Provide a comprehensive explanation

### Question 2: "Create a student consultation component"
Claude will:
- Check existing component patterns in `components/`
- Review the API schema from `lib/api-client-react/`
- Generate TypeScript + React code
- Include error handling and loading states

### Question 3: "How does role-based routing work?"
Claude will:
- Analyze the Expo Router structure
- Explain group folder syntax `(RoleName)/`
- Show how `app/index.tsx` routes users
- Provide examples for each role

## Available Commands in Claude Code

| Command | Action |
|---------|--------|
| `/model` | Switch AI model or provider |
| `/theme` | Change terminal theme |
| `Ctrl+C` | Exit Claude Code |
| Type your question | Get AI assistance |

## What Claude Code Can Do

- **Read & Analyze**: Your entire codebase instantly
- **Generate Code**: Components, hooks, utilities, types
- **Explain**: Complex patterns, architectures, flows
- **Debug**: Identify issues and suggest fixes
- **Refactor**: Improve code quality and performance
- **Document**: Generate comments and documentation
- **Test**: Create test files and test cases

## Pro Tips

1. **Be Specific**: "Create a form component for booking consultations" is better than "create a form"
2. **Reference Files**: "In `app/_layout.tsx`, how does the API base URL get set?"
3. **Ask for Patterns**: "What's the best way to handle loading states in this project?"
4. **Iterate**: Ask follow-up questions - Claude maintains context
5. **Test Generated Code**: Always review generated code before committing

## Your Project Features to Build

- Student mental health buddy chat
- Doctor consultation queue management
- Lab results delivery system
- Pharmacy prescription tracking
- Admin analytics dashboard
- HIV support sessions
- Nurse queue management

## Next Steps

1. Press `Enter` in Claude Code terminal to confirm theme
2. Ask: `Explain the authentication flow in detail`
3. Ask: `What features are missing in the student dashboard?`
4. Ask: `Help me create the mental buddy chat component`
5. Ask: `Generate a hook for managing consultations`

---

**Claude Code is ready!** Start asking questions about your DigiHealth app.
