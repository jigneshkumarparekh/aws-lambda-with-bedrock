"use strict";

import chalk from "chalk";
import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

export const handler = async (event) => {
  const client = new BedrockRuntimeClient({ region: "us-east-1" });

  // Extract input data from the event object
  const { modelId, prompt } = event;

  console.log(chalk.blue("--> Model ID: ", modelId));
  console.log(chalk.blue("--> Prompt: ", prompt));

  const conversation = [
    {
      role: "user",
      content: [{ text: prompt }],
    },
  ];

  // Instructions for the bot.
  const systemPrompt = [
    {
      text: `
        You're an assitive bot helping me learn about provided context. 
        Only answer if question is related to the privided context. 
        Do not answer unrelated questions.
      `,
    },
  ];

  // Create a command with the model ID, the message, and a basic configuration.
  const command = new ConverseCommand({
    modelId,
    messages: conversation,
    system: systemPrompt,
    inferenceConfig: { maxTokens: 512, temperature: 0.5, topP: 0.9 },
  });

  try {
    // Send the request to Bedrock
    const response = await client.send(command);
    // Extract the response text.
    const responseText = response.output.message.content[0].text;

    console.log(chalk.green(`Answer: ${responseText}`));

    // Return the response
    return {
      statusCode: 200,
      body: responseText,
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error invoking Bedrock model" }),
    };
  }
};
