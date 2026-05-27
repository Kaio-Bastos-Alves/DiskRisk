package com.DiskRisk.demo.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Denuncias")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Denuncia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "UsuarioId")
    private Integer usuarioId;

    @NotBlank
    @Size(min = 8, max = 8)
    @Column(nullable = false, length = 8)
    private String cep;

    @Size(max = 20)
    @Column(length = 20)
    private String statusDenuncia = "pendente";

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false, length = 50)
    private String tipoDenuncia;

    @NotBlank
    @Size(max = 20)
    @Column(nullable = false, length = 20)
    private String nivelRisco;

    @Column(nullable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @NotBlank
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String descricao;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Integer usuarioId) { this.usuarioId = usuarioId; }
    public String getCep() { return cep; }
    public void setCep(String cep) { this.cep = cep; }
    public String getStatusDenuncia() { return statusDenuncia; }
    public void setStatusDenuncia(String s) { this.statusDenuncia = s; }
    public String getTipoDenuncia() { return tipoDenuncia; }
    public void setTipoDenuncia(String t) { this.tipoDenuncia = t; }
    public String getNivelRisco() { return nivelRisco; }
    public void setNivelRisco(String n) { this.nivelRisco = n; }
    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime d) { this.dataCriacao = d; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String d) { this.descricao = d; }
}
