package com.certificate.backend.model.dto.Response;

import lombok.Builder;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
public class IssueResponse {
    private int successCount;
    private int failureCount;
    @Builder.Default
    private List<Detail> details = new ArrayList<>();

    @Data
    public static class Detail {
        private Long studentId;
        private String status; // "SUCCESS" hoặc "FAILED"
        private String message;
        private String degreeNo;
        private String ipfsCid;
        private String txHash;

        public Detail(Long studentId, String status, String message, String degreeNo, String ipfsCid, String txHash) {
            this.studentId = studentId;
            this.status = status;
            this.message = message;
            this.degreeNo = degreeNo;
            this.ipfsCid = ipfsCid;
            this.txHash = txHash;
        }
    }

    public void addSuccess(Long studentId, String degreeNo, String ipfsCid, String txHash) {
        this.successCount++;
        this.details.add(new Detail(studentId, "SUCCESS", "Thành công", degreeNo, ipfsCid, txHash));
    }

    public void addFailure(Long studentId, String message) {
        this.failureCount++;
        this.details.add(new Detail(studentId, "FAILED", message, null, null, null));
    }
}
