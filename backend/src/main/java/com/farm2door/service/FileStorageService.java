package com.farm2door.service;

import com.farm2door.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.upload.allowed-extensions:jpg,jpeg,png,webp}")
    private String allowedExtensions;

    @Value("${app.upload.max-file-size-bytes:5242880}")
    private long maxFileSizeBytes;

    private Path uploadPath;

    @PostConstruct
    public void init() {
        this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadPath);
            log.info("Initialized file upload directory at: {}", this.uploadPath);
        } catch (IOException e) {
            log.error("Could not create upload directory: {}", e.getMessage());
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file cannot be empty");
        }

        if (file.getSize() > maxFileSizeBytes) {
            throw new BadRequestException("File exceeds maximum allowed size of " + (maxFileSizeBytes / (1024 * 1024)) + "MB");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg");
        String extension = getFileExtension(originalFilename).toLowerCase();

        List<String> allowedList = Arrays.asList(allowedExtensions.toLowerCase().split(","));
        if (!allowedList.contains(extension)) {
            throw new BadRequestException("File type not allowed. Allowed types: " + allowedExtensions);
        }

        String safeFileName = System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8) + "." + extension;

        try {
            Path targetLocation = this.uploadPath.resolve(safeFileName);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }
            log.info("Stored file successfully: {}", safeFileName);
            return "/api/uploads/" + safeFileName;
        } catch (IOException e) {
            log.error("Failed to store file: {}", e.getMessage());
            throw new RuntimeException("Failed to store file on disk", e);
        }
    }

    public Path loadFile(String fileName) {
        return this.uploadPath.resolve(fileName).normalize();
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < filename.length() - 1) {
            return filename.substring(dotIndex + 1);
        }
        return "";
    }
}
