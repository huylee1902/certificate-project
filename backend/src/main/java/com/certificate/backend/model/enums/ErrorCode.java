package com.certificate.backend.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    FILE_EMPTY(400, "File không được để trống"),
    FILE_INVALID_FORMAT(400, "Định dạng File không hợp lệ"),
    FILE_PARSE_ERROR(400, "Không thể đọc file Excel"),
    INVALID_SCHOOL_STATUS(400, "Thao tác không hợp lệ với trạng thái hiện tại của trường học"),
    SCHOOLCODE_EXIST(400,"Mã trường đã tồn tại!"),
    EMAIL_EXIST(400,"Email đã tồn tại!"),
    USERNAME_EXIST(400,"Tên đăng nhập hoặc email đã tồn tại!"),
    ACCOUNT_ALREADY_ACTIVATED(400, "Tài khoản này đã được kích hoạt thành công từ trước. Vui lòng đăng nhập."),
    TOKEN_INVALID(400, "Đường dẫn không hợp lệ hoặc tài khoản đã được kích hoạt trước đó."),
    TOKEN_EXPIRED(400, "Đường dẫn xác thực đã hết hạn (Quá 24 giờ). Vui lòng yêu cầu cấp lại."),
    PROFILE_INCOMPLETE(400, "Hồ sơ chưa hoàn thiện. Vui lòng cập nhật tên Hiệu trưởng trước khi cấp bằng!"),
    PASSWORD_MISMATCH(400, "Mật khẩu xác nhận mới không trùng khớp"),

    INVALID_USERNAME(401,"Tên đăng nhập hoặc email không chính xác!"),
    INVALID_REFRESH_TOKEN(401, "Refresh Token không hợp lệ"),
    REFRESH_TOKEN_EXPIRED(401, "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại"),
    OTP_EXPIRED(401,"Mã OTP đã hết hạn hoặc chưa được gửi"),
    OTP_INVALID(401,"Mã OTP không chính xác"),
    PASSWORD_INVALID(401,"Mật khẩu không chính xác!"),


    ACCOUNT_PENDING(403, "Tài khoản đang chờ duyệt! Vui lòng liên hệ quản trị viên"),
    ACCOUNT_REJECTED(403, "Tài khoản bị từ chối"),
    ACCOUNT_SUSPENDED(403, "Tài khoản bị khóa tạm thời! Vui lòng liên hệ quản trị viên"),
    TRANSACTION_FAILED(403,"Giao dịch thất bại!"),
    REVOKE_FAILED(403,"Quá trình thu hồi thất bại!"),
    ACCOUNT_NOT_ACTIVATED(403, "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email!"),

    USER_NOT_FOUND(404, "Không tìm thấy tài khoản với email này."),
    BACKGROUND_NOT_FOUND(404,"Không tìm thây văn bằng mẫu"),
    STUDENT_NOT_FOUND(404,"Không tìm thấy sinh viên!"),
    SCHOOL_NOT_FOUND(404, "Không tìm thấy trường học"),
    CERTIFICATE_NOT_AVAILABLE(404,"Sinh viên này chưa được cấp bằng hoặc đã bị thu hồi!"),
    CERTIFICATE_NOT_FOUND(404,"Không tìm thấy dữ liệu chứng chỉ trong hệ thống"),

    STUDENT_IN_DB(409, "Mã sinh viên đã tồn tại trong hệ thống"),

    IMPORT_HAS_ERRORS(422, "File chứa dữ liệu không hợp lệ, không có dòng nào được lưu"),
    STUDENT_IN_FILE(422, "Mã sinh viên bị trùng trong file Excel"),

    FOLDER_CREATE_FAILED(500, "Không thể khởi tạo thư mục lưu file"),
    FILE_SAVE_FAILED(500, "Lỗi khi lưu file"),
    INTERNAL_ERROR(500, "Lỗi hệ thống, vui lòng thử lại");

    private final int httpStatus;
    private final String message;

}
