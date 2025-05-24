const express = require('express');
const axios = require('axios');

const router = express.Router();

// Enhance job description using Local LLM
// POST /api/enhance-job
router.post('/enhance-job', async (req, res) => {
  try {
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }
    
    // Ollama API endpoint (running locally)
    const ollamaEndpoint = 'http://localhost:11434/api/generate';
    
    // Define prompt for the LLM
    const prompt = `
      You are an AI assistant for a home repair platform. Given a homeowner's job description,
      please enhance it with additional helpful details and suggest relevant tags.
      
      Original description:
      "${description}"
      
      Please provide:
      1. An enhanced version of the description with more details about what's needed
      2. A list of 3-5 relevant tags for categorizing this job
      
      Format your response as JSON:
      {
        "enhancedDescription": "...",
        "tags": ["tag1", "tag2", "tag3"]
      }
    `;
    
    try {
      // Try to call the local LLM
      const response = await axios.post(ollamaEndpoint, {
        model: 'llama3', // or whatever model is running locally
        prompt: prompt,
        stream: false
      });
      
      // Parse response
      const llmResponse = response.data.response;
      let result;
      
      // Attempt to extract JSON from the response
      try {
        // Find JSON in the response
        const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Error parsing LLM response as JSON:', parseError);
        
        // Fallback: Generate structured response manually
        // Extract what seems to be the enhanced description (everything before "tags" or similar keywords)
        const enhancedDescription = description + '\n\nAdditional details based on the description:\n- The issue appears to require professional attention\n- Tools and materials may be needed\n- Consider hiring a qualified professional for this job';
        
        // Generate tags based on keywords in the description
        const words = description.toLowerCase().split(/\s+/);
        const possibleTags = ['plumbing', 'electrical', 'carpentry', 'appliance', 'painting', 'landscaping'];
        let tags = possibleTags.filter(tag => words.some(word => word.includes(tag)));
        
        // If no tags found, add generic ones
        if (tags.length === 0) {
          tags = ['home repair', 'general', 'maintenance'];
        }
        
        result = {
          enhancedDescription,
          tags
        };
      }
      
      res.json(result);
    } catch (llmError) {
      console.error('Error connecting to local LLM:', llmError);
      
      // Fallback response if LLM is unavailable
      const enhancedDescription = `${description}\n\nAdditional details based on the description:\n- The issue appears to require professional attention\n- Recommended tools: Various household tools depending on the specific issue\n- Estimated time to complete: Varies based on complexity`;
      
      // Extract potential tags from the description
      const descriptionLower = description.toLowerCase();
      const tags = [];
      
      if (descriptionLower.includes('leak') || descriptionLower.includes('pipe') || descriptionLower.includes('faucet') || descriptionLower.includes('toilet') || descriptionLower.includes('sink')) {
        tags.push('plumbing');
      }
      
      if (descriptionLower.includes('light') || descriptionLower.includes('outlet') || descriptionLower.includes('switch') || descriptionLower.includes('electrical') || descriptionLower.includes('power')) {
        tags.push('electrical');
      }
      
      if (descriptionLower.includes('paint') || descriptionLower.includes('wall') || descriptionLower.includes('ceiling')) {
        tags.push('painting');
      }
      
      if (descriptionLower.includes('wood') || descriptionLower.includes('cabinet') || descriptionLower.includes('door') || descriptionLower.includes('shelf')) {
        tags.push('carpentry');
      }
      
      if (descriptionLower.includes('yard') || descriptionLower.includes('garden') || descriptionLower.includes('lawn') || descriptionLower.includes('tree')) {
        tags.push('landscaping');
      }
      
      if (descriptionLower.includes('appliance') || descriptionLower.includes('dishwasher') || descriptionLower.includes('refrigerator') || descriptionLower.includes('washer') || descriptionLower.includes('dryer')) {
        tags.push('appliance');
      }
      
      // Add general tag if no specific tags identified
      if (tags.length === 0) {
        tags.push('general', 'home repair');
      }
      
      // Make sure we have at least 3 tags
      if (tags.length < 3) {
        if (!tags.includes('home repair')) tags.push('home repair');
        if (!tags.includes('maintenance') && tags.length < 3) tags.push('maintenance');
        if (!tags.includes('general') && tags.length < 3) tags.push('general');
      }
      
      res.json({
        enhancedDescription,
        tags: tags.slice(0, 5) // Limit to 5 tags max
      });
    }
  } catch (error) {
    console.error('Error enhancing job description:', error);
    res.status(500).json({ error: 'Failed to enhance job description' });
  }
});

// Chat with Ollama LLM
// POST /api/ollama/chat
router.post('/chat', async (req, res) => {
  const { message, model } = req.body;
  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }
  try {
    // Send the message to Ollama API (handle streaming response)
    const response = await axios({
      method: 'post',
      url: 'http://127.0.0.1:11434/api/chat',
      data: {
        model: model || 'gemma3:1b',
        messages: [
          { role: 'user', content: message }
        ],
        // Add system prompt to instruct the model to answer concisely
        options: {
          system: 'Only answer the user question directly and concisely. Do not add extra information, greetings, or follow-up questions. Limit your answer to 3 short sentences. Do not exceed 30 words. Do not add explanations, lists, or extra context.'
        }
      },
      responseType: 'stream',
    });

    let fullContent = '';
    let buffer = '';
    await new Promise((resolve, reject) => {
      response.data.on('data', (chunk) => {
        buffer += chunk.toString();
        let lines = buffer.split('\n');
        buffer = lines.pop(); // last line may be incomplete
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.message && parsed.message.content) {
              fullContent += parsed.message.content;
            }
          } catch (e) { /* ignore parse errors */ }
        }
      });
      response.data.on('end', resolve);
      response.data.on('error', reject);
    });

    res.json({ role: 'assistant', content: fullContent });
  } catch (error) {
    console.error('Ollama API error:', error.message);
    res.status(500).json({ message: 'Failed to get response from Ollama', error: error.message });
  }
});

module.exports = router;