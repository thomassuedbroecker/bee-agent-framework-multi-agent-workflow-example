# Run an example multi-agent workflow with Bee Agents and watsonx

This repository was built on the [Bee Agent Framework Starter]() repository. The starter template lets you quickly start working with the [Bee Agent Framework](https://github.com/i-am-bee/bee-agent-framework) in a second. 

The repository as a starting point for multi-agents with the coding from the [MultiAgents](https://github.com/i-am-bee/bee-agent-framework/blob/main/examples/workflows/multiAgents.ts) in the [Bee Agent Framework](https://github.com/i-am-bee/bee-agent-framework). 

Currently, on January 20, the [Bee Agent Framework provides experimental workflows](https://i-am-bee.github.io/bee-agent-framework/#/workflows) with a multi-agent configuration running them in a sequence.
(contains update BeeAgentFramework 0.1.1)

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

-------
To test the configuration you can use the two following questions
-------
1. Ask a simple question 👤 : What is the current weather in New York?
2. Ask a more complex question 👤 : What do you expect based on the current weather and the information related to climate changes for the city of New York? Will there be problems for the next month?
-------
Interactive session has started. To escape, input 'q' and submit.
User input 👤 : What is the current weather in New York?
-> WeatherForecaster:  The current weather in New York as of 17:45 on February 14, 2025, is 2.3°C with a relative humidity of 30% and a wind speed of 23.6 km/h.
-> Researcher:  I don't have the current weather conditions for New York on February 14, 2025. For the most up-to-date and accurate information, I recommend checking a reliable weather website or app.
-> Solver:  As of 5:56 PM on February 14, 2025, the current weather in New York is 2.3°C with a relative humidity of 30% and a wind speed of 23.6 km/h, according to the WeatherForecaster.
--------
Agent 🤖 As of 5:56 PM on February 14, 2025, the current weather in New York is 2.3°C with a relative humidity of 30% and a wind speed of 23.6 km/h, according to the WeatherForecaster.

-> The time to answer the question the LLMs took 34.678531167 seconds.

User input 👤 : What do you expect based on the current weather and the information related to climate changes for the city of New York? Will there be problems for the next month?
-> WeatherForecaster:  For the next month in New York, the temperature is expected to fluctuate, with highs ranging from 0.4°C to 12°C and lows ranging from -6.6°C to 0.9°C. There will be some precipitation, with the most significant amount (31 mm) on February 16. Potential problems related to climate change include extreme temperature fluctuations and increased precipitation, which can lead to flooding and disrupted daily life. However, this forecast only goes until March 1, so it's essential to continue monitoring the weather for the rest of the month.
-> Researcher:  For the next month in New York, the temperature is expected to fluctuate, with highs ranging from 0.4°C to 12°C and lows ranging from -6.6°C to 0.9°C. There will be some precipitation, with the most significant amount (31 mm) on February 16. Potential problems related to climate change include extreme temperature fluctuations and increased precipitation, which can lead to flooding and disrupted daily life. According to the National Weather Service's Climate Prediction Center, there is a likelihood of above-average temperatures in February 2025. Additionally, AccuWeather's 2025 U.S. Spring Forecast predicts that spring warmth will expand across the southern and central U.S., while the northern states will experience a chilly transition. It's essential to continue monitoring the weather for the rest of the month, as forecasts can change.
-> Solver:  Based on the current weather conditions and climate change trends, for the next month in New York, you can expect fluctuating temperatures, with highs ranging from 0.4°C to 12°C and lows ranging from -6.6°C to 0.9°C, and some precipitation, with the most significant amount (31 mm) on February 16. Potential problems related to climate change include extreme temperature fluctuations and increased precipitation, which can lead to flooding and disrupted daily life. It's essential to continue monitoring the weather for the rest of the month, as forecasts can change.
--------
Agent 🤖 Based on the current weather conditions and climate change trends, for the next month in New York, you can expect fluctuating temperatures, with highs ranging from 0.4°C to 12°C and lows ranging from -6.6°C to 0.9°C, and some precipitation, with the most significant amount (31 mm) on February 16. Potential problems related to climate change include extreme temperature fluctuations and increased precipitation, which can lead to flooding and disrupted daily life. It's essential to continue monitoring the weather for the rest of the month, as forecasts can change.

-> The time to answer the question the LLMs took 107.85920366699999 seconds.
```

# Changes in the configuration

This is an early first try using watsonx AI with a chat configuration in this context. In this context, we will use only the [WatsonxChatLLM](https://i-am-bee.github.io/bee-agent-framework/#/llms) and not the combination of WatsonXLLM and [WatsonxChatLLM](https://i-am-bee.github.io/bee-agent-framework/#/llms) because the basic LLM configuration is no longer needed.

The example code shows the remaining needed code for the configuration.

```typescript
const chatLLM = new WatsonxChatModel(
  "meta-llama/llama-3-3-70b-instruct"
)

chatLLM.parameters.maxTokens = 500
chatLLM.parameters.temperature = 1
```

📚 See the [documentation](https://i-am-bee.github.io/bee-agent-framework/) to learn more.

## Prerequisites

- JavaScript runtime [NodeJS > 18](https://nodejs.org/) (ideally installed via [nvm](https://github.com/nvm-sh/nvm)).

## Run the examples

1. Clone this repository
2. Install dependencies 

```sh
npm ci
npm install @ibm-cloud/watsonx-ai
``` 
3. Configure your project by filling in missing values in the `.env` file for watsonx.

```sh
cat .env_template > .env
```

4. Relevant entries.

```sh
## WatsonX
export WATSONX_API_KEY=""
export WATSONX_PROJECT_ID=""
export WATSONX_REGION="us-south"
export WATSONX_CHAT_MODEL="meta-llama/llama-3-3-70b-instruct"
# export WATSONX_EMBEDDING_MODEL=""
# export WATSONX_PROJECT_ID=""
# export WATSONX_SPACE_ID=""
# export WATSONX_VERSION=""
```

5. Run the agents

```sh
npm run start src/multi_agent_example.ts
```

🧪 More examples can be found [here](https://github.com/i-am-bee/bee-agent-framework/blob/main/examples).