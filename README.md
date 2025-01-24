# Run an example multi-agent workflow with Bee Agents and watsonx

This repository was built on the [Bee Agent Framework Starter]() repository. The starter template lets you quickly start working with the [Bee Agent Framework](https://github.com/i-am-bee/bee-agent-framework) in a second. 

The repository as a starting point for multi-agents with the coding from the [MultiAgents](https://github.com/i-am-bee/bee-agent-framework/blob/main/examples/workflows/multiAgents.ts) in the [Bee Agent Framework](https://github.com/i-am-bee/bee-agent-framework). 

Currently, on January 20, the [Bee Agent Framework provides experimental workflows](https://i-am-bee.github.io/bee-agent-framework/#/workflows) with a multi-agent configuration running them in a sequence.

The following example two questions concerns the weather in New York. 

These example questions for the workflow are only to determine whether two different roles are needed and what response the solver generates with the available input. 

* The first question addresses a matter requiring `up-to-date` information, which means that a specialist must formulate a response. 

* The second question is designed to require current facts and additional information, which can't be easily found with a search engine on the internet. The goal of the second question is not to obtain a concrete answer but to demonstrate that the combination of a specialist and research is effective and the solver is able to successfully integrate this information. However, it is important to note that humans or agents cannot answer the second question related to this topic quickly. 

These are the two different questions which the workflow should answer:

* "What is the current weather in New York?" -> `should be solved only by the specialist`.
![](images/bee-multiagent-01.gif)

* "What do you expect based on the current weather and the information related to climate changes for the city of New York? Will there be problems for the next month?" -> `should be solved by specialist and researcher together`.
![](images/bee-multiagent-02.gif)

We will define three agents. Each agent is configured as in the following list:

* `role`
* `custom instructions`
* `tools`
* `execution parameters`

Example code:

```typescript
workflow.addAgent({
 name: "WeatherForecaster",
 instructions: "You are a weather assistant. Respond only if you can provide a useful answer.",
 tools: [new OpenMeteoTool()],
 llm: chatLLM,
 execution: { maxIterations: 10, totalMaxRetries: 10, maxRetriesPerStep: 5 },
});
```

The table contains a high-level overview of the role, the tools, and a short description.

| Role | Tools | Description |
| --- | --- | --- |
|  **specialist** WeatherForecaster | `weather tool` |  A **specialist** a WeatherForecaster, here we provide a `weather tool` to get actual weather information. |
| **researcher** | `DuckDuckGoSearchTool` | A **researcher** who **searches for additional information** in case the specialist knowledge is insufficient, here we provide the DuckDuckGoSearchTool to find additional information online. |
| **solver** | no tool | A **solver** who is responsible for building the **final output** based on the input result of the specialist and the researcher to create the correct answer for the requester. |

In our case, all the agents use the same LLM for their internal system prompt for reasoning and the agent chat communication prompt configuration.

The code follows the steps for implementation.

1. Chat model setup
2. Workflow creation
3. Agent definition
4. Execution with an interactive console input and output

The console output below is the result for the more complex question:

_Note:_ The execution time depends on the model, inference, network, context size, retry configuration, prompts, and so on; this example configuration is not optimal ;-). 

```sh
npm run start src/multi_agent_example.ts

> bee-agent-framework-starter@0.0.1 start
> npm exec tsx src/multi_agent_example.ts

To test the configuration you can use the two following questions
-------
1. Ask a simple question 👤 : What is the current weather in New York?
2. Ask a more complex question 👤 : What do you expect based on the current weather and the information related to climate changes for the city of New York? Will there be problems for the next month?
-------
Interactive session has started. To escape, input 'q' and submit.
User input 👤 : What do you expect based on the current weather and the information related to climate changes for the city of New York? Will there be problems for the next month?
-> WeatherForecaster Based on the current weather and forecast for the next two weeks, New York is expected to experience cold temperatures, with highs ranging from -7.2°C to 15.8°C and lows ranging from -14°C to 7.1°C. There will be some rain, with the most significant amount expected on February 4th and 5th, with 7.7mm and 3mm of rain, respectively. However, please note that this forecast only goes until February 5th, and it's recommended to check for updates for the rest of the month. Additionally, climate change is expected to impact weather patterns, but its effects on the specific weather in New York for the next month are uncertain and would require more detailed climate models to predict.
-> Researcher Based on the current weather trends and climate change predictions, New York City is expected to experience cold temperatures, with potential snowfall, in February 2025. However, the exact weather forecast for the next month is not clear. It's recommended to check for updates for the most accurate and up-to-date information. Additionally, climate change is expected to impact weather patterns, but its effects on the specific weather in New York City for the next month are uncertain and would require more detailed climate models to predict.
-> Solver Based on the current weather forecast, New York City can expect cold temperatures, with highs ranging from -7.2°C to 15.8°C and lows ranging from -14°C to 7.1°C, and some rain, with the most significant amount expected on February 4th and 5th, for the next two weeks. However, the forecast for the rest of the month is uncertain, and it's recommended to check for updates. Climate change is expected to impact weather patterns, but its effects on the specific weather in New York City for the next month are uncertain and would require more detailed climate models to predict. It's always a good idea to check for updates and stay informed about the latest weather forecast and climate change predictions.
Agent 🤖 Based on the current weather forecast, New York City can expect cold temperatures, with highs ranging from -7.2°C to 15.8°C and lows ranging from -14°C to 7.1°C, and some rain, with the most significant amount expected on February 4th and 5th, for the next two weeks. However, the forecast for the rest of the month is uncertain, and it's recommended to check for updates. Climate change is expected to impact weather patterns, but its effects on the specific weather in New York City for the next month are uncertain and would require more detailed climate models to predict. It's always a good idea to check for updates and stay informed about the latest weather forecast and climate change predictions.

-> The time to answer the question the LLMs took 113.55794820899999 seconds.
```

# Changes in the configuration

This is an early first try using watsonx AI with a chat configuration in this context. In this context, we will use only the [WatsonxChatLLM](https://i-am-bee.github.io/bee-agent-framework/#/llms) and not the combination of WatsonXLLM and [WatsonxChatLLM](https://i-am-bee.github.io/bee-agent-framework/#/llms) because the basic LLM configuration is no longer needed.

The example code shows the remaining needed code for the configuration.

```typescript
const chatLLM = WatsonXChatLLM.fromPreset("meta-llama/llama-3-3-70b-instruct", {
    projectId: process.env.WATSONX_PROJECT_ID,
    baseUrl: process.env.WATSONX_BASE_URL,
    apiKey: process.env.WATSONX_API_KEY,
    parameters: {
      decoding_method: "greedy",
      max_new_tokens: 500,
    },
})
```

📚 See the [documentation](https://i-am-bee.github.io/bee-agent-framework/) to learn more.

## Prerequisites

- JavaScript runtime [NodeJS > 18](https://nodejs.org/) (ideally installed via [nvm](https://github.com/nvm-sh/nvm)).

## Run the examples

1. Clone this repository
2. Install dependencies `npm ci`.
3. Configure your project by filling in missing values in the `.env` file for watsonx.

```sh
cat .env_template > .env
```

4. Relevant entries.

```sh
## WatsonX
export WATSONX_API_KEY=
export WATSONX_PROJECT_ID=
export WATSONX_MODEL="meta-llama/llama-3-3-70b-instruct"
export WATSONX_REGION="us-south"
export WATSONX_DEPLOYMENT_ID="XXX"
```

5. Run the agents

```sh
npm run start src/multi_agent_example.ts
```

🧪 More examples can be found [here](https://github.com/i-am-bee/bee-agent-framework/blob/main/examples).