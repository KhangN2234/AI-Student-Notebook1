
import OpenAI from "openai";
import "dotenv/config";

const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;

if (!apiKey) {
    throw new Error(
        "Missing API key. Add GROQ_API_KEY (or OPENAI_API_KEY) to Backend/.env"
    );
}

const client = new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
});

const response = await client.responses.create({
    model: "openai/gpt-oss-20b",
    input: "Explain the importance of fast language models",
});
console.log(response.output_text);
