package com.certificate.backend.model.dto.Response;

public class ApiResponse<T> {
    private int code;
    private String message;
    private T data;

    public ApiResponse(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public ApiResponse(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public T getData() {
        return data;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setData(T data) {
        this.data = data;
    }

    // 1. Thành công (Message mặc định là "Thành công")
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(200, "Thành công", data);
    }

    // 2. Thành công NHƯNG kèm theo lời nhắn động (Đã dùng ở Controller lúc import Excel)
    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(200, message, data);
    }

    public static <T> ApiResponse<T> error(int code, String message) {
        return new ApiResponse<>(code, message, null);
    }

}
