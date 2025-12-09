import { api } from "../api/api";
import { TICKET_ENDPOINTS } from "../constants/apiEndpoints";
import { CreateTicketRequest, Ticket } from "../types/ticket";

interface GetTicketsResponse {
  data: Ticket[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface GetTicketsParams {
  page?: number;
  limit?: number;
  status?: string;
  eventId?: string;
}


class TicketService {
  /**
   * Lấy danh sách vé của sinh viên hiện tại với phân trang
   * Endpoint: GET /tickets/me
   */
  async getMyTickets(params?: GetTicketsParams): Promise<GetTicketsResponse> {
    try {
      const response = await api.get<GetTicketsResponse>(
        TICKET_ENDPOINTS.LIST,
        { params }
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch my tickets", error);
      throw error;
    }
  }

  /**
   * Tạo vé mới (đăng ký sự kiện)
   * Endpoint: POST /tickets
   */
  async createTicket(data: CreateTicketRequest): Promise<Ticket> {
    try {
      const response = await api.post<Ticket>(TICKET_ENDPOINTS.CREATE, data);
      return response;
    } catch (error) {
      console.error("Failed to create ticket", error);
      throw error;
    }
  }

  /**
   * Lấy thông tin vé theo ID
   * Endpoint: GET /tickets/{id}
   */
  async getTicketById(ticketId: string): Promise<Ticket> {
    try {
      const response = await api.get<Ticket>(
        TICKET_ENDPOINTS.BY_ID(ticketId)
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch ticket by ID", error);
      throw error;
    }
  }

  /**
   * Lấy thông tin vé theo QR code
   * Endpoint: GET /tickets/qr/{qrCode}
   */
  async getTicketByQR(qrCode: string): Promise<Ticket> {
    try {
      const response = await api.get<Ticket>(TICKET_ENDPOINTS.BY_QR(qrCode));
      return response;
    } catch (error) {
      console.error("Failed to fetch ticket by QR", error);
      throw error;
    }
  }
}

export const ticketService = new TicketService();
