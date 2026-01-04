const { GoogleGenerativeAI } = require("@google/generative-ai");

// Get key from arguments or hardcode for testing (but better to use process.env if loaded)
// We will rely on user having set it in .env.local, but for this script we might need to load it.
// I'll ask user to paste key or load from .env.local manually if I can't.
// Actually, I can read the file if I had access, but I don't.
// I'll assume I can just use the key the user provided in the chat history: "AIzaSyBO6wyDEUngKKXg56_Vy7Q0a2pJlKjp01o"

const genAI = new GoogleGenerativeAI("AIzaSyBO6wyDEUngKKXg56_Vy7Q0a2pJlKjp01o");

async function listModels() {
    try {
        // There isn't a direct listModels on the high level client in all versions, 
        // but we can try to use a simple text generation on a known model to verify connectivity
        // or try to fetch model info.
        // Actually, v1beta API has listModels.
        // But the node SDK might expose it via a ModelManager or similar.

        // Let's try to just run a simple generation on a few common names to see which one works.
        const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];

        console.log("Testing models...");

        for (const modelName of models) {
            console.log(`Testing ${modelName}...`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello");
                const response = await result.response;
                console.log(`✅ SUCCESS: ${modelName} is working!`);
                return; // Exit after first success
            } catch (error) {
                console.log(`❌ FAILED: ${modelName} - ${error.message.split('\n')[0]}`);
            }
        }

        console.log("All common models failed.");
    } catch (error) {
        console.error("Script error:", error);
    }
}

listModels();
