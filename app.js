const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const keys = require('./keys.json');

const QUESTIONS_URL =
  'https://www.cheatsheet.com/gear-style/20-questions-to-ask-siri-for-a-hilarious-response.html/';

const makeIFTTTReq = (key, trigger) => {
  return `https://maker.ifttt.com/trigger/${trigger}/with/key/${key}`;
};

const questions = [];
const prunedQuestions = [];
const csvQuestions = [];

(async function () {
  const res = await axios.get(QUESTIONS_URL);
  const cheerioData = cheerio.load(res.data);

  // find all questions in page
  const cheerioQuestions = cheerioData('h2');

  // push all questions into array
  cheerioQuestions.each(function (index, element) {
    questions.push(cheerioData(this).text());
  });

  // prune the number at start of each question
  questions.forEach((question, index) => {
    const spaceRegex = /\s+/;
    const questionRemoveSpecials = question.replace('’', "'").replace('‘', "'");
    const questionString = questionRemoveSpecials.substr(
      questionRemoveSpecials.search(spaceRegex) + 1
    );
    prunedQuestions[index] = questionString;
    csvQuestions[index] = {
      question: questionString,
    };
  });

  // write 
  const csvWriter = createCsvWriter({
    path: './Jerry_Zhang_FUNpreselection_siri_questions.csv',
    header: [{ id: 'question', title: 'QUESTION' }],
  });

  csvWriter.writeRecords(csvQuestions);

  // get random question index
  const questionIndex = Math.floor(Math.random() * Math.floor(61));

  axios.post(makeIFTTTReq(keys.key, keys.trigger), {
    value1: prunedQuestions[questionIndex]
  }).then(res => {
    console.log(res.data);
  }, err => {
    console.error(err)
  })
})();
