package com.itsup.incheonguro.emailverification.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.itsup.incheonguro.emailverification.entity.EmailVerification;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {

    Optional<EmailVerification> findTopByEmailOrderByIdDesc(String email);
}
