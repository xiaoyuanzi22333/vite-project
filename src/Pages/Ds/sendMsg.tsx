// streamClient.ts
import ModelClient, { ChatCompletionsOutput } from "@azure-rest/ai-inference";
import { DefaultAzureCredential } from "@azure/identity";

// Define environment variables with fallback
const endpoint: string = "https://ai-9804549640182ai647595511482.services.ai.azure.com/models";
const modelName: string = "DeepSeek-R1";

// Initialize the client with DefaultAzureCredential
const client = ModelClient(
  endpoint,
  // Set the AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, and AZURE_TENANT_ID environment variables
  new DefaultAzureCredential()
);

// Define the message interface
interface ChatMessage {
  role: "system" | "user";
  content: string;
}



// Async function to make the request
async function getChatResponse(input_content: string): Promise<String|null> {
  // Define messages
const messages: ChatMessage[] = [
    { role: "system", content: "You are a helpful assistant" }, // Fixed typo: "an" -> "a"
    { role: "user", content: input_content },
  ];

  try {
    const response = await client.path("/chat/completions").post({
      body: {
        messages,
        max_tokens: 1000,
        model: modelName,
      },
    });

    // Log the response as a JSON string
    // console.log(JSON.stringify(response));
    if (response.status == "200") {
      const output = response.body as ChatCompletionsOutput;
      console.log(output.choices[0].message.content);
      return output.choices[0].message.content;
    }
  } catch (error) {
    console.error("Error occurred:", error);
  }
  return "Error";
}

// Execute the function
// getChatResponse();

// console.log(JSON.stringify(await SendReq("introduce yourself")));
// console.log(await SendReq("introduce yourself"))
  

export default getChatResponse;