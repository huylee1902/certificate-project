package com.certificate.backend.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    FILE_EMPTY(400, "File không được để trống"),
    FILE_INVALID_FORMAT(400, "Định dạng File không hợp lệ"),
    FILE_PARSE_ERROR(400, "Không thể đọc file Excel"),

    IMPORT_HAS_ERRORS(422, "File chứa dữ liệu không hợp lệ, không có dòng nào được lưu"),
    STUDENT_IN_FILE(422, "Mã sinh viên bị trùng trong file Excel"),
    STUDENT_IN_DB(409, "Mã sinh viên đã tồn tại trong hệ thống"),

    SCHOOL_NOT_FOUND(404, "Không tìm thấy trường học"),
    INVALID_SCHOOL_STATUS(400, "Thao tác không hợp lệ với trạng thái hiện tại của trường học"),
    BACKGROUND_NOT_FOUND(404,"Không tìm thây văn bằng mẫu"),
    STUDENT_NOT_FOUND(404,"Không tìm thấy sinh viên!"),

    SCHOOLCODE_EXIST(400,"Mã trường đã tồn tại!"),
    USERNAME_EXIST(400,"Tên đăng nhập hoặc email đã tồn tại!"),
    INVALID_USERNAME(401,"Tên đăng nhập hoặc email không chính xác!"),
    INVALID_REFRESH_TOKEN(401, "Refresh Token không hợp lệ"),
    REFRESH_TOKEN_EXPIRED(401, "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại"),
    ACCOUNT_PENDING(403, "Tài khoản đang chờ duyệt! Vui lòng liên hệ quản trị viên"),
    ACCOUNT_REJECTED(403, "Tài khoản bị từ chối"),
    ACCOUNT_SUSPENDED(403, "Tài khoản bị khóa tạm thời! Vui lòng liên hệ quản trị viên"),
    TRANSACTION_FAILED(403,"Giao dịch thất bại!"),


    FOLDER_CREATE_FAILED(500, "Không thể khởi tạo thư mục lưu file"),
    FILE_SAVE_FAILED(500, "Lỗi khi lưu file"),
    INTERNAL_ERROR(500, "Lỗi hệ thống, vui lòng thử lại");




    private final int httpStatus;
    private final String message;

}
