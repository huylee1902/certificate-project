package com.certificate.backend.repository;

import com.certificate.backend.model.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity,Long> {
    Optional<UserEntity> findByUserNameOrEmail(String username, String email);

    boolean existsByUserName(String username);

    boolean existsByEmail(String email);

    Optional<UserEntity> findByRefreshToken(String refreshToken);

    Optional<UserEntity> findByActiveToken(String activeToken);

    Optional<UserEntity> findByEmail(String email);

    Optional<UserEntity> findByUserName(String userName);
}
