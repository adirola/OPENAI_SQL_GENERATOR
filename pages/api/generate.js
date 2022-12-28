import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const animal = req.body.animal || '';
  if (animal.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid animal",
      }
    });
    return;
  }

  try {
    const completion = await openai.createCompletion({
      model: "code-davinci-002",
      prompt:`### Postgres SQL tables, with their properties:\n#\n#
      Blocks(id, blockHash, parenthash,difficulty,gasused,gaslimit,size)\n
      # Transactions(id,blockHash ,txHash, from, to,contract,value,data,gas,gasprice,state)\n
      # Assets(id, contract, assetType, date)\n
      #\n
      ###${req.body.animal}\n
      SELECT
    `,
      temperature: 0,
      max_tokens: 3000,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      stop: ["#", ";"],
    });
    res.status(200).json({ result: completion.data.choices[0].text });
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}

function generatePrompt(animal) {
  
  return `### Postgres SQL tables, with their properties:
  #
  # Blocks(id, blockHash, parenthash,difficulty,gasused,gaslimit,size)
  # Transactions(id,blockHash ,txHash, from, to,contract,value,data,gas,gasprice,state)
  # Assets(id, contract, assetType, date)
  #
  ###${animal}
`;
}
