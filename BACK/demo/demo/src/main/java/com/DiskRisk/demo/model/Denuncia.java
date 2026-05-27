package com.DiskRisk.demo.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

import jakarta.persistence.Access;
import jakarta.persistence.AccessType;

@Entity
@Table(name = "Denuncias")
@Access(AccessType.FIELD)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Denuncia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @NotNull(message = "usuarioId é obrigatório")
    @Column(name = "UsuarioId", nullable = false)
    private Integer usuarioId;

    @NotBlank
    @Size(min = 8, max = 8)
    @Column(name = "CEP", nullable = false, length = 8)
    private String cep;

    @Size(max = 20)
    @Column(name = "StatusDenuncia", length = 20)
    private String statusDenuncia = "pendente";

    @NotBlank
    @Size(max = 50)
    @Column(name = "TipoDenuncia", nullable = false, length = 50)
    private String tipoDenuncia;

    @NotBlank
    @Size(max = 20)
    @Column(name = "NivelRisco", nullable = false, length = 20)
    private String nivelRisco;

    @Column(name = "DataCriacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    @NotBlank
    @Size(max = 200)
    @Column(name = "Descricao", nullable = false, length = 200)
    private String descricao;

    @Column(name = "FotoDenuncia", columnDefinition = "NVARCHAR(MAX)")
    private String fotoDenuncia;

    @PrePersist
    public void prePersist() {
        if (dataCriacao == null) {
            dataCriacao = LocalDateTime.now();
        }
        if (statusDenuncia == null || statusDenuncia.isBlank()) {
            statusDenuncia = "pendente";
        }
        if (cep != null) {
            cep = cep.replaceAll("\\D", "");
        }
    }

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
    public String getFotoDenuncia() { return fotoDenuncia; }
    public void setFotoDenuncia(String f) { this.fotoDenuncia = f; }

    // DataCriacao e statusDenuncia sao preenchidos antes do insert para funcionar mesmo sem DEFAULT no banco.
}
