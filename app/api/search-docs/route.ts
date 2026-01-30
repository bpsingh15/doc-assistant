import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Sample documentation - in a real app, this would come from LlamaIndex
const sampleDocs = [
  {
    title: "React useState Hook",
    content:
      "useState is a Hook that lets you add state to functional components. Call useState at the top level of your component to declare a state variable.",
    url: "https://react.dev/reference/react/useState",
  },
  {
    title: "Next.js Routing",
    content:
      "Next.js has a file-system based router built on the concept of pages. When a file is added to the pages directory, it's automatically available as a route.",
    url: "https://nextjs.org/docs/routing/introduction",
  },
  {
    title: "TypeScript Basics",
    content:
      "TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. It adds optional static typing to the language.",
    url: "https://www.typescriptlang.org/docs/handbook/basic-types.html",
  },
  {
    title: "Array.map() Method",
    content:
      "The map() method creates a new array with the results of calling a function for every array element. It calls the provided function once for each element in an array, in order.",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map",
  },
  {
    title: "Async/Await in JavaScript",
    content:
      "The async function declaration defines an asynchronous function. Await expressions make promise-returning functions behave as though they're synchronous.",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function",
  },
];

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || code.trim().length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    // Use OpenAI to understand the code and find relevant docs
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that identifies programming concepts and technologies used in code snippets. Return a JSON array of relevant keywords.",
        },
        {
          role: "user",
          content: `Analyze this code and return relevant keywords as a JSON array: ${code}`,
        },
      ],
      temperature: 0.3,
    });

    const response = completion.choices[0].message.content || "[]";

    // Simple keyword matching with sample docs
    const relevantDocs = sampleDocs.filter((doc) => {
      const codeNormalized = code.toLowerCase();
      const titleNormalized = doc.title.toLowerCase();
      const contentNormalized = doc.content.toLowerCase();

      return (
        codeNormalized.includes(titleNormalized.split(" ")[0].toLowerCase()) ||
        titleNormalized
          .split(" ")
          .some((word) => codeNormalized.includes(word.toLowerCase()))
      );
    });

    return NextResponse.json({
      suggestions:
        relevantDocs.length > 0 ? relevantDocs : sampleDocs.slice(0, 2),
    });
  } catch (error) {
    console.error("Error searching docs:", error);
    return NextResponse.json(
      { error: "Failed to search documentation" },
      { status: 500 },
    );
  }
}
