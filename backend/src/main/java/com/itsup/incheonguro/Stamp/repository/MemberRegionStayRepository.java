package com.itsup.incheonguro.Stamp.repository;


import com.itsup.incheonguro.Stamp.entity.MemberRegionStay;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface MemberRegionStayRepository
        extends JpaRepository<MemberRegionStay, Long> {


    Optional<MemberRegionStay>
    findByMemberIdAndRegionId(
            Long memberId,
            Long regionId
    );

}
