import { api } from "../api/api";
import { FEEDBACK_ENDPOINTS } from "../constants";
import { feedback, myFeedback } from "../types/feedback";

class FeedbackService {
  async sendFeedback(params: feedback) {
    const response = await api.post<feedback>(
      FEEDBACK_ENDPOINTS.CREATE,
      params
    );
    return response;
  }
  async getMyFeedbacks(): Promise<myFeedback[]> {
    const data = await api.get<myFeedback[]>(FEEDBACK_ENDPOINTS.MY);
    return data;
  }
}

export const feedbackService = new FeedbackService();
