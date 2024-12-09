import OpenAI from 'openai';
import { Readable } from 'stream';
import FormData from 'form-data';
import axios from 'axios';
import { config } from '../config/environment.js';

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

export class TranscriptionService {
  static async transcribe(audioBuffer) {
    const formData = new FormData();
    
    const stream = new Readable();
    stream.push(audioBuffer);
    stream.push(null);

    formData.append('file', stream, {
      filename: 'audio.mp3',
      contentType: 'audio/mpeg',
    });
    formData.append('model', config.openai.model);
    formData.append('language', config.openai.language);
    formData.append('response_format', 'text');

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${config.openai.apiKey}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('OpenAI API Error:', error.response?.data || error.message);
      throw error;
    }
  }
}