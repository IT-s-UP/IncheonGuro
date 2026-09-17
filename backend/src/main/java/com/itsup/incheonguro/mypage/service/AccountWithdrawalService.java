package com.itsup.incheonguro.mypage.service;

import com.itsup.incheonguro.Auth.entity.Member;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AccountWithdrawalService {
    private final EntityManager em;
    private final PasswordEncoder passwords;
    public AccountWithdrawalService(EntityManager em, PasswordEncoder passwords) {
        this.em = em;
        this.passwords = passwords;
    }

    @Transactional
    public void withdraw(Long memberId, String password) {
        Member member = em.find(Member.class, memberId, LockModeType.PESSIMISTIC_WRITE);
        if (member == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        if (!member.isSocialAccount() && (password == null || !passwords.matches(password, member.getPassword())))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "현재 비밀번호가 일치하지 않습니다.");
        // Delete only rows owned by this member; shared course records have no member ownership.
        for (String entity : new String[]{"MemberStamp", "MemberRegionStay"}) {
            em.createQuery("delete from " + entity + " e where e.memberId = :id")
                .setParameter("id", memberId).executeUpdate();
        }
        for (String entity : new String[]{"Bookmark", "PlaceBookmark"}) {
            em.createQuery("delete from " + entity + " e where e.userId = :id")
                .setParameter("id", memberId).executeUpdate();
        }
        // Entity removal runs the existing day/place cascades in the same transaction.
        em.createQuery("select c from MyCourse c where c.memberId = :id", com.itsup.incheonguro.course.entity.MyCourse.class)
            .setParameter("id", memberId).getResultList().forEach(em::remove);
        em.remove(member);
        em.flush();
    }
}
