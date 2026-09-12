package com.itsup.incheonguro.RegionRecommendPage.repository;

import com.itsup.incheonguro.RegionRecommendPage.entity.Region;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RegionRepository
        extends JpaRepository<Region, Long> {

    Optional<Region> findByRegionName(String regionName);

}
