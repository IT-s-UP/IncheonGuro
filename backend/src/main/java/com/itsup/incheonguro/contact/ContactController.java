package com.itsup.incheonguro.contact;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/contact")
public class ContactController {
    private final JavaMailSender sender;
    private final String from;
    private final String recipient;
    private final Map<String, Long> attempts = new HashMap<>();
    private long windowStart;
    private int windowCount;

    public ContactController(JavaMailSender sender, @Value("${app.mail.from:}") String from,
            @Value("${app.contact.recipient:}") String recipient) {
        this.sender = sender;
        this.from = from;
        this.recipient = recipient;
    }

    public record Inquiry(
            @NotBlank @Pattern(regexp = "서비스 이용|로그인 및 계정|정보 오류 제보|개선 제안|기타 문의") String category,
            @NotBlank @Email @Size(max = 254) @Pattern(regexp = "[^\\r\\n]+") String email,
            @NotBlank @Size(max = 100) @Pattern(regexp = "[^\\r\\n]+") String title,
            @NotBlank @Size(max = 2000) String content) {}

    @PostMapping
    public ResponseEntity<Void> submit(@Valid @RequestBody Inquiry inquiry) {
        if (from.isBlank() || recipient.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "문의 접수 설정을 확인 중입니다. 잠시 후 다시 시도해 주세요.");
        }
        // Limit by reply address so visitors behind the same proxy do not block each other.
        // Keep the global cap: reply addresses are user supplied, not verified identities.
        reserve(inquiry.email().trim().toLowerCase(Locale.ROOT));
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setFrom(from);
        // The browser cannot choose the recipient or the sender.
        mail.setTo(recipient);
        mail.setReplyTo(inquiry.email().trim());
        mail.setSubject("[인천구로 문의] " + inquiry.category() + " - " + inquiry.title().trim());
        mail.setText("문의 유형: " + inquiry.category() + "\n회신 이메일: " + inquiry.email().trim()
                + "\n접수 시각(UTC): " + Instant.now() + "\n\n" + inquiry.content().trim());
        try {
            sender.send(mail);
        } catch (MailException exception) {
            // Never expose SMTP credentials or provider error details.
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "문의 전송에 실패했습니다. 입력 내용은 유지됩니다. 잠시 후 다시 시도해 주세요.");
        }
        return ResponseEntity.noContent().header("Cache-Control", "no-store").build();
    }

    private synchronized void reserve(String replyAddress) {
        long now = System.currentTimeMillis();
        attempts.entrySet().removeIf(entry -> now - entry.getValue() >= 60_000);
        if (now - windowStart >= 60_000) { windowStart = now; windowCount = 0; }
        if (attempts.containsKey(replyAddress) || windowCount >= 30) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "문의는 잠시 후 다시 보내 주세요. (최대 1분 대기)");
        }
        attempts.put(replyAddress, now);
        windowCount++;
    }
}
