import axios from 'axios';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const aiService = {
    generateContent: async (prompt) => {
        try {
            const response = await axios.post(
                `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
                {
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('AI Service Error:', error);
            throw error;
        }
    },

    analyzeData: async (data, question) => {
        try {
            const prompt = `Given the following data: ${JSON.stringify(data)}. ${question}`;
            return await aiService.generateContent(prompt);
        } catch (error) {
            console.error('Data Analysis Error:', error);
            throw error;
        }
    },

    getChartInsights: async (chartData, chartType, prompt) => {
        try {
            // Format the data for better context
            const dataContext = `
                Chart Type: ${chartType}
                Data: ${JSON.stringify(chartData)}
                Please analyze this data and ${prompt}
            `;

            const response = await aiService.generateContent(dataContext);
            
            if (!response.candidates || !response.candidates[0]?.content?.parts[0]?.text) {
                throw new Error('Invalid response format from AI service');
            }

            return response;
        } catch (error) {
            console.error('Chart Insights Error:', error);
            throw error;
        }
    }
};

export default aiService; 