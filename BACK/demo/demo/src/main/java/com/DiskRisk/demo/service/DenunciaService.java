package com.DiskRisk.demo.service;

import com.DiskRisk.demo.model.Denuncia;
import com.DiskRisk.demo.repository.DenunciaRepository;
import com.DiskRisk.demo.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class DenunciaService {

    private final DenunciaRepository repository;
    private final UsuarioRepository usuarioRepository;

    public DenunciaService(DenunciaRepository repository, UsuarioRepository usuarioRepository) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<Denuncia> listarTodas() {
        return repository.findAll();
    }

    public Optional<Denuncia> buscarPorId(Integer id) {
        return repository.findById(id);
    }

    public List<Denuncia> buscarPorUsuario(Integer usuarioId) {
        return repository.findByUsuarioId(usuarioId);
    }

    public List<Denuncia> buscarPorCep(String cep) {
        return repository.findByCep(cep);
    }

    public List<Denuncia> buscarPorNivelRisco(String nivelRisco) {
        return repository.findByNivelRisco(nivelRisco);
    }

    public List<Denuncia> buscarPorStatus(String status) {
        return repository.findByStatusDenuncia(status);
    }

    public Denuncia criar(Denuncia denuncia) {
        if (denuncia.getUsuarioId() != null && !usuarioRepository.existsById(denuncia.getUsuarioId()))
            throw new RuntimeException("Usuário não encontrado.");
        denuncia.setDataCriacao(java.time.LocalDateTime.now());
        if (denuncia.getStatusDenuncia() == null || denuncia.getStatusDenuncia().isBlank())
            denuncia.setStatusDenuncia("pendente");
        return repository.save(denuncia);
    }

    public Denuncia atualizarStatus(Integer id, String status) {
        Denuncia denuncia = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Denúncia não encontrada."));
        denuncia.setStatusDenuncia(status);
        return repository.save(denuncia);
    }

    public Denuncia atualizar(Integer id, Denuncia dados) {
        Denuncia denuncia = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Denúncia não encontrada."));
        denuncia.setCep(dados.getCep());
        denuncia.setStatusDenuncia(dados.getStatusDenuncia());
        denuncia.setTipoDenuncia(dados.getTipoDenuncia());
        denuncia.setNivelRisco(dados.getNivelRisco());
        denuncia.setDescricao(dados.getDescricao());
        denuncia.setFotoDenuncia(dados.getFotoDenuncia());
        return repository.save(denuncia);
    }

    public void deletar(Integer id) {
        if (!repository.existsById(id))
            throw new RuntimeException("Denúncia não encontrada.");
        repository.deleteById(id);
    }
}
