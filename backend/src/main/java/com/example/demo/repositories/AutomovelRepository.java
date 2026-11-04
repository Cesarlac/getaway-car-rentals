package com.example.demo.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.models.Automovel;

public interface AutomovelRepository extends JpaRepository<Automovel, UUID> {
}