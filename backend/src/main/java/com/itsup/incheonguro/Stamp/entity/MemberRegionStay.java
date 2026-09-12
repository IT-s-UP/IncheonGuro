package com.itsup.incheonguro.Stamp.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Entity
@Table(name = "member_region_stay")
@Getter
@NoArgsConstructor
public class MemberRegionStay {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(nullable = false)
    private Long memberId;


    @Column(nullable = false)
    private Long regionId;


    @Column(nullable = false)
    private LocalDateTime enteredAt;


    @Column(nullable = false)
    private boolean activated;



    public MemberRegionStay(
            Long memberId,
            Long regionId
    ){

        this.memberId = memberId;
        this.regionId = regionId;
        this.enteredAt = LocalDateTime.now();
        this.activated = false;

    }



    public void activate(){

        this.activated = true;

    }

}
