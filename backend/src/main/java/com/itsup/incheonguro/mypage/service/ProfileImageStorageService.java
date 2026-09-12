package com.itsup.incheonguro.mypage.service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProfileImageStorageService {

    private static final List<String> ALLOWED_CONTENT_TYPES = List.of(
            "image/jpeg", "image/png", "image/webp");
    private static final long MAX_FILE_SIZE = 5L * 1024 * 1024;

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    public String save(Long memberId, MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미지 파일이 비어 있습니다.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미지 용량은 5MB를 넘을 수 없습니다.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "jpg, png, webp 형식만 업로드할 수 있습니다.");
        }

        try {
            Path dir = Path.of(uploadDir, "profile");
            Files.createDirectories(dir);

            String filename = memberId + "-" + UUID.randomUUID() + extensionOf(contentType);
            Path target = dir.resolve(filename);

            file.transferTo(target);

            return "/uploads/profile/" + filename;
        } catch (IOException e) {
            throw new UncheckedIOException("프로필 이미지 저장에 실패했습니다.", e);
        }
    }

    public void delete(String profileImageUrl) {

        if (profileImageUrl == null || profileImageUrl.isBlank()) {
            return;
        }

        String filename = profileImageUrl.substring(profileImageUrl.lastIndexOf('/') + 1);
        Path target = Path.of(uploadDir, "profile", filename);

        try {
            Files.deleteIfExists(target);
        } catch (IOException e) {
            throw new UncheckedIOException("프로필 이미지 삭제에 실패했습니다.", e);
        }
    }

    private String extensionOf(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> "";
        };
    }
}
