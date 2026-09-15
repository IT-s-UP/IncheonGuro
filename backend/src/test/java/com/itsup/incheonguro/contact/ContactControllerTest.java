package com.itsup.incheonguro.contact;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.server.ResponseStatusException;
import jakarta.validation.Validation;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ContactControllerTest {
    private ContactController.Inquiry inquiry() {
        return new ContactController.Inquiry("서비스 이용", "visitor@example.com", "문의 제목", "문의 내용");
    }
    @Test void deliversToFixedAdministratorAndSetsReplyTo() {
        var sender = mock(JavaMailSender.class);
        var controller = new ContactController(sender, "sender@example.com", "admin@example.com");
        assertEquals(204, controller.submit(inquiry()).getStatusCode().value());
        var captured = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(sender).send(captured.capture());
        assertArrayEquals(new String[]{"admin@example.com"}, captured.getValue().getTo());
        assertEquals("sender@example.com", captured.getValue().getFrom());
        assertEquals("visitor@example.com", captured.getValue().getReplyTo());
        assertTrue(captured.getValue().getText().contains("문의 내용"));
        assertEquals(429, assertThrows(ResponseStatusException.class,
            () -> controller.submit(inquiry())).getStatusCode().value());
        verifyNoMoreInteractions(sender);
    }
    @Test void differentReplyAddressesDoNotShareThePerAddressLimit() {
        var sender = mock(JavaMailSender.class);
        var controller = new ContactController(sender, "sender@example.com", "admin@example.com");
        assertEquals(204, controller.submit(inquiry()).getStatusCode().value());
        var second = new ContactController.Inquiry("서비스 이용", "second@example.com", "제목", "내용");
        assertEquals(204, controller.submit(second).getStatusCode().value());
        var duplicate = new ContactController.Inquiry("서비스 이용", "VISITOR@EXAMPLE.COM", "제목", "내용");
        assertEquals(429, assertThrows(ResponseStatusException.class, () -> controller.submit(duplicate)).getStatusCode().value());
        verify(sender, times(2)).send(any(SimpleMailMessage.class));
    }
    @Test void rotatingReplyAddressesStillHitsGlobalLimit() {
        var sender = mock(JavaMailSender.class);
        var controller = new ContactController(sender, "sender@example.com", "admin@example.com");
        for (int i = 0; i < 30; i++) {
            var request = new ContactController.Inquiry("기타 문의", "visitor" + i + "@example.com", "제목", "내용");
            assertEquals(204, controller.submit(request).getStatusCode().value());
        }
        assertEquals(429, assertThrows(ResponseStatusException.class, () -> controller.submit(inquiry())).getStatusCode().value());
        verify(sender, times(30)).send(any(SimpleMailMessage.class));
    }
    @Test void rejectsInvalidPayloadAndHeaderInjection() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var validator = factory.getValidator();
            assertTrue(validator.validate(inquiry()).isEmpty());
            assertFalse(validator.validate(new ContactController.Inquiry("unknown", "bad", " ", " ")).isEmpty());
            assertFalse(validator.validate(new ContactController.Inquiry("기타 문의", "visitor@example.com", "test\r\nBcc: attacker@example.com", "text")).isEmpty());
            assertFalse(validator.validate(new ContactController.Inquiry("기타 문의", "visitor@example.com", "test", "a".repeat(2001))).isEmpty());
        }
    }
    @Test void smtpFailureDoesNotReturnSuccessOrProviderDetails() {
        var sender = mock(JavaMailSender.class);
        doThrow(new MailSendException("private smtp detail")).when(sender).send(any(SimpleMailMessage.class));
        var controller = new ContactController(sender, "sender@example.com", "admin@example.com");
        var error = assertThrows(ResponseStatusException.class, () -> controller.submit(inquiry()));
        assertEquals(502, error.getStatusCode().value());
        assertFalse(error.getReason().contains("private smtp detail"));
    }
    @Test void missingConfigurationDoesNotAttemptDelivery() {
        var sender = mock(JavaMailSender.class);
        var controller = new ContactController(sender, "", "admin@example.com");
        assertEquals(503, assertThrows(ResponseStatusException.class,
            () -> controller.submit(inquiry())).getStatusCode().value());
        verifyNoInteractions(sender);
    }
}
