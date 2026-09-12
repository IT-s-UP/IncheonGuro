package com.itsup.incheonguro.Stamp.repository;

import com.itsup.incheonguro.Stamp.entity.MemberStamp;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MemberStampRepository
        extends JpaRepository<MemberStamp, Long> {

    boolean existsByMemberIdAndRegionId(
            Long memberId,
            Long regionId);

    List<MemberStamp> findByMemberId(
            Long memberId);

}
