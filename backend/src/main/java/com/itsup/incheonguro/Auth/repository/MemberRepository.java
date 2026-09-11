package com.itsup.incheonguro.Auth.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.itsup.incheonguro.Auth.entity.Member;

public interface MemberRepository
        extends JpaRepository<Member, Long> {

    Optional<Member> findByLoginId(String loginId);

    boolean existsByLoginId(String loginId);
}
