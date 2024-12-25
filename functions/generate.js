// generate.js (Netlify function)
const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.handler = async function(event) {
    try {
        console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
        
        if (!event.body) {
            throw new Error('No request body provided');
        }

        let body;
        try {
            body = JSON.parse(event.body);
            console.log('Request received:', {
                ingredients: body.ingredients,
                method: body.cookingMethod,
                diet: body.dietaryPreference,
                spice: body.spiceLevel
            });
        } catch (e) {
            throw new Error('Failed to parse request body: ' + e.message);
        }

        if (!body.ingredients) {
            throw new Error('No ingredients provided');
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Enhanced prompt for better structure
        const prompt = `Create a detailed recipe using these ingredients: ${body.ingredients}

Requirements:
${body.cookingMethod !== 'any' ? `- Must use ${body.cookingMethod} for cooking` : ''}
${body.dietaryPreference !== 'any' ? `- Must be ${body.dietaryPreference}` : ''}
${body.spiceLevel !== 'any' ? `- Spice level should be ${body.spiceLevel}` : ''}

Please provide the recipe in this exact format:
TITLE: [Recipe Name]
COOKING TIME: [Time in minutes]
SPICE LEVEL: [Mild/Medium/Spicy]

INGREDIENTS:
- [ingredient 1 with quantity]
- [ingredient 2 with quantity]
[etc.]

METHOD:
1. [First step]
2. [Second step]
[etc.]

NOTES: [Any special tips or variations]

Make sure to include quantities for ingredients and detailed steps. Be creative but practical.`;

        console.log('Sending prompt to Gemini:', prompt);
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const recipe = response.text();
        
        console.log('Received recipe from Gemini:', recipe);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ recipe })
        };
    } catch (error) {
        console.error('Detailed error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: error.message || 'Failed to generate recipe'
            })
        };
    }
}

