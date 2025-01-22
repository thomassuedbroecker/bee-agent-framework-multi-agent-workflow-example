import "dotenv/config";
import { UnconstrainedMemory } from "bee-agent-framework/memory/unconstrainedMemory";
import { createConsoleReader } from "./helpers/io.js";
import { OpenMeteoTool } from "bee-agent-framework/tools/weather/openMeteo";
import { DuckDuckGoSearchTool } from "bee-agent-framework/tools/search/duckDuckGoSearch";
import { AgentWorkflow } from "bee-agent-framework/experimental/workflows/agent";
import { BaseMessage, Role } from "bee-agent-framework/llms/primitives/message";

// watsonx configruation
import { WatsonXChatLLM } from "bee-agent-framework/adapters/watsonx/chat";

// Logging
import { BaseLLMEvents } from "bee-agent-framework/llms/base";

/// *******************************
/// 1. Chat model setup
/// *******************************
  
const chatLLM = WatsonXChatLLM.fromPreset("meta-llama/llama-3-3-70b-instruct", {
    projectId: process.env.WATSONX_PROJECT_ID,
    baseUrl: process.env.WATSONX_BASE_URL,
    apiKey: process.env.WATSONX_API_KEY,
    parameters: {
      decoding_method: "greedy",
      max_new_tokens: 500,
    },
})

// *********************************
// 2. Workflow creation
// ******************************** */

const workflow = new AgentWorkflow();

// *********************************
// 3. Agent definitions
// ******************************** */

workflow.addAgent({
  name: "WeatherForecaster",
  instructions: "You are a weather assistant. Respond only if you can provide a useful answer.",
  tools: [new OpenMeteoTool()],
  llm: chatLLM,
  execution: { maxIterations: 10, totalMaxRetries: 10, maxRetriesPerStep: 5 },
});
workflow.addAgent({
  name: "Researcher",
  instructions: "You are a researcher assistant. Respond only if you can provide a useful answer.",
  tools: [new DuckDuckGoSearchTool()],
  llm: chatLLM,
  execution: { maxIterations: 10, totalMaxRetries: 10, maxRetriesPerStep: 5 },
});
workflow.addAgent({
  name: "Solver",
  instructions:
    "Your task is to provide the most useful final answer based on the agents' (WeatherForecaster, Researcher) responses (which all are relevant. Ignore those where agent do not know.)",
  llm: chatLLM,
  execution: { maxIterations: 10, totalMaxRetries: 10, maxRetriesPerStep: 5 },
});

const reader = createConsoleReader();
const memory = new UnconstrainedMemory();

const startTime = performance.now()

console.info(`-------`);
console.info(`To test the configuration you can use the two following questions`);
console.info(`-------`);
console.info(`1. Ask a simple question 👤 : What is the current weather in New York?`);
console.info(`2. Ask a more complex question 👤 : What do you expect based on the current weather and the information related to climate changes for the city of New York? Will there be problems for the next month?`);
console.info(`-------`);

// *********************************
// 4. Execution with an interactive console input and output.
// ******************************** */

for await (const { prompt } of reader) {
  await memory.add(
    BaseMessage.of({
      role: Role.USER,
      text: prompt,
      meta: { createdAt: new Date() },
    }),
  );

  const { result } = await workflow.run(memory.messages).observe((emitter) => {
      emitter.on("success", (data) => {
        reader.write(`-> ${data.step}`, data.response?.update?.finalAnswer ?? "-");
      })
      // Uncomment to output more details
      /*
      emitter.match("*.*", async (data: any, event) => {
          if (event.creator === chatLLM) {
            const eventName = event.name as keyof BaseLLMEvents;
            switch (eventName) {
              case "start":
                console.info("LLM Input");
                console.info(data.input);
                break;
              case "success":
                console.info("LLM Output");
                console.info(data.value.raw.finalResult);
                break;
              case "error":
                console.error(data);
                break;
            }
          }
        });
      */
  });
  await memory.addMany(result.newMessages);
  reader.write(`Agent 🤖`, result.finalAnswer);
  const endTime = performance.now()
  console.log(`\n-> The time to answer the question the LLMs took ${((endTime - startTime)/1000)} seconds.\n`)
}
