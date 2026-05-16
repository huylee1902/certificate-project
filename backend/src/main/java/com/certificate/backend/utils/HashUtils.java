package com.certificate.backend.utils;

import java.security.MessageDigest;
import java.util.HexFormat;

public class HashUtils {
    public static String computeSha256(byte[] data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data);
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("Không thể tính SHA-256", e);
        }
    }
}
