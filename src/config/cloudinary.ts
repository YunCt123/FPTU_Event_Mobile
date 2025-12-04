// Cấu hình Cloudinary dùng cho upload ảnh từ mobile
// TODO: Thay thế các giá trị dưới đây bằng cấu hình thật của bạn.
// - CLOUD_NAME: trong Dashboard Cloudinary (ví dụ: "my-cloud-name")
// - UPLOAD_PRESET: unsigned upload preset bạn tạo trong phần Settings -> Upload

export const CLOUDINARY_CONFIG = {
  CLOUD_NAME: "dpqvdxj10",
  UPLOAD_PRESET: "fpt_event_app",
  // (Không bắt buộc) nếu muốn gom vào 1 folder:
  FOLDER: "fpt_events",
};
