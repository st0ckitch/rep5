import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, RotateCcw, HelpCircle, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ANTHROPIC_API_KEY = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;

const MathTest = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [userQuestions, setUserQuestions] = useState({});
  const [currentUserQuestion, setCurrentUserQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const questions = [
    {
      id: 1,
      question: "რას უდრის 1,5",
      options: ["1", "1,5", "0,6", "0,4"],
      correct: 2,
      explanation: "1 გაყოფილი 0.6-ზე უდრის 0.6 × 2.5 = 1.5, შესაბამისად 1.5 = 0.6"
    },
    {
      id: 2,
      question: "0,0072 =",
      options: ["7,2 × 10⁻³", "72 × 10⁻³", "0,72 × 10⁻⁴", "7,2 × 10⁻¹"],
      correct: 1,
      explanation: "0.0072 = 72 × 10⁻⁴ = 72 × 10⁻³"
    },
    {
      id: 3,
      question: "სპილენძისა და ვერცხლის შენადნობში ვერცხლის მასა სპილენძის მასის 25%-ს შეადგენს. შენადნობის მასის რამდენ პროცენტს შეადგენს სპილენძის მასა?",
      options: ["60%", "75%", "80%", "84%"],
      correct: 2,
      explanation: "თუ x არის სპილენძის მასა, ვერცხლის მასა = 0.25x. ჯამური მასა = x + 0.25x = 1.25x. სპილენძის პროცენტი = (x/1.25x) × 100 = 80%"
    }
  ];

  const askClaude = async (questionText, testQuestion) => {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `მოცემულია მათემატიკის ტესტის ამოცანა: "${testQuestion}" მომხმარებლის კითხვა: "${questionText}" გთხოვთ დეტალურად აუხსნათ მომხმარებელს ამ ამოცანასთან დაკავშირებული საკითხები.`
          }]
        })
      });

      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      throw new Error('Failed to get response from Claude');
    }
  };

  const handleQuestionSubmit = async (questionId) => {
    if (!currentUserQuestion.trim()) return;
    setIsLoading(true);
    setError(null);
    
    try {
      const answer = await askClaude(currentUserQuestion, questions[questionId].question);
      setUserQuestions({
        ...userQuestions,
        [questionId]: [
          ...(userQuestions[questionId] || []),
          { question: currentUserQuestion, answer }
        ]
      });
      setCurrentUserQuestion('');
    } catch (error) {
      setError('Error getting response from Claude. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetTest = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setScore(0);
    setUserQuestions({});
  };

  const handleAnswer = (answerIndex) => {
    const isCorrect = answerIndex === questions[currentQuestion].correct;
    setAnswers({
      ...answers,
      [currentQuestion]: {
        selected: answerIndex,
        isCorrect: isCorrect
      }
    });
    if (isCorrect) setScore(score + 1);
  };

  const getButtonStyle = (optionIndex, questionIndex) => {
    const answer = answers[questionIndex];
    if (!answer) return {};
    
    if (optionIndex === questions[questionIndex].correct) {
      return { backgroundColor: '#22c55e', color: 'white' };
    }
    if (optionIndex === answer.selected && !answer.isCorrect) {
      return { backgroundColor: '#ef4444', color: 'white' };
    }
    return {};
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">მათემატიკის ტესტი - კითხვა {currentQuestion + 1}/{questions.length}</CardTitle>
            <div className="flex items-center gap-4">
              <div className="text-lg font-semibold">ქულა: {score}/{questions.length}</div>
              <Button onClick={resetTest} variant="outline" className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />გადატვირთვა
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-lg font-medium">{questions[currentQuestion].question}</div>
            <div className="space-y-2">
              {questions[currentQuestion].options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Button
                    className="w-full justify-start text-left transition-colors duration-200"
                    onClick={() => handleAnswer(index)}
                    disabled={answers[currentQuestion]}
                    style={getButtonStyle(index, currentQuestion)}
                  >
                    {String.fromCharCode(97 + index)}) {option}
                  </Button>
                  {answers[currentQuestion] && (
                    index === questions[currentQuestion].correct ? 
                      <CheckCircle2 className="text-green-500 h-6 w-6" /> :
                      (index === answers[currentQuestion].selected &&
                        <XCircle className="text-red-500 h-6 w-6" />)
                  )}
                </div>
              ))}
            </div>
            {answers[currentQuestion] && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="font-medium">განმარტება:</p>
                <p>{questions[currentQuestion].explanation}</p>
              </div>
            )}

            <div className="mt-4 p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="h-5 w-5" />
                <h3 className="font-medium">დამატებითი კითხვები</h3>
              </div>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={currentUserQuestion}
                    onChange={(e) => setCurrentUserQuestion(e.target.value)}
                    placeholder="დასვით კითხვა ამ ამოცანის შესახებ..."
                    disabled={isLoading}
                  />
                  <Button
                    onClick={() => handleQuestionSubmit(currentQuestion)}
                    disabled={isLoading || !currentUserQuestion.trim()}
                  >
                    {isLoading ? 'იგზავნება...' : <Send className="h-4 w-4" />}
                  </Button>
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {userQuestions[currentQuestion]?.map((qa, index) => (
                  <Alert key={index} className="bg-gray-50">
                    <div className="flex items-start gap-2">
                      <div className="bg-blue-100 rounded-full p-2">
                        <HelpCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">კითხვა: {qa.question}</div>
                        <AlertDescription className="mt-2 whitespace-pre-wrap">
                          {qa.answer}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <Button 
                onClick={() => setCurrentQuestion(prev => prev - 1)}
                disabled={currentQuestion === 0}
                variant="outline"
              >
                წინა
              </Button>
              <Button 
                onClick={() => setCurrentQuestion(prev => prev + 1)}
                disabled={currentQuestion === questions.length - 1}
              >
                შემდეგი
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="mt-4">
        <Card>
          <CardContent className="mt-4">
            <div className="grid grid-cols-6 gap-2">
              {questions.map((_, index) => (
                <Button
                  key={index}
                  style={answers[index] ? 
                    (answers[index].isCorrect ? 
                      { backgroundColor: '#22c55e', color: 'white' } : 
                      { backgroundColor: '#ef4444', color: 'white' }) : 
                    {}}
                  className="w-full"
                  onClick={() => setCurrentQuestion(index)}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MathTest;
