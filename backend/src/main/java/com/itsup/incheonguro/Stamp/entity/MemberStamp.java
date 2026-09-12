package com.itsup.incheonguro.Stamp.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Entity
@Table(name = "member_stamp")
@Getter
@NoArgsConstructor
public class MemberStamp {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(nullable = false)
    private Long memberId;


    @Column(nullable = false)
    private Long regionId;


    @Column(nullable = false)
    private LocalDateTime achievedAt;



    public MemberStamp(
            Long memberId,
            Long regionId
    ){

        this.memberId = memberId;
        this.regionId = regionId;
        this.achievedAt = LocalDateTime.now();

    }

}
