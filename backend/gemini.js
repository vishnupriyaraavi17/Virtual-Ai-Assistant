import axios from "axios";

const geminiResponse = async (command, assistantName, userName) => {
  try {
    const apiUrl = process.env.GEMINI_API_URL;
    if (!apiUrl) throw new Error("GEMINI_API_URL not set");

    const lowerCmd = command.toLowerCase().trim();
    
    // Function to clean command and extract query
    // const extractQuery = (cmd) => {
    //   // Remove only the assistant name at the beginning
    //   let query = cmd;
    //   if (cmd.toLowerCase().startsWith(assistantName.toLowerCase())) {
    //     query = cmd.substring(assistantName.length).trim();
    //   }
    //   return query;
    // };
      const extractQuery = (cmd) => {
  let q = cmd.trim();
  if (q.toLowerCase().startsWith(assistantName.toLowerCase())) {
    q = q.slice(assistantName.length).trim();
  }
  return q;
};



    const query = extractQuery(command);

    // 1. PERSONAL QUESTIONS ABOUT ASSISTANT
    if (lowerCmd.includes("who created you") || lowerCmd.includes("who made you") || 
        lowerCmd.includes("your creator") || lowerCmd.includes("your developer")) {
      return JSON.stringify({
        type: "general",
        userInput: command,
        response: `I was created by ${userName}.`
      });
    }
    
    if (lowerCmd.includes("who are you") || lowerCmd.includes("what are you") || 
        lowerCmd.includes("your name") || lowerCmd.includes("introduce yourself")) {
      return JSON.stringify({
        type: "general",
        userInput: command,
        response: `I'm ${assistantName}, your personal AI assistant created by ${userName}. I can help you with searches, calculations, reminders, and much more!`
      });
    }
    
    if (lowerCmd.includes("hello") || lowerCmd.includes("hi ") || 
        lowerCmd.includes("hey ") || lowerCmd === "hi" || lowerCmd === "hello") {
      return JSON.stringify({
        type: "general",
        userInput: command,
        response: `Hello ${userName}! I'm ${assistantName}. How can I help you today?`
      });
    }
    
    if (lowerCmd.includes("how are you") || lowerCmd.includes("how do you do")) {
      return JSON.stringify({
        type: "general",
        userInput: command,
        response: `I'm doing great, thank you for asking! Ready to help you with anything you need.`
      });
    }

    // 2. MATH CALCULATIONS
    const hasMathSymbols = /[\+\-\*\/×÷]/;
    const hasNumbers = /\d+/;
    
    if ((hasMathSymbols.test(query) || 
         lowerCmd.includes("plus") || lowerCmd.includes("minus") || 
         lowerCmd.includes("into") || lowerCmd.includes("times") || 
         lowerCmd.includes("divide") || lowerCmd.includes("multiple") ||
         lowerCmd.includes("add") || lowerCmd.includes("subtract") || 
         lowerCmd.includes("multiply")) && 
        hasNumbers.test(query)) {
      
      try {
        let mathExpr = query;
        mathExpr = mathExpr.replace(/^(papa|what is|calculate|compute|find|tell me|perform|do|solve|please|hey|ok|now)\s+/gi, '');
        mathExpr = mathExpr.replace(/plus|\s+add\s+/gi, '+');
        mathExpr = mathExpr.replace(/minus|\s+subtract\s+/gi, '-');
        mathExpr = mathExpr.replace(/into|times|×|x|multiple of|multiplied by|\s+multiply\s+/gi, '*');
        mathExpr = mathExpr.replace(/divide by|divided by|÷|\s+divide\s+/gi, '/');
        mathExpr = mathExpr.replace(/[^0-9\+\-\*\/\(\)\.\s]/g, '');
        mathExpr = mathExpr.trim().replace(/\s+/g, '');
        
        if (mathExpr && mathExpr.match(/\d/) && mathExpr.match(/[\+\-\*\/]/)) {
          const result = new Function(`return ${mathExpr}`)();
          let displayExpr = mathExpr.replace(/\*/g, '×').replace(/\//g, '÷');
          
          return JSON.stringify({
            type: "general",
            userInput: command,
            response: `${displayExpr} = ${result}`
          });
        }
      } catch (mathError) {
        console.log("Math calculation failed:", mathError);
      }
    }
    
    // 3. CALCULATOR APP
    if ((lowerCmd.includes("open calculator") || lowerCmd.includes("open calc") || 
         lowerCmd === "calculator" || lowerCmd === "calc") && 
        !hasNumbers.test(lowerCmd)) {
      return JSON.stringify({
        type: "calculator-open",
        userInput: command,
        response: "Opening calculator"
      });
    }
    
    // 4. GOOGLE SEARCH
    if (lowerCmd.includes("google") || (lowerCmd.includes("search") && !lowerCmd.includes("youtube"))) {
      let searchQuery = query;
      if (searchQuery.toLowerCase().startsWith("search")) {
        searchQuery = searchQuery.substring(6).trim();
      }
      searchQuery = searchQuery.replace(/\s+(on|in)\s+google$/i, '');
      searchQuery = searchQuery.replace(/^open\s+google\s+/i, '').replace(/^open\s+/i, '');
      searchQuery = searchQuery.replace(/\s+google\s+/i, ' ').trim();
      
      if (!searchQuery) searchQuery = "your query";
      
      return JSON.stringify({
        type: "google-search",
        userInput: command,
        response: `Searching Google for "${searchQuery}"`
      });
    }
    
    // 5. YOUTUBE
    if (lowerCmd.includes("youtube")) {
      let ytQuery = query;
      ytQuery = ytQuery.replace(/^(open|search|find|play)\s+/i, '');
      ytQuery = ytQuery.replace(/\s+(on|in)\s+youtube$/i, '').replace(/\s+youtube$/i, '');
      ytQuery = ytQuery.trim();
      
      if (lowerCmd.includes("play")) {
        return JSON.stringify({
          type: "youtube-play",
          userInput: command,
          response: `Playing "${ytQuery || 'video'}" on YouTube`
        });
      }
      return JSON.stringify({
        type: "youtube-search",
        userInput: command,
        response: `Opening YouTube${ytQuery ? ` for "${ytQuery}"` : ''}`
      });
    }
    
    // 6. TIME
    if ((lowerCmd.includes("time") || lowerCmd.includes("clock")) && 
        !lowerCmd.includes("sometimes") && !lowerCmd.includes("timeline")) {
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
      return JSON.stringify({
        type: "get-time",
        userInput: command,
        response: `Current time is ${time}`
      });
    }
    
    // 7. DATE
    if (lowerCmd.includes("date") && !lowerCmd.includes("update") && !lowerCmd.includes("data")) {
      const date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      return JSON.stringify({
        type: "get-date",
        userInput: command,
        response: `Today is ${date}`
      });
    }

    // ===== Local handling for day/month queries =====

     // 8. DAY queries
    if (
      lowerCmd.includes("what day") ||
      lowerCmd.includes("today day") ||
      lowerCmd.includes("tell me the day") ||
      lowerCmd.includes("which day is today") ||
      lowerCmd.includes("day today") ||
      lowerCmd.includes("what is the day today")
    ) {
      const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      return JSON.stringify({
        type: "get-day",
        userInput: command,
        response: `Today is ${day}`
      });
    }

    // 9. MONTH queries
    if (
      lowerCmd.includes("what month") ||
      lowerCmd.includes("month today") ||
      lowerCmd.includes("which month is this") ||
      lowerCmd.includes("tell me the month") ||
      lowerCmd.includes("month now") ||
      lowerCmd.includes("what is the month")
    ) {
      const month = new Date().toLocaleDateString('en-US', { month: 'long' });
      return JSON.stringify({
        type: "get-month",
        userInput: command,
        response: `This month is ${month}`
      });
    }

    // 10. YEAR queries
    if (
      lowerCmd.includes("what year") ||
      lowerCmd.includes("which year") ||
      lowerCmd.includes("current year") ||
      lowerCmd.includes("tell me the year") ||
      lowerCmd.includes("year now")
    ) {
      const year = new Date().getFullYear();
      return JSON.stringify({
        type: "get-year",
        userInput: command,
        response: `The current year is ${year}`
      });
    }




    // Only call Gemini for non-fallback commands
    const prompt = `
You are a voice assistant named ${assistantName}.

STRICT RULES:
1. You MUST reply in JSON only.
2. Do NOT include explanations or text outside JSON.
3. NEVER guess or answer time, date, day, month, or year yourself.
4. If the user asks about time/date/day/month/year,
   respond ONLY with the correct type.
5. Allowed types ONLY:
   - get-time
   - get-date
   - get-day
   - get-month
   - get-year
   - general

EXAMPLES:

User: what is current month
Response:
{ "type": "get-month" }

User: which month is this
Response:
{ "type": "get-month" }

User: what is the time now
Response:
{ "type": "get-time" }

User: open facebook
Response:
{ "type": "general", "response": "Opening Facebook." }

Now respond to this user command:
"${command}"
`;
    const result = await axios.post(apiUrl, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    const text = result?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (text) {
      const jsonMatch = text.match(/{[\s\S]*}/);
      if (jsonMatch) return jsonMatch[0];
    }

    // If Gemini fails, return basic response
    return JSON.stringify({
      type: "general",
      userInput: command,
      response: `I heard: ${query}`
    });

  } catch (error) {
    // Handle common questions even on error
    const lowerCmd = command.toLowerCase().trim();
    
    if (lowerCmd.includes("who created you")) {
      return JSON.stringify({
        type: "general",
        userInput: command,
        response: `I was created by Vishnu.`
      });
    }
    
    if (lowerCmd.includes("who are you")) {
      return JSON.stringify({
        type: "general",
        userInput: command,
        response: `I'm your personal AI assistant created by Vishnu. I can help you with various tasks!`
      });
    }
    
    if (lowerCmd.includes("hello") || lowerCmd.includes("hi")) {
      return JSON.stringify({
        type: "general",
        userInput: command,
        response: `Hello! I'm your assistant. How can I help you?`
      });
    }
    
    return JSON.stringify({
      type: "general",
      userInput: command,
      response: `I'll handle "${command}" locally`
    });
  }
};

export default geminiResponse;



