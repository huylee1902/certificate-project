package com.certificate.backend.security;

import com.certificate.backend.model.entity.SchoolEntity;
import com.certificate.backend.model.entity.UserEntity;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class SecurityUserDetail implements UserDetails {
    private final UserEntity user;

    public SecurityUserDetail(UserEntity user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()));
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getUserName();
    }

    public UserEntity getUser() {
        return this.user;
    }
    public Long schoolId(){
        return user.getSchool().getSchoolId();
    }
    public SchoolEntity getSchool(){
        return this.user.getSchool();
    }
}
