const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyClCsmh_zkE1zwtmf-iGMIg1ZfX1_nnKrc");


const express = require('express');
const cors = require('cors');
const app = express();
const router = express.Router();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const submitHandler = async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res.status(404).json({
        success: false,
        data: "Please fill the required details",
      })
    }

    const model = genAI.getGenerativeModel({ model: "models/gemini-1.0-pro" });

    const prompt = `I will be giving you a question and its answer submitted by a student. Check the answer according to the question and rate it out of 10 also give a review in two lines. The response you will be giving me in the format as {rating: ratingGivenByGemini, review: reviewGivenByGemini} as json object. Here is the question ${question} and here is the answer ${answer}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log(text);

    const data = text.substring(text.indexOf('{'), text.indexOf('}') + 1);

    res.status(200).json({
      success: true,
      data: JSON.parse(data),
    })
  } catch (error) {
    console.log("ERROR OCCURRED AT SUBMITHANDLER CONTROLLER: ", error);
    res.status(500).json({
      success: false,
      data: "Some error occurred please submit again",
    })
  }
}

router.post('/submit-answer', submitHandler);

app.use('/api/v1', router);

app.listen(3000, () => {
  console.log('server started');
})
