package com.itsup.incheonguro.emailverification.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.itsup.incheonguro.emailverification.dto.EmailVerificationConfirmRequest;
import com.itsup.incheonguro.emailverification.entity.EmailVerification;
import com.itsup.incheonguro.emailverification.repository.EmailVerificationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EmailVerificationService {

    private static final int CODE_LENGTH = 6;
    private static final long EXPIRY_MINUTES = 5;

    private final EmailVerificationRepository emailVerificationRepository;
    private final JavaMailSender mailSender;
    private final Environment environment;

    @Value("${app.mail.from:}")
    private String fromAddress;

    @Transactional
    public String sendCode(String email) {

        String code = generateCode();
        EmailVerification verification = new EmailVerification(
                email, code, LocalDateTime.now().plusMinutes(EXPIRY_MINUTES));
        emailVerificationRepository.save(verification);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(email);
            message.setSubject("[인천구로] 이메일 인증번호");
            message.setText("인증번호는 " + code + " 입니다. " + EXPIRY_MINUTES + "분 이내에 입력해주세요.");
            mailSender.send(message);
        } catch (MailException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "인증 메일 발송에 실패했습니다.");
        }

        return environment.acceptsProfiles(Profiles.of("local")) ? code : null;
    }

    @Transactional
    public void confirm(EmailVerificationConfirmRequest request) {

        EmailVerification verification = emailVerificationRepository
                .findTopByEmailOrderByIdDesc(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "인증번호를 먼저 요청해주세요."));

        if (verification.isExpired()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "인증 시간이 만료되었습니다.");
        }

        if (!verification.matches(request.getCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "인증번호가 일치하지 않습니다.");
        }

        verification.markVerified();
    }

    public boolean isVerified(String email) {
        return emailVerificationRepository.findTopByEmailOrderByIdDesc(email)
                .filter(EmailVerification::isVerified)
                .isPresent();
    }

    @Transactional
    public void consume(String email) {
        emailVerificationRepository.deleteByEmail(email);
    }

    private String generateCode() {
        SecureRandom random = new SecureRandom();
        StringBuilder code = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            code.append(random.nextInt(10));
        }
        return code.toString();
    }
}
