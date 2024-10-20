const questionBox = document.querySelector('h2');
const answerBox = document.querySelector('textarea');
const ratingBox = document.getElementById('rating');
const reviewBox = document.getElementById('review'); 
const btnDiv = document.querySelector('.btn-div');

let currentPage = 1;
let DATA = [];
let totalPages = 0;

const fetchQuestions = async () => {
    try {
        const response = await fetch('./question.json');
        DATA = await response.json();
        totalPages = DATA.length;
        console.log(DATA);
    } catch (error) {
        console.log("ERROR OCCURRED WHILE FETCHING QUESTIONS", error);
    }
    getQuestion(currentPage);
}

const getQuestion = (page = 1) => {
    const question = DATA.find(ques => ques.page == page);
    questionBox.innerText = question.question;
    answerBox.value = ''; 
    ratingBox.innerText = question.rating !== -1 ? question.rating : ''; 
    reviewBox.innerText = question.review || '';

    if (currentPage === totalPages) {
        showSubmitTestButton();
    } else {
        showNextButton();
    }
}

const submitHandler = async () => {
    const answer = answerBox.value;
    const question = questionBox.innerText;
    if (!answer || !question) {
        alert("Please fill the required fields");
        return;
    }

    const reqObject = { question, answer };

    try {
        let data;
        do {
            let response = await fetch('https://quiz-app-using-gemini-api.onrender.com/api/v1/submit-answer', {
                method: "POST",
                body: JSON.stringify(reqObject),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            data = await response.json();
        } while (!data.success);

        const currentQuestion = DATA.find(ques => ques.page === currentPage);
        currentQuestion.rating = data.data.rating;
        currentQuestion.review = data.data.review;

        ratingBox.innerText = currentQuestion.rating;
        reviewBox.innerText = currentQuestion.review;

        console.log("Question answered:", reqObject);
        console.log("Updated DATA", DATA);

    } catch (error) {
        console.log("ERROR OCCURRED WHILE SUBMITTING ANSWER", error);
    }
}

const previousHandler = () => {
    if (currentPage === 1) return;
    currentPage--;
    getQuestion(currentPage);
}

const nextHandler = () => {
    if (currentPage < totalPages) {
        currentPage++;
        getQuestion(currentPage);
    }
}

const showSubmitTestButton = () => {
    btnDiv.innerHTML = `
        <button onclick="submitHandler()">Submit</button>
        <button onclick="previousHandler()">Previous</button>
        <button onclick="submitTestHandler()">Submit Test</button>
    `;
}

const showNextButton = () => {
    btnDiv.innerHTML = `
        <button onclick="submitHandler()">Submit</button>
        <button onclick="previousHandler()">Previous</button>
        <button onclick="nextHandler()">Next</button>
    `;
}

const submitTestHandler = () => {
    const allAnswered = DATA.every(ques => ques.rating !== -1 && ques.review);
    if (!allAnswered) {
        alert("Please answer all questions before submitting the test.");
        currentPage = DATA.find(ques => ques.rating === -1).page;
        getQuestion(currentPage);
        return;
    }

    const averageRating = DATA.reduce((acc, ques) => acc + ques.rating, 0) / totalPages;

    console.log('Saving updated questions to question.json...');
    console.log(JSON.stringify(DATA, null, 2));

    alert(`Test Submitted Successfully! Your average rating is: ${averageRating.toFixed(2)}`);

    document.body.innerHTML = `<h1>Test Submitted Successfully!</h1><p>Your average rating is: ${averageRating.toFixed(2)}</p>`;
}

fetchQuestions();
