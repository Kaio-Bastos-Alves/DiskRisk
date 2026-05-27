package com.DiskRisk.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "Usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String nome;

    @NotBlank
    @Email
    @Size(max = 150)
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false, length = 255)
    private String senha;

    @NotBlank
    @Size(min = 8, max = 8)
    @Column(nullable = false, length = 8)
    private String cep;

    @Size(min = 11, max = 11)
    @Column(unique = true, length = 11)
    private String cpf;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
    public String getCep() { return cep; }
    public void setCep(String cep) { this.cep = cep; }
    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = (cpf == null || cpf.isBlank()) ? null : cpf; }
}
