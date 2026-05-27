package com.DiskRisk.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Denuncias")
public class Denuncia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull
    @Column(name = "UsuarioId", nullable = false)
    private Integer usuarioId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UsuarioId", insertable = false, updatable = false)
    private Usuario usuario;

    @NotBlank
    @Size(min = 8, max = 8)
    @Column(nullable = false, length = 8)
    private String cep;

    @NotBlank
    @Size(max = 20)
    @Column(nullable = false, length = 20)
    private String statusDenuncia;

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

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String fotoDenuncia;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Integer usuarioId) { this.usuarioId = usuarioId; }
    public Usuario getUsuario() { return usuario; }
    public String getCep() { return cep; }
    public void setCep(String cep) { this.cep = cep; }
    public String getStatusDenuncia() { return statusDenuncia; }
    public void setStatusDenuncia(String statusDenuncia) { this.statusDenuncia = statusDenuncia; }
    public String getTipoDenuncia() { return tipoDenuncia; }
    public void setTipoDenuncia(String tipoDenuncia) { this.tipoDenuncia = tipoDenuncia; }
    public String getNivelRisco() { return nivelRisco; }
    public void setNivelRisco(String nivelRisco) { this.nivelRisco = nivelRisco; }
    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public String getFotoDenuncia() { return fotoDenuncia; }
    public void setFotoDenuncia(String fotoDenuncia) { this.fotoDenuncia = fotoDenuncia; }
}
