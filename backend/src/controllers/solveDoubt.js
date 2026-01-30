const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");

const getSystemInstruction = (title, description, testCases, startCode, theme) => `
You are an expert Data Structures and Algorithms (DSA) tutor specializing in helping users solve coding problems. Your role is strictly limited to DSA-related assistance only.

## CURRENT PROBLEM CONTEXT:
[PROBLEM_TITLE]: ${title || "N/A"}
[PROBLEM_DESCRIPTION]: ${description || "N/A"}
[EXAMPLES]: ${testCases || "N/A"}
[startCode]: ${startCode || "N/A"}
[USER_THEME]: ${theme || "N/A"}

## YOUR CAPABILITIES:
1. **Hint Provider**: Give step-by-step hints without revealing the complete solution
2. **Code Reviewer**: Debug and fix code submissions with explanations
3. **Solution Guide**: Provide optimal solutions with detailed explanations
4. **Complexity Analyzer**: Explain time and space complexity trade-offs
5. ** Approach Suggester**: Recommend different algorithmic approaches (brute force, optimized, etc.)
6. **Test Case Helper**: Help create additional test cases for edge case validation

## INTERACTION GUIDELINES:
- Break down the problem into smaller sub-problems
- Ask guiding questions to help them think through the solution
- Provide algorithmic intuition without giving away the complete approach
- Suggest relevant data structures or techniques to consider

## RESPONSE FORMAT:
- Use clear, concise explanations
- Format code with proper syntax highlighting
- Use examples to illustrate concepts
- Break complex explanations into digestible parts
- Always relate back to the current problem context
- Always response in the Language in which user is comfortable or given the context

## STRICT LIMITATIONS:
- ONLY discuss topics related to the current DSA problem
- DO NOT help with non-DSA topics (web development, databases, etc.)
- DO NOT provide solutions to different problems
- If asked about unrelated topics, politely redirect.

## TEACHING PHILOSOPHY:
- Encourage understanding over memorization
- Guide users to discover solutions rather than just providing answers
- Explain the "why" behind algorithmic choices
`;

async function callGemini(apiKey, systemInstruction, messages) {
    console.log("Attempting Google Gemini API...");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction
    });

    const history = messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content || "" }],
    }));

    const lastUserMessage = messages[messages.length - 1].content || "";

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastUserMessage);
    const response = await result.response;
    return response.text();
}

async function callGroq(apiKey, systemInstruction, messages) {
    console.log("Attempting Groq API...");
    const groq = new Groq({ apiKey });

    // Fix role mapping for Groq (model -> assistant)
    const formattedMessages = messages.map(msg => ({
        role: (msg.role === 'model' || msg.role === 'assistant') ? 'assistant' : 'user',
        content: msg.content || ""
    }));

    const conversationMessages = [
        { role: "system", content: systemInstruction },
        ...formattedMessages
    ];

    const completion = await groq.chat.completions.create({
        messages: conversationMessages,
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        stream: false,
        stop: null
    });

    return completion.choices[0]?.message?.content || "";
}

const solveDoubt = async (req, res) => {
    console.log("----- solveDoubt Controller Start -----");
    try {
        const { messages, title, description, testCases, startCode, theme } = req.body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ message: "Messages array is required." });
        }

        const systemInstruction = getSystemInstruction(title, description, testCases, startCode, theme);
        let responseText = "";

        // Strategy: First try Gemini, then fallback to Groq
        let geminiError = null;

        if (process.env.GEMINI_KEY) {
            try {
                responseText = await callGemini(process.env.GEMINI_KEY, systemInstruction, messages);
            } catch (err) {
                console.warn("Gemini API Failed:", err.message);
                geminiError = err;
            }
        } else {
            console.warn("GEMINI_KEY not found, skipping Gemini.");
        }

        // If Gemini failed or was skipped, try Groq
        if (!responseText && process.env.GROQ_API_KEY) {
            console.log("Falling back to Groq API...");
            try {
                responseText = await callGroq(process.env.GROQ_API_KEY, systemInstruction, messages);
            } catch (err) {
                console.error("Groq API also Failed:", err.message);
                // Return the error from the fallback (or original if clearer)
                throw err;
            }
        } else if (!responseText && geminiError) {
            // Gemini failed and no Groq key available
            throw geminiError;
        } else if (!responseText) {
            throw new Error("No API keys configuration found for Gemini or Groq.");
        }

        return res.status(200).json({ message: responseText });

    } catch (err) {
        console.error("Final Error in solveDoubt:", err);
        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
}

module.exports = solveDoubt;