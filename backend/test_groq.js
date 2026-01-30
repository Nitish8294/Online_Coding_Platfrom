require('dotenv').config();
const Groq = require("groq-sdk");

async function testGroq() {
         console.log("Testing Groq API...");
         console.log("API Key present:", !!process.env.GROQ_API_KEY);

         if (!process.env.GROQ_API_KEY) {
                  console.error("Error: GROQ_API_KEY is missing in environment variables.");
                  return;
         }

         const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

         try {
                  const completion = await groq.chat.completions.create({
                           messages: [
                                    { role: "user", content: "Hello, confirm you are working." }
                           ],
                           model: "llama-3.3-70b-versatile",
                  });

                  console.log("Success! Response:");
                  console.log(completion.choices[0]?.message?.content);
         } catch (err) {
                  console.error("Groq API failed:");
                  console.error(err);
         }
}

testGroq();
