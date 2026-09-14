import { Request, Response } from 'express';
import { ConversationRepository } from '../repositories/ConversationRepository';
import { SessionRepository } from '../repositories/SessionRepository';
import { v4 as uuidv4 } from 'uuid';

export const addMessage = async (req: Request, res: Response) => {
  try {
    const { sessionId, role, message, transcript } = req.body;
    const conv = await ConversationRepository.create({
      id: uuidv4(),
      sessionId,
      role,
      message,
      transcript,
      timestamp: new Date()
    });
    res.status(201).json(conv);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getConversation = async (req: Request, res: Response) => {
  try {
    const convs = await ConversationRepository.findBySessionId(req.params.sessionId);
    res.json(convs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getNextQuestion = async (req: Request, res: Response) => {
  try {
    const { sessionId, step = 0, language = 'Hindi' } = req.body;

    const hindiQuestions = [
      "Namaste! Aapko sabse zyada kis problem ki wajah se doctor se milna hai?",
      "Ye symptoms aapko exactly kab se hain?",
      "Kya aap is problem ke liye koi medicine le rahe hain?",
      "Kya aapko weakness, ulti ya koi aur pareshani bhi feel ho rahi hai?",
      "Dhanyavaad. Aapki medical details note ho gayi hain. Ab aap previous documents upload kar sakte hain."
    ];

    const englishQuestions = [
      "Hello! What primary health issue brings you to the clinic today?",
      "How long have you been experiencing these symptoms?",
      "Are you currently taking any medications for this condition?",
      "Do you have any associated symptoms like weakness, nausea, or fever?",
      "Thank you. Your history has been recorded. Let's proceed to document upload."
    ];

    const hinglishQuestions = [
      "Namaste! Aapko primary kis problem ki wajah se consult karna hai?",
      "Ye issue kitne time se chal raha hai?",
      "Kya aap iske liye koi medicines le rahe hain?",
      "Kya koi additional weakness ya fever jaisi problem ho rahi hai?",
      "Thank you! Aapki information record ho gayi hai. Next step par chalte hain."
    ];

    let questions = hindiQuestions;
    const langLower = (language || '').toLowerCase();
    if (langLower.includes('en') && !langLower.includes('hing')) {
      questions = englishQuestions;
    } else if (langLower.includes('hing')) {
      questions = hinglishQuestions;
    }

    const idx = Math.min(Math.max(0, parseInt(step, 10)), questions.length - 1);
    const question = questions[idx];

    res.json({ question, step: idx, isFinal: idx === questions.length - 1 });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
