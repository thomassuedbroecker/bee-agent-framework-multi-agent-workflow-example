import "dotenv/config";
import { UnconstrainedMemory } from "bee-agent-framework/memory/unconstrainedMemory";
import { createConsoleReader } from "./helpers/io.js";
import { OpenMeteoTool } from "bee-agent-framework/tools/weather/openMeteo";
import { DuckDuckGoSearchTool } from "bee-agent-framework/tools/search/duckDuckGoSearch";
import { AgentWorkflow } from "bee-agent-framework/workflows/agent";
import { Message, Role, MessageContentPart } from "bee-agent-framework/backend/core";

// watsonx configruation
import { WatsonxChatModel } from "bee-agent-framework/adapters/watsonx/backend/chat";

// Logging
import { ToolEvents } from "bee-agent-framework/backend/base";

/// *******************************
/// 1. Chat model setup
/// *******************************

const chatLLM = new WatsonxChatModel(
  "meta-llama/llama-3-3-70b-instruct"
)

chatLLM.parameters.maxTokens = 500
chatLLM.parameters.temperature = 1

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
    Message.of({
      role: Role.USER,
      text: prompt,
      meta: { createdAt: new Date() },
    }),
  );

  const { result } = await workflow.run(memory.messages).observe((emitter) => {
      
     emitter.on("success", (data) => {
        reader.write(`-> ${data.step}: `, `${data.state.finalAnswer}`);
        /*
        let count = (data.state.newMessages as Message<MessageContentPart, string>[]).length;
        let i = 0
        reader.write(`   -> History length: `, `${(data.state.newMessages as Message<MessageContentPart, string>[]).length}`);
        while ((count-1) >= i){         
          reader.write(`   -> History  role[${i}]: `, `${(data.state.newMessages as Message<MessageContentPart, string>[])[i].role}`);
          reader.write(`   -> History  text[${i}]: `, `${(data.state.newMessages as Message<MessageContentPart, string>[])[i].text}`);
          i = i + 1
        }
        reader.write(`   -> Next step: `, `${data.next}`);
        */
      })

  });
  // await memory.addMany(result.newMessages); // save all steps including the answer for the conversation
  await memory.addMany(result.newMessages.slice(-1)); // save only the final answer for in the conversation
  reader.write(`--------`, "");
  reader.write(`Agent 🤖`, result.finalAnswer);
  const endTime = performance.now()
  console.log(`\n-> The time to answer the question the LLMs took ${((endTime - startTime)/1000)} seconds.\n`)
}
