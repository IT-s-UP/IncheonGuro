package com.itsup.incheonguro.Auth.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.itsup.incheonguro.Auth.entity.Member;

public interface MemberRepository
        extends JpaRepository<Member, Long> {

    Optional<Member> findByLoginId(String loginId);

    boolean existsByLoginId(String loginId);

    // email 컬럼에 유니크 제약이 없어서, 혹시 중복된 값이 있어도 예외 없이 하나만 가져오도록 findFirst 사용
    Optional<Member> findFirstByEmail(String email);
}
