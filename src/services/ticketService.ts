import { api } from "../api/api";
import { TICKET_ENDPOINTS } from "../constants/apiEndpoints";
import {
  CreateTicketRequest,
  ManualCheckinRequest,
  ManualCheckinResponse,
  ScanTicketRequest,
  ScanTicketResponse,
  Ticket,
} from "../types/ticket";

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
      console.log("Failed to fetch my tickets", error);
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
      console.log("Failed to create ticket", error);
      throw error;
    }
  }

  /**
   * Lấy thông tin vé theo ID
   * Endpoint: GET /tickets/{id}
   */
  async getTicketById(ticketId: string): Promise<Ticket> {
    try {
      const response = await api.get<Ticket>(TICKET_ENDPOINTS.BY_ID(ticketId));
      return response;
    } catch (error) {
      console.log("Failed to fetch ticket by ID", error);
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
      console.log("Failed to fetch ticket by QR", error);
      throw error;
    }
  }

  /**
   * Quét QR code vé và check-in
   * Endpoint: POST /tickets/scan
   * Yêu cầu quyền: staff
   */
  async scanTicket(data: ScanTicketRequest): Promise<ScanTicketResponse> {
    try {
      const response = await api.post<ScanTicketResponse>(
        TICKET_ENDPOINTS.SCAN,
        data
      );
      return response;
    } catch (error) {
      console.log("Failed to scan ticket", error);
      throw error;
    }
  }

  /**
   * Manual check-in vé khi không thể quét QR code
   * Có thể sử dụng ticketId hoặc (studentCode + eventId) để tìm vé
   * Endpoint: POST /tickets/manual-checkin
   * Yêu cầu quyền: staff
   */
  async manualCheckin(
    data: ManualCheckinRequest
  ): Promise<ManualCheckinResponse> {
    try {
      const response = await api.post<ManualCheckinResponse>(
        TICKET_ENDPOINTS.MANUAL_CHECKIN,
        data
      );
      return response;
    } catch (error) {
      console.log("Failed to manual check-in ticket", error);
      throw error;
    }
  }

  /**
   * Hủy vé
   * Chỉ cho phép hủy nếu sự kiện bắt đầu sau 1 ngày từ bây giờ
   * Ghế sẽ được giải phóng và eventRegisteredCount sẽ giảm
   * Endpoint: POST /tickets/{id}/cancel
   * Yêu cầu quyền: student
   */
  async cancelTicket(ticketId: string): Promise<void> {
    try {
      await api.post<void>(TICKET_ENDPOINTS.CANCEL(ticketId));
    } catch (error) {
      console.log("Failed to cancel ticket", error);
      throw error;
    }
  }
}

export const ticketService = new TicketService();
